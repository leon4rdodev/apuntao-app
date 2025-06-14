// EDITADO: apuntao-app-master/app/index.tsx

import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { useSessionStore } from '@/store/sessionStore';

export default function CustomSplashScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const { isInitialized, user } = useSessionStore();
    const progress = useSharedValue(0);
    const opacity = useSharedValue(1); // <-- 1. Añadimos un valor para la opacidad

    // Función que decide a dónde navegar
    const navigateToApp = useCallback(() => {
        if (user) {
            router.replace('/(app)/(tabs)');
        } else {
            router.replace('/(auth)/onboarding');
        }
    }, [user, router]);

    // <-- 2. Nueva función que anima la salida y luego navega
    const navigateWithFadeOut = useCallback(() => {
        opacity.value = withTiming(
            0,
            {
                duration: 500, // Duración del fade-out
                easing: Easing.out(Easing.ease),
            },
            (finished) => {
                // Cuando la animación termina, ejecuta la navegación en el hilo de JS
                if (finished) {
                    runOnJS(navigateToApp)();
                }
            }
        );
    }, [opacity, navigateToApp]);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        let isMounted = true;

        async function prepareAndNavigate() {
            try {
                await SplashScreen.hideAsync();

                progress.value = withTiming(0.5, {
                    duration: 1500,
                    easing: Easing.out(Easing.cubic),
                });

                await Font.loadAsync({
                    ...Ionicons.font,
                    ...MaterialIcons.font,
                    ...Entypo.font,
                    ...AntDesign.font,
                    ...FontAwesome.font,
                });

                progress.value = withTiming(1, { duration: 1000, easing: Easing.linear });
                await new Promise((resolve) => setTimeout(resolve, 1000));

                if (!isMounted) return;

                // <-- 3. Llamamos a nuestra nueva función de animación
                navigateWithFadeOut();
            } catch (e) {
                console.warn('Error durante la preparación de la app:', e);
                if (isMounted) {
                    // También navegamos con fade-out en caso de error
                    runOnJS(navigateToApp)(); // O podrías usar navigateWithFadeOut() también aquí
                }
            }
        }

        prepareAndNavigate();

        return () => {
            isMounted = false;
        };
    }, [isInitialized, user, router, progress, navigateWithFadeOut, navigateToApp]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
        backgroundColor: theme.primary,
    }));

    // <-- 4. Estilo animado para el contenedor principal
    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        // <-- 5. Aplicamos el estilo animado al contenedor
        <Animated.View
            style={[
                styles.container,
                { backgroundColor: theme.background },
                containerAnimatedStyle,
            ]}
        >
            <Ionicons name="book-outline" size={60} color={theme.primary} />
            <Text style={[styles.text, { color: theme.text }]}>Apunta&apos;o</Text>
            <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
                <Animated.View style={[styles.progressBar, animatedStyle]} />
            </View>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Cargando tu negocio...
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    text: {
        fontSize: 32,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    progressBarBackground: {
        width: 200,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
});
