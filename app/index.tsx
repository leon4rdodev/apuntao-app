// apuntao-app-master/app/index.tsx

import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
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

export default function SplashScreenComponent() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Obtenemos el estado de inicialización del store
    const { isInitialized, user } = useSessionStore();

    // Animación para la barra de progreso
    const progress = useSharedValue(0);

    useEffect(() => {
        let isMounted = true;

        async function prepareAndNavigate() {
            try {
                // Iniciar animación de carga
                progress.value = withTiming(0.5, {
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                });

                // Cargar fuentes e íconos (esto puede ser rápido si ya están en caché)
                await Font.loadAsync({
                    ...Ionicons.font,
                    ...MaterialIcons.font,
                    ...Entypo.font,
                    ...AntDesign.font,
                    ...FontAwesome.font,
                });

                // La inicialización de la sesión se dispara en el layout raíz,
                // aquí solo esperamos a que termine.

                // Simular que la carga restante toma tiempo
                progress.value = withTiming(1, { duration: 1500, easing: Easing.linear });

                // Esperar un poco para que la animación se vea bien
                await new Promise((resolve) => setTimeout(resolve, 1500));

                if (!isMounted) return;

                // Cuando la sesión esté inicializada, decidimos a dónde ir
                if (isInitialized) {
                    if (user) {
                        router.replace('/(app)/(tabs)');
                    } else {
                        router.replace('/(auth)/onboarding');
                    }
                }
            } catch (e) {
                console.warn('Error durante la preparación de la app:', e);
                // En caso de error, podríamos redirigir a una pantalla de error o al login.
                if (isMounted) {
                    router.replace('/(auth)/login');
                }
            }
        }

        if (isInitialized) {
            prepareAndNavigate();
        }

        return () => {
            isMounted = false;
        };
    }, [isInitialized, progress, router, user]); // El efecto se dispara cuando isInitialized cambia a true

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
        backgroundColor: theme.primary,
    }));

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
