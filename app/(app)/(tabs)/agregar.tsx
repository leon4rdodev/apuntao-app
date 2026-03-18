// apuntao-app-master/app/(app)/(tabs)/agregar.tsx

import CustomInput from '@/components/input/CustomInput';
import CustomButton from '@/components/ui/CustomButton';
import { Colors } from '@/constants/Colors';
import { formatNumberWithCommas, formatPhoneNumber } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import { useAddClient } from '@/hooks/useAddClient';
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
import { Stack } from 'expo-router';
import CustomText from '@/components/ui/CustomText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Sub-componente de la Cabecera ---
const HeaderSection = () => {
    const theme = Colors[useColorScheme() || 'light'];
    return (
        <View style={styles.headerContainer}>
            <View style={[styles.iconWrapper, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="person-add" size={32} color={theme.primary} />
            </View>
            <CustomText size="xxlarge" weight="bold" style={[styles.title, { color: theme.text }]}>
                Nuevo Cliente
            </CustomText>
            <CustomText size="medium" color={theme.textSecondary} style={styles.subtitle}>
                Crea un perfil para tu nuevo cliente.
            </CustomText>
        </View>
    );
};

export default function AgregarClienteScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const insets = useSafeAreaInsets();

    const {
        name,
        setName,
        phone,
        setPhone,
        initialDebt,
        setInitialDebt,
        isSaving,
        isFormValid,
        handleSave,
    } = useAddClient();

    const initialDebtRef = useRef<TextInput>(null!);
    const phoneRef = useRef<TextInput>(null!);

    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    return (
        <View 
            style={[styles.safeArea, { backgroundColor: theme.background, paddingTop: insets.top }]}
        >
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={keyboardVisible}
                    >
                        <HeaderSection />

                        <View style={[styles.formContainer, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                            {/* Campo de Nombre */}
                            <View style={styles.inputGroup}>
                                <CustomText size="small" weight="medium" style={[styles.label, { color: theme.textSecondary }]}>
                                    Nombre del Cliente <CustomText color={theme.error}>*</CustomText>
                                </CustomText>
                                <CustomInput
                                    icon="person"
                                    placeholder="Ej: Juan Pérez"
                                    value={name}
                                    onChangeText={setName}
                                    returnKeyType="next"
                                    onSubmitEditing={() => initialDebtRef.current?.focus()}
                                />
                            </View>

                            {/* Campo de Deuda Inicial */}
                            <View style={styles.inputGroup}>
                                <CustomText size="small" weight="medium" style={[styles.label, { color: theme.textSecondary }]}>
                                    Deuda Inicial (Opcional)
                                </CustomText>
                                <CustomInput
                                    prefix="$"
                                    placeholder="0"
                                    value={initialDebt}
                                    onChangeText={(text) =>
                                        setInitialDebt(formatNumberWithCommas(text))
                                    }
                                    keyboardType="numeric"
                                    returnKeyType="next"
                                    inputRef={initialDebtRef}
                                    onSubmitEditing={() => phoneRef.current?.focus()}
                                />
                            </View>

                            {/* Campo de Teléfono */}
                            <View style={styles.inputGroup}>
                                <CustomText size="small" weight="medium" style={[styles.label, { color: theme.textSecondary }]}>
                                    Número de Teléfono (Opcional)
                                </CustomText>
                                <CustomInput
                                    icon="call"
                                    placeholder="(809) 123-4567"
                                    value={phone}
                                    onChangeText={(text) => setPhone(formatPhoneNumber(text))}
                                    keyboardType="phone-pad"
                                    maxLength={14}
                                    returnKeyType="done"
                                    inputRef={phoneRef}
                                    onSubmitEditing={handleSave}
                                />
                            </View>

                            <CustomButton
                                title="Guardar Cliente"
                                onPress={handleSave}
                                disabled={!isFormValid}
                                isLoading={isSaving}
                                iconName="person-add"
                                buttonStyle={[
                                    { marginTop: 20 },
                                    useColorScheme() === 'light' && (!isFormValid || isSaving) ? {
                                        backgroundColor: theme.inputBackground,
                                        borderWidth: 1.5,
                                        borderColor: theme.borderSubtle,
                                    } : {}
                                ]}
                                textStyle={
                                    useColorScheme() === 'light' && (!isFormValid || isSaving) 
                                        ? { color: theme.buttonTextDisabled } 
                                        : undefined
                                }
                                iconColor={
                                    useColorScheme() === 'light' && (!isFormValid || isSaving) 
                                        ? theme.buttonTextDisabled 
                                        : undefined
                                }
                                spinnerColor={
                                    useColorScheme() === 'light' && isSaving 
                                        ? theme.primary 
                                        : undefined
                                }
                            />
                        </View>
                        {/* Espacio extra al final solo cuando el teclado está abierto */}
                        {keyboardVisible && <View style={{ height: 280 }} />}
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
}


// Estilos (sin cambios)
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 80,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: '90%',
    },
    formContainer: {
        borderRadius: 24, // Consistente con ClientSummaryCard
        padding: 24,
        borderWidth: 1,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        marginBottom: 10,
        marginLeft: 4,
    },
    helperText: {
        marginTop: 8,
        marginLeft: 4,
        lineHeight: 16,
    },
});
