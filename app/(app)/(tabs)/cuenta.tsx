import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import { STORAGE_KEYS } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useClientContext } from '@/context/ClientContext';
import { formatMoney } from '@/utils/formatters';
import { removeFromStorage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, User } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    View,
    useColorScheme
} from 'react-native';

import ActionRow from '@/components/ui/ActionRow'; // Asegúrate de que este componente esté correctamente importado

export default function CuentaScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    const { clients } = useClientContext();

    const [user, setUser] = useState<User['user'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSigningOut, setIsSigningOut] = useState(false);

    // 1. Obtener la información del usuario al cargar la pantalla
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const currentUser = await GoogleSignin.getCurrentUser();
                setUser(currentUser?.user || null);
            } catch (error) {
                console.error('Error al obtener el usuario actual:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCurrentUser();
    }, []);

    // 2. Calcular datos de resumen con useMemo para optimización
    const summaryData = useMemo(() => {
        const totalDebt = clients.reduce((sum, client) => sum + client.debt, 0);
        return {
            clientCount: clients.length,
            totalDebt,
        };
    }, [clients]);

    // 3. Lógica para cerrar sesión
    const handleSignOut = useCallback(async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar tu sesión? Tus datos están seguros en tu Google Drive.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: 'destructive',
                    onPress: async () => {
                        setIsSigningOut(true);
                        try {
                            await GoogleSignin.signOut();
                            await removeFromStorage(STORAGE_KEYS.AUTH_DATA);
                            router.replace('/(auth)/login');
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error);
                            Alert.alert('Error', 'No se pudo cerrar la sesión. Intenta de nuevo.');
                        } finally {
                            setIsSigningOut(false);
                        }
                    },
                },
            ]
        );
    }, [router]);

    // Muestra un indicador de carga mientras se obtiene la info del usuario
    if (isLoading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* --- Cabecera con foto y nombre --- */}
                {user && (
                    <View style={styles.profileHeader}>
                        <Image source={{ uri: user.photo || undefined }} style={styles.avatar} />
                        <CustomText size="xlarge" weight="bold" style={styles.userName}>
                            {user.name}
                        </CustomText>
                        <CustomText size="medium" color={theme.textSecondary}>
                            {user.email}
                        </CustomText>
                    </View>
                )}

                {/* --- Tarjeta de Resumen --- */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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

                {/* --- Tarjeta de Acciones --- */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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
                        text="Sincronizar Datos"
                        onPress={() =>
                            Alert.alert('Próximamente', 'Sincronización manual en desarrollo.')
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

                {/* --- Botón de Cerrar Sesión --- */}
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

                {/* --- Versión de la App --- */}
                <CustomText size="small" color={theme.textSecondary} style={styles.appVersion}>
                    Versión {Constants.expoConfig?.version || '1.0.0'}
                </CustomText>
            </ScrollView>
        </View>
    );
}

// --- Estilos para la pantalla ---

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        padding: 24,
        paddingTop: Constants.statusBarHeight + 24,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        marginBottom: 16,
        borderColor: Colors.light.primary, // Cambia según el tema
    },
    userName: {
        marginBottom: 4,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 18,
        borderWidth: 1,
    },
    cardTitle: {
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        gap: 6,
    },
    appVersion: {
        textAlign: 'center',
        marginTop: 32,
        opacity: 0.7,
    },
});
