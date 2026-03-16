/**
 * @file components/ui/ConfirmModal.tsx
 * @description Componente especializado para diálogos de confirmación.
 * Reemplaza los Alert.alert de React Native con una interfaz más integrada.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import ActionModal from '@/components/clientsScreen/ActionModal';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    iconName?: keyof typeof Ionicons.glyphMap;
    confirmIconName?: keyof typeof Ionicons.glyphMap;
    isLoading?: boolean;
}

const ConfirmModal = ({
    isVisible,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDestructive = false,
    iconName = 'alert-circle-outline',
    confirmIconName,
    isLoading = false,
}: ConfirmModalProps) => {
    const theme = Colors[useColorScheme() || 'light'];

    const actions = [
        {
            title: cancelText,
            onPress: onClose,
            buttonStyle: { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.borderSubtle, 
                borderWidth: 1,
                flex: 1 
            },
            textStyle: { color: theme.textSecondary },
        },
        {
            title: confirmText,
            onPress: onConfirm,
            isLoading: isLoading,
            buttonStyle: { 
                backgroundColor: isDestructive ? theme.error : theme.primary,
                flex: 1 
            },
            textStyle: { color: theme.textOnPrimary },
            iconName: confirmIconName || (isDestructive ? 'trash-outline' : 'checkmark-outline'),
            iconColor: theme.textOnPrimary,
        },
    ];

    return (
        <ActionModal
            isVisible={isVisible}
            onClose={onClose}
            title={title}
            actions={actions}
            paddingBottom={40}
        >
            <View style={styles.container}>
                <View style={[styles.iconContainer, { backgroundColor: isDestructive ? theme.errorLight : theme.primaryLight }]}>
                    <Ionicons 
                        name={iconName} 
                        size={32} 
                        color={isDestructive ? theme.error : theme.primary} 
                    />
                </View>
                <CustomText 
                    size="medium" 
                    color={theme.textSecondary} 
                    style={styles.description}
                >
                    {description}
                </CustomText>
            </View>
        </ActionModal>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    description: {
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 8,
    },
});

export default ConfirmModal;
