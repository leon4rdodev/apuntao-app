import { useSessionStore } from '@/store/sessionStore';
import { useSubscriptionModalStore } from '@/store/subscriptionModalStore';
import { Subscription } from '@/types';

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
    const subscription = useSessionStore((state) => state.subscription);
    const showSubscriptionModal = useSubscriptionModalStore((state) => state.showModal);

    const restrictedStatuses: Subscription['status'][] = [
        'expired',
        'cancelled',
        'unknown',
    ];

    /**
     * @returns {boolean} true si puede proceder, false si fue bloqueado y se mostró el modal.
     */
    const checkAndAlert = (): boolean => {
        if (restrictedStatuses.includes(subscription.status)) {
            // Muestra el modal estilizado en lugar del Alert simple
            showSubscriptionModal(subscription.status);
            return false;
        }
        return true;
    };

    return { checkAndAlert };
}
