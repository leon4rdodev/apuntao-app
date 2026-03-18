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
        <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: theme.surface }]} 
        >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
            <CustomText size="medium" weight="medium" style={{ color: theme.text }}>
                Volver
            </CustomText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 44 : 54,
        left: 18,
        zIndex: 10,
        paddingLeft: 12,
        paddingRight: 24,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 30,
        opacity: 0.99,
        elevation: 1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
    },
});

export default BackButton;
