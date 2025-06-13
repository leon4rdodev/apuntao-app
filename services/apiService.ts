// apuntao-app-master/services/apiService.ts

import { STORAGE_KEYS } from '@/constants';
import { getFromStorage, saveToStorage } from '@/utils/storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const APP_SESSION_KEY = '@app_session';

// Define la estructura de los tokens de nuestra app que se guardan
interface AppSessionData {
    accessToken: string;
    refreshToken: string;
}

// Lógica para evitar peticiones de refresco múltiples
let isRefreshing = false;
let failedQueue: { resolve: (value: string) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token!)));
    failedQueue = [];
};

/**
 * Función centralizada para realizar peticiones a nuestro backend.
 * - Adjunta el token de autenticación.
 * - Maneja el refresco automático de tokens.
 * - Lanza un error específico 'SESSION_EXPIRED' si la sesión no puede ser recuperada.
 *
 * @param endpoint - El path de la API a llamar (ej. '/api/subscription/sync').
 * @param options - Opciones estándar de la API Fetch.
 * @returns La respuesta de la API parseada como JSON.
 */
async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const appSession = await getFromStorage<AppSessionData>(APP_SESSION_KEY);

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (appSession?.accessToken) {
        headers.set('Authorization', `Bearer ${appSession.accessToken}`);
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (response.status === 401) {
        // Si no hay refresh token, la sesión no puede ser recuperada.
        if (!appSession?.refreshToken) {
            throw new Error('SESSION_EXPIRED');
        }

        // Si ya hay una petición de refresco en curso, encolar esta petición.
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((newToken) => {
                headers.set('Authorization', `Bearer ${newToken as string}`);
                return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers }).then((res) =>
                    res.json()
                );
            });
        }

        isRefreshing = true;

        try {
            const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: appSession.refreshToken }),
            });

            if (!refreshResponse.ok) {
                // Si el refresco falla, la sesión ha expirado definitivamente.
                throw new Error('SESSION_EXPIRED');
            }

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                await refreshResponse.json();
            const newAppSession: AppSessionData = {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken || appSession.refreshToken,
            };
            await saveToStorage(APP_SESSION_KEY, newAppSession);

            // Reintentar la petición original con el nuevo token.
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            processQueue(null, newAccessToken);
            response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        } catch (refreshError) {
            processQueue(refreshError, null);
            throw new Error('SESSION_EXPIRED'); // Lanzar el error estandarizado.
        } finally {
            isRefreshing = false;
        }
    }

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => ({ error: 'Error desconocido del servidor' }));
        throw new Error(errorData.error || `Error HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return response.json();
    }
    // No devuelve nada si la respuesta no tiene contenido (ej. 204)
}

/**
 * Orquesta el login completo: intercambia tokens de Google por los de la app
 * y guarda ambos conjuntos de tokens en su respectivo lugar en AsyncStorage.
 */
export const syncAndStoreSession = async (googleIdToken: string, googleAccessToken: string) => {
    const backendData = await apiFetch('/api/auth/google-sync', {
        method: 'POST',
        body: JSON.stringify({ idToken: googleIdToken }),
    });

    const appSession: AppSessionData = {
        accessToken: backendData.accessToken,
        refreshToken: backendData.refreshToken,
    };
    await saveToStorage(APP_SESSION_KEY, appSession);

    const googleUser = await GoogleSignin.getCurrentUser();
    if (!googleUser) throw new Error('No se pudo obtener la información de Google tras el login.');

    const googleAuthData = {
        user: googleUser.user,
        accessToken: googleAccessToken,
    };
    await saveToStorage(STORAGE_KEYS.AUTH_DATA, googleAuthData);

    return {
        ...googleUser.user,
        subscription: backendData.subscription,
    };
};

/**
 * Obtiene el estado más reciente de la suscripción del usuario desde el backend.
 */
export const fetchSubscriptionStatus = async () => {
    return await apiFetch('/api/subscription/sync', { method: 'GET' });
};
