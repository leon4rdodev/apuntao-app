/**
 * @file app/_layout.tsx
 * @description Layout raíz de la aplicación. Ensambla los proveedores
 * y utiliza un hook para manejar la navegación protegida.
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

ExpoSplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const colorScheme = useColorScheme();
    const { session, isLoading } = useAuth();
    const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    const [isUpdateModalVisible, setIsUpdateModalVisible] = React.useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        async function onFetchUpdateAsync() {
            try {
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                    setIsUpdateModalVisible(true);
                }
            } catch (error) {
                console.error('Error fetching latest Expo update:', error);
            }
        }

        if (!__DEV__) {
            onFetchUpdateAsync();
        }
    }, []);

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
        if (!isLoading) {
            ExpoSplashScreen.hideAsync();
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
                        title: 'Actualizar ahora',
                        onPress: handleUpdate,
                        iconName: 'rocket'
                    }
                ]}
            >
                <CustomText style={{ textAlign: 'center', opacity: 0.7 }}>
                    Hay una nueva versión de Apunta'o lista con mejoras y correcciones. ¿Quieres actualizar ahora? La aplicación se reiniciará.
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
