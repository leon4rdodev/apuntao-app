import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
// 1. Imports necesarios para la animación y el icono
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons'; // Para el icono de cuaderno y lápiz
import { useSessionStore } from '@/store/sessionStore';
import { useClientContext } from '@/context/ClientContext';
import { STORAGE_KEYS } from '@/constants';
import { getFromStorage } from '@/utils/storage';
import { AppSessionData } from '@/types';
import { Colors } from '@/constants/Colors';

// --- Constantes de Diseño y Animación ---
const ANIMATION_DURATION = 3000; // Duración en milisegundos de la barra de carga.

export default function Index() {
    const router = useRouter();
    const { syncAccountData } = useSessionStore();
    const { setClients } = useClientContext();
    const theme = Colors[useColorScheme() || 'light'];

    // 2. Configuración de los valores para las animaciones
    const progress = useSharedValue(0); // Para la barra de progreso (0% a 100%)
    const iconTranslateY = useSharedValue(0); // Para el movimiento vertical del icono

    // Estilo animado para la barra de progreso (cambia el ancho)
    const progressBarAnimatedStyle = useAnimatedStyle(() => {
        return {
            width: `${progress.value}%`,
        };
    });

    // Estilo animado para el icono (lo hace flotar)
    const iconAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: iconTranslateY.value }],
        };
    });

    useEffect(() => {
        // 3. Iniciar las animaciones cuando el componente se monta
        
        // Animación de la barra de progreso: va de 0 a 100 en ANIMATION_DURATION
        progress.value = withTiming(100, { duration: ANIMATION_DURATION });

        // Animación del icono: se mueve arriba y abajo repetidamente
        iconTranslateY.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
            ),
            -1, // Repetir infinitamente
            true // Ir de ida y vuelta
        );

        // Tu lógica original de verificación de sesión
        const checkSessionAndSync = async () => {
            try {
                const session = await getFromStorage<AppSessionData>(STORAGE_KEYS.APP_SESSION);
                
                if (session?.accessToken) {
                    console.log('Sesión encontrada, sincronizando datos...');
                    const syncedData = await syncAccountData();
                    if (syncedData?.clients) {
                        setClients(syncedData.clients);
                        router.replace('/(app)/(tabs)');
                    } else {
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

        // Ejecutamos la lógica de negocio después de que la animación de carga haya comenzado.
        // Esto asegura que el usuario siempre vea la animación, incluso si la verificación es muy rápida.
        const timer = setTimeout(checkSessionAndSync, ANIMATION_DURATION - 500);

        // Limpieza al desmontar el componente
        return () => clearTimeout(timer);

    }, []);

    // 4. Renderizar la pantalla de carga animada
    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <Animated.View style={[iconAnimatedStyle]}>
                {/* El icono `file-signature` es perfecto para "cuaderno con lápiz" */}
                <FontAwesome5 name="store-alt" size={80} color={theme.primary} />
            </Animated.View>

            <Text style={[styles.loadingText, {color: theme.text}]}>Cargando tu negocio...</Text>

            <View style={[styles.progressBarContainer, {backgroundColor: theme.surface}]}>
                <Animated.View style={[styles.progressBar, progressBarAnimatedStyle, {backgroundColor: theme.primary}]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 16,
    },
    progressBarContainer: {
        height: 8,
        width: '80%',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
});