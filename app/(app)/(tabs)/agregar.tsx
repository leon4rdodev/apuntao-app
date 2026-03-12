// apuntao-app-master/app/(app)/(tabs)/agregar.tsx

import CustomInput from '@/components/input/CustomInput';
import CustomButton from '@/components/ui/CustomButton';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/store/notificationStore';
import { useClientStore } from '@/store/clientStore';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck'; // <-- NUEVO

import {
    formatName,
    formatNumberWithCommas,
    formatPhoneNumber,
    parseFormattedNumber,
} from '@/utils/formatters';
import { validateClientData } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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

    // Obtenemos los datos y las acciones por separado para optimizar re-renders.
    const clients = useClientStore((state) => state.clients);
    const { addClient, addTransaction } = useClientStore((state) => state.actions);

    const { checkAndAlert } = useSubscriptionCheck(); // <-- USO DEL HOOK

    const showNotification = useNotification();

    // Estados del formulario (sin cambios)
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [initialDebt, setInitialDebt] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Deshabilita el botón si el nombre es muy corto
    const isFormValid = name.trim().length >= 3;

    /**
     * Maneja la lógica de validación y guardado del cliente.
     */
    const handleSave = async () => {
        Keyboard.dismiss();
        if (!isFormValid) return;

        // =======================================================
        // <-- LÓGICA DE RESTRICCIÓN DE SUSCRIPCIÓN IMPLEMENTADA -->
        if (!checkAndAlert()) {
            return;
        }
        // =======================================================

        setIsSaving(true);

        const formattedName = formatName(name);
        const debtAmount = initialDebt ? parseFormattedNumber(initialDebt) : 0;
        const formattedPhone = phone.replaceAll('-', '');

        // 1. Validar que el cliente no exista ya (lógica sin cambios)
        if (clients.some((client) => client.name.toLowerCase() === formattedName.toLowerCase())) {
            showNotification({
                message: ERROR_MESSAGES.DUPLICATE_CLIENT,
                type: 'error',
            });
            setIsSaving(false);
            return;
        }

        // 2. Validar todos los datos del formulario (lógica sin cambios)
        const validation = validateClientData(formattedName, debtAmount, formattedPhone);
        if (!validation.isValid) {
            showNotification({
                message: validation.error || 'Por favor, revisa los datos ingresados.',
                type: 'error',
            });
            setIsSaving(false);
            return;
        }

        // 3. Intentar guardar el cliente (lógica sin cambios)
        try {
            const newClient = await addClient({ name: formattedName, phone: formattedPhone });

            if (debtAmount > 0) {
                await addTransaction(newClient.id, {
                    amount: debtAmount,
                    type: 'Deuda',
                    date: Date.now(),
                });
            }

            showNotification({
                message: SUCCESS_MESSAGES.CLIENT_ADDED,
                type: 'success',
            });

            // Limpiar el formulario
            setName('');
            setPhone('');
            setInitialDebt('');
        } catch (e: any) {
            showNotification({
                message: e.message || 'Ocurrió un error inesperado al guardar.',
                type: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    };

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
