/**
 * @file app/_layout.tsx
 * @description Layout raíz de la aplicación. Configura proveedores de contexto, carga de fuentes
 * y la estructura de navegación principal. La lógica de redirección ahora se maneja aquí.
 */
import { GlobalNotification } from '@/components/ui/GlobalNotification';
import { Colors } from '@/constants/Colors';
import { ClientProvider } from '@/context/ClientContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSessionStore } from '@/store/sessionStore';
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

// Mantiene la pantalla de bienvenida visible mientras cargamos los recursos.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const { initializeSession, isInitialized, account } = useSessionStore();
    const segments = useSegments();
    const router = useRouter();

    // ✅ CÓDIGO CORREGIDO Y OPTIMIZADO
    // Este useEffect carga las fuentes y la sesión en paralelo para un inicio más rápido.
    useEffect(() => {
        const loadResourcesAndSession = async () => {
            try {
                // Inicia ambas tareas (cargar fuentes e inicializar sesión) al mismo tiempo.
                await Promise.all([
                    Font.loadAsync({
                        ...Ionicons.font,
                        ...MaterialIcons.font,
                        ...Entypo.font,
                        ...AntDesign.font,
                        ...FontAwesome.font,
                    }),
                    initializeSession(),
                ]);
            } catch (e) {
                // Es una buena práctica manejar cualquier error potencial durante la carga.
                console.warn('Error al cargar recursos o inicializar la sesión:', e);
            }
        };

        loadResourcesAndSession();
    }, [initializeSession]); // La dependencia es correcta, ya que initializeSession es estable.

    // Oculta la pantalla de bienvenida solo cuando la app está completamente inicializada.
    const onLayoutRootView = useCallback(async () => {
        if (isInitialized) {
            await SplashScreen.hideAsync();
        }
    }, [isInitialized]);

    // Este useEffect maneja las redirecciones de forma segura, DESPUÉS del renderizado.
    useEffect(() => {
        // No hacer nada hasta que la sesión esté cargada.
        if (!isInitialized) return;

        // Comprueba si el usuario está actualmente en las pantallas de la app (protegidas).
        const inAppGroup = segments[0] === '(app)';

        // Si el usuario está logueado pero está fuera de las pantallas de la app,
        // lo redirigimos adentro.
        if (account && !inAppGroup) {
            router.replace('/(app)/(tabs)');
        }
        // Si el usuario NO está logueado pero está dentro de las pantallas de la app,
        // lo redirigimos al flujo de autenticación.
        else if (!account && inAppGroup) {
            router.replace('/(auth)/onboarding');
        }
    }, [isInitialized, account, segments, router]);

    // Muestra una pantalla vacía (o un componente de carga) mientras se inicializa todo.
    // Esto, junto con `hideAsync`, asegura que no haya saltos de contenido.
    if (!isInitialized) {
        return null;
    }

    const theme = Colors[colorScheme || 'light'];
    const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

    return (
        <ThemeProvider value={navigationTheme}>
            <GlobalNotification />
            <ClientProvider>
                <View
                    style={{ flex: 1, backgroundColor: theme.background }}
                    onLayout={onLayoutRootView}
                >
                    {/* Slot renderizará el layout correcto ((app) o (auth)) basado en la URL actual. */}
                    <Slot />
                </View>
            </ClientProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
    );
}
