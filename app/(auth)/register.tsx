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
import { TextInput } from 'react-native';

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
                                Configura el perfil de tu colmado.
                            </CustomText>
                        </View>

                        <View style={styles.form}>
                            <CustomInput
                                icon="storefront-outline"
                                placeholder="Nombre de tu Negocio"
                                value={colmadoName}
                                onChangeText={setColmadoName}
                                editable={!isLoading}
                                returnKeyType="next"
                                onSubmitEditing={() => emailRef.current?.focus()}
                            />
                            
                            <CustomInput
                                icon="mail-outline"
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
                                icon="lock-closed-outline"
                                placeholder="Crea una Contraseña (min. 6 char)"
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
                                iconName="person-add-outline"
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
});