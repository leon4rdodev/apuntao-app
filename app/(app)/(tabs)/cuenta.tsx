// apuntao-app-master/app/(app)/(tabs)/cuenta.tsx

import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React from 'react'; // Eliminados useState y useEffect
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
import { useSessionStore } from '@/store/sessionStore';

import SubscriptionCard from '@/components/cards/SubscriptionCard';
import ActionRow from '@/components/ui/ActionRow';
import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import { formatPhoneNumber } from '@/utils/formatters';

export default function CuentaScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();

    // ✅ --- SOLUCIÓN AL BUCLE INFINITO ---
    // Seleccionamos cada pieza del estado de forma individual.
    // Zustand solo re-renderizará si uno de estos valores específicos cambia.
    const account = useSessionStore((state) => state.account);
    const isInitialized = useSessionStore((state) => state.isInitialized);
    const logout = useSessionStore((state) => state.logout);

    const handleSignOut = () => {
        Alert.alert('Cerrar Sesión', '¿Estás seguro? Se cerrarán tu sesión en este dispositivo.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Confirmar',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                },
            },
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {account ? (
                    <View style={styles.profileHeader}>
                        <CustomText size="xxlarge" weight="bold" style={styles.userName}>
                            {account.colmadoName}
                        </CustomText>
                        <CustomText size="large" color={theme.textSecondary}>
                            {formatPhoneNumber(account.phoneNumber)}
                        </CustomText>
                    </View>
                ) : (
                    // Se muestra mientras se sincronizan los datos por primera vez tras el login.
                    <View style={styles.profileHeader}>
                        <ActivityIndicator color={theme.primary} />
                        <CustomText style={{ marginTop: 8, color: theme.textSecondary }}>
                            Cargando perfil...
                        </CustomText>
                    </View>
                )}

                <SubscriptionCard />

                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                            paddingBottom: 18,
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
    profileHeader: { alignItems: 'center', marginBottom: 24, minHeight: 70 },
    userName: { marginBottom: 4 },
    card: {
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingTop: 18,
        marginBottom: 18,
        borderWidth: 1,
    },
    cardTitle: { textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    appVersion: { textAlign: 'center', marginTop: 32, opacity: 0.7 },
});
