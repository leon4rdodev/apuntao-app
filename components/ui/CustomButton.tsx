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
    StyleProp,
} from 'react-native';
import { Colors } from '@/constants/Colors';

type CustomButtonProps = {
    /** El texto principal a mostrar en el botón. */
    title: string;
    /** Función a ejecutar cuando se presiona el botón. */
    onPress: (event: GestureResponderEvent) => void;
    /** Estilos personalizados para el contenedor del botón. */
    buttonStyle?: StyleProp<ViewStyle>;
    /** Estilos personalizados para el texto del botón. */
    textStyle?: StyleProp<TextStyle>;
    /** Nombre del ícono de Ionicons (opcional). */
    iconName?: keyof typeof Ionicons.glyphMap;
    /** Si el botón está en estado de carga. Muestra un spinner y se deshabilita. */
    isLoading?: boolean;
    /** Si el botón está deshabilitado por una razón externa (además de isLoading). */
    disabled?: boolean;
    // ✅ CORRECCIÓN: Añadimos las props que faltaban para resolver los errores de TypeScript.
    /** Controla la opacidad del botón cuando se presiona. */
    activeOpacity?: number;
    /** Permite sobreescribir el color del ícono. Si no se provee, usa el color del texto. */
    iconColor?: string;
    /** Permite sobreescribir el color del spinner de carga. */
    spinnerColor?: string;
    /** Permite sobreescribir el tamaño del ícono. */
    iconSize?: number;
};

export default function CustomButton({
    title,
    onPress,
    buttonStyle,
    textStyle,
    iconName,
    isLoading = false,
    disabled = false,
    // ✅ CORRECCIÓN: Recibimos las nuevas props.
    activeOpacity = 0.8, // Valor por defecto de TouchableOpacity.
    iconColor,
    spinnerColor,
    iconSize,
}: CustomButtonProps) {
    const theme = Colors[useColorScheme() || 'light'];
    const isActuallyDisabled = disabled || isLoading;

    const defaultButtonStyle: ViewStyle = {
        backgroundColor: isActuallyDisabled ? theme.buttonDisabled : theme.primary,
        ...styles.button,
    };

    const defaultTextStyle: TextStyle = {
        color: isActuallyDisabled ? theme.buttonTextDisabled : theme.textOnPrimary,
        ...styles.text,
    };

    // ✅ CORRECCIÓN: El color del ícono ahora es más inteligente.
    // Prioridad: 1. `iconColor` prop, 2. `textStyle` color, 3. `defaultTextStyle` color.
    const flatTextStyle = StyleSheet.flatten(textStyle);
    const finalIconColor =
        iconColor ||
        flatTextStyle?.color ||
        defaultTextStyle.color;

    return (
        <TouchableOpacity
            style={[
                defaultButtonStyle, 
                buttonStyle,
            ]}
            onPress={onPress}
            // ✅ CORRECCIÓN: Usamos la prop activeOpacity.
            activeOpacity={activeOpacity}
            disabled={isActuallyDisabled}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color={spinnerColor || theme.textOnPrimary} />
            ) : (
                <View style={styles.content}>
                    {iconName && (
                        <Ionicons
                            name={iconName}
                            size={iconSize || 22}
                            // ✅ CORRECCIÓN: Usamos el color final calculado.
                            color={finalIconColor as string}
                        />
                    )}
                    <Text 
                        style={[defaultTextStyle, textStyle]} 
                        numberOfLines={1} 
                        adjustsFontSizeToFit
                    >
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        minHeight: 52,
        borderRadius: 100, // Forma de píldora para coincidir con los inputs
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    text: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    disabled: {
        opacity: 1,
    },
});
