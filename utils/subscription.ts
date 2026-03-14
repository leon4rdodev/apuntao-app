/**
 * @file utils/subscription.ts
 * @description Utilidades para la validación segura de suscripciones y detección de fraude por reloj.
 */

import { Subscription } from '@/types';

/**
 * Determina si una suscripción ha expirado comparándola con el tiempo actual,
 * considerando posibles manipulaciones del reloj del dispositivo.
 */
export const isSubscriptionExpired = (
    subscription: Subscription,
    serverTimeOffset: number = 0
): boolean => {
    // Si no hay suscripción o está cargando, asumimos que no ha expirado para evitar bloqueos falsos
    if (!subscription || subscription.status === 'loading') return false;
    
    // Estados que ya están marcados como bloqueados explícitamente
    if (subscription.status === 'expired' || subscription.status === 'cancelled') return true;
    
    // La prueba gratuita y el plan activo dependen de una fecha final
    const expirationDateStr = subscription.status === 'trial' 
        ? subscription.trialEndDate 
        : subscription.endDate;

    if (!expirationDateStr) return false;

    try {
        const expirationDate = new Date(expirationDateStr);
        // Si la fecha guardada no es válida (ej. el formato viejo), intentamos parsearla
        // pero por ahora el sistema nuevo usará ISO.
        if (isNaN(expirationDate.getTime())) {
            // Logica trivial de fallback para el formato viejo: "Sábado, 21 de marzo..."
            // Es difícil de parsear precisamente sin librerías pesadas, así que si es viejo
            // daremos el beneficio de la duda hasta que se sincronice con el nuevo formato ISO.
            return false; 
        }

        // Tiempo "corregido": Hora Local + Offset del Servidor
        // El offset se calcula como: (HoraServidor - HoraLocal) al momento de la sincronización.
        const currentTime = Date.now() + serverTimeOffset;

        return currentTime > expirationDate.getTime();
    } catch (e) {
        console.error('Error validando fecha de suscripción:', e);
        return false;
    }
};

/**
 * Detecta si el usuario ha atrasado su reloj manualmente.
 * @param lastKnownTime El último timestamp del servidor que recibimos exitosamente.
 * @returns true si se detecta retroceso de tiempo.
 */
export const hasClockBeenRolledBack = (lastKnownTime: number): boolean => {
    if (!lastKnownTime) return false;
    // Si la hora actual es menor que la última hora que sabemos que fue "verdadera", hay fraude.
    // Damos un margen de 1 minuto por discrepancias menores.
    return Date.now() < (lastKnownTime - 60000);
};
