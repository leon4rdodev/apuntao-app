import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { existsInStorage } from '@/utils/storage'; // Asumo que esta función devuelve Promise<boolean>
import { STORAGE_KEYS } from '@/constants';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        // 1. Define una función 'async' dentro del useEffect.
        const verificarSesion = async () => {
            console.log('Verificando sesión...');

            try {
                // 2. USA 'await' para esperar el resultado booleano de la promesa.
                //    Ahora 'yaHizoLogin' contendrá 'true' o 'false', no una promesa.
                const yaHizoLogin = await existsInStorage(STORAGE_KEYS.APP_SESSION);

                console.log(`Resultado de la verificación: ${yaHizoLogin}`);

                // 3. Ahora tu lógica 'if/else' funcionará como esperas.
                if (yaHizoLogin) {
                    console.log('Sesión encontrada, redirigiendo a /home...');
                    router.replace('/(app)/(tabs)'); // O la ruta principal de tu app
                } else {
                    console.log('No hay sesión, redirigiendo a /auth...');
                    router.replace('/(auth)/onboarding'); // O la pantalla de login
                }
            } catch (error) {
                console.error('Error al verificar la sesión:', error);
                // En caso de error, probablemente quieras ir al login.
                router.replace('/(auth)/login');
            }
        };

        // 4. Llama a la función asíncrona.
        verificarSesion();
    }, []); // <-- Array vacío para que solo se ejecute una vez al montar el componente.

    // Es una buena práctica mostrar algo mientras se verifica la sesión.
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#0000ff" />
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
