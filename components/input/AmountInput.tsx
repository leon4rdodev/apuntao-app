import React, { forwardRef } from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface AmountInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

/**
 * @component AmountInput
 * @description Input especializado para montos monetarios, ahora con soporte para Refs.
 */
export const AmountInput = forwardRef<TextInput, AmountInputProps>(({
    value,
    onChangeText,
    placeholder = '0',
    ...rest
}, ref) => {
    const theme = Colors[useColorScheme() || 'light'];
    // Muestra "0" solo si value está vacío
    const displayValue = `${value || ''}`;

    const handleChangeText = (text: string) => {
        // Limpia el texto de cualquier caracter que no sea número o punto
        const cleanText = text.replace(/[^0-9.]/g, '');

        // Si el texto limpio es solo "0" o está vacío, envía cadena vacía
        if (cleanText === '0' || cleanText === '') {
            onChangeText('');
        } else {
            onChangeText(cleanText);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                ref={ref}
                style={[styles.input, { color: theme.text }]}
                value={displayValue}
                onChangeText={handleChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                autoFocus={false} // Desactivamos el autoFocus nativo para controlarlo manualmente con delay
                caretHidden={true}
                {...rest}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: 'transparent',
        borderRadius: 20,
        marginBottom: 8,
    },
    input: {
        fontSize: 56,
        fontWeight: '700',
        backgroundColor: 'transparent',
        minWidth: 120,
        padding: 0,
        margin: 0,
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
        letterSpacing: -1,
    },
});
