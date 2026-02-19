/**
 * @file app/(auth)/login.tsx
 * @description Pantalla de inicio de sesión para que los usuarios accedan a su cuenta.
 */
import CustomButton from '@/components/ui/CustomButton';
import CustomInput from '@/components/input/CustomInput';
import CustomText from '@/components/ui/CustomText';
import { API_URLS, ERROR_MESSAGES, STORAGE_KEYS } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/store/notificationStore';
import { useSessionStore } from '@/store/sessionStore';
import { AppSessionData } from '@/types';
import { formatPhoneNumber } from '@/utils/formatters';
import { apiFetch } from '@/services/apiService';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useClientStore } from '@/store/clientStore';

import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from 'react-native';

export default function LoginScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    const showNotification = useNotification();
    const setClients = useClientStore((state) => state.actions.setClients);
    const { syncAccountData } = useSessionStore();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Estado para recuperación de datos
    const [backupInfo, setBackupInfo] = useState<{ count: number; date: string } | null>(null);

    // Verificar si hay backup al montar
    React.useEffect(() => {
        const checkBackup = async () => {
             console.log('🔍 Buscando backup local...');
             // Solo mostrar si NO hay clientes activos en storage (evitar confusión)
             const currentClients = await getFromStorage<any[]>(STORAGE_KEYS.CLIENTS);
             if (currentClients && currentClients.length > 0) {
                 console.log('⚠️ Ya hay clientes activos, ocultando opción de backup.');
                 return;
             }

             const backup = await getFromStorage<any>('@clients_backup');
             console.log('📦 Resultado backup:', backup ? `Encontrado (${backup.clients?.length} clientes)` : 'NULL');
             
             if (backup && backup.clients && backup.clients.length > 0) {
                 setBackupInfo({
                     count: backup.clients.length,
                     date: new Date(backup.timestamp).toLocaleString(),
                 });
             } else {
                 console.log('❌ Backup vacío o inválido');
             }
        };
        checkBackup();
    }, []);

    const handleRestoreBackup = () => {
        if (!backupInfo) return;
        
        // Alerta nativa para confirmar
        // Nota: En Expo Web esto no funcionaría igual, pero es mobile-focused.
        // Usamos un confirm simple si no hay Alert.alert (web), pero React Native tiene Alert.
        const { Alert } = require('react-native');
        
        Alert.alert(
            'Restaurar Datos Locales',
            `Se encontraron ${backupInfo.count} clientes del ${backupInfo.date}.\n\n¿Quieres restaurarlos ahora? Esto sobrescribirá los datos locales actuales.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Restaurar',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            const backup = await getFromStorage<any>('@clients_backup');
                            if (backup) {
                                await saveToStorage(STORAGE_KEYS.CLIENTS, backup.clients);
                                await saveToStorage('@sync_queue', backup.queue || []);
                                
                                showNotification({
                                    message: '¡Datos restaurados! Ahora inicia sesión para sincronizar.',
                                    type: 'success',
                                });
                                // Ocultar botón tras restaurar
                                setBackupInfo(null);
                            }
                        } catch (e) {
                            showNotification({ message: 'Error al restaurar', type: 'error' });
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!phoneNumber || !pin || pin.length < 6) {
            showNotification({
                message: 'Por favor, completa todos los campos correctamente.',
                type: 'error',
            });
            return;
        }

        setIsLoading(true);

        try {
            const cleanedPhone = phoneNumber.replace(/-/g, '');

            // 1. Autenticar y obtener los tokens de sesión.
            const sessionData: AppSessionData = await apiFetch(
                API_URLS.LOGIN,
                {
                    method: 'POST',
                    body: JSON.stringify({ phoneNumber: cleanedPhone, pin }),
                },
                true
            );

            // 2. Guardar los tokens de sesión.
            await saveToStorage(STORAGE_KEYS.APP_SESSION, sessionData);

            // 3. Sincronizar los datos de la cuenta.
            // Esta función ahora actualiza el store de Zustand (`sessionStore`).
            const syncedData = await syncAccountData();

            // 4. Poblar el ClientContext con los clientes recibidos.
            if (syncedData?.clients) {
                setClients(syncedData.clients);
            }

            // 5. NO es necesario navegar. El hook `useProtectedRoute` detectará
            //    el cambio en la sesión y redirigirá automáticamente.
        } catch (error: any) {
            showNotification({
                message: error.message || ERROR_MESSAGES.GENERIC_ERROR,
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.header}>
                            <Ionicons name="key-outline" size={60} color={theme.primary} />
                            <CustomText size="xlarge" weight="bold" style={styles.title}>
                                ¡Qué bueno verte!
                            </CustomText>
                            <CustomText color={theme.textSecondary} style={styles.subtitle}>
                                Ingresa tus datos para acceder a tu negocio.
                            </CustomText>
                        </View>

                        <View style={styles.form}>
                            <CustomInput
                                icon="call-outline"
                                placeholder="Número de Teléfono"
                                value={phoneNumber}
                                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                                keyboardType="phone-pad"
                                maxLength={12}
                                editable={!isLoading}
                            />
                            <CustomInput
                                icon="lock-closed-outline"
                                placeholder="PIN de 6 dígitos"
                                value={pin}
                                onChangeText={setPin}
                                keyboardType="number-pad"
                                secureTextEntry
                                maxLength={6}
                                editable={!isLoading}
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                            />
                        </View>

                        <View style={styles.footer}>
                            <CustomButton
                                title={isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                                onPress={handleLogin}
                                isLoading={isLoading}
                                disabled={isLoading}
                                iconName="log-in-outline"
                            />
                            
                            {/* 🔥 BOTÓN DE RECUPERACIÓN DE DATOS (SOLO SI HAY BACKUP) */}
                            {backupInfo && (
                                <CustomButton
                                    title={`Recuperar Datos (${backupInfo.count} clientes)`}
                                    onPress={handleRestoreBackup}
                                    iconName="cloud-upload-outline"
                                    buttonStyle={{ backgroundColor: theme.warning, marginTop: 16 }}
                                    textStyle={{ color: '#000' }}
                                />
                            )}
                            
                            <CustomButton
                                title="No tengo cuenta, quiero registrarme"
                                onPress={() => router.replace('/(auth)/register')}
                                disabled={isLoading}
                                buttonStyle={{ backgroundColor: 'transparent', marginTop: 16 }}
                                textStyle={{ color: theme.primary }}
                            />

                            {/* 🔥 Botón de Exportar Backups (Siempre visible) */}
                            <View style={{ padding: 10, alignItems: 'center' }}>
                                <CustomButton
                                    title="Exportar Backups Locales"
                                    onPress={async () => {
                                        try {
                                            const { BackupService } = require('@/services/BackupService');
                                            await BackupService.exportBackups();
                                        } catch (error) {
                                            // Ignore
                                        }
                                    }}
                                    iconName="download-outline"
                                    buttonStyle={{ backgroundColor: 'transparent', marginTop: 8 }}
                                    textStyle={{ color: theme.textSecondary, fontSize: 12 }}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { marginTop: 16, marginBottom: 8 },
    subtitle: { textAlign: 'center' },
    form: { gap: 16, marginBottom: 30 },
    footer: { marginTop: 20 },
});
