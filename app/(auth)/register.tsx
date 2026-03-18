/**
 * @file app/(auth)/register.tsx
 * @description Pantalla de registro para nuevos dueños de colmados usando Email/Password.
 */
import CustomButton from '@/components/ui/CustomButton';
import CustomInput from '@/components/input/CustomInput';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { useEmailAuth } from '@/hooks/useEmailAuth';
import { TextInput, TouchableOpacity, Linking } from 'react-native';
import { SUPPORT_CONTACT } from '@/constants/index';
import { useNotification } from '@/store/notificationStore';

import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();

    const {
        colmadoName,
        setColmadoName,
        email,
        setEmail,
        password,
        setPassword,
        isLoading,
        handleRegister,
    } = useEmailAuth();

    const emailRef = useRef<TextInput>(null!);
    const passwordRef = useRef<TextInput>(null!);
    const showNotification = useNotification();

    const handleHelpPress = () => {
        const { WHATSAPP_NUMBER } = SUPPORT_CONTACT;
        const message = "Hola, necesito ayuda para crear mi cuenta en Apunta'o.";
        const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

        Linking.openURL(url).catch(() => {
            showNotification({
                message: 'Asegúrate de tener WhatsApp instalado',
                type: 'error',
            });
        });
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            {/* Elementos Decorativos (Orbes/Bolas) */}
            <View style={[styles.orbTopLeft, { backgroundColor: theme.primary }]} />
            <View style={[styles.orbBottomRight, { backgroundColor: theme.primary }]} />

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
                        <TouchableOpacity 
                            style={[styles.helpButton, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]} 
                            onPress={handleHelpPress}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                            <CustomText size="small" weight="bold" style={{ marginLeft: 6, color: theme.textSecondary }}>
                                Ayuda
                            </CustomText>
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <Ionicons name="person-add" size={60} color={theme.primary} />
                            <CustomText size="xlarge" weight="bold" style={styles.title}>
                                Crea tu Cuenta
                            </CustomText>
                            <CustomText color={theme.textSecondary} style={styles.subtitle}>
                                Configura el perfil de tu colmado.
                            </CustomText>
                        </View>

                        <View style={styles.form}>
                            <CustomInput
                                icon="storefront"
                                placeholder="Nombre de tu Negocio"
                                value={colmadoName}
                                onChangeText={setColmadoName}
                                editable={!isLoading}
                                returnKeyType="next"
                                onSubmitEditing={() => emailRef.current?.focus()}
                            />
                            
                            <CustomInput
                                icon="mail"
                                placeholder="Correo Electrónico"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                                returnKeyType="next"
                                inputRef={emailRef}
                                onSubmitEditing={() => passwordRef.current?.focus()}
                            />
                            
                            <CustomInput
                                icon="lock-closed"
                                placeholder="Contraseña (min. 6 char)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                editable={!isLoading}
                                returnKeyType="done"
                                inputRef={passwordRef}
                                onSubmitEditing={handleRegister}
                            />
                        </View>

                        <View style={styles.footer}>
                            <CustomButton
                                title={isLoading ? 'Creando Cuenta...' : 'Registrarse'}
                                onPress={handleRegister}
                                isLoading={isLoading}
                                disabled={isLoading}
                                iconName="person-add"
                            />

                            <CustomButton
                                title="Ya tengo cuenta"
                                onPress={() => router.replace('/(auth)/login')}
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
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 40 },
    header: { alignItems: 'center', marginBottom: 30 },
    title: { marginTop: 16, marginBottom: 8 },
    subtitle: { textAlign: 'center' },
    form: { gap: 12, marginBottom: 28 },
    footer: { gap: 12 },
    helpButton: {
        position: 'absolute',
        top: 10,
        right: 20,
        paddingHorizontal: 12,
        height: 38,
        borderRadius: 19,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        zIndex: 10,
        // Sombra suave
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
     orbTopLeft: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        opacity: 0.08,
        zIndex: 0,
    },
    orbBottomRight: {
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        opacity: 0.08,
        zIndex: 0,
    },
});