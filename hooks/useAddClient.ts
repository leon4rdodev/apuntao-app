import { useState } from 'react';
import { Keyboard } from 'react-native';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { useNotification } from '@/store/notificationStore';
import { useClientStore } from '@/store/clientStore';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { formatName, parseFormattedNumber } from '@/utils/formatters';
import { validateClientData } from '@/utils/validation';

/**
 * Hook para manejar la inserción de un nuevo cliente y su deuda inicial en Firestore.
 * Esto mantiene el componente `agregar.tsx` como una vista estúpida (Dumb Component).
 */
export function useAddClient() {
    const clients = useClientStore((state) => state.clients);
    const { addClient, addTransaction } = useClientStore((state) => state.actions);
    const { checkAndAlert } = useSubscriptionCheck();
    const showNotification = useNotification();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [initialDebt, setInitialDebt] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const isFormValid = name.trim().length >= 3;

    const handleSave = async () => {
        Keyboard.dismiss();
        if (!isFormValid) return;

        // Limita a usuarios gratuitos
        if (!checkAndAlert()) return;

        setIsSaving(true);
        const formattedName = formatName(name);
        const debtAmount = initialDebt ? parseFormattedNumber(initialDebt) : 0;
        const formattedPhone = phone.replaceAll('-', '');

        // 1. Validar duplicidad
        if (clients.some((client) => client.name.toLowerCase() === formattedName.toLowerCase())) {
            showNotification({
                message: ERROR_MESSAGES.DUPLICATE_CLIENT,
                type: 'error',
            });
            setIsSaving(false);
            return;
        }

        // 2. Validar estructura
        const validation = validateClientData(formattedName, debtAmount, formattedPhone);
        if (!validation.isValid) {
            showNotification({
                message: validation.error || 'Por favor, revisa los datos ingresados.',
                type: 'error',
            });
            setIsSaving(false);
            return;
        }

        // 3. Escribir a Firestore
        try {
            const newClient = await addClient({ name: formattedName, phone: formattedPhone });

            if (debtAmount > 0) {
                await addTransaction(newClient.id, {
                    amount: debtAmount,
                    type: 'Deuda',
                    date: Date.now(),
                });
            }

            showNotification({
                message: SUCCESS_MESSAGES.CLIENT_ADDED,
                type: 'success',
            });

            // Limpiar formulario para el sig cliente
            setName('');
            setPhone('');
            setInitialDebt('');
        } catch (e: any) {
            showNotification({
                message: e.message || 'Ocurrió un error inesperado al guardar.',
                type: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return {
        name,
        setName,
        phone,
        setPhone,
        initialDebt,
        setInitialDebt,
        focusedField,
        setFocusedField,
        isSaving,
        isFormValid,
        handleSave,
    };
}
