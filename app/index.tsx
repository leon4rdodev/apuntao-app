import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Font from 'expo-font';

import { STORAGE_KEYS } from '@/constants';
import { Colors } from '@/constants/Colors';
import { existsInStorage } from '@/utils/storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

let isLoguedIn: boolean = false;

// Configura Google Sign-In
GoogleSignin.configure({
    webClientId: '678047446795-nju0hhb4hq4pabp3q893fp7fh2i2gi98.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/drive.file', 'openid', 'profile', 'email'],
    offlineAccess: true,
    profileImageSize: 150,
    forceCodeForRefreshToken: true,
});

// 👇 Previene que el splash nativo desaparezca automáticamente
SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent() {
    const router = useRouter();
    const progress = useSharedValue(0);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        const prepare = async () => {
            try {
                // Cargar fuentes e íconos
                await Font.loadAsync({
                    ...Ionicons.font,
                    ...MaterialIcons.font,
                    ...Entypo.font,
                    ...AntDesign.font,
                    ...FontAwesome.font,
                });

                // Verifica si hay sesión
                const authData = await existsInStorage(STORAGE_KEYS.AUTH_DATA);
                isLoguedIn = !!authData;

                // Inicia animación de progreso
                progress.value = withTiming(1, {
                    duration: 5000,
                    easing: Easing.out(Easing.cubic),
                });

                // Espera a que termine la animación
                setTimeout(async () => {
                    await SplashScreen.hideAsync(); // Oculta el splash nativo
                    if (isLoguedIn) {
                        router.replace('/(app)/(tabs)');
                    } else {
                        router.replace('/(auth)/onboarding');
                    }
                }, 5000);
            } catch (error) {
                console.warn('Error preparando splash:', error);
            }
        };

        prepare();
    }, [progress, router]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
        backgroundColor: theme.primary,
    }));

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.quad),
        }),
        transform: [
            {
                scale: withTiming(1, {
                    duration: 1000,
                    easing: Easing.out(Easing.back(1.2)),
                }),
            },
        ],
    }));

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Animated.View style={[styles.content, containerAnimatedStyle]}>
                <Text style={[styles.text, { color: theme.text }]}>Cargando...</Text>
                <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
                    <Animated.View style={[styles.progressBar, animatedStyle]} />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
        fontWeight: '600',
    },
    progressBarBackground: {
        width: 250,
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
    },
});
