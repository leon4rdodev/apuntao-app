// Archivo: app/_layout.tsx

import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { GlobalNotification } from '@/components/ui/GlobalNotification';
import { ClientProvider } from '@/context/ClientContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSessionStore } from '@/store/sessionStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.file', 'openid', 'profile', 'email'],
    offlineAccess: true,
});

// Mantenemos la pantalla de bienvenida nativa visible
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const initializeSession = useSessionStore((state) => state.initializeSession);
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepareApp() {
            try {
                await Promise.all([
                    initializeSession(),
                    Font.loadAsync({
                        ...Ionicons.font,
                        ...MaterialIcons.font,
                        ...Entypo.font,
                        ...AntDesign.font,
                        ...FontAwesome.font,
                    }),
                ]);
            } catch (e) {
                console.warn('Error durante la preparación de la app:', e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepareApp();
    }, [initializeSession]);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    const backgroundColor = colorScheme === 'dark' ? '#0f0f0f' : '#f8fafc';

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <GlobalNotification />
            <View style={{ flex: 1, backgroundColor }} onLayout={onLayoutRootView}>
                <ClientProvider>
                    <Stack
                        screenOptions={{
                            animation: 'fade_from_bottom',
                            headerShown: false,
                        }}
                    />
                </ClientProvider>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </View>
        </ThemeProvider>
    );
}