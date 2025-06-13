import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText'; // 1. Importar CustomText
import { Colors } from '@/constants/Colors';
import React from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    useColorScheme,
} from 'react-native';

/**
 * @component ActionModal
 * @description Modal genérico y reutilizable para acciones como añadir transacciones o editar clientes.
 */
const ActionModal = ({
    isVisible,
    onClose,
    title,
    children,
    actions,
}: {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions: any[]; // Se mantiene 'any' ya que las props son para CustomButton
}) => {
    const theme = Colors[useColorScheme() || 'light'];
    return (
        <Modal transparent visible={isVisible} animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
                <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                    {/* 2. Reemplazar Text con CustomText y usar props semánticas */}
                    <CustomText size="large" weight="bold" style={styles.modalTitle}>
                        {title}
                    </CustomText>

                    {children}

                    <View style={styles.modalActions}>
                        {actions.map((action) => (
                            <CustomButton key={action.title} {...action} />
                        ))}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// 3. Simplificar la hoja de estilos
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        width: '100%',
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        // Se eliminan fontSize, fontWeight y color.
        // Solo quedan los estilos de layout.
        marginBottom: 20,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 16,
    },
});

export default ActionModal;
