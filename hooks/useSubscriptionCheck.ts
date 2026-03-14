import { useSessionStore } from '@/store/sessionStore';
import { useSubscriptionModalStore } from '@/store/subscriptionModalStore';
import { Subscription } from '@/types';
import { isSubscriptionExpired, hasClockBeenRolledBack } from '@/utils/subscription';
import { useNotification } from '@/store/notificationStore';

/**
 * Mapea el estado de la suscripción a un texto legible para el usuario.
 */
const getStatusText = (status: Subscription['status']) => {
    switch (status) {
        case 'expired':
            return 'vencida';
        case 'cancelled':
            return 'cancelada';
        case 'unknown':
            return 'desconocido'; // <-- CAMBIO: Añadido para 'unknown'
        default:
            return 'inactiva'; // Usaremos esto para cualquier otro estado no permitido
    }
};

/**
 * Hook para verificar el estado de la suscripción y mostrar el modal si está inactiva.
 * @returns Función booleana que retorna true si la acción es permitida, false si fue bloqueada.
 */
export function useSubscriptionCheck() {
    const subscription = useSessionStore((state: any) => state.subscription);
    const lastSyncTimestamp = useSessionStore((state: any) => state.lastSyncTimestamp);
    const showSubscriptionModal = useSubscriptionModalStore((state) => state.showModal);
    const showNotification = useNotification();

    const restrictedStatuses: Subscription['status'][] = [
        'expired',
        'cancelled',
        'unknown',
    ];

    /**
     * @returns {boolean} true si puede proceder, false si fue bloqueado y se mostró el modal.
     */
    const checkAndAlert = (): boolean => {
        // 1. Detección de Fraude por Reloj (Anti-Clock-Rollback)
        if (hasClockBeenRolledBack(lastSyncTimestamp)) {
            showNotification({
                message: 'Se detectó una fecha incorrecta en tu dispositivo. Por favor, ajústala a la hora real.',
                type: 'error',
            });
            showSubscriptionModal('unknown');
            return false;
        }

        // 2. Validación por Fecha de Expiración Autómática
        const isExpired = isSubscriptionExpired(subscription);
        
        if (restrictedStatuses.includes(subscription.status) || isExpired) {
            // Si expiró por fecha pero el estatus aún dice 'trial'/'active',
            // forzamos la visualización del modal de expiración.
            const displayStatus = isExpired ? 'expired' : subscription.status;
            showSubscriptionModal(displayStatus);
            return false;
        }
        return true;
    };

    return { checkAndAlert };
}
