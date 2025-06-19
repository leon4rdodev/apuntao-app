import { Colors } from "@/constants/Colors";
import { useSessionStore } from "@/store/sessionStore";
import { formatDate } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, useColorScheme, View } from "react-native";
import CustomButton from "../ui/CustomButton";
import CustomText from "../ui/CustomText";

const SubscriptionCard = () => {
    const theme = Colors[useColorScheme() || 'light'];
    // Obtenemos el estado de la suscripción desde el store
    const { subscription } = useSessionStore();

    const getStatusInfo = () => {
        switch (subscription?.status) {
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
            case 'loading':
                return {
                    icon: 'hourglass-outline' as const,
                    color: theme.textSecondary,
                    text: 'Cargando...',
                };
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
        subscription?.status === 'trial' ? subscription.trialEndDate : subscription.endDate;

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
                        Plan:{' '}
                        {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                    </CustomText>
                )}
                {dateToShow && (
                    <CustomText size="small" color={theme.textSecondary} style={{ marginTop: 2 }}>
                        Vence: {formatDate(dateToShow)}
                    </CustomText>
                )}
            </View>
            {(subscription?.status === 'expired' || subscription?.status === 'cancelled') && (
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