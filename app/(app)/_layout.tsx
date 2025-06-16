/**
 * @file app/(app)/_layout.tsx
 * @description Layout protegido para las pantallas principales de la aplicación.
 * La lógica de redirección ahora es manejada por el layout raíz.
 */
import { Stack } from 'expo-router';
import React from 'react';

export default function AppStackLayout() {
    // Simplemente renderizamos el Stack para las pantallas de este grupo.
    return (
        <Stack screenOptions={{ animation: 'fade' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="clients/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
