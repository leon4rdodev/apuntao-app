/**
 * @file app/(auth)/register.tsx
 * @description Pantalla de registro para nuevos dueños de colmados usando Firebase Phone Auth.
 */
import CustomButton from '@/components/ui/CustomButton';
import CustomInput from '@/components/input/CustomInput';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/store/notificationStore';
import { formatPhoneNumber } from '@/utils/formatters';
import { useSessionStore } from '@/store/sessionStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useRegister } from '@/hooks/useRegister';

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

export default function RegisterScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();

    const {
        colmadoName,
        setColmadoName,
        phoneNumber,
        setPhoneNumber,
        code,
        setCode,
        isLoading,
        confirm,
        handleRegister,
        handleConfirmCode,
        resetConfirmation,
    } = useRegister();

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
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <Ionicons name="person-add-outline" size={60} color={theme.primary} />
                            <CustomText size="xlarge" weight="bold" style={styles.title}>
                                Crea tu Cuenta
                            </CustomText>
                            <CustomText color={theme.textSecondary} style={styles.subtitle}>
                                {!confirm 
                                    ? 'Crea el perfil de tu colmado.' 
                                    : 'Por seguridad, ingresa el código SMS que te enviamos.'}
                            </CustomText>
                        </View>

                        <View style={styles.form}>
                            {!confirm ? (
                                <>
                                    <CustomInput
                                        icon="storefront-outline"
                                        placeholder="Nombre de tu Negocio"
                                        value={colmadoName}
                                        onChangeText={setColmadoName}
                                        editable={!isLoading}
                                    />
                                    <CustomInput
                                        icon="call-outline"
                                        placeholder="Teléfono (Ej. 809-123-4567)"
                                        value={phoneNumber}
                                        onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                                        keyboardType="phone-pad"
                                        maxLength={14}
                                        editable={!isLoading}
                                    />
                                </>
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
                                    title={isLoading ? 'Enviando SMS...' : 'Enviar Código'}
                                    onPress={handleRegister}
                                    isLoading={isLoading}
                                    iconName="send-outline"
                                />
                            ) : (
                                <>
                                    <CustomButton
                                        title={isLoading ? 'Verificando...' : 'Verificar y Crear Cuenta'}
                                        onPress={handleConfirmCode}
                                        isLoading={isLoading}
                                        iconName="checkmark-circle-outline"
                                    />
                                    <CustomButton
                                        title="Volver atrás"
                                        onPress={resetConfirmation}
                                        disabled={isLoading}
                                        buttonStyle={{ backgroundColor: 'transparent', marginTop: 16 }}
                                        textStyle={{ color: theme.primary }}
                                    />
                                </>
                            )}
                            
                            {!confirm && (
                                <CustomButton
                                    title="Ya tengo una cuenta"
                                    onPress={() => router.replace('/(auth)/login')}
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