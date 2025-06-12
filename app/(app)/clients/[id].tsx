import CustomInput from '@/components/input/CustomInput';
import CustomButton from '@/components/ui/CustomButton';
import { ERROR_MESSAGES } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useClientContext } from '@/context/ClientContext';
import { TransactionType } from '@/types';
import {
    formatDate,
    formatMoney,
    formatNumberWithCommas,
    parseFormattedNumber,
} from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

/**
 * Pantalla de Detalle de Cliente.
 *
 * Muestra información detallada de un cliente específico, incluyendo su deuda total,
 * información de contacto y un historial completo de transacciones.
 * Permite al usuario realizar acciones como registrar nuevos abonos (pagos)
 * o añadir nuevas deudas a través de un modal interactivo.
 */
export default function ClientDetailScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getClientById, addTransaction } = useClientContext();

    const client = useMemo(() => (id ? getClientById(id) : undefined), [id, getClientById]);

    // Estado para el modal de transacciones
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<TransactionType>('Pago');
    const [amount, setAmount] = useState('');
    const [modalError, setModalError] = useState<string | null>(null);

    const openModal = (type: TransactionType) => {
        setModalType(type);
        setAmount('');
        setModalError(null);
        setModalVisible(true);
    };

    const handleSaveTransaction = () => {
        if (!client) return;

        const numericAmount = parseFormattedNumber(amount);

        // Validaciones
        if (!numericAmount || numericAmount <= 0) {
            setModalError(ERROR_MESSAGES.INVALID_AMOUNT);
            return;
        }
        if (modalType === 'Pago' && numericAmount > client.debt) {
            setModalError(ERROR_MESSAGES.PAYMENT_EXCEEDS_DEBT);
            return;
        }

        // Agregar transacción
        addTransaction(client.id, {
            amount: numericAmount,
            type: modalType,
            date: Date.now(),
        });

        setModalVisible(false);
        Alert.alert(
            'Éxito',
            `Se ha registrado un ${modalType.toLowerCase()} de $${formatMoney(numericAmount)}.`
        );
    };

    // Si el cliente no se encuentra, muestra un mensaje de error.
    if (!client) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.notFoundContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color={theme.error} />
                    <Text style={[styles.notFoundText, { color: theme.text }]}>
                        Cliente no encontrado
                    </Text>
                    <CustomButton title="Volver al inicio" onPress={() => router.back()} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: client.name,
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: theme.text,
                    headerTitleStyle: { fontWeight: '600' },
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() =>
                                Alert.alert(
                                    'Próximamente',
                                    'La pantalla para editar clientes estará disponible pronto.'
                                )
                            }
                        >
                            <Ionicons name="pencil-outline" size={24} color={theme.primary} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Card de Resumen de Deuda */}
                <View
                    style={[
                        styles.summaryCard,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                >
                    <Text style={[styles.debtLabel, { color: theme.textSecondary }]}>
                        Deuda Total
                    </Text>
                    <Text
                        style={[
                            styles.debtAmount,
                            { color: client.debt > 0 ? theme.error : theme.success },
                        ]}
                    >
                        ${formatMoney(client.debt)}
                    </Text>
                    <View style={styles.clientInfo}>
                        <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
                        <Text style={[styles.infoText, { color: theme.text }]}>{client.name}</Text>
                    </View>
                    {client.phone && (
                        <View style={styles.clientInfo}>
                            <Ionicons name="call-outline" size={20} color={theme.textSecondary} />
                            <Text style={[styles.infoText, { color: theme.text }]}>
                                {client.phone}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Botones de Acción */}
                <View style={styles.actionsContainer}>
                    <CustomButton
                        title="Abonar"
                        onPress={() => openModal('Pago')}
                        iconName="arrow-down-circle-outline"
                        buttonStyle={[styles.actionButton, { backgroundColor: theme.successLight }]}
                        textStyle={{ color: theme.success }}
                        iconColor={theme.success}
                    />
                    <CustomButton
                        title="Añadir Deuda"
                        onPress={() => openModal('Deuda')}
                        iconName="arrow-up-circle-outline"
                        buttonStyle={[styles.actionButton, { backgroundColor: theme.errorLight }]}
                        textStyle={{ color: theme.error }}
                        iconColor={theme.error}
                    />
                </View>

                {/* Historial de Transacciones */}
                <View style={styles.historyContainer}>
                    <Text style={[styles.historyTitle, { color: theme.text }]}>
                        Historial de Movimientos
                    </Text>
                    {client.transactions.length > 0 ? (
                        client.transactions.map((tx) => (
                            <View
                                key={tx.id}
                                style={[styles.transactionRow, { borderBottomColor: theme.border }]}
                            >
                                <View>
                                    <Text style={[styles.transactionType, { color: theme.text }]}>
                                        {tx.type}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.transactionDate,
                                            { color: theme.textSecondary },
                                        ]}
                                    >
                                        {formatDate(new Date(tx.date).toISOString())}
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.transactionAmount,
                                        { color: tx.type === 'Pago' ? theme.success : theme.error },
                                    ]}
                                >
                                    {tx.type === 'Pago' ? '-' : '+'}${formatMoney(tx.amount)}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.noHistoryText, { color: theme.textSecondary }]}>
                            No hay movimientos registrados.
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* Modal para agregar transacción */}
            <Modal
                transparent
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {modalType === 'Pago' ? 'Registrar Abono' : 'Añadir Nueva Deuda'}
                        </Text>
                        <CustomInput
                            value={amount}
                            onChangeText={(text) => setAmount(formatNumberWithCommas(text))}
                            placeholder="Monto"
                            keyboardType="numeric"
                            autoFocus
                        />
                        {modalError && (
                            <Text style={[styles.modalError, { color: theme.error }]}>
                                {modalError}
                            </Text>
                        )}
                        <View style={styles.modalActions}>
                            <CustomButton
                                title="Cancelar"
                                onPress={() => setModalVisible(false)}
                                buttonStyle={[
                                    styles.modalButton,
                                    { backgroundColor: theme.border },
                                ]}
                                textStyle={{ color: theme.textSecondary }}
                            />
                            <CustomButton
                                title="Guardar"
                                onPress={handleSaveTransaction}
                                buttonStyle={[
                                    styles.modalButton,
                                    { backgroundColor: theme.primary },
                                ]}
                                textStyle={{ color: theme.textOnPrimary }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    summaryCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
    },
    debtLabel: { fontSize: 16, fontWeight: '500', textAlign: 'center' },
    debtAmount: { fontSize: 40, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
    clientInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    infoText: { fontSize: 16, marginLeft: 8 },
    actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
    actionButton: { flex: 1, paddingVertical: 14 },
    historyContainer: { marginTop: 32 },
    historyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    transactionType: { fontSize: 16, fontWeight: '500' },
    transactionDate: { fontSize: 12, marginTop: 2 },
    transactionAmount: { fontSize: 16, fontWeight: '600' },
    noHistoryText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
    notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    notFoundText: { fontSize: 22, fontWeight: '600', marginVertical: 16 },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalError: {
        marginTop: 10,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 16,
    },
    modalButton: { flex: 1 },
});
