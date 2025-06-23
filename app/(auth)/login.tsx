/**
 * @file app/(auth)/login.tsx
 * @description Pantalla de inicio de sesión para que los usuarios accedan a su cuenta.
 */
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import CustomButton from '@/components/ui/CustomButton';
import CustomInput from '@/components/input/CustomInput';
import CustomText from '@/components/ui/CustomText';
import { API_URLS, ERROR_MESSAGES, STORAGE_KEYS } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useClientContext } from '@/context/ClientContext';
import { useNotification } from '@/store/notificationStore';
import { useSessionStore } from '@/store/sessionStore';
import type { AppSessionData } from '@/types';
import { formatPhoneNumber } from '@/utils/formatters';
import { apiFetch } from '@/services/apiService';
import { saveToStorage } from '@/utils/storage';

export default function LoginScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    const showNotification = useNotification();
    const { setClients } = useClientContext();
    const { syncAccountData } = useSessionStore();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!phoneNumber || !pin || pin.length < 6) {
            showNotification({
                message: 'Por favor, completa todos los campos correctamente.',
                type: 'error',
            });
            return;
        }

        setIsLoading(true);

        try {
            const cleanedPhone = phoneNumber.replace(/-/g, '');

            // 1. Autenticar y obtener los tokens de sesión de nuestra API.
            const sessionData: AppSessionData = await apiFetch(
                API_URLS.LOGIN,
                {
                    method: 'POST',
                    body: JSON.stringify({ phoneNumber: cleanedPhone, pin }),
                },
                true // Marcar como ruta pública para que no se requiera token.
            );

            // 2. Guardar los tokens de sesión. Esto es crucial para futuras peticiones.
            await saveToStorage(STORAGE_KEYS.APP_SESSION, sessionData);

            // 3. Mostrar una notificación de éxito mientras se cargan los datos.
            showNotification({
                message: '¡Login exitoso! Cargando los datos de tu negocio...',
                type: 'info',
                duration: 4000, // Duración más larga
            });

            // 4. Llamar a syncAccountData. Esta función ahora es la única responsable
            //    de obtener los datos del perfil Y los clientes, además de actualizar
            //    el estado global (Zustand) y el almacenamiento persistente.
            const syncedData = await syncAccountData();

            // 5. Poblar el ClientContext con los clientes recibidos.
            if (syncedData?.clients) {
                setClients(syncedData.clients);
                // 6. Una vez que todo está cargado y en su lugar, redirigir.
                router.replace('/(app)/(tabs)');
            } else {
                // Este caso puede ocurrir si syncAccountData falla internamente.
                // El logout ya se manejaría dentro del store.
                throw new Error('No se pudieron cargar los datos de la cuenta.');
            }
        } catch (error: any) {
            // El usuario ve un error claro si el login o la sincronización fallan.
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
                                // ✅ Permite enviar el formulario desde el teclado
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                            />
                        </View>

                        <View style={styles.footer}>
                            <CustomButton
                                title={isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                                onPress={handleLogin}
                                isLoading={isLoading}
                                disabled={isLoading}
                                iconName="log-in-outline"
                            />
                            <CustomButton
                                title="No tengo cuenta, quiero registrarme"
                                onPress={() => router.replace('/(auth)/register')}
                                disabled={isLoading}
                                buttonStyle={{ backgroundColor: 'transparent', marginTop: 16 }}
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
