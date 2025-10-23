import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

interface AmountInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
    value,
    onChangeText,
    placeholder = '0',
    ...rest
}) => {
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
                style={[styles.input, { color: theme.primary }]}
                value={displayValue}
                onChangeText={handleChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.primary}
                keyboardType="decimal-pad"
                autoFocus
                caretHidden={true}
                {...rest}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    input: {
        fontSize: 48,
        fontWeight: '700',
        backgroundColor: 'transparent',
        minWidth: 120,
        padding: 0,
        margin: 0,
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
});
