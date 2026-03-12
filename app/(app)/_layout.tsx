/**
 * @file app/(app)/_layout.tsx
 * @description Layout protegido para las pantallas principales de la aplicación.
 * La lógica de redirección ahora es manejada por el layout raíz.
 */
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import SubscriptionRenewalModal from '@/components/modals/SubscriptionRenewalModal';
import { useAuth } from '@/context/AuthContext';

export default function AppStackLayout() {
    const { session, isLoading } = useAuth();

    // Redirección declarativa al Auth Stack si no hay usuario
    if (!isLoading && !session) {
        return <Redirect href="/(auth)/login" />;
    }

    // Hasta que sepamos el estado definitivo, no montamos el stack hijo para evitar flashes blancos
    if (isLoading) {
        return null;
    }

    return (
        <>
            {/* <-- Envolvemos en un Fragmento para incluir el modal --> */}
            <Stack screenOptions={{ animation: 'fade_from_bottom' }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="clients/[id]" options={{ headerShown: false }} />
            </Stack>
            {/* <-- AÑADIDO: El modal de renovación de suscripción ahora está disponible
               para (tabs) y clients/[id] --> */}
            <SubscriptionRenewalModal />
        </>
    );
}
