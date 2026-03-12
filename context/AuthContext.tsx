// context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as Font from 'expo-font';
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSessionStore } from '@/store/sessionStore';
import { useClientStore } from '@/store/clientStore';

interface AuthContextData {
    signOut: () => Promise<void>;
    session: Omit<any, 'clients'> | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { account, logout, setAccount, setSubscription, setInitialized } = useSessionStore();
    
    // Función que implementaremos en clientStore.ts para sincronizar con Firestore
    const startFirestoreSync = useClientStore((state) => state.actions.startFirestoreSync);
    const stopFirestoreSync = useClientStore((state) => state.actions.stopFirestoreSync);

    const [isFontLoaded, setIsFontLoaded] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        Font.loadAsync({
            ...Ionicons.font,
            ...MaterialIcons.font,
            ...Entypo.font,
            ...AntDesign.font,
            ...FontAwesome.font,
        }).then(() => setIsFontLoaded(true));
    }, []);

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(async (user) => {
            if (user) {
                // Obtener perfil desde Firestore
                try {
                    const userDoc = await firestore().collection('users').doc(user.uid).get();
                    const data = userDoc.data() as any;
                    
                    if (data) {
                        setAccount({
                            colmadoName: data.colmadoName || 'Mi Colmado',
                            phoneNumber: user.phoneNumber || data.phoneNumber || '',
                            subscription: data.subscription || { status: 'active', plan: 'none' },
                        });
                        setSubscription(data.subscription || { status: 'active', plan: 'none' });
                    } else {
                        // Perfil nuevo o sin completar
                        setAccount({
                            colmadoName: 'Mi Colmado',
                            phoneNumber: user.phoneNumber || '',
                            subscription: { status: 'active', plan: 'none' },
                        });
                    }
                    
                    // Iniciar la suscripción en tiempo real a Clientes
                    startFirestoreSync(user.uid);
                } catch (error) {
                    console.error('Error cargando el perfil del usuario:', error);
                }
            } else {
                setAccount(null);
                stopFirestoreSync();
            }
            
            setIsAuthReady(true);
            setInitialized(true);
        });
        
        return () => {
            subscriber();
            stopFirestoreSync();
        }; // unsubscribe on unmount
    }, [setAccount, setSubscription, setInitialized, startFirestoreSync, stopFirestoreSync]);

    const isLoading = !isFontLoaded || !isAuthReady;

    return (
        <AuthContext.Provider
            value={{
                signOut: logout,
                session: account,
                isLoading: isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
