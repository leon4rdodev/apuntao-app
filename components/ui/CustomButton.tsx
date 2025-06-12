import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

type CustomButtonProps = {
    title: string;
    onPress: () => void;
    iconName?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    buttonStyle?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
    iconSize?: number;
    iconColor?: string;
    activeOpacity?: number;
    disabled?: boolean;
};

export default function CustomButton({
    title,
    onPress,
    iconName,
    iconPosition = 'left',
    buttonStyle,
    textStyle,
    iconSize = 20,
    iconColor = '#fff',
    activeOpacity = 0.8,
    disabled = false,
}: CustomButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.button, buttonStyle]}
            onPress={onPress}
            activeOpacity={activeOpacity}
            disabled={disabled}
        >
            <View style={[styles.content, iconPosition === 'right' && styles.rowReverse]}>
                {iconName && iconPosition === 'left' && (
                    <Ionicons
                        name={iconName}
                        size={iconSize}
                        color={iconColor}
                        style={styles.icon}
                    />
                )}
                <Text style={[styles.text, textStyle]}>{title}</Text>
                {iconName && iconPosition === 'right' && (
                    <Ionicons
                        name={iconName}
                        size={iconSize}
                        color={iconColor}
                        style={styles.icon}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    rowReverse: {
        flexDirection: 'row-reverse',
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
    icon: {},
});
