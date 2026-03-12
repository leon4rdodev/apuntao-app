/**
 * @file app/_layout.tsx
 * @description Layout raíz de la aplicación. Ensambla los proveedores
 * y utiliza un hook para manejar la navegación protegida.
 */
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen as ExpoSplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { GlobalNotification } from '@/components/ui/GlobalNotification';
import { getFromStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

ExpoSplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const colorScheme = useColorScheme();
    const { session, isLoading } = useAuth();
    const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    
    const [hasOnboarded, setHasOnboarded] = React.useState<boolean | null>(null);

    // Leer onboarding desde AsyncStorage una vez
    useEffect(() => {
        (async () => {
            const onboarded = await getFromStorage<boolean>(STORAGE_KEYS.HAS_ONBOARDED);
            setHasOnboarded(!!onboarded);
        })();
    }, []);

    const isAppReady = !isLoading && hasOnboarded !== null;

    useEffect(() => {
        if (isAppReady) {
            ExpoSplashScreen.hideAsync();
        }
    }, [isAppReady]);

    // Si la app no está lista (cargando auth o fonts), no renderizamos NADA de la UI,
    // garantizando que el usuario solo ve el Splash Screen nativo.
    if (!isAppReady) {
        return null;
    }

    return (
        <ThemeProvider value={navigationTheme}>
            <GlobalNotification />
            <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
                <Stack.Screen name="(app)" />
                <Stack.Screen name="(auth)" />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        // Proveedor de márgenes seguros absoluto para evitar el "salto" de UI
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            {/* Envolvemos toda la app en los proveedores. El orden importa. */}
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
