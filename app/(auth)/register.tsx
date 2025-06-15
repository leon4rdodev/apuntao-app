/**
 * @file app/(auth)/register.tsx
 * @description Pantalla de registro para nuevos dueños de colmados.
 * Corregida para un manejo de estado y navegación robustos.
 */
import CustomButton from '@/components/ui/CustomButton';
import CustomInput from '@/components/input/CustomInput';
import CustomText from '@/components/ui/CustomText';
import { API_URLS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/store/notificationStore';
import { formatPhoneNumber } from '@/utils/formatters';
import { apiFetch } from '@/services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
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

export default function RegisterScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    const showNotification = useNotification();

    const [colmadoName, setColmadoName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * @function handleRegister
     * @description Valida los datos y envía la petición de registro al backend.
     */
    const handleRegister = async () => {
        Keyboard.dismiss();
        if (!colmadoName || !phoneNumber || !pin) {
            showNotification({ message: 'Todos los campos son obligatorios.', type: 'error' });
            return;
        }
        setIsLoading(true);

        try {
            const cleanedPhone = phoneNumber.replace(/-/g, '');
            await apiFetch(API_URLS.REGISTER, {
                method: 'POST',
                body: JSON.stringify({ colmadoName, phoneNumber: cleanedPhone, pin }),
            });

            Alert.alert('¡Registro Exitoso!', SUCCESS_MESSAGES.ACCOUNT_CREATED, [
                { text: 'OK', onPress: () => router.replace('/login') },
            ]);
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
                            <Ionicons name="person-add-outline" size={60} color={theme.primary} />
                            <CustomText size="xlarge" weight="bold" style={styles.title}>
                                Crea tu Cuenta
                            </CustomText>
                            <CustomText color={theme.textSecondary} style={styles.subtitle}>
                                Empieza a digitalizar tu negocio en menos de un minuto.
                            </CustomText>
                        </View>

                        <View style={styles.form}>
                            <CustomInput
                                icon="storefront-outline"
                                placeholder="Nombre de tu Colmado"
                                value={colmadoName}
                                onChangeText={setColmadoName}
                                editable={!isLoading}
                            />
                            <CustomInput
                                icon="call-outline"
                                placeholder="Tu Número de Teléfono (será tu usuario)"
                                value={phoneNumber}
                                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                                keyboardType="phone-pad"
                                maxLength={12}
                                editable={!isLoading}
                            />
                            <CustomInput
                                icon="lock-closed-outline"
                                placeholder="Crea un PIN de 6 dígitos"
                                value={pin}
                                onChangeText={setPin}
                                keyboardType="number-pad"
                                secureTextEntry
                                maxLength={6}
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.footer}>
                            {/* ✅ CORRECCIÓN APLICADA AQUÍ */}
                            <CustomButton
                                title="Crear Cuenta"
                                onPress={handleRegister}
                                isLoading={isLoading}
                                iconName="person-add-outline"
                            />
                            <CustomButton
                                title="Ya tengo una cuenta"
                                onPress={() => router.replace('/login')}
                                disabled={isLoading}
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
