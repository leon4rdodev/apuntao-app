// app/(app)/(tabs)/cuenta.tsx

import SubscriptionCard from '@/components/cards/SubscriptionCard';
import ActionRow from '@/components/ui/ActionRow';
import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { formatPhoneNumber } from '@/utils/formatters';
import { getFromStorage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons'; // <-- 1. Importa Ionicons
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    useColorScheme,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function CuentaScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { session: account, signOut } = useAuth();
    const [isExternalConfigured, setIsExternalConfigured] = React.useState(false);

    React.useEffect(() => {
        const checkConfig = async () => {
            const uri = await getFromStorage('EXTERNAL_BACKUP_URI');
            setIsExternalConfigured(!!uri);
        };
        checkConfig();
    }, []);

    const handleSignOut = useCallback(() => {
        Alert.alert('Cerrar Sesión', '¿Estás seguro? Se cerrará tu sesión en este dispositivo.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Confirmar',
                style: 'destructive',
                onPress: signOut,
            },
        ]);
    }, [signOut]);

    const handleExportDatabase = useCallback(async () => {
        try {
            const fs: any = FileSystem;
            const documentDirectory = fs.documentDirectory;
            if (!documentDirectory) {
                Alert.alert('Error', 'No se pudo acceder al sistema de archivos.');
                return;
            }

            // La ruta base de la aplicación (en Android) suele estar un nivel arriba de files/
            const dbDirPath = documentDirectory.replace('files/', 'databases/');
            
            const dirInfo = await FileSystem.getInfoAsync(dbDirPath);
            if (!dirInfo.exists) {
                Alert.alert('Error', 'No se encontró la carpeta de bases de datos local.');
                return;
            }

            // Leer todos los archivos en el directorio databases/
            const files = await FileSystem.readDirectoryAsync(dbDirPath);
            
            // Buscar la base de datos de Firestore. Suele llamarse firestore.[app_id] o firestore.%2F...
            // Ignoramos los archivos temporales tipo -journal o -wal
            const dbFileName = files.find(f => f.startsWith('firestore.') && !f.endsWith('-journal') && !f.endsWith('-wal'));

            if (!dbFileName) {
                Alert.alert('Error', 'No se encontró el archivo de la caché de Firestore.');
                return;
            }

            const dbPath = `${dbDirPath}${dbFileName}`;

            // Copiamos la base de datos al CacheDirectory para poder compartirla de forma segura
            const dateStr = new Date().toISOString().split('T')[0];
            const exportFileName = `apuntao_backup_${dateStr}.sqlite`;
            const cacheDirectory = fs.cacheDirectory;
            const exportPath = `${cacheDirectory}${exportFileName}`;

            await FileSystem.copyAsync({
                from: dbPath,
                to: exportPath
            });

            // Compartir el archivo
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(exportPath, {
                    dialogTitle: 'Exportar Base de Datos Apuntao',
                    mimeType: 'application/x-sqlite3',
                });
            } else {
                Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo.');
            }

        } catch (error) {
            console.error('Error al exportar la BD:', error);
            Alert.alert('Error', 'Hubo un problema al exportar la base de datos.');
        }
    }, []);

    return (
        <View 
            style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}
        >
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
                    <ActionRow
                        icon="server-outline"
                        text="Exportar Base de Datos"
                        onPress={handleExportDatabase}
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
    scrollContainer: { 
        padding: 24, 
        paddingTop: 12, // El TabBar navigator ya maneja el padding si no hay header
        paddingBottom: 40, 
    },
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
