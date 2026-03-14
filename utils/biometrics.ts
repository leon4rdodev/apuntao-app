/**
 * @file utils/biometrics.ts
 * @description Utilidades para manejar la autenticación biométrica (Huella, Rostro, etc.)
 * utilizando expo-local-authentication.
 */

import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Verifica si el hardware soporta biometría y si hay registros configurados.
 * @returns true si está disponible y listo para usar.
 */
export const isBiometricsAvailable = async (): Promise<boolean> => {
    try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    } catch (error) {
        console.error('Error al verificar disponibilidad de biometría:', error);
        return false;
    }
};

/**
 * Lanza el prompt de autenticación biométrica del sistema.
 * @param message Mensaje personalizado para mostrar en el prompt (Android).
 * @returns true si la autenticación fue exitosa.
 */
export const authenticateBiometrics = async (message: string = 'Verifica tu identidad'): Promise<boolean> => {
    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: message,
            fallbackLabel: 'Usar código',
            disableDeviceFallback: false,
        });
        return result.success;
    } catch (error) {
        console.error('Error durante la autenticación biométrica:', error);
        return false;
    }
};
