import CustomInput from '@/components/input/CustomInput';
import Notification from '@/components/ui/Notification';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useClientContext } from '@/context/ClientContext';
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
    Alert,
    Keyboard,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from 'react-native';

// --- Sub-componentes (sin cambios) ---

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

// --- Componente Principal (CORREGIDO) ---

export default function AgregarClienteScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const { clients, addClient, addTransaction } = useClientContext();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [initialDebt, setInitialDebt] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    const isFormValid = name.trim().length >= 3;

    const closeNt = () => {
        setShowNotification(!showNotification);
    };

    const handleSave = () => {
        Keyboard.dismiss();
        setIsSaving(true);

        const formattedName = formatName(name);
        const debtAmount = initialDebt ? parseFormattedNumber(initialDebt) : 0;
        const formattedPhone = phone.trim();

        if (clients.some((client) => client.name.toLowerCase() === formattedName.toLowerCase())) {
            setIsSaving(false);
            setShowNotification(true)
            return;
        }

        const validation = validateClientData(formattedName, debtAmount, formattedPhone);
        if (!validation.isValid) {
            Alert.alert(
                'Datos Inválidos',
                validation.error || 'Por favor, revisa los datos ingresados.'
            );
            setIsSaving(false);
            return;
        }

        try {
            const newClient = addClient({ name: formattedName, phone: formattedPhone });
            if (debtAmount > 0) {
                addTransaction(newClient.id, {
                    amount: debtAmount,
                    type: 'Deuda',
                    date: Date.now(),
                });
            }

            Alert.alert('¡Éxito!', SUCCESS_MESSAGES.CLIENT_ADDED, [{ text: 'OK' }]);
            setName('');
            setPhone('');
            setInitialDebt('');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Ocurrió un error inesperado.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            {showNotification ? (
                <Notification
                    message={ERROR_MESSAGES.DUPLICATE_CLIENT}
                    type={'error'}
                    onClose={closeNt}
                />
            ) : (
                ''
            )}

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <HeaderSection />

                    <View style={[styles.formContainer, { backgroundColor: theme.surface }]}>
                        {/* Nombre */}
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
                                    focusedField === 'name' && { borderColor: theme.primary }
                                }
                            />
                        </View>

                        {/* Deuda Inicial */}
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
                                    focusedField === 'debt' && { borderColor: theme.primary }
                                }
                            />
                            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                                Opcional. Monto con el que empieza debiendo.
                            </Text>
                        </View>

                        {/* Teléfono */}
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
                                    focusedField === 'phone' && { borderColor: theme.primary }
                                }
                            />
                            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                                Opcional.
                            </Text>
                        </View>

                        {/* Botón */}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                { backgroundColor: isFormValid ? theme.primary : theme.border },
                            ]}
                            onPress={handleSave}
                            disabled={!isFormValid || isSaving}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={20}
                                color={isFormValid ? theme.textOnPrimary : theme.textSecondary}
                            />
                            <Text
                                style={[
                                    styles.buttonText,
                                    {
                                        color: isFormValid
                                            ? theme.textOnPrimary
                                            : theme.textSecondary,
                                    },
                                ]}
                            >
                                {isSaving ? 'Guardando...' : 'Agregar Cliente'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

// Estilos (se eliminó `flex` que ya no es necesario)
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 100, // Ajusta este padding si necesitas más o menos espacio arriba
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
    button: {
        marginTop: 10,
        height: 52,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
