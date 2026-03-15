import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import ActionModal from '../clientsScreen/ActionModal';
import CustomText from './CustomText';
import CustomButton from './CustomButton';
import { migrateLegacyData } from '@/utils/migration';
import { useAuth } from '@/context/AuthContext';
import { getAuth } from '@react-native-firebase/auth';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '@/store/notificationStore';

// Importamos el archivo directamente. Metro lo convertirá en un objeto JS.
// Esto NO requiere librerías nativas de archivos.
import backupData from '../../backup_colmado_amarilis_2026-03-15.json';

interface MigrationModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function MigrationModal({ isVisible, onClose }: MigrationModalProps) {
    const { session } = useAuth();
    const [isMigrating, setIsMigrating] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme || 'light'];
    const showNotification = useNotification();

    const handleStartMigration = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user?.uid) {
                throw new Error('No se encontró sesión de usuario válida');
            }

            setStatus('loading');
            setIsMigrating(true);

            // Usamos la data importada directamente
            await migrateLegacyData(backupData, user.uid);

            setStatus('success');
            showNotification({
                message: '¡Migración completada con éxito!',
                type: 'success',
            });
            
            // Damos tiempo a la notificación para que se vea antes de cerrar
            setTimeout(() => {
                setIsMigrating(false);
                onClose();
            }, 2500);

        } catch (error: any) {
            console.error('Error en migración:', error);
            setStatus('error');
            setIsMigrating(false);
            Alert.alert('Error', 'No se pudo procesar la migración: ' + (error.message || 'Error desconocido'));
        }
    };

    return (
        <ActionModal
            isVisible={isVisible}
            onClose={isMigrating ? () => {} : onClose}
            title="Migración de Datos (Local)"
            paddingBottom={40}
            actions={isMigrating ? [] : [
                {
                    title: 'Cancelar',
                    onPress: onClose,
                    buttonStyle: { backgroundColor: 'transparent', borderColor: theme.border, borderWidth: 1 },
                    textStyle: { color: theme.textSecondary },
                }
            ]}
        >
            <View style={styles.container}>
                {status === 'idle' && (
                    <>
                        <Ionicons name="archive-outline" size={64} color={theme.primary} style={styles.icon} />
                        <CustomText weight="bold" style={styles.fileName}>
                            Archivo: backup_colmado_amarilis.json
                        </CustomText>
                        <CustomText style={styles.description}>
                            Se ha detectado el archivo de respaldo en el proyecto. Al presionar el botón, se migrarán todos los clientes y ventas a tu cuenta actual de Firebase.
                        </CustomText>
                        <CustomButton 
                            title="Iniciar Migración Ahora" 
                            onPress={handleStartMigration}
                            iconName="rocket-outline"
                        />
                    </>
                )}

                {status === 'loading' && (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <CustomText style={styles.statusText}>Migrando datos desde el archivo local...</CustomText>
                        <CustomText size="small" color={theme.textSecondary} style={{marginTop: 8}}>
                             No cierres la app
                        </CustomText>
                    </View>
                )}

                {status === 'success' && (
                    <View style={styles.center}>
                        <Ionicons name="checkmark-circle-outline" size={64} color={theme.success} />
                        <CustomText style={styles.statusText}>¡Migración Finalizada!</CustomText>
                        <CustomText size="small" color={theme.textSecondary} style={styles.subStatusText}>
                            Ya puedes borrar el archivo .json del proyecto.
                        </CustomText>
                    </View>
                )}

                {status === 'error' && (
                    <View style={styles.center}>
                        <Ionicons name="alert-circle-outline" size={64} color={theme.error} />
                        <CustomText style={styles.statusText}>Fallo en la migración</CustomText>
                        <CustomButton 
                            title="Reintentar" 
                            onPress={() => setStatus('idle')}
                            buttonStyle={{ marginTop: 16 }}
                        />
                    </View>
                )}
            </View>
        </ActionModal>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    icon: {
        marginBottom: 16,
    },
    fileName: {
        marginBottom: 8,
        fontSize: 16,
    },
    description: {
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.8,
        lineHeight: 20,
    },
    center: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    statusText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    subStatusText: {
        marginTop: 8,
        textAlign: 'center',
    }
});
