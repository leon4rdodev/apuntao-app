import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFromStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';

/**
 * Hook que protege las rutas de la aplicación.
 * Redirige al usuario basado en su estado de autenticación y onboarding.
 */
export function useProtectedRoute() {
    const { session, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

    useEffect(() => {
        // No hacer nada mientras el AuthProvider está cargando los datos iniciales.
        if (isLoading) {
            return;
        }

        const inAuthGroup = segments[0] === '(auth)';

        (async () => {
            const hasOnboarded = await getFromStorage<boolean>(STORAGE_KEYS.HAS_ONBOARDED);
            setHasCheckedOnboarding(true);

            if (!hasOnboarded) {
                // Si nunca ha visto el onboarding, forzarlo.
                return router.replace('/(auth)/onboarding');
            }

            // Si ha visto el onboarding, aplicar lógica de sesión.
            if (!session && !inAuthGroup) {
                // Si no hay sesión y está intentando acceder a la app, redirigir a login.
                return router.replace('/(auth)/login');
            } else if (session && inAuthGroup) {
                // Si tiene sesión y está en una pantalla de auth (ej. login), redirigir a la app.
                return router.replace('/(app)/(tabs)');
            }
        })();
    }, [session, segments, isLoading]);

    // Devolvemos un booleano para saber si ya se puede mostrar la UI
    return { isReady: !isLoading && hasCheckedOnboarding };
}
