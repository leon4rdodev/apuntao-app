/**
 * @file app/_layout.tsx
 * @description Layout raíz de la aplicación. Configura proveedores de contexto, carga de fuentes
 * y la estructura de navegación principal. La lógica de redirección ahora se maneja aquí.
 */
import { GlobalNotification } from '@/components/ui/GlobalNotification';
import { ClientProvider } from '@/context/ClientContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Slot, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const colorScheme = useColorScheme();
    useEffect(() => {
        const load = async () => {
            try {
                await Promise.all([
                    Font.loadAsync({
                        ...Ionicons.font,
                        ...MaterialIcons.font,
                        ...Entypo.font,
                        ...AntDesign.font,
                        ...FontAwesome.font,
                    }),
                ]);
            } catch (e) {
                console.warn('Error al cargar recursos o inicializar la sesión:', e);
            }
        };

        load()
    }, []);

    const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

    return (
        <ThemeProvider value={navigationTheme}>
            <GlobalNotification />
                <Slot />
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