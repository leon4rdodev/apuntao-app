import { useState } from 'react';
import { Keyboard } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNotification } from '@/store/notificationStore';
import { useSessionStore } from '@/store/sessionStore';

/**
 * Hook personalizado para aislar la lógica de registro de nuevo colmado
 * con autenticación por verificación SMS.
 */
export function useRegister() {
    const showNotification = useNotification();
    const setAccount = useSessionStore((state) => state.setAccount);

    const [colmadoName, setColmadoName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

    const handleRegister = async () => {
        Keyboard.dismiss();
        if (!colmadoName.trim() || !phoneNumber || phoneNumber.length < 10) {
            showNotification({
                message: 'Completa correctamente el nombre de tu colmado y el teléfono.',
                type: 'error',
            });
            return;
        }

        setIsLoading(true);
        try {
            let formattedPhone = phoneNumber.replace(/-/g, '').replace(/ /g, '');
            if (!formattedPhone.startsWith('+')) {
                formattedPhone = '+1' + formattedPhone; 
            }

            const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
            setConfirm(confirmation);
            
            showNotification({
                message: 'Código SMS enviado a tu teléfono.',
                type: 'success',
            });
        } catch (error: any) {
            console.error('Error enviando SMS de registro:', error);
            showNotification({
                message: 'Error al enviar el SMS. Revisa tu red o el formato del teléfono.',
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
                message: 'Por favor, ingresa el código de 6 dígitos que recibiste.',
                type: 'error',
            });
            return;
        }

        setIsLoading(true);
        try {
            if (confirm) {
                const credential = await confirm.confirm(code);
                const user = credential?.user;
                
                if (user) {
                    // Escribir el perfil en Firestore inmediatamente
                    const defaultSub = { status: 'active', plan: 'free' as const };
                    await firestore().collection('users').doc(user.uid).set({
                        colmadoName: colmadoName.trim(),
                        phoneNumber: user.phoneNumber,
                        subscription: defaultSub,
                        createdAt: firestore.FieldValue.serverTimestamp(),
                    }, { merge: true });

                    // Forzamos actualización en el store por si el AuthContext fue más rápido
                    setAccount({
                        colmadoName: colmadoName.trim(),
                        phoneNumber: user.phoneNumber || '',
                        subscription: defaultSub as any, // Bypass TS temporal
                    });
                }
            }
        } catch (error: any) {
            console.error('Error confirmando código en registro:', error);
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
        colmadoName,
        setColmadoName,
        phoneNumber,
        setPhoneNumber,
        code,
        setCode,
        isLoading,
        confirm,
        handleRegister,
        handleConfirmCode,
        resetConfirmation,
    };
}
