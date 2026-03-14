/**
 * @file app/(auth)/login.tsx
 * @description Pantalla de inicio de sesión con Email/Password.
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

export default function LoginScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    
    const {
        email,
        setEmail,
        password,
        setPassword,
        isLoading,
        handleLogin,
    } = useEmailAuth();

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
                            <Ionicons name="key-outline" size={60} color={theme.primary} />
                            <CustomText size="xlarge" weight="bold" style={styles.title}>
                                ¡Qué bueno verte!
                            </CustomText>
                            <CustomText color={theme.textSecondary} style={styles.subtitle}>
                                Ingresa con tu correo y contraseña.
                            </CustomText>
                        </View>

                        <View style={styles.form}>
                            <CustomInput
                                icon="mail-outline"
                                placeholder="Correo Electrónico"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                                returnKeyType="next"
                                onSubmitEditing={() => passwordRef.current?.focus()}
                            />
                            
                            <CustomInput
                                icon="lock-closed-outline"
                                placeholder="Contraseña"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                editable={!isLoading}
                                returnKeyType="done"
                                inputRef={passwordRef}
                                onSubmitEditing={handleLogin}
                            />
                        </View>

                        <View style={styles.footer}>
                            <CustomButton
                                title={isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                                onPress={handleLogin}
                                isLoading={isLoading}
                                disabled={isLoading}
                                iconName="log-in-outline"
                            />
                            
                            <CustomButton
                                title="Crear una cuenta"
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
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 40 },
    header: { alignItems: 'center', marginBottom: 30 },
    title: { marginTop: 16, marginBottom: 8 },
    subtitle: { textAlign: 'center' },
    form: { gap: 12, marginBottom: 28 },
    footer: { gap: 12 },
});
