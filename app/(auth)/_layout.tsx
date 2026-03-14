/**
 * @file app/(auth)/_layout.tsx
 * @description Layout para las pantallas de autenticación.
 * 
 * IMPORTANTE: Siempre renderizamos el <Stack>. Nunca retornamos un <Redirect>
 * a una ruta dentro del mismo grupo (auth), porque el Stack no estaría montado
 * todavía y provoca un bucle infinito de re-renders (parpadeo).
 * 
 * La pantalla inicial se controla con `initialRouteName` basado en si
 * el usuario ya completó el onboarding o no.
 */
import { Redirect, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getFromStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';

export default function AuthLayout() {
    const { session, isLoading } = useAuth();
    const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

    useEffect(() => {
        (async () => {
            const onboarded = await getFromStorage<boolean>(STORAGE_KEYS.HAS_ONBOARDED);
            setHasOnboarded(!!onboarded);
        })();
    }, []);

    // Esperar hasta tener ambos estados resueltos antes de renderizar
    if (isLoading || hasOnboarded === null) {
        return null;
    }

    // Si hay sesión activa, salir del grupo auth hacia la app principal.
    // Esto es seguro porque (app) es un grupo diferente y su Stack ya está montado.
    if (session) {
        return <Redirect href="/(app)/(tabs)" />;
    }

    // Siempre renderizar el Stack. Controlamos la pantalla inicial con
    // `initialRouteName` para evitar bucles de redirección dentro del mismo grupo.
    return (
        <Stack
            initialRouteName={hasOnboarded ? 'login' : 'onboarding'}
            screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}
        />
    );
}