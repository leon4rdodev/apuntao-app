import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import ActionModal from '@/components/clientsScreen/ActionModal';
import CustomInput from '@/components/input/CustomInput';
import CustomText from '@/components/ui/CustomText';
import { AmountInput } from '@/components/input/AmountInput';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { formatPhoneNumber } from '@/utils/formatters';
import { ModalConfig } from '@/hooks/useClientDetail';
import { Client } from '@/types';

interface ClientActionModalProps {
    config: ModalConfig;
    client: Client;
    onClose: () => void;
    onSaveTransaction: (amount: string, closeParams: () => void) => void;
    onUpdateClient: (editName: string, editPhone: string, closeParams: () => void) => void;
}

export default function ClientActionModal({
    config,
    client,
    onClose,
    onSaveTransaction,
    onUpdateClient,
}: ClientActionModalProps) {
    const theme = Colors[useColorScheme() || 'light'];

    // --- State Local Aislado ---
    const [amount, setAmount] = useState('');
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');

    const amountInputRef = useRef<TextInput>(null);
    const editNameInputRef = useRef<TextInput>(null);

    // Initial sync
    useEffect(() => {
        if (config?.type === 'edit') {
            setEditName(client.name);
            setEditPhone(client.phone || '');
            const timer = setTimeout(() => editNameInputRef.current?.focus(), 100);
            return () => clearTimeout(timer);
        } else if (config?.type === 'transaction') {
            setAmount('');
            const timer = setTimeout(() => amountInputRef.current?.focus(), 100);
            return () => clearTimeout(timer);
        }
    }, [config, client]);

    const handleSaveTransactionLocal = useCallback(
        () => onSaveTransaction(amount, onClose),
        [amount, onClose, onSaveTransaction]
    );

    const handleUpdateClientLocal = useCallback(
        () => onUpdateClient(editName, editPhone, onClose),
        [editName, editPhone, onClose, onUpdateClient]
    );

    const renderModalContent = () => {
        if (!config) return null;

        if (config.type === 'transaction') {
            return (
                <AmountInput
                    ref={amountInputRef as any}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0"
                    autoFocus={false}
                    onSubmitEditing={handleSaveTransactionLocal}
                    returnKeyType="done"
                    submitBehavior="submit"
                />
            );
        }

        if (config.type === 'edit') {
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
                            onSubmitEditing={handleUpdateClientLocal}
                            returnKeyType="next"
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
                            onSubmitEditing={handleUpdateClientLocal}
                            returnKeyType="done"
                            submitBehavior="submit"
                        />
                    </View>
                </>
            );
        }
        return null;
    };

    const { title, actions } = useMemo(() => {
        if (!config) return { title: '', actions: [] };
        const baseActions = [
            {
                title: 'Cancelar',
                onPress: onClose,
                buttonStyle: { backgroundColor: theme.inputBackground, flex: 1, borderWidth: 1, borderColor: theme.borderSubtle },
                textStyle: { color: theme.textSecondary },
            },
        ];
        
        if (config.type === 'transaction') {
            const isPayment = config.payload === 'Pago';
            return {
                title: isPayment ? 'Registrar Pago' : 'Añadir Nueva Deuda',
                actions: [
                    ...baseActions,
                    {
                        title: 'Guardar',
                        onPress: handleSaveTransactionLocal,
                        buttonStyle: { backgroundColor: theme.primary, flex: 1 },
                        textStyle: { color: theme.textOnPrimary },
                        iconName: 'checkmark',
                        iconColor: theme.textOnPrimary,
                    },
                ],
            };
        }

        if (config.type === 'edit') {
            return {
                title: 'Editar Cliente',
                actions: [
                    ...baseActions,
                    {
                        title: 'Actualizar',
                        onPress: handleUpdateClientLocal,
                        buttonStyle: { backgroundColor: theme.primary, flex: 1 },
                        textStyle: { color: theme.textOnPrimary },
                        iconName: 'save',
                        iconColor: theme.textOnPrimary,
                    },
                ],
            };
        }
        
        return { title: '', actions: [] };
    }, [config, theme, onClose, handleSaveTransactionLocal, handleUpdateClientLocal]);

    return (
        <ActionModal
            paddingBottom={config?.type === 'transaction' ? 400 : 430}
            isVisible={!!config}
            onClose={onClose}
            title={title}
            actions={actions}
        >
            {renderModalContent()}
        </ActionModal>
    );
}

const styles = StyleSheet.create({
    inputGroup: { marginBottom: 16 },
    label: { marginBottom: 8 },
});
