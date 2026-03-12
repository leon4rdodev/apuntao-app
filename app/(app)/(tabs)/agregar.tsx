// apuntao-app-master/app/(app)/(tabs)/agregar.tsx

import CustomInput from '@/components/input/CustomInput';
import CustomButton from '@/components/ui/CustomButton';
import { Colors } from '@/constants/Colors';
import { formatNumberWithCommas, formatPhoneNumber } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useAddClient } from '@/hooks/useAddClient';
import {
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Sub-componente de la Cabecera (sin cambios) ---
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

    // Custom Hook encapsula estado y UI Logic
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

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
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
                </ScrollView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

// Estilos (sin cambios)
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 100,
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
