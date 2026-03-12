/**
 * @file app/(auth)/_layout.tsx
 * @description Layout para las pantallas de autenticación.
 * Gestiona las redirecciones de onboarding y sesión activa.
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

    // 1. Si el usuario ya inició sesión, mandarlo a la app principal
    if (session) {
        return <Redirect href="/(app)/(tabs)" />;
    }

    // 2. Si nunca hizo el onboarding, mostrarlo primero
    if (!hasOnboarded) {
        return <Redirect href="/(auth)/onboarding" />;
    }

    // 3. Si ya hizo el onboarding pero no tiene sesión, ir al login
    return <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }} />;
}