'use client';

/**
 * Componente de input reutilizable y altamente personalizable para la aplicación.
 * Puede ser usado como un simple campo de texto, un input de búsqueda, o un
 * campo de formulario con íconos y prefijos.
 * @module components/input/CustomInput
 */

import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    TextInputProps,
    useColorScheme,
    View,
} from 'react-native';

/**
 * Props para el componente CustomInput, extendiendo las de TextInput.
 */
interface CustomInputProps extends TextInputProps {
    // No se necesita onChangeText aquí, ya que viene de TextInputProps

    /** Un ícono de Ionicons para mostrar a la izquierda del input. */
    icon?: keyof typeof Ionicons.glyphMap;

    /** Un texto de prefijo (ej. '$') para mostrar antes del texto del input. */
    prefix?: string;

    /** Referencia al componente TextInput subyacente. */
    inputRef?: React.RefObject<RNTextInput>;

    /** Estilo para el contenedor principal del input. */
    containerStyle?: View['props']['style'];
}

export default function CustomInput({
    icon,
    prefix,
    inputRef,
    style, // Extraemos el 'style' de las props para aplicarlo al TextInput
    containerStyle,
    ...rest
}: CustomInputProps) {
    const theme = Colors[useColorScheme() || 'light'];

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
                containerStyle, // Estilo del contenedor principal
            ]}
        >
            {/* Renderiza el ícono si se proporciona */}
            {icon && (
                <Ionicons name={icon} size={20} color={theme.textSecondary} style={styles.icon} />
            )}

            {/* Renderiza el prefijo si se proporciona */}
            {prefix && (
                <Text style={[styles.prefix, { color: theme.textSecondary }]}>{prefix}</Text>
            )}

            {/* El componente de TextInput real */}
            <RNTextInput
                ref={inputRef}
                style={[styles.input, { color: theme.text }, style]} // Combina estilos base y personalizados
                placeholderTextColor={theme.textSecondary}
                {...rest}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16, // Bordes más elegantes
        borderWidth: 1.5,
        height: 56, // Más alto para mobile-flow superior
        paddingHorizontal: 16,
        width: '100%',
    },
    icon: {
        marginRight: 10,
    },
    prefix: {
        fontSize: 16,
        fontWeight: '700',
        marginRight: 6,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 17,
        fontWeight: '500',
        paddingVertical: 0,
        letterSpacing: 0.2, // Mejor legibilidad
    },
});
