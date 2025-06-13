// apuntao-app-master/app/_layout.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { useSessionStore } from '@/store/sessionStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

// ✅ Configurar Google Sign-In (perfecto aquí)
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.file', 'openid', 'profile', 'email'],
    offlineAccess: true,
});

// ✅ Evita que el splash nativo se oculte hasta que se lo indiquemos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const initializeSession = useSessionStore((state) => state.initializeSession);

    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    const backgroundColor = colorScheme === 'dark' ? '#0f0f0f' : '#f8fafc';

    return (
        // El layout solo provee el contexto del tema y renderiza la ruta activa.
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={{ flex: 1, backgroundColor }}>
                <Slot />
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </View>
        </ThemeProvider>
    );
}
