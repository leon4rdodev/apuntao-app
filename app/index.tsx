// apuntao-app-master/app/index.tsx


import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen'; // Importa SplashScreen aquí
import React, { useEffect } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { useSessionStore } from '@/store/sessionStore';
import { Ionicons } from '@expo/vector-icons';

export default function CustomSplashScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const { isInitialized, user } = useSessionStore();
    const progress = useSharedValue(0);

    useEffect(() => {
        // Solo procederemos cuando el store de sesión haya terminado de inicializarse.
        if (!isInitialized) {
            return;
        }

        let isMounted = true;

        async function prepareAndNavigate() {
            try {
                // 1. Ocultamos el splash nativo para mostrar nuestro splash personalizado.
                await SplashScreen.hideAsync();

                // 2. Iniciar animación de carga.
                progress.value = withTiming(0.5, {
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                });

                // 3. Cargar fuentes e íconos.
                

                // 4. Completar la animación y esperar para una mejor UX.
                progress.value = withTiming(1, { duration: 1500, easing: Easing.linear });
                await new Promise((resolve) => setTimeout(resolve, 1500));

                if (!isMounted) return;

                // 5. Redirigir según el estado del usuario.
                // Esta pantalla será reemplazada, por lo que no se podrá volver a ella.
                if (user) {
                    router.replace('/(app)/(tabs)');
                } else {
                    router.replace('/(auth)/onboarding');
                }
            } catch (e) {
                console.warn('Error durante la preparación de la app:', e);
                if (isMounted) {
                    // En caso de error, es seguro redirigir al login.
                    router.replace('/(auth)/login');
                }
            }
        }

        prepareAndNavigate();

        return () => {
            isMounted = false;
        };
        // Dependemos de `isInitialized` para empezar, y de `user` para la redirección.
    }, [isInitialized, user, router, progress]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
        backgroundColor: theme.primary,
    }));

    // Mientras isInitialized es false, se sigue mostrando el splash nativo.
    // Cuando se vuelve true, este componente se renderiza y toma el control.
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Ionicons name="book-outline" size={60} color={theme.primary} />
            <Text style={[styles.text, { color: theme.text }]}>Apunta&apos;o</Text>
            <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
                <Animated.View style={[styles.progressBar, animatedStyle]} />
            </View>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Cargando tu negocio...
            </Text>
        </View>
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
