/**
 * @file app/_layout.tsx
 * @description Layout raíz de la aplicación. Ensambla los proveedores
 * y utiliza un hook para manejar la navegación protegida.
 * Ghost update: Modal verification
 */
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen as ExpoSplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import * as Updates from 'expo-updates';
import { GlobalNotification } from '@/components/ui/GlobalNotification';
import { SafeAreaProvider, initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionModal from '@/components/clientsScreen/ActionModal';
import CustomText from '@/components/ui/CustomText';
import { AppState, AppStateStatus } from 'react-native';

ExpoSplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const colorScheme = useColorScheme();
    const { isLoading } = useAuth();
    const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    const [isUpdateModalVisible, setIsUpdateModalVisible] = React.useState(false);
    const insets = useSafeAreaInsets();

    const checkForUpdates = async () => {
        if (__DEV__) return;
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                setIsUpdateModalVisible(true);
            }
        } catch (error) {
            console.error('Error fetching latest Expo update:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
        } catch (e) {
            console.error(e);
            setIsUpdateModalVisible(false);
        }
    };

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                checkForUpdates();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (!isLoading) {
            ExpoSplashScreen.hideAsync();
            
            // Delayed check (3 seconds) to not block initial UI
            const timer = setTimeout(() => {
                checkForUpdates();
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (isLoading) {
        return null;
    }

    return (
        <ThemeProvider value={navigationTheme}>
            <GlobalNotification />
            <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(app)" />
                <Stack.Screen name="(auth)" />
            </Stack>

            <ActionModal
                isVisible={isUpdateModalVisible}
                onClose={() => setIsUpdateModalVisible(false)}
                title="Actualización disponible"
                paddingBottom={insets.bottom}
                actions={[
                    {
                        title: 'Más tarde',
                        onPress: () => setIsUpdateModalVisible(false),
                        buttonStyle: { backgroundColor: 'transparent', borderWidth: 1, borderColor: navigationTheme.colors.border },
                        textStyle: { color: navigationTheme.colors.text }
                    },
                    {
                        title: 'Actualizar',
                        onPress: handleUpdate,
                        iconName: 'cloud-download'
                    }
                ]}
            >
                <CustomText style={{ textAlign: 'center', opacity: 0.7 }}>
                    Hay una nueva versión de Apunta&apos;o lista con mejoras y correcciones. ¿Quieres actualizar ahora? La aplicación se reiniciará.
                </CustomText>
            </ActionModal>
            
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
