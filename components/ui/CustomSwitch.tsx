import React, { useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { 
    useAnimatedStyle, 
    interpolateColor, 
    withTiming, 
    useSharedValue, 
    interpolate
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CustomSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    activeColor?: string;
    inactiveColor?: string;
}

const CustomSwitch = ({ 
    value, 
    onValueChange, 
    activeColor, 
    inactiveColor 
}: CustomSwitchProps) => {
    const theme = Colors[useColorScheme() || 'light'];
    const progress = useSharedValue(value ? 1 : 0);

    const colors = useMemo(() => ({
        active: activeColor || theme.primary,
        inactive: inactiveColor || theme.borderSubtle,
        thumb: '#FFFFFF',
    }), [theme, activeColor, inactiveColor]);

    useEffect(() => {
        progress.value = withTiming(value ? 1 : 0, { duration: 200 });
    }, [value]);

    const trackAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            [colors.inactive, colors.active]
        );
        return { backgroundColor };
    });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            progress.value,
            [0, 1],
            [2, 22] // Inactive: 2, Active: 22 (44track - 20thumb - 2offset)
        );

        return {
            transform: [{ translateX }],
        };
    });

    return (
        <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => onValueChange(!value)}
        >
            <Animated.View style={[styles.track, trackAnimatedStyle]}>
                <Animated.View style={[styles.thumb, { backgroundColor: colors.thumb }, thumbAnimatedStyle]} />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    track: {
        width: 44,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
    },
    thumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
});

export default CustomSwitch;
