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

    const [isFontLoaded, setIsFontLoaded] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        // Solo cargamos Ionicons de forma bloqueante (es el único usado en el primer frame).
        // El resto se carga en segundo plano para no retrasar el splash screen.
        Font.loadAsync({ ...Ionicons.font })
            .then(() => setIsFontLoaded(true))
            .then(() => {
                // Carga diferida del resto — no bloquea la UI
                Font.loadAsync({
                    ...MaterialIcons.font,
                    ...Entypo.font,
                    ...AntDesign.font,
                    ...FontAwesome.font,
                }).catch(() => {/* Ignorar errores de fuentes secundarias */});
                
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

                // IMPORTANTE: Establecemos un usuario temporal ANTES de marcar auth como lista.
                // Esto evita que expo-router vea isLoading=false y session=null,
                // lo que causaba el destello (flash) de la pantalla de login.
                setAccount({
                    colmadoName: 'Cargando...',
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || '',
                    subscription: { status: 'loading', plan: 'none' }, // Cambiado a loading
                });

                // Marcar auth como lista INMEDIATAMENTE para que la UI cargue
                // con los datos locales sin esperar la red.
                setIsAuthReady(true);
                setInitialized(true);

                // Usar onSnapshot en lugar de getDoc para el perfil.
                // onSnapshot (Local-First): Entrega el perfil desde SQLite instantáneamente en ~5ms,
                // y luego actualiza en background si hay cambios en la nube.
                const userRef = doc(db, 'users', user.uid);
                unsubProfile = onSnapshot(userRef, (userSnap) => {
                    const data = userSnap.data() as any;
                    
                    // Si el snapshot no es del caché, es una confirmación de la hora real del servidor.
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
