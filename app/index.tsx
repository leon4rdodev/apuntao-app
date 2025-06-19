import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSessionStore } from '@/store/sessionStore';
import { useClientContext } from '@/context/ClientContext';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage } from '@/utils/storage';

export default function Index() {
    const router = useRouter();
    const { syncAccountData } = useSessionStore();
    const { setClients } = useClientContext();

    useEffect(() => {
        const checkSessionAndSync = async () => {
            try {
                // Verificamos si existe un token de sesión
                const session = await getFromStorage(STORAGE_KEYS.APP_SESSION);

                if (session?.accessToken) {
                    console.log('Sesión encontrada, sincronizando datos...');
                    // Si hay sesión, intentamos sincronizar todos los datos
                    const syncedData = await syncAccountData();

                    if (syncedData?.clients) {
                        setClients(syncedData.clients);
                        router.replace('/(app)/(tabs)');
                    } else {
                        // Si la sincronización falla (ej. token inválido), irá a login por el manejador de errores
                        console.log('Sincronización fallida, redirigiendo a login...');
                        router.replace('/(auth)/login');
                    }
                } else {
                    console.log('No hay sesión, redirigiendo a onboarding...');
                    router.replace('/(auth)/onboarding');
                }
            } catch (error) {
                console.error('Error al verificar la sesión:', error);
                router.replace('/(auth)/login');
            }
        };

        checkSessionAndSync();
    }, []); // Se ejecuta solo una vez

    // Muestra un indicador de carga mientras se verifica la sesión
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#16a34a" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});