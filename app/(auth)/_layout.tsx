/**
 * @file app/(auth)/_layout.tsx
 * @description Layout para las pantallas de autenticación.
 * La lógica de redirección es manejada por el layout raíz.
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

    // Evitar montajes prematuros
    if (isLoading || hasOnboarded === null) {
        return null; 
    }

    // Redirigir basado en el onboarding y la sesión
    if (!hasOnboarded) {
        // Permitimos montar las rutas de auth (que incluye onboarding)
        // pero idealmente deberías manejar si está en login redirigir a onboarding manualmente si quieres.
    } else if (session) {
        return <Redirect href="/(app)/(tabs)" />;
    }

    return <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }} />;
}