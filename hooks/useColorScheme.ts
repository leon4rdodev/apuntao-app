import { useColorScheme as useRNColorScheme } from 'react-native';
import { useUIStore } from '@/store/uiStore';

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const themeMode = useUIStore((state) => state.themeMode);

  if (themeMode === 'system') {
    return systemColorScheme;
  }
  
  return themeMode;
}
