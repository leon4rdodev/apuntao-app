// Archivo: components/ui/SplashScreenUI.tsx

import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import CustomText from './CustomText';

const ANIMATION_DURATION = 1500;

/**
 * @description Componente visual para la pantalla de carga animada.
 */
export function SplashScreenUI() {
    const theme = Colors[useColorScheme() || 'light'];

    // --- Lógica de Animación ---
    const progress = useSharedValue(0);
    const iconTranslateY = useSharedValue(0);

    const progressBarAnimatedStyle = useAnimatedStyle(() => ({
        width: `${progress.value}%`,
    }));

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: iconTranslateY.value }],
    }));

    useEffect(() => {
        progress.value = withTiming(100, { duration: ANIMATION_DURATION });
        iconTranslateY.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Animated.View style={iconAnimatedStyle}>
                <FontAwesome5 name="store-alt" size={80} color={theme.primary} />
            </Animated.View>

            <CustomText size="xlarge" weight="bold" style={styles.loadingText}>
                Apunta'o
            </CustomText>
            <CustomText size="medium" color={theme.textSecondary}>
                Cargando tu negocio...
            </CustomText>

            <View style={[styles.progressBarContainer, { backgroundColor: theme.surface }]}>
                <Animated.View
                    style={[
                        styles.progressBar,
                        progressBarAnimatedStyle,
                        { backgroundColor: theme.primary },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 24,
        marginBottom: 8,
    },
    progressBarContainer: {
        height: 8,
        width: '80%',
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 24,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
});
