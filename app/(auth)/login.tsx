import { useRouter } from 'expo-router';
import React from 'react';
// Asegúrate de tener @expo/vector-icons instalado
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';

// Asumo que estos componentes y constantes ya existen en tu proyecto
import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import FeatureItem from '@/components/ui/FeatureItem';
import { STORAGE_KEYS } from '@/constants';
import { Colors } from '@/constants/Colors';
import { LoginFeatures } from '@/constants/FeatureItems';
import { saveToStorage } from '@/utils/storage';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';

/**
 * @component Login
 * @description
 * Pantalla de autenticación para la aplicación Apunta'o.
 *
 * **¿Qué hace esta pantalla?**
 * Su función principal es permitir que el usuario inicie sesión de forma segura
 * utilizando su cuenta de Google. Este es el punto de entrada a la aplicación.
 *
 * **¿Para qué sirve el inicio de sesión?**
 * La autenticación es un paso crucial y obligatorio para usar Apunta'o porque habilita
 * las características más importantes de la aplicación:
 *
 * 1.  **Seguridad:** Protege el acceso a los datos sensibles de tus clientes y sus deudas.
 * 2.  **Respaldo en la Nube:** Permite guardar automáticamente toda tu información (clientes,
 *     deudas, pagos) en tu cuenta personal de Google Drive, evitando la pérdida de datos si
 *     pierdes o dañas tu dispositivo.
 * 3.  **Sincronización:** Facilita el acceso a tu información desde múltiples dispositivos.
 *     Puedes gestionar tu negocio desde tu teléfono o tablet de forma sincronizada.
 *
 * Al completar el inicio de sesión, el usuario es redirigido a la pantalla principal de la
 * aplicación, donde puede empezar a gestionar su negocio.
 */
export default function Login() {
    const router = useRouter();
    const colorScheme = useColorScheme() || 'light';
    const theme = Colors[colorScheme];

    

    const handleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            const { accessToken } = await GoogleSignin.getTokens();

            if (isSuccessResponse(response)) {
                const { user } = response.data;
                saveToStorage(
                    STORAGE_KEYS.AUTH_DATA,
                    JSON.stringify({
                        user: {
                            email: user.email,
                            name: user.name,
                            photo: user.photo,
                            accessToken: accessToken,
                        },
                    })
                );
                router.replace('/(app)/(tabs)');
            } else {
                console.error('Sign-in failed: Response was not successful.');
            }
        } catch (error) {
            console.error('Error during sign-in:', error);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* --- Sección Superior: Logo y Bienvenida --- */}
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
                        Digitaliza el cuaderno de deudas de tu negocio. Seguro, fácil y siempre a la
                        mano.
                    </CustomText>
                </View>

                {/* --- Sección Central: Beneficios Clave --- */}
                <View style={styles.featuresContainer}>
                    {LoginFeatures.map((feature, index) => (
                        <FeatureItem key={index} feature={feature} />
                    ))}
                </View>

                {/* --- Sección Inferior: Botón de Acción --- */}
                <View style={styles.footerContainer}>
                    <CustomButton
                        onPress={handleSignIn}
                        title="Continuar con Google"
                        iconName="logo-google"
                        buttonStyle={[styles.button, { backgroundColor: theme.primary }]}
                        textStyle={{ color: theme.textOnPrimary }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'space-around', // Distribuye el espacio de forma equilibrada
        alignItems: 'center',
        padding: 24,
    },
    headerContainer: {
        alignItems: 'center',
        textAlign: 'center',
    },
    title: {
        marginTop: 24,
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        maxWidth: '90%',
    },
    // Estilos para la nueva sección de beneficios
    featuresContainer: {
        width: '100%',
        paddingHorizontal: 16,
        gap: 24, // Espacio vertical entre cada item de beneficio
    },
    // Estilos para el pie de página y el botón
    footerContainer: {
        width: '100%',
        paddingBottom: 16,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
    },
});
