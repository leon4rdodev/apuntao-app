// store/useCounterStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CounterStore = {
    count: number;
    increase: () => void;
    decrease: () => void;
    reset: () => void;
};

export const useCounterStore = create<CounterStore>()(
    persist(
        (set) => ({
            count: 0,
            increase: () => set((state) => ({ count: state.count + 1 })),
            decrease: () => set((state) => ({ count: state.count - 1 })),
            reset: () => set({ count: 0 }),
        }),
        {
            name: 'counter-storage', 
            storage: {
                getItem: async (key) => {
                    const value = await AsyncStorage.getItem(key);
                    return value ? JSON.parse(value) : null;
                },
                setItem: async (key, value) => {
                    await AsyncStorage.setItem(key, JSON.stringify(value));
                },
                removeItem: async (key) => {
                    await AsyncStorage.removeItem(key);
                },
            },
        }
    )
);
