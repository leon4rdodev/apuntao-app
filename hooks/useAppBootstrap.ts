// Archivo: app/hooks/useAppBootstrap.ts

import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Easing, runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';

import { AuthService } from '@/services/authService';
import { useSessionStore } from '@/store/sessionStore';

const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;
const ANIMATION_DURATION = 2000;

export function useAppBootstrap() {
    const router = useRouter();
    const { isInitialized, user } = useSessionStore();
    const progress = useSharedValue(0);

    const navigate = useCallback(async () => {
        // Esta función vive y se ejecuta en el hilo de JavaScript
        if (user) {
            try {
                if (ANDROID_CLIENT_ID) {
                    await AuthService.checkAndRefreshToken(ANDROID_CLIENT_ID);
                }
                router.replace('/(app)/(tabs)');
            } catch (error) {
                console.error(
                    'Falló la actualización del token, redirigiendo a onboarding:',
                    error
                );
                router.replace('/(auth)/onboarding');
            }
        } else {
            router.replace('/(auth)/onboarding');
        }
    }, [user, router]);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        progress.value = withTiming(
            1,
            {
                duration: ANIMATION_DURATION,
                easing: Easing.out(Easing.cubic),
            },
            (isFinished) => {
                // Este callback es un worklet y se ejecuta en el HILO DE UI.
                'use worklet';
                if (isFinished) {
                    // Aquí es donde le decimos a Reanimated:
                    // "Toma la función 'navigate' y ejecútala de vuelta en el HILO DE JS".
                    runOnJS(navigate)();
                }
            }
        );
    }, [isInitialized, navigate, progress]); // `navigate` está en las dependencias

    return { progress };
}
