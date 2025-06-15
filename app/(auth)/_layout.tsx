/**
 * @file app/(auth)/_layout.tsx
 * @description Layout para las pantallas de autenticación.
 * Redirige a la app principal si ya existe una sesión activa.
 */
import { useSessionStore } from '@/store/sessionStore';
import { router, Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    const { account, isInitialized } = useSessionStore();

    // Mientras el store se inicializa, no renderizamos nada para evitar flashes.
    if (!isInitialized) {
        return null;
    }

    // Si la sesión ya se inicializó y SÍ hay una cuenta, redirigimos a la app.
    if (isInitialized && account) {
        router.replace('/(app)/(tabs)')
    }

    // Si no hay sesión, permitimos el acceso a las pantallas de login y registro.
    return <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }} />;
}
