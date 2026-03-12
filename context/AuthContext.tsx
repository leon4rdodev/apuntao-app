// context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { getFirestore, collection, doc, getDoc } from '@react-native-firebase/firestore';
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
        const auth = getAuth();
        const db = getFirestore();

        const subscriber = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Iniciar la sincronización en tiempo real a Clientes de inmediato.
                // Firestore usará su propia persistencia local si no hay internet.
                startFirestoreSync(user.uid);

                // Intentar actualizar el perfil desde Firestore en segundo plano
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    const data = userSnap.data() as any;
                    
                    if (data) {
                        setAccount({
                            colmadoName: data.colmadoName || 'Mi Colmado',
                            email: user.email || data.email || '',
                            phoneNumber: data.phoneNumber || '',
                            subscription: data.subscription || { status: 'active', plan: 'none' },
                        });
                        setSubscription(data.subscription || { status: 'active', plan: 'none' });
                    }
                } catch (error: any) {
                    // Si falla (ej: estamos offline), no pasa nada, el 'sessionStore' 
                    // ya tiene los últimos datos gracias al middleware 'persist'.
                    console.log('Trabajando en modo offline o error al refrescar perfil:', error.message);
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
