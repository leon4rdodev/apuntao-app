// apuntao-app-master/app/_layout.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthService } from '@/services/authService';
import { useSessionStore } from '@/store/sessionStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

const webClientId = process.env.EXPO_PUBLIC_WEB_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;

// ✅ Configurar Google Sign-In (perfecto aquí)
GoogleSignin.configure({
    webClientId,
    scopes: ['https://www.googleapis.com/auth/drive.file', 'openid', 'profile', 'email'],
    offlineAccess: true,
});

// ✅ Evita que el splash nativo se oculte hasta que se lo indiquemos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const initializeSession = useSessionStore((state) => state.initializeSession);
    
    if (androidClientId) {
        AuthService.checkAndRefreshToken(androidClientId);
    }

    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    const backgroundColor = colorScheme === 'dark' ? '#0f0f0f' : '#f8fafc';

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={{ flex: 1, backgroundColor }}>
                <Slot />
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </View>
        </ThemeProvider>
    );
}
