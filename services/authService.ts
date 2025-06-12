/**
 * Servicio de autenticación
 * Maneja todas las operaciones relacionadas con la autenticación
 */

import * as AuthSession from 'expo-auth-session';
import { API_URLS, ERROR_MESSAGES, TOKEN_CONFIG } from '../constants';
import type { StoredAuthData, UserInfo } from '../types';
import { checkNetworkConnection, handleError } from '../utils/network';
import { getFromStorage, removeFromStorage, saveToStorage } from '../utils/storage';

/**
 * Clase para manejar operaciones de autenticación
 */
export class AuthService {
    /**
     * Verifica si el token está cerca de su expiración
     * @param expirationDate - Fecha de expiración en formato ISO
     * @returns true si el token está cerca de expirar
     */
    static isTokenNearExpiration(expirationDate: string): boolean {
        const expiration = new Date(expirationDate);
        const now = new Date();
        const thresholdTime = new Date(
            expiration.getTime() - TOKEN_CONFIG.REFRESH_THRESHOLD_MINUTES * 60 * 1000
        );
        return now >= thresholdTime;
    }

    /**
     * Obtiene información del usuario desde Google
     * @param accessToken - Token de acceso
     * @returns Información del usuario
     */
    static async getUserInfo(accessToken: string): Promise<UserInfo> {
        if (!accessToken) {
            throw new Error('AccessToken no proporcionado');
        }

        try {
            const response = await fetch(API_URLS.GOOGLE_USER_INFO, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!response.ok) {
                throw new Error(`Error getting user info: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            handleError(error, 'AuthService.getUserInfo');
            throw error;
        }
    }

    /**
     * Almacena datos de autenticación
     * @param user - Información del usuario
     * @param accessToken - Token de acceso
     * @param refreshToken - Token de refresco
     * @param expirationDate - Fecha de expiración
     */
    static async storeAuthData(
        user: UserInfo,
        accessToken: string,
        refreshToken: string,
        expirationDate: string
    ): Promise<void> {
        const authData: StoredAuthData = {
            user,
            accessToken,
            refreshToken,
            expirationDate,
        };

        await saveToStorage('@auth_data', authData);
    }

    /**
     * Carga datos de autenticación almacenados
     * @returns Datos de autenticación o null
     */
    static async loadStoredAuthData(): Promise<StoredAuthData | null> {
        return await getFromStorage<StoredAuthData>('@auth_data');
    }

    /**
     * Refresca el token de acceso
     * @param refreshToken - Token de refresco
     * @param clientId - ID del cliente
     * @returns Nuevos datos de autenticación
     */
    static async refreshToken(refreshToken: string, clientId: string): Promise<StoredAuthData> {
        const hasConnection = await checkNetworkConnection();
        if (!hasConnection) {
            throw new Error(ERROR_MESSAGES.NO_CONNECTION);
        }

        try {
            const tokenResult = await AuthSession.refreshAsync(
                { clientId, refreshToken },
                { tokenEndpoint: API_URLS.GOOGLE_TOKEN_REFRESH }
            );

            const expiresIn = tokenResult.expiresIn ?? TOKEN_CONFIG.DEFAULT_EXPIRES_IN;
            const user = await this.getUserInfo(tokenResult.accessToken);
            const expirationDate = new Date(new Date().getTime() + expiresIn * 1000).toISOString();

            const newAuthData: StoredAuthData = {
                user,
                accessToken: tokenResult.accessToken,
                refreshToken: tokenResult.refreshToken || refreshToken,
                expirationDate,
            };

            await this.storeAuthData(
                newAuthData.user,
                newAuthData.accessToken,
                newAuthData.refreshToken,
                newAuthData.expirationDate
            );

            return newAuthData;
        } catch (error) {
            handleError(error, 'AuthService.refreshToken');
            throw error;
        }
    }

    /**
     * Cierra la sesión del usuario
     */
    static async logout(): Promise<void> {
        try {
            await removeFromStorage('@auth_data');
        } catch (error) {
            handleError(error, 'AuthService.logout');
            throw error;
        }
    }

    /**
     * Verifica y refresca el token si es necesario
     * @param clientId - ID del cliente
     * @returns true si el token es válido o se refrescó correctamente
     */
    static async checkAndRefreshToken(clientId: string): Promise<boolean> {
        try {
            const storedAuthData = await this.loadStoredAuthData();
            if (!storedAuthData) return false;

            if (this.isTokenNearExpiration(storedAuthData.expirationDate)) {
                await this.refreshToken(storedAuthData.refreshToken, clientId);
            }

            return true;
        } catch (error) {
            handleError(error, 'AuthService.checkAndRefreshToken');
            return false;
        }
    }
}
