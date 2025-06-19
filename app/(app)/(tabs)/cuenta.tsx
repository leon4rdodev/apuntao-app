// apuntao-app-master/app/(app)/(tabs)/cuenta.tsx

import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
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
import { formatMoney } from '@/utils/formatters';

import SubscriptionCard from '@/components/cards/SubscriptionCard';
import ActionRow from '@/components/ui/ActionRow';
import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';

// --- Componente Principal de la Pantalla ---
export default function CuentaScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    
    // Obtenemos el estado de la sesión y los datos del cliente de nuestros hooks centralizados
    const { account, logout, isInitialized } = useSessionStore();
    const { clients, clearClients } = useClientContext(); 

    const summaryData = useMemo(() => {
        const totalDebt = clients.reduce((sum, client) => sum + client.debt, 0);
        return { clientCount: clients.length, totalDebt };
    }, [clients]);

    const handleSignOut = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro? Se cerrarán tu sesión en este dispositivo.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: 'destructive',
                    onPress: async () => {
                        await clearClients(); // Limpia el contexto de clientes
                        await logout();       // Llama a la función de logout del store de sesión
                    },
                },
            ]
        );
    };

    // Muestra un indicador de carga mientras se inicializa la sesión
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
                {account && (
                    <View style={styles.profileHeader}>
                        <CustomText size="xlarge" weight="bold" style={styles.userName}>
                            {account.colmadoName}
                        </CustomText>
                        <CustomText size="medium" color={theme.textSecondary}>
                            {account.phoneNumber}
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
                        { backgroundColor: theme.surface, borderColor: theme.border, paddingBottom: 0 },
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
                </View>

                <View style={{ marginTop: 24 }}>
                    <CustomButton
                        title={'Cerrar Sesión'}
                        onPress={handleSignOut}
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
    userName: { marginBottom: 4 },
    card: { borderRadius: 16, padding: 18, marginBottom: 18, borderWidth: 1 },
    cardTitle: { textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center', gap: 6 },
    appVersion: { textAlign: 'center', marginTop: 32, opacity: 0.7 },
});