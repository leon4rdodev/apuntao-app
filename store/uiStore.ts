import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  themeMode: ThemeMode;
  isBiometricsSupported: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  checkBiometrics: () => Promise<void>;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      isBiometricsSupported: false,
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleTheme: () => {
        const current = get().themeMode;
        if (current === 'light') set({ themeMode: 'dark' });
        else if (current === 'dark') set({ themeMode: 'light' });
        else set({ themeMode: 'dark' }); // De sistema a oscuro por defecto al tocar
      },
      checkBiometrics: async () => {
        const { isBiometricsAvailable } = require('@/utils/biometrics');
        const supported = await isBiometricsAvailable();
        set({ isBiometricsSupported: supported });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themeMode: state.themeMode }), // Solo persistir el tema
    }
  )
);
