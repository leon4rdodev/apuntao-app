// app/(app)/(tabs)/cuenta.tsx

import SubscriptionCard from '@/components/cards/SubscriptionCard';
import ActionRow from '@/components/ui/ActionRow';
import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { formatPhoneNumber } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons'; // <-- 1. Importa Ionicons
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    useColorScheme,
    View,
} from 'react-native';

export default function CuentaScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    const { session: account, signOut } = useAuth();

    const handleSignOut = () => {
        Alert.alert('Cerrar Sesión', '¿Estás seguro? Se cerrará tu sesión en este dispositivo.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Confirmar',
                style: 'destructive',
                onPress: signOut,
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
                        <View
                            style={[
                                styles.profileIconContainer,
                                { backgroundColor: theme.primaryLight },
                            ]}
                        >
                            <Ionicons
                                name="storefront-outline"
                                style={styles.profileIcon}
                                color={theme.primary}
                            />
                        </View>

                        <CustomText size="xxlarge" weight="bold" style={styles.userName}>
                            {account.colmadoName}
                        </CustomText>
                        <CustomText size="large" color={theme.textSecondary}>
                            {formatPhoneNumber(account.phoneNumber)}
                        </CustomText>
                    </View>
                ) : (
                    <View style={styles.profileHeader}>
                        <ActivityIndicator color={theme.primary} size="large" />
                        <CustomText style={{ marginTop: 12, color: theme.textSecondary }}>
                            Sincronizando perfil...
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
                            paddingBottom: 0,
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
    scrollContainer: { padding: 24, paddingTop: Constants.statusBarHeight + 24, paddingBottom: 50 },
    profileHeader: { alignItems: 'center', marginBottom: 24, minHeight: 70 },

    // --- 3. AÑADE LOS ESTILOS PARA EL ÍCONO ---
    profileIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40, // La mitad del ancho/alto para hacerlo un círculo perfecto
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16, // Espacio entre el ícono y el nombre
    },
    profileIcon: {
        fontSize: 40, // Tamaño del ícono dentro del círculo
    },
    // --- FIN DE LOS NUEVOS ESTILOS ---

    userName: { marginBottom: 4, textAlign: 'center' }, // Añadido textAlign para nombres largos
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
