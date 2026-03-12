// app/(app)/clients/[id].tsx

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
import { useClientStore } from '@/store/clientStore';

// --- Imports de Lógica y Hooks ---
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/store/notificationStore';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck'; // <-- MANTENER IMPORTADO
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
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmountInput } from '@/components/input/AmountInput';

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
    const showNotification = useNotification();

    // --- Consumo de Stores y Hooks ---
    const { addTransaction, deleteTransaction, updateClient, deleteClient } = useClientStore(
        (state) => state.actions
    );
    const client = useClientStore((state) => state.clients.find((c) => c.id === id));

    const { checkAndAlert } = useSubscriptionCheck(); // <-- USO DEL HOOK

    // --- State local del componente ---
    const [modalConfig, setModalConfig] = useState<ModalConfig>(null);
    const [amount, setAmount] = useState('');
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // --- Handlers (Lógica de la pantalla) ---

    const handleSaveTransaction = useCallback(() => {
        if (!client || modalConfig?.type !== 'transaction') return;
        const numericAmount = parseFormattedNumber(amount);
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
        setAmount('');
    }, [client, amount, modalConfig, addTransaction, showNotification]);

    const handleUpdateClient = useCallback(() => {
        if (!client) return;

        const formattedName = formatName(editName);
        const formattedPhone = editPhone.replaceAll('-', '');
        const validation = validateClientData(formattedName, 0, formattedPhone);

        if (!validation.isValid) {
            showNotification({ message: validation.error || 'Revise los datos', type: 'error' });
            return;
        }

        updateClient(client.id, { name: formattedName, phone: formattedPhone });

        showNotification({ message: SUCCESS_MESSAGES.CLIENT_UPDATED, type: 'success' });
        setModalConfig(null);
    }, [client, editName, editPhone, updateClient, showNotification]);

    // ... (handler handleDeleteClient sin cambios)
    const handleDeleteClient = useCallback(() => {
        if (!client) return;

        if (client.debt > 0) {
            showNotification({ message: ERROR_MESSAGES.DELETE_CLIENT_WITH_DEBT, type: 'error' });
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

        // =======================================================
        // <-- RESTRICCIÓN DE SUSCRIPCIÓN PARA SALDAR DEUDA TOTAL -->
        if (!checkAndAlert()) {
            return;
        }
        // =======================================================

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
    }, [client, addTransaction, showNotification, checkAndAlert]);

    const handleDeleteTransaction = useCallback(
        (tx: Transaction) => {
            if (!client) return;

            // =======================================================
            // <-- NUEVA RESTRICCIÓN DE SUSCRIPCIÓN PARA ELIMINAR TXN -->
            if (!checkAndAlert()) {
                return;
            }
            // =======================================================

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
        [client, deleteTransaction, showNotification, checkAndAlert]
    );

    // --- Lógica del Modal ---
    const openModal = (config: ModalConfig) => {
        // <-- RESTRICCIÓN DE SUSCRIPCIÓN PARA AÑADIR TXN -->
        if (config?.type === 'transaction') {
            if (!checkAndAlert()) {
                return; // Bloquea y muestra el modal estilizado si está inactiva
            }
        }

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
                <AmountInput
                    value={amount}
                    onChangeText={(text) => setAmount(formatNumberWithCommas(text))}
                    placeholder="0"
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
                            onChangeText={(text) => setEditPhone(text)}
                            keyboardType="phone-pad"
                            placeholder="809-123-4567"
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
                title: isPayment ? 'Registrar Pago' : 'Añadir Nueva Deuda',
                actions: [
                    {
                        title: 'Guardar',
                        onPress: handleSaveTransaction,
                        buttonStyle: {
                            backgroundColor: theme.primary,
                            flex: 1,
                        },
                        textStyle: { color: theme.textOnPrimary },
                    },
                    ...baseActions,
                ],
            };
        }

        if (modalConfig.type === 'edit') {
            return {
                title: 'Editar Cliente',
                actions: [
                    {
                        title: 'Actualizar',
                        onPress: handleUpdateClient,
                        buttonStyle: { backgroundColor: theme.primary, flex: 1 },
                        textStyle: { color: theme.textOnPrimary },
                    },
                    ...baseActions,
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
                    // Llama a openModal (con check de suscripción)
                    onPay={() => openModal({ type: 'transaction', payload: 'Pago' })}
                    onAddDebt={() => openModal({ type: 'transaction', payload: 'Deuda' })}
                />
                <DangerZone
                    debt={client.debt}
                    // Llama a handleSettleDebt (con check de suscripción)
                    onSettleDebt={handleSettleDebt}
                    onDeleteClient={handleDeleteClient}
                />
                <TransactionHistory
                    transactions={client.transactions}
                    // Llama a handleDeleteTransaction (con check de suscripción)
                    onDelete={handleDeleteTransaction}
                />
            </ScrollView>

            <ActionModal
                paddingBottom={modalConfig?.type === 'transaction' ? 400 : 430}
                isVisible={!!modalConfig}
                onClose={() => setModalConfig(null)}
                title={title}
                actions={actions}
            >
                {renderModalContent()}
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
