import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Appearance } from 'react-native';

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
        const currentMode = get().themeMode;
        
        let nextMode: ThemeMode;
        if (currentMode === 'light') {
          nextMode = 'dark';
        } else if (currentMode === 'dark') {
          nextMode = 'light';
        } else {
          // Si es 'system', detectamos el tema actual real
          const systemTheme = Appearance.getColorScheme();
          nextMode = systemTheme === 'dark' ? 'light' : 'dark';
        }
        
        set({ themeMode: nextMode });
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
