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
import { useLogin } from '@/hooks/useLogin';

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
    
    // Custom Hook encapsula toda la Lógica y el Estado
    const {
        code,
        setCode,
        isLoading,
        confirm,
        handleSendCode,
        handleConfirmCode,
        resetConfirmation,
    } = useLogin();

    const [phoneNumber, setPhoneNumber] = useState('');

    const onSubmitPhone = () => {
        handleSendCode(phoneNumber);
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
                                    onSubmitEditing={onSubmitPhone}
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
                                    onPress={onSubmitPhone}
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
                                        onPress={resetConfirmation}
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
