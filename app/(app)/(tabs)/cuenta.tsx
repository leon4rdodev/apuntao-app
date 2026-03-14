// app/(app)/(tabs)/cuenta.tsx

import SubscriptionCard from '@/components/cards/SubscriptionCard';
import ActionRow from '@/components/ui/ActionRow';
import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { getFromStorage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons'; // <-- 1. Importa Ionicons
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import { authenticateBiometrics, isBiometricsAvailable } from '@/utils/biometrics';
import { STORAGE_KEYS } from '@/constants';
import { saveToStorage } from '@/utils/storage';
import { useNotification } from '@/store/notificationStore';
import { useUIStore } from '@/store/uiStore';
import { ERROR_MESSAGES } from '@/constants';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import ActionModal from '@/components/clientsScreen/ActionModal';
import CustomInput from '@/components/input/CustomInput';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { useClientStore } from '@/store/clientStore';

export default function CuentaScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { session: account, signOut } = useAuth();
    const showNotification = useNotification();
    const hasPendingWrites = useClientStore((state) => state.hasPendingWrites);
    const [isExternalConfigured, setIsExternalConfigured] = React.useState(false);
    
    // Perfil
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Biometría
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);
    const isBiometricsSupported = useUIStore((state) => state.isBiometricsSupported);

    React.useEffect(() => {
        const checkConfig = async () => {
            const uri = await getFromStorage('EXTERNAL_BACKUP_URI');
            setIsExternalConfigured(!!uri);

            // Cargar preferencia de biometría
            const enabled = await getFromStorage<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
            setBiometricsEnabled(!!enabled);
        };
        checkConfig();
    }, []);

    const handleSignOut = useCallback(() => {
        if (hasPendingWrites) {
            showNotification({
                message: 'No puedes cerrar sesión. Hay datos sincronizándose.',
                type: 'error',
            });
            return;
        }

        Alert.alert('Cerrar Sesión', '¿Estás seguro? Se cerrará tu sesión en este dispositivo.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Confirmar',
                style: 'destructive',
                onPress: signOut,
            },
        ]);
    }, [signOut, hasPendingWrites, showNotification]);

    const handleEditProfile = useCallback(() => {
        if (account) {
            setNewName(account.colmadoName);
            setIsEditing(true);
        }
    }, [account]);

    const handleUpdateName = useCallback(async () => {
        if (!newName.trim()) {
            showNotification({
                message: 'El nombre no puede estar vacío',
                type: 'error',
            });
            return;
        }

        setIsSaving(true);
        try {
            const auth = getAuth();
            const db = getFirestore();
            const user = auth.currentUser;

            if (!user) throw new Error('Usuario no autenticado');

            await updateDoc(doc(db, 'users', user.uid), {
                colmadoName: newName.trim(),
            });

            setIsEditing(false);
            showNotification({
                message: 'Nombre actualizado con éxito',
                type: 'success',
            });
        } catch (error) {
            console.error('Error al actualizar nombre:', error);
            showNotification({
                message: 'No se pudo actualizar el nombre',
                type: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    }, [newName]);

    const toggleBiometrics = useCallback(async (value: boolean) => {
        try {
            const supported = await isBiometricsAvailable();
            if (!supported) {
                showNotification({
                    message: 'Tu dispositivo no soporta biometría o no está configurada',
                    type: 'error',
                });
                return;
            }

            // Pedir verificación antes de cambiar el estado (ya sea activar o desactivar)
            const actionLabel = value ? 'activar' : 'desactivar';
            const authSuccess = await authenticateBiometrics(`Confirma para ${actionLabel} la seguridad biométrica`);
            
            if (!authSuccess) {
                // Si falla o cancela, mantenemos el estado actual del Switch (no hacemos nada)
                return;
            }
            
            await saveToStorage(STORAGE_KEYS.BIOMETRICS_ENABLED, value);
            setBiometricsEnabled(value);
            showNotification({
                message: value ? 'Seguridad biométrica activada' : 'Seguridad biométrica desactivada',
                type: 'success',
            });
        } catch (error) {
            console.error('Error al cambiar biometría:', error);
            showNotification({
                message: 'No se pudo guardar la preferencia',
                type: 'error',
            });
        }
    }, [showNotification]);



    return (
        <View 
            style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {account ? (
                    <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                        <View
                            style={[
                                styles.profileIconContainer,
                                { backgroundColor: theme.primaryLight },
                            ]}
                        >
                            <Ionicons
                                name="storefront-outline"
                                style={styles.profileIcon}
                                color={theme.primary}
                            />
                        </View>

                        <View style={styles.nameRow}>
                            <CustomText size="xlarge" weight="bold" style={styles.userName}>
                                {account.colmadoName}
                            </CustomText>
                            <TouchableOpacity 
                                onPress={handleEditProfile}
                                style={styles.inlineEditButton}
                            >
                                <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <CustomText size="medium" color={theme.textSecondary} style={styles.userPhone}>
                            {account.email}
                        </CustomText>
                    </View>
                ) : (
                    <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                        <ActivityIndicator color={theme.primary} size="large" />
                        <CustomText style={{ marginTop: 12, color: theme.textSecondary }}>
                            Sincronizando perfil...
                        </CustomText>
                    </View>
                )}

                <SubscriptionCard />

                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.borderSubtle,
                            paddingBottom: 0,
                        },
                    ]}
                >
                    <CustomText
                        size="small"
                        weight="bold"
                        color={theme.textSecondary}
                        style={styles.cardTitle}
                    >
                        Ajustes y Soporte
                    </CustomText>
                    <ActionRow
                        icon="help-buoy-outline"
                        text="Centro de Ayuda"
                        onPress={() => router.push('/(app)/(tabs)/ayuda')}
                        theme={theme}
                    />
                    <ActionRow
                        icon="star-outline"
                        text="Calificar la App"
                        
                        onPress={() =>
                            Linking.openURL('market://details?id=com.leon4rdodev.apuntao')
                        }
                        theme={theme}
                    />


                    {isBiometricsSupported && (
                        <View style={[styles.settingRow, { borderTopColor: theme.borderSubtle }]}>
                            <View style={styles.settingTextContainer}>
                                <Ionicons name="finger-print-outline" size={22} color={theme.text} style={styles.settingIcon} />
                                <CustomText size="medium" weight="medium">Seguridad Biométrica</CustomText>
                            </View>
                            <TouchableOpacity 
                                activeOpacity={0.7}
                                onPress={() => toggleBiometrics(!biometricsEnabled)}
                            >
                                <View pointerEvents="none">
                                    <Switch
                                        value={biometricsEnabled}
                                        trackColor={{ false: theme.border, true: theme.primary }}
                                        thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={{ marginTop: 12 }}>
                    <CustomButton
                        title={'Cerrar Sesión'}
                        onPress={handleSignOut}
                        buttonStyle={{ backgroundColor: 'transparent', borderColor: theme.border, borderWidth: 1 }}
                        textStyle={{ color: theme.error, fontWeight: '600' }}
                        iconName="log-out-outline"
                        iconColor={theme.error}
                    />
                </View>

                <CustomText size="small" color={theme.textSecondary} style={styles.appVersion}>
                    Versión {require('../../../package.json').version}
                </CustomText>
            </ScrollView>

            <ActionModal
                isVisible={isEditing}
                onClose={() => setIsEditing(false)}
                title="Editar Perfil"
                paddingBottom={350}
                actions={[
                    {
                        title: 'Cancelar',
                        onPress: () => setIsEditing(false),
                        buttonStyle: { backgroundColor: 'transparent', borderColor: theme.border, borderWidth: 1 },
                        textStyle: { color: theme.textSecondary },
                    },
                    {
                        title: 'Guardar',
                        onPress: handleUpdateName,
                        isLoading: isSaving,
                        iconName: 'checkmark-outline',
                    },
                ]}
            >
                <View style={{ marginBottom: 12 }}>
                    <CustomText size="small" weight="medium" style={{ marginBottom: 8, color: theme.textSecondary, marginLeft: 4 }}>
                        Nombre de tu Negocio
                    </CustomText>
                    <CustomInput
                        value={newName}
                        onChangeText={setNewName}
                        placeholder="Ej. Colmado El Sol"
                        autoFocus
                    />
                </View>
            </ActionModal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { 
        padding: 20, 
        paddingTop: 60, // Consistente con agregar.tsx
        paddingBottom: 40, 
    },
    profileCard: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 20,
    },
    profileIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileIcon: {
        fontSize: 32,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 4,
    },
    inlineEditButton: {
        padding: 6,
        borderRadius: 100,
    },
    userName: { textAlign: 'center' },
    userPhone: { textAlign: 'center' },
    card: {
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
        borderWidth: 1,
    },
    cardTitle: { 
        textTransform: 'uppercase', 
        letterSpacing: 0.5, 
        marginBottom: 12,
        marginLeft: 4,
    },
    appVersion: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderTopWidth: 1,
    },
    settingTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        marginRight: 12,
    },
});
