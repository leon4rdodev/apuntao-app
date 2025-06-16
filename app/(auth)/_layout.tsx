/**
 * @file app/(auth)/_layout.tsx
 * @description Layout para las pantallas de autenticación.
 * La lógica de redirección ahora es manejada por el layout raíz.
 */
import { useSessionStore } from '@/store/sessionStore';
import { router, Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    const { account, isInitialized } = useSessionStore();

    // ✅ CORRECCIÓN: Hemos eliminado la lógica de redirección de aquí.
    // Si la sesión ya existe, el guardia en el RootLayout se encargará de redirigir.
    if (!isInitialized) {
        return null;
    }

    // Si el usuario ya está logueado, lo redirigimos a la app.
    if (account) {
        return router.replace('/(app)/(tabs)');
    }

    // Simplemente renderizamos el Stack para las pantallas de este grupo.
    return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
