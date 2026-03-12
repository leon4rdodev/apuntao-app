// components/ui/GlobalNotification.tsx
import { Colors } from '@/constants/Colors';
import { useNotificationStore } from '@/store/notificationStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
// Usaremos Reanimated para animaciones más fluidas
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';

export function GlobalNotification() {
    const theme = Colors[useColorScheme() || 'light'];

    // 1. Obtenemos el estado y las acciones del store
    const { isVisible, message, type, hide } = useNotificationStore();

    // 2. Usamos `useSharedValue` para las animaciones
    const translateY = useSharedValue(-24);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isVisible) {
            opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
            translateY.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
        } else {
            opacity.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.cubic) });
            translateY.value = withTiming(-24, { duration: 200, easing: Easing.in(Easing.cubic) });
        }
    }, [isVisible, translateY, opacity]);

    // Estilo animado
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    // Determina el estilo basado en el tipo de notificación
    const getNotificationStyle = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'checkmark-circle' as const,
                    backgroundColor: theme.successLight,
                    iconColor: theme.success,
                };
            case 'error':
                return {
                    icon: 'alert-circle' as const,
                    backgroundColor: theme.errorLight,
                    iconColor: theme.error,
                };
            default: // info
                return {
                    icon: 'information-circle' as const,
                    backgroundColor: theme.surface, // Un color neutro para 'info'
                    iconColor: theme.info,
                };
        }
    };

    const { icon, backgroundColor, iconColor } = getNotificationStyle();

    // No renderizamos el contenedor si el mensaje está vacío para evitar flashes
    if (!message) return null;

    return (
        <Animated.View
            pointerEvents={isVisible ? 'auto' : 'none'}
            style={[styles.notification, { backgroundColor }, animatedStyle]}
        >
            <Ionicons name={icon} size={24} color={iconColor} style={styles.icon} />
            <Text
                style={[styles.message, { color: theme.text }]}
                numberOfLines={3}
                ellipsizeMode="tail"
            >
                {message}
            </Text>
            <TouchableOpacity onPress={hide} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
        </Animated.View>
    );
}

// Se mantienen los mismos estilos, pero ahora aplicados al componente global
const styles = StyleSheet.create({
    notification: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        zIndex: 9999, // Aseguramos que esté por encima de todo
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        minHeight: 60,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
    },
    icon: {
        marginRight: 12,
    },
    message: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    closeButton: {
        marginLeft: 12,
        padding: 4,
    },
});
