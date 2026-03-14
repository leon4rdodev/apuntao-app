'use client';

/**
 * Componente de input reutilizable y altamente personalizable para la aplicación.
 * Puede ser usado como un simple campo de texto, un input de búsqueda, o un
 * campo de formulario con íconos y prefijos.
 * @module components/input/CustomInput
 */

import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    TextInputProps,
    View,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

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
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        if (rest.onFocus) rest.onFocus(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        if (rest.onBlur) rest.onBlur(e);
    };

    return (
        <View
            style={[
                styles.container,
                { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: isFocused ? theme.primary : theme.borderSubtle,
                },
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
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...rest}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 100, // Look tipo píldora moderno
        borderWidth: 1.5, // Borde constante para evitar saltos de layout
        height: 50, // Altura estándar más limpia
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
        fontSize: 16,
        fontWeight: '500',
        paddingVertical: 0,
        letterSpacing: 0.1,
    },
});
