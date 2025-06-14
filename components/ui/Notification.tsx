/**
 * Componente de notificación
 * Muestra notificaciones temporales con animaciones
 */

import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { ANIMATIONS } from '../../constants/';
import type { NotificationProps } from '../../types';

/**
 * Componente de notificación animada
 * @param message - Mensaje a mostrar
 * @param type - Tipo de notificación (success/error)
 * @param onClose - Función para cerrar la notificación
 */
const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    const [slideAnim] = useState(new Animated.Value(-100));
    const [fadeAnim] = useState(new Animated.Value(0));
    const theme = Colors[useColorScheme() || 'light'];

    /**
     * Maneja el cierre de la notificación con animación
     */
    const handleClose = useCallback(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: ANIMATIONS.NOTIFICATION_EXIT_DURATION,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: ANIMATIONS.NOTIFICATION_EXIT_DURATION,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    }, [slideAnim, fadeAnim, onClose]);

    /**
     * Obtiene el ícono según el tipo de notificación
     */
    const getIconName = (): keyof typeof Ionicons.glyphMap => {
        return type === 'success' ? 'checkmark-circle' : 'alert-circle';
    };

    /**
     * Obtiene el color de fondo según el tipo
     */
    const getBackgroundColor = (): string => {
        return type === 'success' ? theme.successLight : theme.errorLight;
    };

    // Animación de entrada y auto-cierre
    useEffect(() => {
        // Animación de entrada
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: ANIMATIONS.NOTIFICATION_ENTER_DURATION,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: ANIMATIONS.NOTIFICATION_ENTER_DURATION,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto-cerrar después del tiempo configurado
        const timer = setTimeout(() => {
            handleClose();
        }, ANIMATIONS.NOTIFICATION_AUTO_CLOSE);

        return () => clearTimeout(timer);
    }, [fadeAnim, handleClose, slideAnim]);

    return (
        <Animated.View
            style={[
                styles.notification,
                {
                    backgroundColor: getBackgroundColor(),
                    transform: [{ translateY: slideAnim }],
                    opacity: fadeAnim,
                },
            ]}
        >
            <Ionicons name={getIconName()} size={24} color={theme.error} style={styles.icon} />

            <Text
                style={[styles.message, { color: theme.text }]}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {message}
            </Text>

            <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    notification: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        zIndex: 1000,
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
    },
    icon: {
        marginRight: 12,
        flexShrink: 0,
    },
    message: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        lineHeight: 22,
        letterSpacing: 0.2,
    },
    closeButton: {
        marginLeft: 12,
        padding: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        flexShrink: 0,
    },
});

export default Notification;
