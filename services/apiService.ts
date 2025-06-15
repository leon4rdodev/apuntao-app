/**
 * @file apiService.ts
 * @description Servicio centralizado para todas las comunicaciones con el backend de Apunta'o.
 * Se encarga de la autenticación, el refresco de tokens y las llamadas a la API.
 * @version 2.0
 */

import { router } from 'expo-router';
import { API_URLS, ERROR_MESSAGES, STORAGE_KEYS } from '@/constants';
import type { AppSessionData } from '@/types';
import { getFromStorage, removeFromStorage, saveToStorage } from '@/utils/storage';

// --- Configuración y Estado Interno ---

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/** Flag para prevenir múltiples peticiones de refresco de token simultáneas. */
let isRefreshing = false;
/** Cola de peticiones que fallaron por token expirado y esperan uno nuevo. */
let failedQueue: { resolve: (token: string) => void; reject: (reason?: any) => void }[] = [];

/**
 * Procesa la cola de peticiones fallidas, reintentándolas con el nuevo token o rechazándolas si el refresco falló.
 * @param {any | null} error - El error que ocurrió durante el refresco, o null si fue exitoso.
 * @param {string | null} token - El nuevo accessToken, o null si el refresco falló.
 */
const processQueue = (error: any | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

/**
 * Función central para realizar peticiones autenticadas a nuestro backend.
 * - Adjunta el `accessToken` a las cabeceras.
 * - Maneja automáticamente el refresco de tokens cuando la respuesta es 401.
 * - Implementa una cola para evitar múltiples peticiones de refresco simultáneas.
 * - Desconecta al usuario si el `refreshToken` es inválido.
 *
 * @param {string} endpoint - El path de la API a llamar (ej. '/api/data/sync').
 * @param {RequestInit} options - Opciones estándar de la API Fetch.
 * @returns {Promise<any>} La respuesta de la API parseada como JSON.
 * @throws Lanza un error con un mensaje descriptivo si la petición falla.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const session = await getFromStorage<AppSessionData>(STORAGE_KEYS.APP_SESSION);
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (session?.accessToken) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        if (response.status === 401) {
            if (!session?.refreshToken) {
                // Si no hay refresh token, la sesión no es recuperable.
                throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
            }

            if (isRefreshing) {
                // Si ya se está refrescando el token, encolamos esta petición.
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            headers.set('Authorization', `Bearer ${token}`);
                            resolve(fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers }));
                        },
                        reject,
                    });
                }).then(async (retryResponse: any) => {
                    const data = await retryResponse.json();
                    if (!retryResponse.ok) throw data;
                    return data;
                });
            }

            isRefreshing = true;

            try {
                const refreshResponse = await fetch(`${API_BASE_URL}${API_URLS.REFRESH_TOKEN}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: session.refreshToken }),
                });

                if (!refreshResponse.ok) {
                    throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
                }

                const newSessionData: Partial<AppSessionData> = await refreshResponse.json();
                const newFullSession: AppSessionData = {
                    accessToken: newSessionData.accessToken!,
                    refreshToken: newSessionData.refreshToken || session.refreshToken,
                };
                await saveToStorage(STORAGE_KEYS.APP_SESSION, newFullSession);

                processQueue(null, newFullSession.accessToken);
                // Reintentar la petición original con la cabecera ya actualizada
                headers.set('Authorization', `Bearer ${newFullSession.accessToken}`);
                const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers,
                });
                const data = await retryResponse.json();
                if (!retryResponse.ok) throw data;
                return data;
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Si el refresco falla, la sesión es inválida
                await logout();
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: `Error del servidor: ${response.statusText}`,
            }));
            const errorMessage =
                typeof errorData.error === 'object'
                    ? Object.values(errorData.error).flat().join(' ')
                    : errorData.error;
            throw new Error(errorMessage || ERROR_MESSAGES.GENERIC_ERROR);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }
        // Para respuestas sin contenido (ej. 204 No Content)
        return;
    } catch (error) {
        // Si el error ya fue manejado (ej. sesión expirada), lo relanzamos para que se ejecute el logout.
        if (error instanceof Error && error.message === ERROR_MESSAGES.SESSION_EXPIRED) {
            await logout();
        }
        throw error; // Re-lanzar para que el llamador pueda manejarlo.
    }
}

/**
 * Cierra la sesión del usuario, limpia el almacenamiento y redirige a la pantalla de login.
 * Esta función es segura de llamar desde cualquier parte de la app.
 */
export async function logout() {
    console.log('Cerrando sesión y limpiando datos...');
    await removeFromStorage(STORAGE_KEYS.APP_SESSION);
    await removeFromStorage(STORAGE_KEYS.ACCOUNT_INFO);
    await removeFromStorage(STORAGE_KEYS.CLIENTS);
    // Usamos un pequeño timeout para asegurar que la navegación no interfiera con otros procesos.
    setTimeout(() => router.replace('/(auth)/login'), 0);
}
