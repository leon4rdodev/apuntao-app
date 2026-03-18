import { Colors } from '@/constants/Colors';
import { useSessionStore } from '@/store/sessionStore';
import { formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, View, Linking } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import CustomButton from '../ui/CustomButton';
import CustomText from '../ui/CustomText';
import { Subscription } from '@/types';
import { SUPPORT_CONTACT } from '@/constants';
import { useNotification } from '@/store/notificationStore';

const planNames: Record<Subscription['plan'], string> = {
    none: 'Ninguno',
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    yearly: 'Anual',
};

const SubscriptionCard = () => {
    const theme = Colors[useColorScheme() || 'light'];
    const showNotification = useNotification();

    // Obtenemos la suscripción reactivamente del store
    const subscription = useSessionStore((state) => state.subscription);

    const handleWhatsAppContact = (customMessage?: string) => {
        const { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } = SUPPORT_CONTACT;
        const message = customMessage || WHATSAPP_MESSAGE;
        const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

        Linking.openURL(url).catch(() => {
            showNotification({
                message: 'Asegúrate de tener WhatsApp instalado',
                type: 'error',
            });
        });
    };

    const getStatusInfo = () => {
        // ... (resto de la función getStatusInfo igual)
        if (!subscription || subscription.status === 'loading') {
            return {
                icon: 'hourglass' as const,
                color: theme.textSecondary,
                text: 'Cargando...',
            };
        }

        switch (subscription.status) {
            case 'active':
                return {
                    icon: 'shield-checkmark' as const,
                    color: theme.success,
                    text: 'Activa',
                };
            case 'trial':
                return {
                    icon: 'time' as const,
                    color: theme.info,
                    text: 'Prueba Gratuita',
                };
            case 'expired':
                return {
                    icon: 'alert-circle' as const,
                    color: theme.error,
                    text: 'Expirada',
                };
            case 'cancelled':
                return {
                    icon: 'close-circle' as const,
                    color: theme.error,
                    text: 'Cancelada',
                };
            default:
                return {
                    icon: 'help-circle' as const,
                    color: theme.textSecondary,
                    text: 'Desconocido',
                };
        }
    };

    const statusInfo = getStatusInfo();
    const dateToShow =
        subscription?.status === 'trial'
            ? subscription?.trialEndDate
            : subscription?.endDate;

    const translatedPlanName = subscription?.plan ? planNames[subscription.plan] : '';

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
                {subscription?.plan && subscription.plan !== 'none' && (
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

            {subscription?.status === 'trial' && (
                <CustomButton
                    title="Obtener Suscripción"
                    onPress={() => handleWhatsAppContact("Hola, estoy interesado en obtener una suscripción para Apunta'o.")}
                    buttonStyle={{ marginTop: 16, backgroundColor: theme.primary }}
                    textStyle={{ color: theme.textOnPrimary }}
                    iconName="logo-whatsapp"
                />
            )}

            {(subscription?.status === 'expired' ||
                subscription?.status === 'cancelled') && (
                <CustomButton
                    title="Renovar Suscripción"
                    onPress={() => handleWhatsAppContact("Hola, mi suscripción ha vencido y quiero renovarla.")}
                    buttonStyle={{ marginTop: 16, backgroundColor: theme.primary }}
                    textStyle={{ color: theme.textOnPrimary }}
                    iconName="logo-whatsapp"
                />
            )}
        </View>
    );
};

export default SubscriptionCard;

const styles = StyleSheet.create({
    card: { borderRadius: 24, padding: 20, marginBottom: 18, borderWidth: 1 },
    cardTitle: { textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
    statItem: { alignItems: 'center', gap: 6 },
});
