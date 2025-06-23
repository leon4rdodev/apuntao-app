import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFromStorage, saveToStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import * as Font from 'expo-font';
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSessionStore } from '@/store/sessionStore';

const MINIMUM_SPLASH_TIME = 2000;

// Definimos la forma de los datos que proveerá el contexto
interface AuthContextData {
    signOut: () => void;
    session: Omit<any, 'clients'> | null; // Simplificado a 'any' por brevedad, pero usa tu tipo de 'account'
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
 * Se encarga de la carga inicial de fuentes, sesión y estado de onboarding.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { account, initializeSessionFromStorage, logout } = useSessionStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadDataAndRoute() {
            try {
                const timerPromise = new Promise((resolve) =>
                    setTimeout(resolve, MINIMUM_SPLASH_TIME)
                );

                // Cargar todo en paralelo para máxima eficiencia
                await Promise.all([
                    Font.loadAsync({
                        ...Ionicons.font,
                        ...MaterialIcons.font,
                        ...Entypo.font,
                        ...AntDesign.font,
                        ...FontAwesome.font,
                    }),
                    initializeSessionFromStorage(), // Carga la sesión desde el storage al store de Zustand
                    timerPromise,
                ]);
            } catch (error) {
                console.error('Error en la carga inicial:', error);
            } finally {
                // Una vez que todo ha cargado (incluyendo la espera mínima),
                // la app está lista para renderizar su contenido.
                setIsLoading(false);
            }
        }

        loadDataAndRoute();
    }, []);

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
