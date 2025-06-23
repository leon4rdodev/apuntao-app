/**
 * @file apiService.ts
 * @description Servicio centralizado para todas las comunicaciones con el backend de Apunta'o.
 * @version 2.2 - Manejo de errores específico del backend.
 */

import { router } from 'expo-router';
import { API_URLS, ERROR_MESSAGES, STORAGE_KEYS } from '@/constants';
import type { AppSessionData } from '@/types';
import { getFromStorage, removeFromStorage, saveToStorage } from '@/utils/storage';

const API_BASE_URL = 'https://apuntao-admin.vercel.app';

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (reason?: any) => void }[] = [];

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

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {},
    isPublic: boolean = false
): Promise<any> {
    const session = await getFromStorage<AppSessionData>(STORAGE_KEYS.APP_SESSION);
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (session?.accessToken && !isPublic) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        // Manejo de token expirado (solo para rutas protegidas)
        if (response.status === 401 && !isPublic) {
            if (!session?.refreshToken) {
                await logout();
                throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: async (token: string) => {
                            headers.set('Authorization', `Bearer ${token}`);
                            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                                ...options,
                                headers,
                            });
                            const data = await retryResponse.json();
                            if (!retryResponse.ok)
                                return reject(
                                    new Error(
                                        data.error || data.message || ERROR_MESSAGES.GENERIC_ERROR
                                    )
                                );
                            resolve(data);
                        },
                        reject,
                    });
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

                headers.set('Authorization', `Bearer ${newFullSession.accessToken}`);
                const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers,
                });

                if (!retryResponse.ok) {
                    const errorData = await retryResponse.json().catch(() => ({}));
                    throw new Error(
                        errorData.error || errorData.message || ERROR_MESSAGES.GENERIC_ERROR
                    );
                }

                return retryResponse.json();
            } catch (refreshError) {
                processQueue(refreshError, null);
                await logout();
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }

        // --- MANEJO DE ERRORES GENERAL (INCLUYENDO CREDENCIALES INCORRECTAS) ---
        // Este bloque se ejecuta para cualquier respuesta no exitosa (ej. 400, 401 en rutas públicas, 404, 500, etc.)
        if (!response.ok) {
            let errorMessage = ERROR_MESSAGES.GENERIC_ERROR; // Mensaje por defecto
            try {
                const errorData = await response.json();

                // *** LÓGICA CLAVE PARA CAPTURAR EL ERROR DEL BACKEND ***
                // Busca el mensaje en la propiedad "error" (como en tu caso) o "message".
                const backendMessage = errorData.error || errorData.message;

                if (backendMessage) {
                    // Si el mensaje es un objeto (común en errores de validación), lo convierte a string.
                    if (typeof backendMessage === 'object') {
                        errorMessage = Object.values(backendMessage).flat().join(' ');
                    } else {
                        // Si es un string (ej: "Credenciales incorrectas"), se asigna directamente.
                        errorMessage = String(backendMessage);
                    }
                } else if (response.status === 401) {
                    // Fallback específico para 401 si no hay mensaje en el cuerpo.
                    errorMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
                }
            } catch (e) {
                // Si el cuerpo del error no es JSON, usamos el texto de estado HTTP como fallback.
                errorMessage = `Error: ${response.statusText || response.status}`;
            }
            // Lanza un error con el mensaje específico para que la UI lo capture.
            throw new Error(errorMessage);
        }

        // Si la respuesta es exitosa, procesamos el cuerpo si es JSON.
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }

        // Retorna undefined para respuestas exitosas sin cuerpo (ej: 204 No Content).
        return;
    } catch (error: any) {
        // Si el error es de red (ej. no hay conexión), lo atrapa aquí y lo relanza.
        if (error.message.includes('Network request failed')) {
            throw new Error(ERROR_MESSAGES.NO_CONNECTION);
        }
        // Relanza cualquier otro error para que sea manejado por el código que llamó a `apiFetch`.
        throw error;
    }
}

/**
 * Cierra la sesión del usuario, limpia el almacenamiento y redirige a la pantalla de login.
 */
export async function logout() {
    console.log('Cerrando sesión y limpiando datos...');
    await removeFromStorage(STORAGE_KEYS.APP_SESSION);
    await removeFromStorage(STORAGE_KEYS.ACCOUNT_INFO);
    await removeFromStorage(STORAGE_KEYS.CLIENTS);
}
