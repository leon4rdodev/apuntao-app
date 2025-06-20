/**
 * @file app/_layout.tsx
 * @description Layout raíz de la aplicación. Configura proveedores, carga de fuentes y oculta el splash screen.
 */
import { GlobalNotification } from '@/components/ui/GlobalNotification';
import { ClientProvider } from '@/context/ClientContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
// --- Mantenemos la importación de Stack ---
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const colorScheme = useColorScheme();
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadResourcesAndData() {
            try {
                await Font.loadAsync({
                    ...Ionicons.font,
                    ...MaterialIcons.font,
                    ...Entypo.font,
                    ...AntDesign.font,
                    ...FontAwesome.font,
                });
            } catch (e) {
                console.warn('Error al cargar las fuentes:', e);
            } finally {
                setFontsLoaded(true);
            }
        }

        loadResourcesAndData();
    }, []);

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

    return (
        <ThemeProvider value={navigationTheme}>
            <GlobalNotification />
            <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }} />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <ClientProvider>
            <RootLayoutNav />
        </ClientProvider>
    );
}