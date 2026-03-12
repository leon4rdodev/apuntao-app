import { useState } from 'react';
import { Keyboard } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useNotification } from '@/store/notificationStore';

/**
 * Hook personalizado para encapsular toda la lógica de negocio del inicio de sesión
 * por número de teléfono en Firebase. De esta forma, la UI se mantiene limpia.
 */
export function useLogin() {
    const showNotification = useNotification();
    
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

    const handleSendCode = async (phoneNumber: string) => {
        Keyboard.dismiss();
        if (!phoneNumber || phoneNumber.length < 10) {
            showNotification({
                message: 'Por favor, ingresa un número de teléfono válido.',
                type: 'error',
            });
            return;
        }

        setIsLoading(true);
        try {
            // Asegurar formato internacional (ej. +18091234567)
            let formattedPhone = phoneNumber.replace(/-/g, '').replace(/ /g, '');
            if (!formattedPhone.startsWith('+')) {
                formattedPhone = '+1' + formattedPhone; 
            }

            const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
            setConfirm(confirmation);
            
            showNotification({
                message: 'Código SMS enviado.',
                type: 'success',
            });
        } catch (error: any) {
            console.error('Error enviando SMS:', error);
            showNotification({
                message: 'Error al enviar el código. Verifica el número.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmCode = async () => {
        Keyboard.dismiss();
        if (!code || code.length !== 6) {
            showNotification({
                message: 'Por favor, ingresa el código de 6 dígitos.',
                type: 'error',
            });
            return;
        }

        setIsLoading(true);
        try {
            if (confirm) {
                await confirm.confirm(code);
                // AuthContext detectará la nueva sesión y se encargará del ruteo.
            }
        } catch (error: any) {
            console.error('Error confirmando código:', error);
            showNotification({
                message: 'Código incorrecto o expirado.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetConfirmation = () => {
        setConfirm(null);
        setCode('');
    };

    return {
        code,
        setCode,
        isLoading,
        confirm,
        handleSendCode,
        handleConfirmCode,
        resetConfirmation,
    };
}
