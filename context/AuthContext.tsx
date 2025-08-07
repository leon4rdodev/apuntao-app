// context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSessionStore } from '@/store/sessionStore';
import { useClientStore } from '@/store/clientStore';

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
    const { account, initializeSessionFromStorage, logout } = useSessionStore();
    const initializeClients = useClientStore(
            (state) => state.actions.initializeClientsFromStorage
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadInitialData() {
            try {
                // Inicia todas las tareas de carga de datos en paralelo
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

                // Establece un temporizador para la duración mínima del splash screen
                const timerPromise = new Promise((resolve) =>
                    setTimeout(resolve, MINIMUM_SPLASH_TIME)
                );

                // Espera a que tanto la carga de datos como el temporizador se completen
                await Promise.all([dataPromises, timerPromise]);
            } catch (error) {
                console.error('Error durante la carga inicial:', error);
                // Es importante continuar incluso si hay un error para no bloquear la app.
                // La lógica de redirección se encargará del estado sin sesión.
            } finally {
                // Asegura que el estado de carga se desactive siempre,
                // permitiendo que la app avance y el splash screen se oculte.
                setIsLoading(false);
            }
        }

        loadInitialData();
    }, [initializeSessionFromStorage, initializeClients]); // Se añade la dependencia para seguir las reglas de los hooks

    return (
        <AuthContext.Provider
            value={{
                signOut: logout, // Usamos la función de logout del store
                session: account,
                isLoading: isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
