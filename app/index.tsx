import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Font from 'expo-font';

import { Colors } from '@/constants/Colors';

export default function SplashScreen() {
    const router = useRouter();
    const progress = useSharedValue(0);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        const prepare = async () => {
            // Pre-cargar íconos (y otras fuentes si lo necesitas)
            await Font.loadAsync({
                ...Ionicons.font,
                ...MaterialIcons.font,
                ...Entypo.font,
            });

            // Inicia la animación
            progress.value = withTiming(1, {
                duration: 5000,
                easing: Easing.out(Easing.cubic),
            });

            // Redirección una vez completada la animación
            setTimeout(() => {
                router.replace('/(auth)');
            }, 5000);
        };

        prepare();
    }, [progress, router]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
        backgroundColor: theme.primary,
    }));

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.quad),
        }),
        transform: [
            {
                scale: withTiming(1, {
                    duration: 1000,
                    easing: Easing.out(Easing.back(1.2)),
                }),
            },
        ],
    }));

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Animated.View style={[styles.content, containerAnimatedStyle]}>
                <Text style={[styles.text, { color: theme.text }]}>Cargando...</Text>
                <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
                    <Animated.View style={[styles.progressBar, animatedStyle]} />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
        fontWeight: '600',
    },
    progressBarBackground: {
        width: 250,
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
    },
});
