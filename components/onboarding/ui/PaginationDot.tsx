import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface Props {
    index: number;
    activeIndex: number;
    theme: any;
}

export default function PaginationDot({ index, activeIndex, theme }: Props) {
    const animatedStyle = useAnimatedStyle(() => {
        const isActive = index === activeIndex;
        return {
            transform: [{ scale: withTiming(isActive ? 1.3 : 1, { duration: 200 }) }],
            backgroundColor: withTiming(isActive ? theme.primary : theme.border, { duration: 200 }),
        };
    }, [activeIndex]);

    return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
});
