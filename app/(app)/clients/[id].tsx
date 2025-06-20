// --- Imports de Componentes UI ---
import ActionModal from '@/components/clientsScreen/ActionModal';
import ClientSummaryCard from '@/components/clientsScreen/ClientSummaryCard';
import DangerZone from '@/components/clientsScreen/DangerZone';
import MainActionButtons from '@/components/clientsScreen/MainActionButtons';
import TransactionHistory from '@/components/clientsScreen/TransactionHistory';
import CustomInput from '@/components/input/CustomInput';
import BackButton from '@/components/ui/BackButton';
import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';

// --- Imports de Lógica y Hooks ---
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useClientContext } from '@/context/ClientContext';
import { useNotification } from '@/store/notificationStore';
import { Transaction, TransactionType } from '@/types';
import {
    formatMoney,
    formatName,
    formatNumberWithCommas,
    formatPhoneNumber,
    parseFormattedNumber,
} from '@/utils/formatters';
import { validateClientData } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';

// --- Tipos para el estado del Modal ---
type ModalConfig = { type: 'transaction'; payload: TransactionType } | { type: 'edit' } | null;

/**
 * Pantalla de Detalle de Cliente.
 * Orquesta los componentes que muestran la información y las acciones de un cliente.
 */
export default function ClientDetailScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    // Hooks de contexto y notificación
    const { getClientById, addTransaction, deleteTransaction, updateClient, deleteClient } =
        useClientContext();
    const showNotification = useNotification();

    const client = useMemo(() => (id ? getClientById(id) : undefined), [id, getClientById]);

    // --- State ---
    const [modalConfig, setModalConfig] = useState<ModalConfig>(null);
    const [amount, setAmount] = useState('');
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // --- Handlers (Lógica de la pantalla) ---

    const handleSaveTransaction = useCallback(() => {
        if (!client || modalConfig?.type !== 'transaction') return;

        const numericAmount = parseFormattedNumber(amount);

        // Validaciones con notificaciones
        if (!numericAmount || numericAmount <= 0) {
            showNotification({ message: ERROR_MESSAGES.INVALID_AMOUNT, type: 'error' });
            return;
        }
        if (modalConfig.payload === 'Pago' && numericAmount > client.debt) {
            showNotification({ message: ERROR_MESSAGES.PAYMENT_EXCEEDS_DEBT, type: 'error' });
            return;
        }

        addTransaction(client.id, {
            amount: numericAmount,
            type: modalConfig.payload,
            date: Date.now(),
        });

        showNotification({ message: SUCCESS_MESSAGES.TRANSACTION_ADDED, type: 'success' });
        setModalConfig(null);
    }, [client, amount, modalConfig, addTransaction, showNotification]);

    const handleUpdateClient = useCallback(() => {
        if (!client) return;

        const formattedName = formatName(editName);
        const formattedPhone = editPhone.replaceAll('-', '')
        const validation = validateClientData(formattedName, 0, formattedPhone);

        if (!validation.isValid) {
            showNotification({ message: validation.error || 'Revise los datos', type: 'error' });
            return;
        }

        updateClient(client.id, { name: formattedName, phone: editPhone });
        showNotification({ message: SUCCESS_MESSAGES.CLIENT_UPDATED, type: 'success' });
        setModalConfig(null);
    }, [client, editName, editPhone, updateClient, showNotification]);

    const handleDeleteClient = useCallback(() => {
        if (!client) return;

        if (client.debt > 0) {
            showNotification({
                message: 'No puedes eliminar un cliente con deuda pendiente.',
                type: 'error',
            });
            return;
        }

        Alert.alert(
            'Eliminar Cliente',
            `¿Estás seguro de que deseas eliminar a ${client.name}? Esta acción no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        deleteClient(client.id);
                        showNotification({
                            message: `${client.name} fue eliminado.`,
                            type: 'success',
                        });
                        router.back();
                    },
                },
            ]
        );
    }, [client, deleteClient, router, showNotification]);

    const handleSettleDebt = useCallback(() => {
        if (!client || client.debt <= 0) return;

        Alert.alert(
            'Saldar Deuda',
            `¿Confirmas que ${client.name} pagó su deuda total de $${formatMoney(client.debt)}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar Pago',
                    onPress: () => {
                        addTransaction(client.id, {
                            amount: client.debt,
                            type: 'Pago',
                            date: Date.now(),
                        });
                        showNotification({
                            message: SUCCESS_MESSAGES.DEBT_CLEARED,
                            type: 'success',
                        });
                    },
                },
            ]
        );
    }, [client, addTransaction, showNotification]);

    const handleDeleteTransaction = useCallback(
        (tx: Transaction) => {
            if (!client) return;
            Alert.alert(
                'Eliminar Transacción',
                `¿Seguro que quieres eliminar este movimiento de $${formatMoney(tx.amount)}?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: () => {
                            deleteTransaction(client.id, tx.id);
                            showNotification({
                                message: SUCCESS_MESSAGES.TRANSACTION_DELETED,
                                type: 'success',
                            });
                        },
                    },
                ]
            );
        },
        [client, deleteTransaction, showNotification]
    );

    // --- Lógica del Modal ---
    const openModal = (config: ModalConfig) => {
        if (config?.type === 'edit' && client) {
            setEditName(client.name);
            setEditPhone(client.phone || '');
        } else if (config?.type === 'transaction') {
            setAmount('');
        }
        setModalConfig(config);
    };

    const renderModalContent = () => {
        if (!modalConfig) return null;

        if (modalConfig.type === 'transaction') {
            return (
                <CustomInput
                    prefix="$"
                    placeholder="0"
                    value={amount}
                    onChangeText={(text) => setAmount(formatNumberWithCommas(text))}
                    keyboardType="numeric"
                    autoFocus
                />
            );
        }

        if (modalConfig.type === 'edit') {
            return (
                <>
                    <View style={styles.inputGroup}>
                        <CustomText
                            size="small"
                            weight="medium"
                            color={theme.textSecondary}
                            style={styles.label}
                        >
                            Nombre del Cliente
                        </CustomText>
                        <CustomInput value={editName} onChangeText={setEditName} autoFocus />
                    </View>
                    <View style={styles.inputGroup}>
                        <CustomText
                            size="small"
                            weight="medium"
                            color={theme.textSecondary}
                            style={styles.label}
                        >
                            Teléfono (Opcional)
                        </CustomText>
                        <CustomInput
                            value={formatPhoneNumber(editPhone)}
                            onChangeText={(text) => setEditPhone(formatPhoneNumber(text))}
                            keyboardType="phone-pad"
                            placeholder="000-000-0000"
                            maxLength={12}
                        />
                    </View>
                </>
            );
        }
        return null;
    };

    const getModalConfig = () => {
        if (!modalConfig) return { title: '', actions: [] };

        const baseActions = [
            {
                title: 'Cancelar',
                onPress: () => setModalConfig(null),
                buttonStyle: { backgroundColor: theme.border, flex: 1 },
                textStyle: { color: theme.textSecondary },
            },
        ];

        if (modalConfig.type === 'transaction') {
            const isPayment = modalConfig.payload === 'Pago';
            return {
                title: isPayment ? 'Registrar Abono' : 'Añadir Nueva Deuda',
                actions: [
                    ...baseActions,
                    {
                        title: 'Guardar',
                        onPress: handleSaveTransaction,
                        buttonStyle: {
                            backgroundColor: isPayment ? theme.success : theme.error,
                            flex: 1,
                        },
                        textStyle: { color: theme.textOnPrimary },
                    },
                ],
            };
        }

        if (modalConfig.type === 'edit') {
            return {
                title: 'Editar Cliente',
                actions: [
                    ...baseActions,
                    {
                        title: 'Actualizar',
                        onPress: handleUpdateClient,
                        buttonStyle: { backgroundColor: theme.primary, flex: 1 },
                        textStyle: { color: theme.textOnPrimary },
                    },
                ],
            };
        }

        return { title: '', actions: [] };
    };

    // --- Renderizado ---
    if (!client) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.notFoundContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color={theme.error} />
                    <CustomText size="large" weight="bold" style={{ marginVertical: 16 }}>
                        Cliente no encontrado
                    </CustomText>
                    <CustomButton title="Volver al inicio" onPress={() => router.back()} />
                </View>
            </SafeAreaView>
        );
    }

    const { title, actions } = getModalConfig();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <BackButton />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ClientSummaryCard client={client} onEdit={() => openModal({ type: 'edit' })} />
                <MainActionButtons
                    onPay={() => openModal({ type: 'transaction', payload: 'Pago' })}
                    onAddDebt={() => openModal({ type: 'transaction', payload: 'Deuda' })}
                />
                <DangerZone
                    debt={client.debt}
                    onSettleDebt={handleSettleDebt}
                    onDeleteClient={handleDeleteClient}
                />
                <TransactionHistory
                    transactions={client.transactions}
                    onDelete={handleDeleteTransaction}
                />
            </ScrollView>

            <ActionModal
                paddingBottom={modalConfig?.type === 'transaction' ? 350 : 430}
                isVisible={!!modalConfig}
                onClose={() => setModalConfig(null)}
                title={title}
                actions={actions}
            >
                {renderModalContent()}
                {/* El estado de error local y su renderizado ya no son necesarios */}
            </ActionModal>
        </SafeAreaView>
    );
}

// Estilos
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingTop: 110, padding: 16, paddingBottom: 40 },
    inputGroup: { marginBottom: 16 },
    label: { marginBottom: 8 },
    notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});
