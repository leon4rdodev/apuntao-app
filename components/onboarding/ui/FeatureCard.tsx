import { Colors } from '@/constants/Colors';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

export interface Feature {
    icon: string;
    iconLib: typeof Ionicons | typeof MaterialIcons | typeof Entypo;
    text: string;
}

interface FeatureCardProps {
    feature: Feature;
}

/**
 * Componente que muestra una tarjeta con un ícono y un texto descriptivo,
 * representando una característica o funcionalidad.
 *
 * @component
 * @param {FeatureCardProps} props - Props que contiene la información de la característica.
 */
export default function FeatureCard({ feature }: FeatureCardProps) {
    const FeatureIcon = feature.iconLib;
    const theme = Colors[useColorScheme() || 'light'];

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                },
            ]}
        >
            <View
                style={[
                    styles.iconContainer,
                    {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                    },
                ]}
            >
                <FeatureIcon name={feature.icon as any} size={24} color={theme.primary} />
            </View>
            <Text style={[styles.featureText, { color: theme.text }]}>{feature.text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
    },
    featureText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
});
