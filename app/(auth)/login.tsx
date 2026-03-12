/**
 * @file app/(auth)/login.tsx
 * @description Pantalla de inicio de sesión con Firebase Phone Auth.
 */
import CustomButton from '@/components/ui/CustomButton';
import CustomInput from '@/components/input/CustomInput';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/store/notificationStore';
import { formatPhoneNumber } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    const showNotification = useNotification();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Estado para guardar la confirmación de Firebase
    const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

    // 1. Iniciar sesión con número de teléfono
    const handleSendCode = async () => {
        Keyboard.dismiss();
        if (!phoneNumber || phoneNumber.length < 10) {
            showNotification({
                message: 'Por favor, ingresa un número de teléfono válido.',
                type: 'error',
            });
            return;
        }

        setIsLoading(true);
        try {
            // Asegurar formato internacional (ej. +18091234567 para RD)
            let formattedPhone = phoneNumber.replace(/-/g, '').replace(/ /g, '');
            if (!formattedPhone.startsWith('+')) {
                // Asumimos código de país +1 si no se provee (República Dominicana/USA)
                // Ajustar según el target principal de la app
                formattedPhone = '+1' + formattedPhone; 
            }

            const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
            setConfirm(confirmation);
            
            showNotification({
                message: 'Código SMS enviado.',
                type: 'success',
            });
        } catch (error: any) {
            console.error('Error enviando SMS:', error);
            showNotification({
                message: 'Error al enviar el código. Verifica el número.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Confirmar el código recibido por SMS
    const handleConfirmCode = async () => {
        Keyboard.dismiss();
        if (!code || code.length !== 6) {
            showNotification({
                message: 'Por favor, ingresa el código de 6 dígitos.',
                type: 'error',
            });
            return;
        }

        setIsLoading(true);
        try {
            if (confirm) {
                await confirm.confirm(code);
                // El AuthContext detectará el cambio y redirigirá lógicamente.
            }
        } catch (error: any) {
            console.error('Error confirmando código:', error);
            showNotification({
                message: 'Código incorrecto o expirado.',
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
                                {confirm 
                                    ? 'Ingresa el código que te enviamos por SMS.' 
                                    : 'Ingresa tu teléfono para recibir un código de acceso.'}
                            </CustomText>
                        </View>

                        <View style={styles.form}>
                            {!confirm ? (
                                <CustomInput
                                    icon="call-outline"
                                    placeholder="Número de Teléfono (Ej. 809-123-4567)"
                                    value={phoneNumber}
                                    onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                                    keyboardType="phone-pad"
                                    maxLength={14}
                                    editable={!isLoading}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSendCode}
                                />
                            ) : (
                                <CustomInput
                                    icon="chatbubble-ellipses-outline"
                                    placeholder="Código SMS de 6 dígitos"
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    editable={!isLoading}
                                    returnKeyType="done"
                                    onSubmitEditing={handleConfirmCode}
                                />
                            )}
                        </View>

                        <View style={styles.footer}>
                            {!confirm ? (
                                <CustomButton
                                    title={isLoading ? 'Enviando...' : 'Enviar SMS'}
                                    onPress={handleSendCode}
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                    iconName="send-outline"
                                />
                            ) : (
                                <>
                                    <CustomButton
                                        title={isLoading ? 'Verificando...' : 'Conectar'}
                                        onPress={handleConfirmCode}
                                        isLoading={isLoading}
                                        disabled={isLoading}
                                        iconName="log-in-outline"
                                    />
                                    <CustomButton
                                        title="Volver a intentar"
                                        onPress={() => {
                                            setConfirm(null);
                                            setCode('');
                                        }}
                                        disabled={isLoading}
                                        buttonStyle={{ backgroundColor: 'transparent', marginTop: 16 }}
                                        textStyle={{ color: theme.primary }}
                                    />
                                </>
                            )}
                            
                            {!confirm && (
                                <CustomButton
                                    title="No tengo cuenta, quiero registrarme"
                                    onPress={() => router.replace('/(auth)/register')}
                                    disabled={isLoading}
                                    buttonStyle={{ backgroundColor: 'transparent', marginTop: 16 }}
                                    textStyle={{ color: theme.primary }}
                                />
                            )}
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
