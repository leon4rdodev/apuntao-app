// context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSessionStore } from '@/store/sessionStore';
import { useClientStore } from '@/store/clientStore';
import { useNotificationStore } from '@/store/notificationStore'; // Importamos notificationStore
import { ERROR_MESSAGES } from '@/constants'; // Importamos mensajes

const MINIMUM_SPLASH_TIME = 2000;

// Definimos la forma de los datos que proveerá el contexto
interface AuthContextData {
    signOut: () => void;
    session: Omit<any, 'clients'> | null; // Simplificado para brevedad, pero usa tu tipo de 'account'
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

/**
 * Hook para acceder fácilmente a los datos de autenticación desde cualquier componente.
 * @returns {AuthContextData} El estado y las funciones de autenticación.
 */
export const useAuth = () => {
    return useContext(AuthContext);
};

/**
 * Proveedor que envuelve la aplicación y gestiona el estado de autenticación.
 * Se encarga de la carga inicial de fuentes y de la sesión del usuario.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { account, initializeSessionFromStorage, syncAccountData, logout } = useSessionStore();
    const initializeClients = useClientStore((state) => state.actions.initializeClientsFromStorage);
    const setClients = useClientStore((state) => state.actions.setClients); // Para la sincronización

    const [isLoading, setIsLoading] = useState(true);
    const showNotification = useNotificationStore((state) => state.show);

    useEffect(() => {
        async function loadInitialData() {
            try {
                const start = Date.now();

                // 1. CARGA INICIAL (Caché): Carga lo más rápido posible (fonts, sesión, clientes)
                const dataPromises = Promise.all([
                    Font.loadAsync({
                        // ... fonts
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

                // 2. SINCRONIZACIÓN (API): Una vez cargado el caché y si hay una sesión, sincronizamos
                const sessionFromCache = useSessionStore.getState().account;

                let syncPromise: Promise<any> | null = null;
                if (sessionFromCache) {
                    // Sincronizar los datos del perfil y suscripción.
                    syncPromise = syncAccountData()
                        .then((syncedData) => {
                            // Si la sincronización trae nuevos clientes, actualizamos el store de clientes
                            if (syncedData?.clients) {
                                setClients(syncedData.clients);
                            }
                        })
                        .catch((error) => {
                            // Mostrar notificación si la sincronización falla (ej. sin internet o token expirado)
                            const errorMessage = error.message || ERROR_MESSAGES.NO_CONNECTION;
                            if (errorMessage !== ERROR_MESSAGES.SESSION_EXPIRED) {
                                showNotification({ message: errorMessage, type: 'error' });
                            }
                        });
                }

                // 3. MINIMUM SPLASH TIME: Asegurar el tiempo mínimo
                const elapsed = Date.now() - start;
                const remainingTime = Math.max(0, MINIMUM_SPLASH_TIME - elapsed);
                const timerPromise = new Promise((resolve) => setTimeout(resolve, remainingTime));

                // 4. Esperar el timer y la sincronización (si existe)
                await Promise.all([timerPromise, syncPromise]);
            } catch (error) {
                console.error('Error durante la carga inicial:', error);
            } finally {
                // Asegura que el estado de carga se desactive siempre.
                setIsLoading(false);
            }
        }

        loadInitialData();
    }, [initializeSessionFromStorage, initializeClients, syncAccountData, setClients]);

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
