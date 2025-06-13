/**
 * Servicio de autenticación para Google.
 * Maneja la verificación y el refresco de tokens de acceso para interactuar
 * con las APIs de Google, como Google Drive.
 */

import * as AuthSession from 'expo-auth-session';
import { API_URLS, ERROR_MESSAGES, STORAGE_KEYS, TOKEN_CONFIG } from '../constants';
import type { StoredAuthData, UserInfo } from '../types';
import { checkNetworkConnection, handleError } from '../utils/network';
import { getFromStorage, saveToStorage } from '../utils/storage';

/**
 * Clase para manejar operaciones de autenticación con Google.
 */
export class AuthService {
    /**
     * Verifica si un token de acceso está cerca de su fecha de expiración.
     * @param expirationDate - La fecha de expiración del token en formato ISO.
     * @returns `true` si el token está por expirar, de lo contrario `false`.
     */
    private static isTokenNearExpiration(expirationDate: string): boolean {
        const expiration = new Date(expirationDate);
        const now = new Date();
        const thresholdTime = new Date(
            expiration.getTime() - TOKEN_CONFIG.REFRESH_THRESHOLD_MINUTES * 60 * 1000
        );
        return now >= thresholdTime;
    }

    /**
     * Carga los datos de autenticación guardados desde el almacenamiento local.
     * @returns Una promesa que resuelve con los datos de autenticación o `null` si no se encuentran.
     */
    private static async loadStoredAuthData(): Promise<StoredAuthData | null> {
        return await getFromStorage<StoredAuthData>(STORAGE_KEYS.AUTH_DATA);
    }

    /**
     * Refresca el token de acceso de Google usando un token de refresco.
     * Guarda los nuevos tokens y la información actualizada del usuario.
     * @param refreshToken - El token de refresco válido.
     * @param clientId - El Client ID de Android para la autenticación.
     * @returns Una promesa que resuelve con los nuevos datos de autenticación.
     * @throws Lanza un error si la red no está disponible o si el refresco falla.
     */
    private static async refreshToken(
        refreshToken: string,
        clientId: string
    ): Promise<StoredAuthData> {
        const hasConnection = await checkNetworkConnection();
        if (!hasConnection) {
            throw new Error(ERROR_MESSAGES.NO_CONNECTION);
        }

        try {
            // Solicita un nuevo token de acceso a Google
            const tokenResult = await AuthSession.refreshAsync(
                { clientId, refreshToken },
                { tokenEndpoint: API_URLS.GOOGLE_TOKEN_REFRESH }
            );

            // Calcula la nueva fecha de expiración
            const expiresIn = tokenResult.expiresIn ?? TOKEN_CONFIG.DEFAULT_EXPIRES_IN;
            const expirationDate = new Date(new Date().getTime() + expiresIn * 1000).toISOString();

            // Obtiene la información actualizada del usuario con el nuevo token
            const response = await fetch(API_URLS.GOOGLE_USER_INFO, {
                headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
            });
            if (!response.ok) {
                throw new Error(`Error getting user info after refresh: ${response.status}`);
            }
            const user: UserInfo = await response.json();

            // Construye y guarda los nuevos datos de autenticación
            const newAuthData: StoredAuthData = {
                user,
                accessToken: tokenResult.accessToken,
                refreshToken: tokenResult.refreshToken || refreshToken, // Google puede o no devolver un nuevo refresh_token
                expirationDate,
            };

            await saveToStorage(STORAGE_KEYS.AUTH_DATA, newAuthData);

            return newAuthData;
        } catch (error) {
            handleError(error, 'AuthService.refreshToken');
            // Si el refresco falla, es probable que la sesión haya expirado permanentemente.
            // La lógica que llama a esta función deberá manejar este error (ej: haciendo logout).
            throw error;
        }
    }

    /**
     * Verifica el estado del token de Google almacenado. Si está a punto de expirar,
     * intenta refrescarlo. Esta es la función principal a llamar desde otros servicios
     * antes de realizar una operación que requiera un token de Google válido.
     *
     * @param clientId - El Client ID de Android para la autenticación.
     * @returns Una promesa que resuelve a `true` si el token es válido o se refrescó
     *          exitosamente. Resuelve a `false` si no hay datos de sesión o si el
     *          refresco falla.
     */
    static async checkAndRefreshToken(clientId: string): Promise<boolean> {
        try {
            const storedAuthData = await this.loadStoredAuthData();
            if (!storedAuthData?.refreshToken) {
                console.warn('No hay datos de autenticación o refresh token para verificar.');
                return false;
            }

            if (this.isTokenNearExpiration(storedAuthData.expirationDate)) {
                console.log('Token de Google cerca de expirar, intentando refrescar...');
                await this.refreshToken(storedAuthData.refreshToken, clientId);
                console.log('Token de Google refrescado exitosamente.');
            }

            return true;
        } catch (error) {
            handleError(error, 'AuthService.checkAndRefreshToken');
            // Si checkAndRefreshToken falla, probablemente el usuario necesite volver a iniciar sesión.
            return false;
        }
    }
}
