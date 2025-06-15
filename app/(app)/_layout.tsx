import { Stack } from 'expo-router';

export default function AppStackLayout() {
    return (
        <Stack>
            {/* La pantalla principal son las pestañas. Ocultamos su header */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade_from_bottom' }} />

            {/* Aquí definimos la pantalla de detalle del cliente */}
            <Stack.Screen name="clients/[id]" />
        </Stack>
    );
}
