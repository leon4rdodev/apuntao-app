// apuntao-app-master/app/_layout.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { useSessionStore } from '@/store/sessionStore';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

// ✅ Configurar Google Sign-In una sola vez
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.file', 'openid', 'profile', 'email'],
    offlineAccess: true,
});

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const segments = useSegments();
    const router = useRouter();
    const { user, isInitialized } = useSessionStore();

    useEffect(() => {
        const prepare = async () => {
            await Font.loadAsync({
                ...Ionicons.font,
            });

            if (!isInitialized) return;

            const inApp = segments[0] === '(app)';

            if (user && !inApp) {
                router.replace('/(app)/(tabs)');
            } else if (!user && inApp) {
                router.replace('/(auth)/login');
            }

            await SplashScreen.hideAsync();
        };

        prepare();
    }, [user, segments, isInitialized, router]);

    return <Slot />;
}

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const initializeSession = useSessionStore((state) => state.initializeSession);

    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    const backgroundColor = colorScheme === 'dark' ? '#0f0f0f' : '#f8fafc';

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={{ flex: 1, backgroundColor }}>
                <RootLayoutNav />
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </View>
        </ThemeProvider>
    );
}
