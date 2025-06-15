/**
 * @file app/_layout.tsx
 * @description Layout raíz de la aplicación. Configura proveedores de contexto, carga de fuentes
 * y la estructura de navegación principal. La lógica de redirección se maneja en los layouts de grupo.
 */
import { GlobalNotification } from '@/components/ui/GlobalNotification';
import { Colors } from '@/constants/Colors';
import { ClientProvider } from '@/context/ClientContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSessionStore } from '@/store/sessionStore';
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

// Mantenemos la pantalla de bienvenida nativa visible mientras preparamos la app.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const { initializeSession, isInitialized } = useSessionStore();

    useEffect(() => {
        // Ejecutamos la carga de fuentes y la inicialización de la sesión en paralelo.
        Font.loadAsync({
            ...Ionicons.font,
            ...MaterialIcons.font,
            ...Entypo.font,
            ...AntDesign.font,
            ...FontAwesome.font,
        });
        initializeSession();
    }, [initializeSession]);

    const onLayoutRootView = useCallback(async () => {
        // Ocultamos la pantalla de bienvenida solo cuando la sesión esté inicializada.
        if (isInitialized) {
            await SplashScreen.hideAsync();
        }
    }, [isInitialized]);

    // No renderizamos nada hasta que la sesión esté inicializada para evitar flashes.
    if (!isInitialized) {
        return null;
    }

    const theme = Colors[colorScheme || 'light'];
    const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

    return (
        <ThemeProvider value={navigationTheme}>
            <GlobalNotification />
            <ClientProvider>
                <View
                    style={{ flex: 1, backgroundColor: theme.background }}
                    onLayout={onLayoutRootView}
                >
                    <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }} />
                </View>
            </ClientProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
    );
}
