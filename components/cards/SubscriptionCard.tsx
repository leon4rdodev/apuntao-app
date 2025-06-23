import { Colors } from '@/constants/Colors';
import { useSessionStore } from '@/store/sessionStore';
import { formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, useColorScheme, View, Linking } from 'react-native';
// 1. Importamos React para usar useState y useEffect
import React, { useState, useEffect } from 'react';
import CustomButton from '../ui/CustomButton';
import CustomText from '../ui/CustomText';
import { Subscription } from '@/types';
import { SUPPORT_CONTACT } from '@/constants';

const planNames: Record<Subscription['plan'], string> = {
    none: 'Ninguno',
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    yearly: 'Anual',
};

const SubscriptionCard = () => {
    const theme = Colors[useColorScheme() || 'light'];

    // 2. Creamos un estado local para "congelar" la información de la suscripción
    const [localSubscription, setLocalSubscription] = useState<Subscription | null>(null);

    // 3. Usamos un efecto para cargar los datos del store al estado local UNA SOLA VEZ
    useEffect(() => {
        // Obtenemos el estado actual del store al montar el componente
        const initialSubscription = useSessionStore.getState().subscription;
        // Lo guardamos en nuestro estado local
        setLocalSubscription(initialSubscription);
    }, []); // El array vacío [] asegura que esto se ejecute solo al montar.

    const handleGetSubscription = () => {
        const { WHATSAPP_NUMBER } = SUPPORT_CONTACT;
        const message = `Hola, estoy interesado en obtener una suscripción para Apunta'o.`;
        const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Asegúrate de tener WhatsApp instalado en tu dispositivo.');
        });
    };

    // 4. TODA LA LÓGICA AHORA USA `localSubscription` EN LUGAR DE LEER DEL STORE
    const getStatusInfo = () => {
        // Si el estado local aún no se ha cargado, mostramos 'Cargando...'
        if (!localSubscription) {
            return {
                icon: 'hourglass-outline' as const,
                color: theme.textSecondary,
                text: 'Cargando...',
            };
        }

        switch (localSubscription.status) {
            case 'active':
                return {
                    icon: 'shield-checkmark-outline' as const,
                    color: theme.success,
                    text: 'Activa',
                };
            case 'trial':
                return {
                    icon: 'time-outline' as const,
                    color: theme.info,
                    text: 'Prueba Gratuita',
                };
            case 'expired':
                return {
                    icon: 'alert-circle-outline' as const,
                    color: theme.error,
                    text: 'Expirada',
                };
            case 'cancelled':
                return {
                    icon: 'close-circle-outline' as const,
                    color: theme.error,
                    text: 'Cancelada',
                };
            // El caso 'loading' se maneja con la comprobación de !localSubscription
            default:
                return {
                    icon: 'help-circle-outline' as const,
                    color: theme.textSecondary,
                    text: 'Desconocido',
                };
        }
    };

    const statusInfo = getStatusInfo();
    const dateToShow =
        localSubscription?.status === 'trial'
            ? localSubscription?.trialEndDate
            : localSubscription?.endDate;

    const translatedPlanName = localSubscription?.plan ? planNames[localSubscription.plan] : '';

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <CustomText
                size="small"
                weight="bold"
                color={theme.textSecondary}
                style={styles.cardTitle}
            >
                Estado de tu Suscripción
            </CustomText>
            <View style={styles.statItem}>
                <Ionicons name={statusInfo.icon} size={32} color={statusInfo.color} />
                <CustomText
                    size="large"
                    weight="bold"
                    color={statusInfo.color}
                    style={{ marginVertical: 4 }}
                >
                    {statusInfo.text}
                </CustomText>
                {localSubscription?.plan && localSubscription.plan !== 'none' && (
                    <CustomText size="medium" color={theme.textSecondary}>
                        Plan: {translatedPlanName}
                    </CustomText>
                )}
                {dateToShow && (
                    <CustomText size="small" color={theme.textSecondary} style={{ marginTop: 2 }}>
                        {statusInfo.text === 'Prueba Gratuita' ? 'Termina el:' : 'Vence:'}{' '}
                        {formatDate(dateToShow)}
                    </CustomText>
                )}
            </View>

            {localSubscription?.status === 'trial' && (
                <CustomButton
                    title="Obtener Suscripción"
                    onPress={handleGetSubscription}
                    buttonStyle={{ marginTop: 16, backgroundColor: theme.primary }}
                    textStyle={{ color: theme.textOnPrimary }}
                    iconName="logo-whatsapp"
                />
            )}

            {(localSubscription?.status === 'expired' ||
                localSubscription?.status === 'cancelled') && (
                <CustomButton
                    title="Renovar Suscripción"
                    onPress={() =>
                        Alert.alert(
                            'Contactar Soporte',
                            'Por favor, contacta a soporte para renovar tu suscripción.'
                        )
                    }
                    buttonStyle={{ marginTop: 16, backgroundColor: theme.primary }}
                    textStyle={{ color: theme.textOnPrimary }}
                    iconName="rocket-outline"
                />
            )}
        </View>
    );
};

export default SubscriptionCard;

const styles = StyleSheet.create({
    card: { borderRadius: 16, padding: 20, marginBottom: 18, borderWidth: 1 },
    cardTitle: { textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
    statItem: { alignItems: 'center', gap: 6 },
});
