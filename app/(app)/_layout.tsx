/**
 * @file app/(app)/_layout.tsx
 * @description Layout protegido para las pantallas principales de la aplicación.
 * La lógica de redirección ahora es manejada por el layout raíz.
 */
import { Stack } from 'expo-router';
import React from 'react';
import SubscriptionRenewalModal from '@/components/modals/SubscriptionRenewalModal'; // <-- IMPORTADO

export default function AppStackLayout() {
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
