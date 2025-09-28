// store/subscriptionModalStore.ts
import { create } from 'zustand';
import { Subscription } from '@/types';

// 1. Definir la forma del estado y las acciones
interface SubscriptionModalState {
    isVisible: boolean;
    status: Subscription['status'];
    showModal: (status: Subscription['status']) => void;
    hideModal: () => void;
}

// 2. Crear el store
export const useSubscriptionModalStore = create<SubscriptionModalState>((set) => ({
    isVisible: false,
    status: 'unknown', // <-- CAMBIO: Usamos 'unknown' como valor por defecto de restricción.

    showModal: (status) => set({ isVisible: true, status }),
    hideModal: () => set({ isVisible: false, status: 'unknown' }),
}));
