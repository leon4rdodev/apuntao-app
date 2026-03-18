// app/(app)/clients/[id].tsx

// --- Imports de Componentes UI ---
import ActionModal from '@/components/clientsScreen/ActionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
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
import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, View, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AmountInput } from '@/components/input/AmountInput';
import { authenticateBiometrics } from '@/utils/biometrics';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage } from '@/utils/storage';

// --- Tipos para el estado del Modal ---
type ModalConfig = { type: 'transaction'; payload: TransactionType } | { type: 'edit' } | null;

type ConfirmConfig = {
    type: 'deleteClient' | 'deleteTransaction' | 'settleDebt';
    title: string;
    description: string;
    confirmText?: string;
    isDestructive?: boolean;
    iconName?: any;
    payload?: any;
} | null;

/**
 * Pantalla de Detalle de Cliente.
 * Orquesta los componentes que muestran la información y las acciones de un cliente.
 */
export default function ClientDetailScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const insets = useSafeAreaInsets();
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
    const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>(null);
    const [amount, setAmount] = useState('');
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // --- Refs para Foco programático ---
    const amountInputRef = useRef<TextInput>(null);
    const editNameInputRef = useRef<TextInput>(null);

    // --- Lógica de Autofocus con Delay de 100ms ---
    useEffect(() => {
        if (modalConfig) {
            const timer = setTimeout(() => {
                if (modalConfig.type === 'transaction') {
                    amountInputRef.current?.focus();
                } else if (modalConfig.type === 'edit') {
                    editNameInputRef.current?.focus();
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [modalConfig]);

    // --- Handlers (Lógica de la pantalla) ---

    const handleSaveTransaction = useCallback(async () => {
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

        // Verificación Biométrica
        const biometricsEnabled = await getFromStorage<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
        if (biometricsEnabled) {
            const success = await authenticateBiometrics(`Confirmar ${modalConfig.payload} de $${amount}`);
            if (!success) return;
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
        const formattedPhone = editPhone.replace(/\D/g, '');
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
    const handleDeleteClient = useCallback(async () => {
        if (!client) return;

        if (client.debt > 0) {
            showNotification({ message: ERROR_MESSAGES.DELETE_CLIENT_WITH_DEBT, type: 'error' });
            return;
        }

        setConfirmConfig({
            type: 'deleteClient',
            title: 'Eliminar Cliente',
            description: `¿Estás seguro de que deseas eliminar a ${client.name}? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            isDestructive: true,
            iconName: 'trash'
        });
    }, [client, showNotification]);

    const onConfirmDeleteClient = async () => {
        if (!client) return;
        
        // Verificación Biométrica
        const biometricsEnabled = await getFromStorage<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
        if (biometricsEnabled) {
            const success = await authenticateBiometrics(`Confirmar eliminación de ${client.name}`);
            if (!success) return;
        }

        deleteClient(client.id);
        showNotification({
            message: `${client.name} fue eliminado.`,
            type: 'success',
        });
        setConfirmConfig(null);
        router.back();
    };

    const handleSettleDebt = useCallback(async () => {
        if (!client || client.debt <= 0) return;

        // =======================================================
        // <-- RESTRICCIÓN DE SUSCRIPCIÓN PARA SALDAR DEUDA TOTAL -->
        if (!checkAndAlert()) {
            return;
        }
        // =======================================================

        setConfirmConfig({
            type: 'settleDebt',
            title: 'Saldar Deuda',
            description: `¿Confirmas que ${client.name} pagó su deuda total de $${formatMoney(client.debt)}?`,
            confirmText: 'Saldar',
            iconName: 'cash'
        });
    }, [client, formatMoney, checkAndAlert]);

    const onConfirmSettleDebt = async () => {
        if (!client) return;

        // Verificación Biométrica
        const biometricsEnabled = await getFromStorage<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
        if (biometricsEnabled) {
            const success = await authenticateBiometrics(`Confirmar saldo total de ${client.name}`);
            if (!success) return;
        }

        addTransaction(client.id, {
            amount: client.debt,
            type: 'Pago',
            date: Date.now(),
        });
        showNotification({
            message: SUCCESS_MESSAGES.DEBT_CLEARED,
            type: 'success',
        });
        setConfirmConfig(null);
    };

    const handleDeleteTransaction = useCallback(
        (tx: Transaction) => {
            if (!client) return;

            // =======================================================
            // <-- NUEVA RESTRICCIÓN DE SUSCRIPCIÓN PARA ELIMINAR TXN -->
            if (!checkAndAlert()) {
                return;
            }
            // =======================================================

            setConfirmConfig({
                type: 'deleteTransaction',
                title: 'Eliminar Transacción',
                description: `¿Seguro que quieres eliminar este movimiento de $${formatMoney(tx.amount)}?`,
                confirmText: 'Eliminar',
                isDestructive: true,
                payload: tx,
                iconName: 'trash'
            });
        },
        [client, formatMoney, checkAndAlert]
    );

    const onConfirmDeleteTransaction = async () => {
        if (!client || !confirmConfig?.payload) return;
        const tx = confirmConfig.payload as Transaction;

        // Verificación Biométrica
        const biometricsEnabled = await getFromStorage<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
        if (biometricsEnabled) {
            const success = await authenticateBiometrics(`Confirmar eliminación de movimiento por $${formatMoney(tx.amount)}`);
            if (!success) return;
        }

        deleteTransaction(client.id, tx.id);
        showNotification({
            message: SUCCESS_MESSAGES.TRANSACTION_DELETED,
            type: 'success',
        });
        setConfirmConfig(null);
    };

    const openModal = useCallback((config: ModalConfig) => {
        if (config?.type === 'transaction' || config?.type === 'edit') {
            if (!checkAndAlert()) return;
        }
        if (config?.type === 'edit' && client) {
            setEditName(client.name);
            setEditPhone(client.phone || '');
        } else if (config?.type === 'transaction') {
            setAmount('');
        }
        setModalConfig(config);
    }, [client, checkAndAlert]);

    const handleEditOpen = useCallback(() => openModal({ type: 'edit' }), [openModal]);
    const handlePayOpen = useCallback(() => openModal({ type: 'transaction', payload: 'Pago' }), [openModal]);
    const handleAddDebtOpen = useCallback(() => openModal({ type: 'transaction', payload: 'Deuda' }), [openModal]);

    const renderModalContent = useCallback(() => {
        if (!modalConfig) return null;
        if (modalConfig.type === 'transaction') {
            return (
                <AmountInput
                    ref={amountInputRef as any}
                    value={amount}
                    onChangeText={(text) => setAmount(formatNumberWithCommas(text))}
                    placeholder="0"
                    keyboardType="numeric"
                    autoFocus={false}
                />
            );
        }
        if (modalConfig.type === 'edit') {
            return (
                <>
                    <View style={styles.inputGroup}>
                        <CustomText size="small" weight="medium" color={theme.textSecondary} style={styles.label}>
                            Nombre del Cliente
                        </CustomText>
                        <CustomInput 
                            inputRef={editNameInputRef as any} 
                            value={editName} 
                            onChangeText={setEditName} 
                            autoFocus={false} 
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <CustomText size="small" weight="medium" color={theme.textSecondary} style={styles.label}>
                            Teléfono (Opcional)
                        </CustomText>
                        <CustomInput
                            value={formatPhoneNumber(editPhone)}
                            onChangeText={(text) => setEditPhone(text)}
                            keyboardType="phone-pad"
                            placeholder="(809) 123-4567"
                            maxLength={14}
                        />
                    </View>
                </>
            );
        }
        return null;
    }, [modalConfig, amount, editName, editPhone, theme]);

    const { title, actions } = useMemo(() => {
        if (!modalConfig) return { title: '', actions: [] };
        const baseActions = [
            {
                title: 'Cancelar',
                onPress: () => setModalConfig(null),
                buttonStyle: { backgroundColor: theme.inputBackground, flex: 1, borderWidth: 1, borderColor: theme.borderSubtle },
                textStyle: { color: theme.textSecondary },
            },
        ];
        if (modalConfig.type === 'transaction') {
            const isPayment = modalConfig.payload === 'Pago';
            return {
                title: isPayment ? 'Registrar Pago' : 'Añadir Nueva Deuda',
                actions: [
                    ...baseActions,
                    { 
                        title: 'Guardar', 
                        onPress: handleSaveTransaction, 
                        buttonStyle: { backgroundColor: theme.primary, flex: 1 }, 
                        textStyle: { color: theme.textOnPrimary },
                        iconName: 'checkmark',
                        iconColor: theme.textOnPrimary,
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
                        iconName: 'save',
                        iconColor: theme.textOnPrimary,
                    },
                ],
            };
        }
        return { title: '', actions: [] };
    }, [modalConfig, theme, handleSaveTransaction, handleUpdateClient]);

    // --- Renderizado ---
    if (!client) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: insets.bottom }]}>
                <View style={styles.notFoundContainer}>
                    <Ionicons name="alert-circle" size={60} color={theme.error} />
                    <CustomText size="large" weight="bold" style={{ marginVertical: 16 }}>
                        Cliente no encontrado
                    </CustomText>
                    <CustomButton title="Volver al inicio" onPress={() => router.back()} />
                </View>
            </View>
        );
    }


    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: insets.bottom }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <BackButton />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ClientSummaryCard client={client} onEdit={handleEditOpen} />
                <MainActionButtons
                    onPay={handlePayOpen}
                    onAddDebt={handleAddDebtOpen}
                />
                <DangerZone
                    debt={client.debt}
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

            <ConfirmModal
                isVisible={!!confirmConfig}
                onClose={() => setConfirmConfig(null)}
                title={confirmConfig?.title || ''}
                description={confirmConfig?.description || ''}
                confirmText={confirmConfig?.confirmText}
                isDestructive={confirmConfig?.isDestructive}
                iconName={confirmConfig?.iconName}
                onConfirm={() => {
                    if (confirmConfig?.type === 'deleteClient') onConfirmDeleteClient();
                    if (confirmConfig?.type === 'settleDebt') onConfirmSettleDebt();
                    if (confirmConfig?.type === 'deleteTransaction') onConfirmDeleteTransaction();
                }}
            />
        </View>
    );
}

// Estilos
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingTop: 110, paddingHorizontal: 20 },
    inputGroup: { marginBottom: 16 },
    label: { marginBottom: 8 },
    notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});
