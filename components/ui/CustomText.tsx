import { Colors } from '@/constants/Colors';
import React from 'react';
import { Text, TextProps, TextStyle, useColorScheme } from 'react-native';

// 1. Añadimos 'xxlarge' al tipo para que sea una opción válida.
type TextSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
type TextWeight = 'regular' | 'medium' | 'bold';

type CustomTextProps = TextProps & {
    size?: TextSize;
    weight?: TextWeight;
    color?: string; // sobreescribe color de tema
    style?: TextStyle | TextStyle[];
};

// 2. Mapeamos el nuevo tamaño 'xxlarge' a un valor numérico.
const sizeMap: Record<TextSize, number> = {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 26,
    xxlarge: 32, // <-- Añadido
};

const weightMap: Record<TextWeight, TextStyle['fontWeight']> = {
    regular: '400',
    medium: '600',
    bold: '700',
};

export default function CustomText({
    size = 'medium',
    weight = 'regular',
    color, // La prop de color se manejará más abajo
    style,
    children,
    ...rest
}: CustomTextProps) {
    // 3. Eliminamos 'xxlarge' de aquí, no es una prop.
    const theme = Colors[useColorScheme() || 'light'];

    // Creamos el estilo base
    const textStyle: TextStyle = {
        fontSize: sizeMap[size],
        fontWeight: weightMap[weight],
        // Usamos el color de la prop si existe, si no, el del tema.
        color: color || theme.text,
    };

    return (
        <Text
            style={[textStyle, style]} // Combinamos el estilo base con los estilos adicionales
            {...rest}
        >
            {children}
        </Text>
    );
}
