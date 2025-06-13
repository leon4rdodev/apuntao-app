import { ClientProvider } from '@/context/ClientContext';
import { Stack } from 'expo-router';

export default function AppStackLayout() {
    return (
        <ClientProvider>
            <Stack
                screenOptions={{animation: 'fade_from_bottom'}}
            >
                {/* La pantalla principal son las pestañas. Ocultamos su header */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                {/* Aquí definimos la pantalla de detalle del cliente */}
                <Stack.Screen
                    name="clients/[id]"
                    options={{
                        // El título y otras opciones se pueden configurar aquí
                        // o directamente en el archivo de la pantalla como ya lo hicimos.
                        headerBackTitle: 'Atrás', // Opcional: para iOS
                    }}
                />
            </Stack>
        </ClientProvider>
    );
}
