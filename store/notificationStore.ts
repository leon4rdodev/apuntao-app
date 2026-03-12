// store/notificationStore.ts

import { APP_CONFIG  } from '@/constants/index';
import { create } from 'zustand';

// 1. Definimos los tipos para el estado y las acciones
export type NotificationType = 'success' | 'error' | 'info';

interface NotificationState {
    isVisible: boolean;
    message: string;
    type: NotificationType;
    // CORRECCIÓN: El tipo de timerId en React Native es `number`.
    timerId?: number;
}

interface NotificationActions {
    show: (payload: { message: string; type?: NotificationType; duration?: number }) => void;
    hide: () => void;
}

// 2. Definimos el estado inicial
const initialState: NotificationState = {
    isVisible: false,
    message: '',
    type: 'info',
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

        set({ timerId: newTimerId });
    },

    hide: () => {
        const { timerId } = get();
        if (timerId) {
            clearTimeout(timerId);
        }
        // Primero ocultamos visualmente (dispara la animación de salida)
        set({ isVisible: false, timerId: undefined });
        // Luego limpiamos el mensaje después de la animación de salida (~200ms)
        // para que el componente se desmonte y no bloquee eventos de toque
        setTimeout(() => {
            set({ message: '' });
        }, 250);
    },
}));

// 4. Creamos un hook selector para un uso más limpio
export const useNotification = () => useNotificationStore((state) => state.show);
