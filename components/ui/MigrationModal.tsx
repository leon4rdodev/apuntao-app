import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import CustomButton from './CustomButton';
import { migrateLegacyData } from '@/utils/migration';
import { getAuth } from '@react-native-firebase/auth';
import { useNotificationStore } from '@/store/notificationStore';

// Importación directa del JSON para evitar dependencias nativas
// @ts-ignore
import legacyData from '../../backup_colmado_amarilis_2026-03-15.json';

interface MigrationModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function MigrationModal({ isVisible, onClose }: MigrationModalProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme || 'light'];
    const showNotification = useNotificationStore((state) => state.show);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleStartMigration = async () => {
        try {
            const user = getAuth().currentUser;
            if (!user?.uid) {
                throw new Error('No se encontró sesión de usuario');
            }

            setStatus('loading');
            showNotification({
                message: 'Migración en curso...',
                type: 'info',
            });

            const count = await migrateLegacyData(user.uid, legacyData as any);

            setStatus('success');
            showNotification({
                message: `¡Éxito! Se migraron ${count} clientes correctamente.`,
                type: 'success',
            });

            // Cerrar después de un momento
            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 2000);

        } catch (error: any) {
            console.error('Error en migración:', error);
            setStatus('error');
            Alert.alert('Error', error.message || 'No se pudo completar la migración.');
        }
    };

    const isLoading = status === 'loading';

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        {isLoading ? 'Migrando datos...' : 'Migración de Datos'}
                    </Text>
                    
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        {isLoading
                            ? 'Por favor espera. Estamos importando los clientes y sus movimientos.'
                            : 'Se ha detectado un archivo de respaldo. ¿Deseas importar los clientes y su historial de deudas?'}
                    </Text>

                    {isLoading ? (
                        <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
                    ) : (
                        <View style={styles.buttonContainer}>
                            <CustomButton
                                title="Cancelar"
                                onPress={onClose}
                                disabled={isLoading}
                                buttonStyle={[styles.button, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.borderSubtle }]}
                                textStyle={{ color: theme.textSecondary }}
                            />
                            <CustomButton
                                title="Comenzar"
                                onPress={handleStartMigration}
                                disabled={isLoading || status === 'success'}
                                buttonStyle={styles.button}
                            />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    loader: {
        marginVertical: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
    },
});
