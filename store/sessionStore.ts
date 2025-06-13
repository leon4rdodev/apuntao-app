// apuntao-app-master/store/sessionStore.ts

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants';
import { fetchSubscriptionStatus } from '@/services/apiService';
import { StoredAuthData, UserInfo } from '@/types';
import { getFromStorage, removeFromStorage, saveToStorage } from '@/utils/storage';

// --- Definición de Tipos para el Estado ---

interface SubscriptionState {
    status: 'trial' | 'active' | 'expired' | 'cancelled' | 'loading' | 'unknown';
    plan: 'none' | 'monthly' | 'quarterly' | 'yearly';
    endDate?: string;
    trialEndDate?: string;
}

interface SessionState {
    user: UserInfo | null;
    subscription: SubscriptionState;
    isInitialized: boolean;

    setUser: (user: UserInfo | null) => void;
    setSubscription: (subscription: SubscriptionState) => void;

    initializeSession: () => Promise<void>;
    fetchAndUpdateSubscription: () => Promise<void>;
    logout: () => Promise<void>;
}

const APP_SESSION_KEY = '@app_session';

// --- Creación del Store de Zustand ---

export const useSessionStore = create<SessionState>((set, get) => ({
    // --- Estado Inicial ---
    user: null,
    subscription: { status: 'loading', plan: 'none' },
    isInitialized: false,

    // --- Acciones (Mutations) ---
    setUser: (user) => set({ user }),
    setSubscription: (subscription) => set({ subscription }),

    // --- Acciones de Ciclo de Vida ---

    /**
     * Carga la sesión desde el almacenamiento al iniciar la app.
     */
    initializeSession: async () => {
        try {
            const authData = await getFromStorage<StoredAuthData>(STORAGE_KEYS.AUTH_DATA);
            if (authData?.user) {
                set({
                    user: authData.user,
                    subscription: (authData.user as any).subscription || {
                        status: 'loading',
                        plan: 'none',
                    },
                    isInitialized: true,
                });
                // Sincronizar estado con el backend en segundo plano
                get().fetchAndUpdateSubscription();
            } else {
                set({ isInitialized: true, user: null });
            }
        } catch (error) {
            console.error('Error al inicializar la sesión:', error);
            set({
                isInitialized: true,
                user: null,
                subscription: { status: 'unknown', plan: 'none' },
            });
        }
    },

    /**
     * Actualiza el estado de la suscripción desde el backend.
     * Si la sesión expira durante la petición, llama a logout.
     */
    fetchAndUpdateSubscription: async () => {
        if (!get().user) return; // No hacer nada si no hay usuario

        try {
            const newSubscriptionData = await fetchSubscriptionStatus();
            set({ subscription: newSubscriptionData });

            const authData = await getFromStorage<StoredAuthData>(STORAGE_KEYS.AUTH_DATA);
            if (authData) {
                const updatedUser = { ...authData.user, subscription: newSubscriptionData };
                const updatedAuthData = { ...authData, user: updatedUser };
                await saveToStorage(STORAGE_KEYS.AUTH_DATA, updatedAuthData);
                set({ user: updatedUser });
            }
        } catch (error: any) {
            console.error('Fallo al actualizar la suscripción:', error.message);
            // Si el error es de sesión expirada, el store se encarga de cerrar la sesión.
            if (error.message === 'SESSION_EXPIRED') {
                await get().logout();
            }
        }
    },

    /**
     * Cierra la sesión del usuario por completo.
     */
    logout: async () => {
        try {
            await GoogleSignin.signOut();
            await removeFromStorage(STORAGE_KEYS.AUTH_DATA);
            await removeFromStorage(APP_SESSION_KEY);
        } catch (error) {
            console.error('Error durante el cierre de sesión:', error);
        } finally {
            // Garantiza que el estado se limpie y se redirija al usuario.
            set({
                user: null,
                subscription: { status: 'unknown', plan: 'none' },
                isInitialized: true,
            });
        }
    },
}));
