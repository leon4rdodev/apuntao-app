// context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { getFirestore, doc, onSnapshot } from '@react-native-firebase/firestore';
import * as Font from 'expo-font';
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSessionStore } from '@/store/sessionStore';
import { useClientStore } from '@/store/clientStore';
import { useUIStore } from '@/store/uiStore';

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
    const checkBiometrics = useUIStore((state) => state.checkBiometrics);
    
    // Función que implementaremos en clientStore.ts para sincronizar con Firestore
    const startFirestoreSync = useClientStore((state) => state.actions.startFirestoreSync);
    const stopFirestoreSync = useClientStore((state) => state.actions.stopFirestoreSync);

    const isHydrated = useClientStore((state) => state.isHydrated);
    const [isFontLoaded, setIsFontLoaded] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        // Cargamos todas las fuentes principales en paralelo usando Promise.all
        Promise.all([
            Font.loadAsync({ ...Ionicons.font }),
            Font.loadAsync({ ...MaterialIcons.font }),
            Font.loadAsync({ ...Entypo.font }),
            Font.loadAsync({ ...AntDesign.font }),
            Font.loadAsync({ ...FontAwesome.font }),
        ])
            .then(() => setIsFontLoaded(true))
            .catch((err) => {
                console.warn('Error cargando fuentes:', err);
                // Continuamos de todos modos para no bloquear la app indefinidamente
                setIsFontLoaded(true);
            })
            .finally(() => {
                // Verificar biometría una sola vez al inicio
                checkBiometrics();
            });
    }, [checkBiometrics]);

    useEffect(() => {
        const auth = getAuth();
        const db = getFirestore();
        let unsubProfile: (() => void) | null = null;

        const subscriber = onAuthStateChanged(auth, async (user) => {
            // Limpiar suscripción del perfil previo si existe
            if (unsubProfile) {
                unsubProfile();
                unsubProfile = null;
            }

            if (user) {
                // Iniciar sincronización de clientes — Firestore entrega caché local primero.
                startFirestoreSync(user.uid);

                setAccount({
                    colmadoName: 'Cargando...',
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || '',
                    subscription: { status: 'loading', plan: 'none' },
                });

                // Marcar auth como lista
                setIsAuthReady(true);
                setInitialized(true);

                const userRef = doc(db, 'users', user.uid);
                unsubProfile = onSnapshot(userRef, (userSnap) => {
                    const data = userSnap.data() as any;
                    if (!userSnap.metadata.fromCache) {
                        useSessionStore.getState().setSyncTimestamp(Date.now());
                    }

                    if (data) {
                        setAccount({
                            colmadoName: data.colmadoName || 'Mi Colmado',
                            email: user.email || data.email || '',
                            phoneNumber: data.phoneNumber || '',
                            subscription: data.subscription || { status: 'active', plan: 'none' },
                        });
                        setSubscription(data.subscription || { status: 'active', plan: 'none' });
                    }
                }, (error) => {
                    console.log('Perfil en caché (offline o error de red):', error.message);
                });

            } else {
                setAccount(null);
                stopFirestoreSync();
                setIsAuthReady(true);
                setInitialized(true);
            }
        });

        return () => {
            subscriber();
            if (unsubProfile) unsubProfile();
            stopFirestoreSync();
        };
    }, [setAccount, setSubscription, setInitialized, startFirestoreSync, stopFirestoreSync]);

    // isLoading ahora depende de que las fuentes estén listas, la sesión autenticada 
    // Y que el store de clientes esté hidratado (aunque sea del caché local).
    const isLoading = !isFontLoaded || !isAuthReady || (account !== null && !isHydrated);

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
