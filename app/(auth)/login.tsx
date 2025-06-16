/**
 * @file app/(auth)/login.tsx
 * @description Pantalla de inicio de sesión para que los dueños de colmados accedan a su cuenta.
 * Corregida para un manejo de estado y navegación robustos.
 */
import CustomButton from '@/components/ui/CustomButton';
import CustomInput from '@/components/input/CustomInput';
import CustomText from '@/components/ui/CustomText';
import { API_URLS, ERROR_MESSAGES, STORAGE_KEYS } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/store/notificationStore';
import { useSessionStore } from '@/store/sessionStore';
import type { AppSessionData } from '@/types';
import { formatPhoneNumber } from '@/utils/formatters';
import { apiFetch } from '@/services/apiService';
import { saveToStorage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from 'react-native';

export default function LoginScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    const showNotification = useNotification();
    const { syncAccountData } = useSessionStore.getState();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * @function handleLogin
     * @description Maneja el proceso de inicio de sesión, llamando a la API y guardando la sesión.
     */
    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!phoneNumber || !pin) {
            showNotification({
                message: 'Por favor, completa todos los campos.',
                type: 'error',
            });
            return;
        }
        setIsLoading(true);

        try {
            const cleanedPhone = phoneNumber.replace(/-/g, '');
            const sessionData: AppSessionData = await apiFetch(API_URLS.LOGIN, {
                method: 'POST',
                body: JSON.stringify({ phoneNumber: cleanedPhone, pin }),
            });

            await saveToStorage(STORAGE_KEYS.APP_SESSION, sessionData);

            await syncAccountData();

            router.replace('/(app)/(tabs)');
        } catch (error: any) {
            showNotification({
                message: error.message || ERROR_MESSAGES.GENERIC_ERROR,
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.header}>
                            <Ionicons name="key-outline" size={60} color={theme.primary} />
                            <CustomText size="xlarge" weight="bold" style={styles.title}>
                                ¡Qué bueno verte!
                            </CustomText>
                            <CustomText color={theme.textSecondary} style={styles.subtitle}>
                                Ingresa tus datos para acceder a tu negocio.
                            </CustomText>
                        </View>

                        <View style={styles.form}>
                            <CustomInput
                                icon="call-outline"
                                placeholder="Número de Teléfono"
                                value={phoneNumber}
                                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                                keyboardType="phone-pad"
                                maxLength={12}
                                editable={!isLoading}
                            />
                            <CustomInput
                                icon="lock-closed-outline"
                                placeholder="PIN de 6 dígitos"
                                value={pin}
                                onChangeText={setPin}
                                keyboardType="number-pad"
                                secureTextEntry
                                maxLength={6}
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.footer}>
                            <CustomButton
                                title="Iniciar Sesión"
                                onPress={handleLogin}
                                isLoading={isLoading} // Le pasamos el estado de carga
                                iconName="log-in-outline"
                            />
                            <CustomButton
                                title="No tengo cuenta, quiero registrarme"
                                onPress={() => router.replace('/register')}
                                disabled={isLoading} // ✅ Se deshabilita, pero no muestra spinner
                                buttonStyle={{
                                    backgroundColor: 'transparent',
                                    marginTop: 16,
                                }}
                                textStyle={{ color: theme.primary }}
                            />
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { marginTop: 16, marginBottom: 8 },
    subtitle: { textAlign: 'center' },
    form: { gap: 16, marginBottom: 30 },
    footer: { marginTop: 20 },
});
