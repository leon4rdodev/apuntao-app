/**
 * @file store/sessionStore.ts
 * @description Store de Zustand para gestionar el estado de la sesión del usuario (cuenta del colmado).
 */

import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants';
import { apiFetch, logout as apiLogout } from '@/services/apiService';
import type { Client, ColmadoAccountInfo, Subscription } from '@/types';
import { getFromStorage, saveToStorage } from '@/utils/storage';

// --- Definición de Tipos para el Estado ---

interface SessionState {
    /** La información completa de la cuenta del colmado. Null si no hay sesión. */
    account: ColmadoAccountInfo | null;
    /** El estado de la suscripción de la cuenta. */
    subscription: Subscription;
    /** Indica si el store ha intentado cargar la sesión inicial desde el storage. */
    isInitialized: boolean;

    /**
     * Establece la información de la cuenta.
     * @param {ColmadoAccountInfo | null} account - La información de la cuenta o null para limpiar.
     */
    setAccount: (account: ColmadoAccountInfo | null) => void;

    /**
     * Actualiza solo el estado de la suscripción.
     * @param {Subscription} subscription - El nuevo objeto de suscripción.
     */
    setSubscription: (subscription: Subscription) => void;

    /**
     * Inicializa la sesión al arrancar la app, cargando datos desde el almacenamiento.
     * Este método solo se debe llamar una vez al inicio.
     */
    initializeSession: () => Promise<void>;

    /**
     * Sincroniza los datos de la cuenta (clientes y suscripción) con el backend.
     * Es la fuente de verdad para los datos del usuario.
     * @returns {Promise<Client[]>} Una promesa que resuelve con la lista de clientes actualizada.
     */
    // ✅ CORRECCIÓN AQUÍ: Cambiamos Promise<void> por Promise<Client[] | undefined>
    syncAccountData: () => Promise<Client[] | undefined>;

    /**
     * Realiza el logout, limpiando el estado y el almacenamiento.
     */
    logout: () => Promise<void>;
}

// --- Creación del Store de Zustand ---

export const useSessionStore = create<SessionState>((set, get) => ({
    // --- Estado Inicial ---
    account: null,
    subscription: { status: 'loading', plan: 'none' },
    isInitialized: false,

    // --- Acciones (Mutations) ---
    setAccount: (account) => set({ account }),
    setSubscription: (subscription) => set({ subscription }),

    // --- Acciones de Ciclo de Vida y Sincronización ---

    /**
     * Carga la sesión desde el almacenamiento al iniciar la app.
     * Este método se ejecuta en la pantalla de arranque para determinar el estado inicial.
     */
    initializeSession: async () => {
        if (get().isInitialized) return;
        try {
            // Se asume que la información de la cuenta se guarda tras un login exitoso.
            const storedAccount = await getFromStorage<ColmadoAccountInfo>(
                STORAGE_KEYS.ACCOUNT_INFO
            );
            if (storedAccount) {
                set({
                    account: storedAccount,
                    subscription: storedAccount.subscription,
                    isInitialized: true,
                });
            } else {
                set({ isInitialized: true, account: null });
            }
        } catch (error) {
            console.error('Error al inicializar la sesión desde el storage:', error);
            set({
                isInitialized: true,
                account: null,
                subscription: { status: 'unknown', plan: 'none' },
            });
        }
    },

    /**
     * Obtiene los datos más recientes de la cuenta desde el backend (GET /api/data/sync)
     * y actualiza el estado local y el almacenamiento.
     */
    syncAccountData: async () => {
        try {
            // Primero, obtenemos la información del perfil del colmado (nombre, teléfono, etc.)
            // Asumimos que tienes un endpoint para esto, por ejemplo /api/account/me
            const accountInfo = await apiFetch('/api/account/me');

            // Luego, obtenemos los datos sincronizables (clientes, suscripción)
            const syncData = await apiFetch('/api/data/sync');

            // Combinamos toda la información
            const fullAccountData: ColmadoAccountInfo = {
                ...accountInfo,
                clients: syncData.clients,
                subscription: syncData.subscription,
            };

            // Actualizamos el estado y el almacenamiento local
            set({
                account: fullAccountData,
                subscription: fullAccountData.subscription,
            });
            await saveToStorage(STORAGE_KEYS.ACCOUNT_INFO, fullAccountData);

            // Devolvemos los clientes para que el ClientContext también se actualice
            return fullAccountData.clients;
        } catch (error) {
            console.error('Fallo al sincronizar datos de la cuenta:', error);
            // La lógica de logout en caso de error 401 ya la maneja apiFetch
            // No es necesario relanzar el error aquí, ya que el llamador no necesita manejarlo,
            // solo saber que no se devolvieron clientes.
            return undefined;
        }
    },

    /**
     * Cierra la sesión del usuario. Esta acción llama a la función de logout del apiService
     * para asegurar que todo se limpie de forma centralizada.
     */
    logout: async () => {
        set({ account: null, subscription: { status: 'unknown', plan: 'none' } });
        await apiLogout(); // Llama a la función centralizada de logout
    },
}));
