import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleTheme: () => {
        const current = get().themeMode;
        if (current === 'light') set({ themeMode: 'dark' });
        else if (current === 'dark') set({ themeMode: 'light' });
        else set({ themeMode: 'dark' }); // De sistema a oscuro por defecto al tocar
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
