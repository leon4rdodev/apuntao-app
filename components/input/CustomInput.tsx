'use client';

/**
 * Componente reutilizable de input de búsqueda
 * @module components/inputs/CustomInput
 */

import { Colors } from '@/constants/Colors';
import React from 'react';
import { TextInput as RNTextInput, StyleSheet, TextInput, TextInputProps, useColorScheme } from 'react-native';

/**
 * Props para el componente CustomInput
 * @param value - Texto actual del input
 * @param onChangeText - Función que maneja el cambio de texto
 * @param placeholder - Texto del placeholder del input (opcional)
 * @param inputRef - Referencia al TextInput (opcional)
 */
interface CustomInputProps extends TextInputProps {
    onChangeText: (text: string) => void;
    placeholder?: string;
    inputRef?: React.RefObject<RNTextInput>;
}

export default function CustomInput({
    onChangeText,
    placeholder = 'Buscar cliente...',
    inputRef,
    ...rest
}: CustomInputProps) {
    const theme = Colors[useColorScheme() || 'light'];
    return (
        <TextInput
            ref={inputRef}
            style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground }]}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            onChangeText={onChangeText}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
        height: 48,
        paddingHorizontal: 18,
        borderRadius: 24,
        fontWeight: '500',
    },
});
