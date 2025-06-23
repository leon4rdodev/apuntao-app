/**
 * @file app/_layout.tsx
 * @description Layout raíz de la aplicación. Ensambla los proveedores
 * y utiliza un hook para manejar la navegación protegida.
 */
import { ClientProvider } from '@/context/ClientContext';
import { AuthProvider, useAuth } from '@/context/AuthContext'; // Importamos el nuevo AuthProvider
import { useProtectedRoute } from '@/hooks/useProtectedRoute'; // Importamos el nuevo hook
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen as ExpoSplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { GlobalNotification } from '@/components/ui/GlobalNotification';
import { SplashScreenUI } from '@/components/ui/SplashScreenUI';

ExpoSplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const colorScheme = useColorScheme();

    // 1. Usar nuestros hooks de autenticación y protección.
    const { isLoading } = useAuth();
    const { isReady } = useProtectedRoute();

    useEffect(() => {
        // Ocultar el splash screen nativo solo cuando el hook nos diga que es seguro.
        if (isReady) {
            ExpoSplashScreen.hideAsync();
        }
    }, [isReady]);

    // 2. LA GUARDA DEFINITIVA: Si isLoading (o !isReady), mostrar el splash.
    // Esto previene CUALQUIER renderizado del Stack hasta que todo esté listo.
    if (isLoading || !isReady) {
        return <SplashScreenUI />;
    }

    const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

    // 3. Renderizar el Stack de forma segura.
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
        // Envolvemos toda la app en los proveedores. El orden importa.
        <AuthProvider>
            <ClientProvider>
                <RootLayoutNav />
            </ClientProvider>
        </AuthProvider>
    );
}
