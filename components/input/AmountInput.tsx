import React, { forwardRef, useCallback } from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

/**
 * Formatea un número puro (sin comas) a string con separadores de miles.
 * Eg: "1500.5" -> "1,500.5"
 */
function formatRawToDisplay(raw: string): string {
    if (!raw) return '';
    const [intPart, decPart] = raw.split('.');
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
}

/**
 * Limpia un string ingresado desde el teclado a un "raw" numérico puro.
 * Eg: "1,500.50" -> "1500.50"
 */
function cleanToRaw(text: string): string {
    // Quitar todo excepto dígitos y punto
    let clean = text.replace(/[^\d.]/g, '');

    // Solo un punto decimal permitido
    const firstDot = clean.indexOf('.');
    if (firstDot !== -1) {
        clean = clean.slice(0, firstDot + 1) + clean.slice(firstDot + 1).replace(/\./g, '');
    }

    // Máximo 2 decimales
    if (clean.includes('.')) {
        const [int, dec] = clean.split('.');
        clean = `${int}.${dec.slice(0, 2)}`;
    }

    return clean;
}

interface AmountInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
    /** Valor "raw" sin comas (e.g. "1500.50"). El padre debe guardar este valor sin formatear. */
    value: string;
    /** Devuelve el valor raw limpio sin comas para que el padre lo guarde directamente. */
    onChangeText: (rawValue: string) => void;
    placeholder?: string;
}

/**
 * @component AmountInput
 * @description Input especializado para montos monetarios.
 * El padre guarda el valor RAW (sin comas), este componente formatea para display.
 * Esto elimina el parpadeo por reformateo en cada tecla.
 */
export const AmountInput = forwardRef<TextInput, AmountInputProps>((
    { value, onChangeText, placeholder = '0', ...rest },
    ref
) => {
    const theme = Colors[useColorScheme() || 'light'];

    // Formateamos para display SOLO al renderizar, nunca en el estado del padre
    const displayValue = formatRawToDisplay(value);

    const handleChangeText = useCallback((text: string) => {
        const raw = cleanToRaw(text);
        onChangeText(raw);
    }, [onChangeText]);

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
                autoFocus={false}
                caretHidden={true}
                {...rest}
            />
        </View>
    );
});

AmountInput.displayName = 'AmountInput';

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
