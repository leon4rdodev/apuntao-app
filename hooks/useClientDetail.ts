import { useState, useCallback } from 'react';
import { useClientStore } from '@/store/clientStore';
import { useNotification } from '@/store/notificationStore';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { formatName, formatMoney, parseFormattedNumber } from '@/utils/formatters';
import { validateClientData } from '@/utils/validation';
import { authenticateBiometrics } from '@/utils/biometrics';
import { STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { getFromStorage } from '@/utils/storage';
import { Transaction, TransactionType } from '@/types';
import { useRouter } from 'expo-router';

export type ModalConfig = { type: 'transaction'; payload: TransactionType } | { type: 'edit' } | null;

export type ConfirmConfig = {
    type: 'deleteClient' | 'deleteTransaction' | 'settleDebt';
    title: string;
    description: string;
    confirmText?: string;
    isDestructive?: boolean;
    iconName?: any;
    payload?: any;
} | null;

export function useClientDetail(clientId: string) {
    const router = useRouter();
    const showNotification = useNotification();
    const { addTransaction, deleteTransaction, updateClient, deleteClient } = useClientStore((state) => state.actions);
    const client = useClientStore((state) => state.clients.find((c) => c.id === clientId));
    const { checkAndAlert } = useSubscriptionCheck();

    const [modalConfig, setModalConfig] = useState<ModalConfig>(null);
    const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>(null);

    // --- Modal Configuration Handlers ---
    const openModal = useCallback((config: ModalConfig) => {
        if (config?.type === 'transaction' || config?.type === 'edit') {
            if (!checkAndAlert()) return; // Valida suscripción siempre primero
        }
        setModalConfig(config);
    }, [checkAndAlert]);

    const handleEditOpen = useCallback(() => openModal({ type: 'edit' }), [openModal]);
    const handlePayOpen = useCallback(() => openModal({ type: 'transaction', payload: 'Pago' }), [openModal]);
    const handleAddDebtOpen = useCallback(() => openModal({ type: 'transaction', payload: 'Deuda' }), [openModal]);
    const closeModal = useCallback(() => setModalConfig(null), []);

    // --- Action Handlers ---
    const handleSaveTransaction = useCallback(async (amount: string, onClose: () => void) => {
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

        const biometricsEnabled = await getFromStorage<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
        if (biometricsEnabled) {
            const success = await authenticateBiometrics(`Confirmar ${modalConfig.payload} de $${formatMoney(numericAmount)}`);
            if (!success) return;
        }

        addTransaction(client.id, {
            amount: numericAmount,
            type: modalConfig.payload,
            date: Date.now(),
        });

        showNotification({ message: SUCCESS_MESSAGES.TRANSACTION_ADDED, type: 'success' });
        onClose();
        closeModal();
    }, [client, modalConfig, addTransaction, showNotification, closeModal]);

    const handleUpdateClient = useCallback((editName: string, editPhone: string, onClose: () => void) => {
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
        onClose();
        closeModal();
    }, [client, updateClient, showNotification, closeModal]);

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

    const handleSettleDebt = useCallback(async () => {
        if (!client || client.debt <= 0) return;
        if (!checkAndAlert()) return;

        setConfirmConfig({
            type: 'settleDebt',
            title: 'Saldar Deuda',
            description: `¿Confirmas que ${client.name} pagó su deuda total de $${formatMoney(client.debt)}?`,
            confirmText: 'Saldar',
            iconName: 'cash'
        });
    }, [client, checkAndAlert]);

    const handleDeleteTransaction = useCallback((tx: Transaction) => {
        if (!client) return;
        if (!checkAndAlert()) return;

        setConfirmConfig({
            type: 'deleteTransaction',
            title: 'Eliminar Transacción',
            description: `¿Seguro que quieres eliminar este movimiento de $${formatMoney(tx.amount)}?`,
            confirmText: 'Eliminar',
            isDestructive: true,
            payload: tx,
            iconName: 'trash'
        });
    }, [client, checkAndAlert]);

    // --- Confirmations Final Execution ---
    const confirmAction = useCallback(async () => {
        if (!client || !confirmConfig) return;

        const biometricsEnabled = await getFromStorage<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);

        switch (confirmConfig.type) {
            case 'deleteClient': {
                if (biometricsEnabled) {
                    const success = await authenticateBiometrics(`Confirmar eliminación de ${client.name}`);
                    if (!success) return;
                }
                deleteClient(client.id);
                showNotification({ message: `${client.name} fue eliminado.`, type: 'success' });
                router.back();
                break;
            }
            case 'settleDebt': {
                if (biometricsEnabled) {
                    const success = await authenticateBiometrics(`Confirmar saldo total de ${client.name}`);
                    if (!success) return;
                }
                addTransaction(client.id, { amount: client.debt, type: 'Pago', date: Date.now() });
                showNotification({ message: SUCCESS_MESSAGES.DEBT_CLEARED, type: 'success' });
                break;
            }
            case 'deleteTransaction': {
                const tx = confirmConfig.payload as Transaction;
                if (biometricsEnabled) {
                    const success = await authenticateBiometrics(`Confirmar eliminación de movimiento por $${formatMoney(tx.amount)}`);
                    if (!success) return;
                }
                deleteTransaction(client.id, tx.id);
                showNotification({ message: SUCCESS_MESSAGES.TRANSACTION_DELETED, type: 'success' });
                break;
            }
        }
        setConfirmConfig(null);
    }, [client, confirmConfig, deleteClient, addTransaction, deleteTransaction, showNotification, router]);

    return {
        client,
        modalConfig,
        confirmConfig,
        actions: {
            handleEditOpen,
            handlePayOpen,
            handleAddDebtOpen,
            closeModal,
            handleSaveTransaction,
            handleUpdateClient,

            handleDeleteClient,
            handleSettleDebt,
            handleDeleteTransaction,
            
            closeConfirm: () => setConfirmConfig(null),
            confirmAction,
        }
    };
}
