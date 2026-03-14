import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import CustomText from '../ui/CustomText';

/**
 * @component BackButton
 * @description Botón para navegar a la pantalla anterior. Reemplaza el header.
 */
const BackButton = () => {
    const router = useRouter();
    const theme = Colors[useColorScheme() || 'light'];

    return (
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.surface }]} >
            <Ionicons name="arrow-back-sharp" size={24} color={theme.text} />
            <CustomText size="medium" weight="medium" style={{ color: theme.text }}>
                Volver
            </CustomText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        // Ajusta la posición para estar debajo de la barra de estado
        top: Platform.OS === 'android' ? 44 : 54,
        left: 18,
        zIndex: 10,
        // Añade un padding para aumentar el área de toque
        paddingHorizontal: 20,
        justifyContent: 'center',
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // Espacio entre el icono y el texto
        borderRadius: 30,
        opacity: 0.99, // Añade un poco de opacidad para el efecto hover
    },
});

export default BackButton;
