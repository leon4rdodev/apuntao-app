// context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSessionStore } from '@/store/sessionStore';
import { useClientStore } from '@/store/clientStore';
import { useNotificationStore } from '@/store/notificationStore';
import { ERROR_MESSAGES } from '@/constants';
import NetInfo from '@react-native-community/netinfo'; // 🔥 Importar NetInfo

const MINIMUM_SPLASH_TIME = 2000;

interface AuthContextData {
    signOut: () => void;
    session: Omit<any, 'clients'> | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { account, initializeSessionFromStorage, syncAccountData, logout } = useSessionStore();
    const initializeClients = useClientStore((state) => state.actions.initializeClientsFromStorage);
    // 🔥 Usamos mergeClients y processSyncQueue en lugar de setClients
    const mergeClients = useClientStore((state) => state.actions.mergeClients);
    const processSyncQueue = useClientStore((state) => state.actions.processSyncQueue);

    const [isLoading, setIsLoading] = useState(true);
    const showNotification = useNotificationStore((state) => state.show);

    // 🔥 Efecto para escuchar cambios de red y procesar la cola
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            if (state.isConnected) {
                processSyncQueue();
            }
        });
        return () => unsubscribe();
    }, [processSyncQueue]);

    useEffect(() => {
        async function loadInitialData() {
            try {
                const start = Date.now();

                // 1. CARGA INICIAL (Caché): Carga lo más rápido posible.
                // initializeClients ahora carga también la SyncQueue.
                const dataPromises = Promise.all([
                    Font.loadAsync({
                        ...Ionicons.font,
                        ...MaterialIcons.font,
                        ...Entypo.font,
                        ...AntDesign.font,
                        ...FontAwesome.font,
                    }),
                    initializeSessionFromStorage(),
                    initializeClients(),
                ]);

                await dataPromises;

                // 2. SINCRONIZACIÓN (API):
                const sessionFromCache = useSessionStore.getState().account;

                let syncPromise: Promise<any> | null = null;
                if (sessionFromCache) {
                    // 🔥 Antes de pedir datos, intentamos subir lo que tenemos pendiente
                    await processSyncQueue();

                    syncPromise = syncAccountData()
                        .then((syncedData) => {
                            if (syncedData?.clients) {
                                // 🔥 FUSIÓN INTELIGENTE: Mezclamos server con local
                                mergeClients(syncedData.clients);
                            }
                        })
                        .catch((error) => {
                            // Si falla, no pasa nada, seguimos con los datos locales (Offline First)
                            console.log('Sync failed, using offline data:', error);
                            // Solo mostramos error si NO es de red estándar
                            // (El usuario ya verá el indicador "Sin conexión")
                        });
                }

                const elapsed = Date.now() - start;
                const remainingTime = Math.max(0, MINIMUM_SPLASH_TIME - elapsed);
                const timerPromise = new Promise((resolve) => setTimeout(resolve, remainingTime));

                await Promise.all([timerPromise, syncPromise]);
            } catch (error) {
                console.error('Error durante la carga inicial:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadInitialData();
    }, [initializeSessionFromStorage, initializeClients, syncAccountData, mergeClients, processSyncQueue]);

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
