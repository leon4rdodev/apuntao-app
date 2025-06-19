/**
 * @file app/(auth)/_layout.tsx
 * @description Layout para las pantallas de autenticación.
 * La lógica de redirección es manejada por el layout raíz.
 */
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
   
    // Si, tras inicializar, resulta que SÍ hay una cuenta,
   
    // Si no hay cuenta, este es el layout correcto. Mostramos las pantallas de auth.
    return <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }} />;
}