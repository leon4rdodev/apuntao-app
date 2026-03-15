// components/ui/GlobalNotification.tsx
import { Colors } from '@/constants/Colors';
import { useNotificationStore } from '@/store/notificationStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
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
                    iconColor: theme.success,
                    borderColor: theme.success + '30',
                };
            case 'error':
                return {
                    icon: 'alert-circle' as const,
                    iconColor: theme.error,
                    borderColor: theme.error + '30',
                };
            default: // info
                return {
                    icon: 'information-circle' as const,
                    iconColor: theme.primary,
                    borderColor: theme.borderSubtle,
                };
        }
    };

    const { icon, iconColor, borderColor } = getNotificationStyle();

    // No renderizamos el contenedor si el mensaje está vacío para evitar flashes
    if (!message) return null;

    return (
        <Animated.View
            pointerEvents={isVisible ? 'auto' : 'none'}
            style={[
                styles.notification, 
                { 
                    backgroundColor: theme.surface,
                    borderColor: borderColor,
                }, 
                animatedStyle
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <Text
                style={[styles.message, { color: theme.text }]}
                numberOfLines={2}
            >
                {message}
            </Text>
            <TouchableOpacity 
                onPress={hide} 
                style={styles.closeButton}
                activeOpacity={0.6}
            >
                <Ionicons name="close" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    notification: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 100, // Forma de píldora
        borderWidth: 1,
        // Sombra premium coherente con ClientCard
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        marginRight: 12,
    },
    message: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        letterSpacing: -0.2,
    },
    closeButton: {
        marginLeft: 8,
        padding: 4,
    },
});
