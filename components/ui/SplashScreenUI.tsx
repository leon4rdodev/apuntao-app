// Archivo: app/components/SplashScreenUI.tsx

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

interface SplashScreenUIProps {
    progress: Animated.SharedValue<number>;
}

export function SplashScreenUI({ progress }: SplashScreenUIProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Ionicons name="book-outline" size={60} color={theme.primary} />
            <Text style={[styles.text, { color: theme.text }]}>Apunta&apos;o</Text>
            <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
                <Animated.View
                    style={[styles.progressBar, { backgroundColor: theme.primary }, animatedStyle]}
                />
            </View>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Cargando tu negocio...
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    text: {
        fontSize: 32,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    progressBarBackground: {
        width: 200,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
});
