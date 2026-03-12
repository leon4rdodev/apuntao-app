// apuntao-app-master/app/(app)/(tabs)/agregar.tsx

import CustomInput from '@/components/input/CustomInput';
import CustomButton from '@/components/ui/CustomButton';
import { Colors } from '@/constants/Colors';
import { formatNumberWithCommas, formatPhoneNumber } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useAddClient } from '@/hooks/useAddClient';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Sub-componente de la Cabecera ---
const HeaderSection = () => {
    const theme = Colors[useColorScheme() || 'light'];
    return (
        <View style={styles.headerContainer}>
            <View style={[styles.iconWrapper, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="person-add-outline" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Nuevo Cliente</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Añade a alguien a tu lista de fiado.
            </Text>
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
        focusedField,
        setFocusedField,
        isSaving,
        isFormValid,
        handleSave,
    } = useAddClient();

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

                        <View style={[styles.formContainer, { backgroundColor: theme.surface }]}>
                            {/* Campo de Nombre */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>
                                    Nombre del Cliente <Text style={{ color: theme.error }}>*</Text>
                                </Text>
                                <CustomInput
                                    icon="person-outline"
                                    placeholder="Ej: Juan Pérez"
                                    value={name}
                                    onChangeText={setName}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField(null)}
                                    containerStyle={
                                        focusedField === 'name' ? { borderColor: theme.primary } : {}
                                    }
                                />
                            </View>

                            {/* Campo de Deuda Inicial */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>
                                    Deuda Inicial
                                </Text>
                                <CustomInput
                                    prefix="$"
                                    placeholder="0"
                                    value={initialDebt}
                                    onChangeText={(text) =>
                                        setInitialDebt(formatNumberWithCommas(text))
                                    }
                                    keyboardType="numeric"
                                    onFocus={() => setFocusedField('debt')}
                                    onBlur={() => setFocusedField(null)}
                                    containerStyle={
                                        focusedField === 'debt' ? { borderColor: theme.primary } : {}
                                    }
                                />
                                <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                                    Opcional. Monto con el que empieza debiendo.
                                </Text>
                            </View>

                            {/* Campo de Teléfono */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>
                                    Número de Teléfono
                                </Text>
                                <CustomInput
                                    icon="call-outline"
                                    placeholder="809-123-4567"
                                    value={phone}
                                    onChangeText={(text) => setPhone(formatPhoneNumber(text))}
                                    keyboardType="phone-pad"
                                    maxLength={12}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    containerStyle={
                                        focusedField === 'phone' ? { borderColor: theme.primary } : {}
                                    }
                                />
                                <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                                    Opcional.
                                </Text>
                            </View>

                            <CustomButton
                                title="Agregar Cliente"
                                onPress={handleSave}
                                disabled={!isFormValid}
                                isLoading={isSaving}
                                iconName="checkmark-circle-outline"
                                buttonStyle={{ marginTop: 10 }}
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
        padding: 24,
        paddingTop: 20,
        paddingBottom: 80,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        maxWidth: '80%',
    },
    formContainer: {
        borderRadius: 16,
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    helperText: {
        fontSize: 12,
        marginTop: 6,
    },
});
