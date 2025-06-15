/**
 * @file components/ui/CustomButton.tsx
 * @description Componente de botón principal de la aplicación.
 * Diseñado para ser visualmente prominente, con un manejo claro del estado de carga.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
    useColorScheme,
    type GestureResponderEvent,
} from 'react-native';
import { Colors } from '@/constants/Colors';

type CustomButtonProps = {
    /** El texto principal a mostrar en el botón. */
    title: string;
    /** Función a ejecutar cuando se presiona el botón. */
    onPress: (event: GestureResponderEvent) => void;
    /** Estilos personalizados para el contenedor del botón. */
    buttonStyle?: ViewStyle | ViewStyle[];
    /** Estilos personalizados para el texto del botón. */
    textStyle?: TextStyle | TextStyle[];
    /** Nombre del ícono de Ionicons (opcional). */
    iconName?: keyof typeof Ionicons.glyphMap;
    /** Si el botón está en estado de carga. Muestra un spinner y se deshabilita. */
    isLoading?: boolean;
    /** Si el botón está deshabilitado por una razón externa (además de isLoading). */
    disabled?: boolean;
};

export default function CustomButton({
    title,
    onPress,
    buttonStyle,
    textStyle,
    iconName,
    isLoading = false,
    disabled = false,
}: CustomButtonProps) {
    const theme = Colors[useColorScheme() || 'light'];

    // El botón está deshabilitado si la prop 'disabled' es true O si está cargando.
    const isActuallyDisabled = disabled || isLoading;

    // Estilos por defecto para el botón principal.
    const defaultButtonStyle: ViewStyle = {
        backgroundColor: isActuallyDisabled ? theme.border : theme.primary,
        ...styles.button,
    };

    const defaultTextStyle: TextStyle = {
        color: isActuallyDisabled ? theme.textSecondary : theme.textOnPrimary,
        ...styles.text,
    };

    return (
        <TouchableOpacity
            style={[defaultButtonStyle, buttonStyle]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={isActuallyDisabled}
        >
            {isLoading ? (
                // ✅ ESTADO DE CARGA: Muestra solo el spinner.
                <ActivityIndicator size="small" color={theme.textOnPrimary} />
            ) : (
                // ✅ ESTADO NORMAL: Muestra el ícono y el texto.
                <View style={styles.content}>
                    {iconName && (
                        <Ionicons
                            name={iconName}
                            size={22}
                            color={(Array.isArray(textStyle) ? textStyle[0]?.color : textStyle?.color) || defaultTextStyle.color}
                        />
                    )}
                    <Text style={[defaultTextStyle, textStyle]}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    text: {
        fontSize: 17,
        fontWeight: '600',
    },
    disabled: {
        // El color ya se maneja en la lógica de 'defaultButtonStyle'
        // pero mantenemos la opacidad para un efecto extra.
        opacity: 0.8,
    },
});
