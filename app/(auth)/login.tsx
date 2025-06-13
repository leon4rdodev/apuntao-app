// EDITADO: apuntao-app-master/app/(auth)/login.tsx

import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
// --- ANOTACIÓN 1: Importar herramientas de Reanimated ---
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import FeatureItem from '@/components/ui/FeatureItem';
import { Colors } from '@/constants/Colors';
import { LoginFeatures } from '@/constants/FeatureItems';
import { syncAndStoreSession } from '@/services/apiService';
import { useSessionStore } from '@/store/sessionStore';

export default function LoginScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() || 'light';
    const theme = Colors[colorScheme];
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { setUser, setSubscription } = useSessionStore.getState();

    // --- ANOTACIÓN 2: Crear valor compartido para la opacidad ---
    const opacity = useSharedValue(1);

    // --- ANOTACIÓN 3: Crear estilo animado para el contenedor ---
    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const handleSignIn = async () => {
        if (isLoggingIn) return;
        setIsLoggingIn(true);

        try {
            await GoogleSignin.hasPlayServices();
            await GoogleSignin.signOut();
            await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();

            if (!tokens.idToken || !tokens.accessToken) {
                throw new Error('No se pudieron obtener los tokens de Google.');
            }

            const userWithSubscription = await syncAndStoreSession(
                tokens.idToken,
                tokens.accessToken
            );

            setUser(userWithSubscription);
            setSubscription(userWithSubscription.subscription);

            // --- ANOTACIÓN 4: Animar la salida antes de navegar ---
            // En lugar de navegar directamente, iniciamos la animación de fade-out.
            opacity.value = withTiming(
                0,
                {
                    duration: 400, // Duración de la animación en milisegundos
                    easing: Easing.out(Easing.ease),
                },
                (finished) => {
                    // Cuando la animación termina, ejecutamos la navegación.
                    if (finished) {
                        runOnJS(router.replace)('/(app)/(tabs)');
                    }
                }
            );
        } catch (error: any) {
            console.error('Error durante el inicio de sesión:', error);
            if (error.code !== '12501') {
                Alert.alert(
                    'Error de Inicio de Sesión',
                    error.message ||
                        'Ocurrió un error. Por favor, revisa tu conexión e intenta de nuevo.'
                );
            }
        } finally {
            // No cambiamos `isLoggingIn` a `false` en el caso de éxito
            // porque la pantalla se va a desmontar de todos modos.
            // Solo lo necesitamos para el caso de error.
            if (!opacity.value) {
                // Si la animación ya empezó (caso de éxito) no hacemos nada.
            } else {
                setIsLoggingIn(false);
            }
        }
    };

    return (
        // --- ANOTACIÓN 5: Envolver todo en un Animated.View ---
        <Animated.View style={[styles.flexOne, animatedContainerStyle]}>
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.headerContainer}>
                        <Ionicons name="document-text-outline" size={80} color={theme.primary} />
                        <CustomText
                            size="xxlarge"
                            weight="bold"
                            style={[styles.title, { color: theme.text }]}
                        >
                            Bienvenido a Apunta&apos;o
                        </CustomText>
                        <CustomText
                            size="medium"
                            style={[styles.subtitle, { color: theme.textSecondary }]}
                        >
                            Digitaliza el cuaderno de deudas de tu negocio. Seguro, fácil y siempre
                            a la mano.
                        </CustomText>
                    </View>

                    <View style={styles.featuresContainer}>
                        {LoginFeatures.map((feature, index) => (
                            <FeatureItem key={index} feature={feature} />
                        ))}
                    </View>

                    <View style={styles.footerContainer}>
                        <CustomButton
                            onPress={handleSignIn}
                            title={isLoggingIn ? 'Conectando...' : 'Continuar con Google'}
                            disabled={isLoggingIn}
                            iconName="logo-google"
                            buttonStyle={[styles.button, { backgroundColor: theme.primary }]}
                            textStyle={{ color: theme.textOnPrimary }}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    flexOne: { flex: 1 }, // Estilo para el contenedor animado
    safeArea: { flex: 1 },
    container: { flexGrow: 1, justifyContent: 'space-around', alignItems: 'center', padding: 24 },
    headerContainer: { alignItems: 'center', textAlign: 'center', marginTop: 20 },
    title: { marginTop: 24, marginBottom: 8 },
    subtitle: { textAlign: 'center', maxWidth: '90%' },
    featuresContainer: { width: '100%', paddingHorizontal: 16, gap: 24, marginVertical: 40 },
    footerContainer: { width: '100%', paddingBottom: 16 },
    button: { paddingVertical: 16, borderRadius: 12 },
});
