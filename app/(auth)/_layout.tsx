/**
 * @file app/(auth)/_layout.tsx
 * @description Layout para las pantallas de autenticación.
 */
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    // Si hay sesión activa, salir del grupo auth hacia la app principal.
    if (session) {
        return <Redirect href="/(app)/(tabs)" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }} />
    );
}