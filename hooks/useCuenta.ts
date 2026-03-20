import { useState, useEffect, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';

import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/store/notificationStore';
import { useClientStore } from '@/store/clientStore';
import { useUIStore } from '@/store/uiStore';
import { authenticateBiometrics, isBiometricsAvailable } from '@/utils/biometrics';
import { STORAGE_KEYS } from '@/constants';
import { saveToStorage, getFromStorage } from '@/utils/storage';

export function useCuenta() {
    const { session: account, signOut } = useAuth();
    const showNotification = useNotification();
    const hasPendingWrites = useClientStore((state) => state.hasPendingWrites);
    const isBiometricsSupported = useUIStore((state) => state.isBiometricsSupported);

    const [isEditing, setIsEditing] = useState(false);
    const [isLogoutVisible, setIsLogoutVisible] = useState(false);
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);

    useEffect(() => {
        const checkConfig = async () => {
            const enabled = await getFromStorage<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
            setBiometricsEnabled(!!enabled);
        };
        checkConfig();
    }, []);

    const handleSignOutRequest = useCallback(() => {
        if (hasPendingWrites) {
            showNotification({
                message: 'No puedes cerrar sesión. Hay datos sincronizándose.',
                type: 'error',
            });
            return;
        }
        setIsLogoutVisible(true);
    }, [hasPendingWrites, showNotification]);

    const handleUpdateName = useCallback(async (newName: string, setIsSaving: (s: boolean) => void) => {
        if (!newName.trim()) {
            showNotification({ message: 'El nombre no puede estar vacío', type: 'error' });
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
            
            Keyboard.dismiss();
            setIsEditing(false);
            showNotification({ message: 'Nombre actualizado con éxito', type: 'success' });
        } catch (error) {
            console.error('Error al actualizar nombre:', error);
            showNotification({ message: 'No se pudo actualizar el nombre', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    }, [showNotification]);

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

            const actionLabel = value ? 'activar' : 'desactivar';
            const authSuccess = await authenticateBiometrics(`Confirma para ${actionLabel} la seguridad biométrica`);
            
            if (!authSuccess) return;
            
            await saveToStorage(STORAGE_KEYS.BIOMETRICS_ENABLED, value);
            setBiometricsEnabled(value);
            showNotification({
                message: value ? 'Seguridad biométrica activada' : 'Seguridad biométrica desactivada',
                type: 'success',
            });
        } catch (error) {
            console.error('Error al cambiar biometría:', error);
            showNotification({ message: 'No se pudo guardar la preferencia', type: 'error' });
        }
    }, [showNotification]);

    return {
        account,
        isBiometricsSupported,
        biometricsEnabled,
        isEditing,
        isLogoutVisible,
        actions: {
            openEdit: () => setIsEditing(true),
            closeEdit: () => setIsEditing(false),
            openLogout: handleSignOutRequest,
            closeLogout: () => setIsLogoutVisible(false),
            handleUpdateName,
            toggleBiometrics,
            signOut,
        }
    };
}
