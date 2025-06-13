// apuntao-app-master/app/(app)/(tabs)/cuenta.tsx

import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    useColorScheme,
    View,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useClientContext } from '@/context/ClientContext';
import { useSessionStore } from '@/store/sessionStore';
import { formatDate, formatMoney } from '@/utils/formatters';

import ActionRow from '@/components/ui/ActionRow';
import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';

// --- Sub-componente para la Tarjeta de Suscripción ---
const SubscriptionCard = () => {
    const theme = Colors[useColorScheme() || 'light'];
    const { subscription } = useSessionStore();

    const getStatusInfo = () => {
        switch (subscription.status) {
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
        subscription.status === 'trial' ? subscription.trialEndDate : subscription.endDate;

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
                {subscription.plan && subscription.plan !== 'none' && (
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
            {(subscription.status === 'expired' || subscription.status === 'cancelled') && (
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

// --- Componente Principal de la Pantalla ---
export default function CuentaScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const { clients, clearClients } = useClientContext(); // ✅ Obtener la función de limpieza
    const { user, isInitialized, logout: logoutAction } = useSessionStore(); // ✅ Obtener la acción de logout

    const summaryData = useMemo(() => {
        const totalDebt = clients.reduce((sum, client) => sum + client.debt, 0);
        return { clientCount: clients.length, totalDebt };
    }, [clients]);

    const handleSignOut = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro? Se borrarán los datos locales de esta sesión.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: 'destructive',
                    onPress: () => {
                        setIsSigningOut(true);
                        // 1. Limpiar los datos de clientes y transacciones
                        clearClients();
                        // 2. Limpiar la sesión de autenticación y redirigir
                        logoutAction();
                    },
                },
            ]
        );
    };

    if (!isInitialized) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {user && (
                    <View style={styles.profileHeader}>
                        <Image
                            source={{ uri: user.photo || undefined }}
                            style={[styles.avatar, { borderColor: theme.primary }]}
                        />
                        <CustomText size="xlarge" weight="bold" style={styles.userName}>
                            {user.name}
                        </CustomText>
                        <CustomText size="medium" color={theme.textSecondary}>
                            {user.email}
                        </CustomText>
                    </View>
                )}

                <SubscriptionCard />

                <View
                    style={[
                        styles.card,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                >
                    <CustomText
                        size="small"
                        weight="bold"
                        color={theme.textSecondary}
                        style={styles.cardTitle}
                    >
                        Resumen de tu Negocio
                    </CustomText>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons name="people-outline" size={28} color={theme.primary} />
                            <CustomText size="large" weight="bold">
                                {summaryData.clientCount}
                            </CustomText>
                            <CustomText size="small" color={theme.textSecondary}>
                                Clientes
                            </CustomText>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="cash-outline" size={28} color={theme.primary} />
                            <CustomText size="large" weight="bold">
                                ${formatMoney(summaryData.totalDebt)}
                            </CustomText>
                            <CustomText size="small" color={theme.textSecondary}>
                                Por Cobrar
                            </CustomText>
                        </View>
                    </View>
                </View>

                <View
                    style={[
                        styles.card,
                        { backgroundColor: theme.surface, borderColor: theme.border },
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
                        icon="sync-outline"
                        text="Sincronizar Datos con Drive"
                        onPress={() =>
                            Alert.alert(
                                'Próximamente',
                                'La sincronización con Google Drive está en desarrollo.'
                            )
                        }
                        theme={theme}
                    />
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
                </View>

                <View style={{ marginTop: 24 }}>
                    <CustomButton
                        title={isSigningOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                        onPress={handleSignOut}
                        disabled={isSigningOut}
                        buttonStyle={{ backgroundColor: theme.errorLight }}
                        textStyle={{ color: theme.error }}
                        iconName="log-out-outline"
                        iconColor={theme.error}
                    />
                </View>

                <CustomText size="small" color={theme.textSecondary} style={styles.appVersion}>
                    Versión {Constants.expoConfig?.version || '1.0.0'}
                </CustomText>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    scrollContainer: { padding: 24, paddingTop: Constants.statusBarHeight + 24, paddingBottom: 50 },
    profileHeader: { alignItems: 'center', marginBottom: 24 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, marginBottom: 16 },
    userName: { marginBottom: 4 },
    card: { borderRadius: 16, padding: 20, marginBottom: 18, borderWidth: 1 },
    cardTitle: { textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center', gap: 6 },
    appVersion: { textAlign: 'center', marginTop: 32, opacity: 0.7 },
});
