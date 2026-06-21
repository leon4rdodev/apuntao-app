// store/notificationStore.ts

import { APP_CONFIG  } from '@/constants/index';
import { create } from 'zustand';

// 1. Definimos los tipos para el estado y las acciones
export type NotificationType = 'success' | 'error' | 'info';

interface NotificationState {
    isVisible: boolean;
    message: string;
    type: NotificationType;
    timerId?: ReturnType<typeof setTimeout>;
    activeModalCount: number;
}

interface NotificationActions {
    show: (payload: { message: string; type?: NotificationType; duration?: number }) => void;
    hide: () => void;
    registerModal: () => void;
    unregisterModal: () => void;
}

// 2. Definimos el estado inicial
const initialState: NotificationState = {
    isVisible: false,
    message: '',
    type: 'info',
    activeModalCount: 0,
};

// 3. Creamos el store
export const useNotificationStore = create<NotificationState & NotificationActions>((set, get) => ({
    ...initialState,

    show: ({ message, type = 'info', duration = APP_CONFIG.NOTIFICATION_AUTO_CLOSE_DURATION }) => {
        const { timerId } = get();
        if (timerId) {
            clearTimeout(timerId);
        }

        set({ isVisible: true, message, type });

        const newTimerId = setTimeout(() => {
            get().hide();
        }, duration);

        set({ timerId: newTimerId as any });
    },

    hide: () => {
        const { timerId } = get();
        if (timerId) {
            clearTimeout(timerId);
        }
        set({ isVisible: false, timerId: undefined });
        setTimeout(() => {
            set({ message: '' });
        }, 250);
    },

    registerModal: () => set((state) => ({ activeModalCount: state.activeModalCount + 1 })),
    unregisterModal: () => set((state) => ({ activeModalCount: Math.max(0, state.activeModalCount - 1) })),
}));

// 4. Creamos un hook selector para un uso más limpio
export const useNotification = () => useNotificationStore((state) => state.show);
