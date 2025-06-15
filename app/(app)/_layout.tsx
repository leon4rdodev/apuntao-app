/**
 * @file app/(app)/_layout.tsx
 * @description Layout protegido para las pantallas principales de la aplicación.
 * Redirige al login si no hay una sesión activa.
 */
import { useSessionStore } from '@/store/sessionStore';
import { router, Stack } from 'expo-router';
import React from 'react';

export default function AppStackLayout() {
    const { account, isInitialized } = useSessionStore();

    // Mientras el store se inicializa, no renderizamos nada para evitar flashes.
    if (!isInitialized) {
        return null;
    }

    // Si hay una sesión, permitimos el acceso a las pantallas de la app.
    return (
        <Stack screenOptions={{animation: 'fade_from_bottom'}}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="clients/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
