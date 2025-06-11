import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';

// --- INTERFACES y TIPOS ---
// Exportamos la interfaz 'Feature' para que otros componentes (como la pantalla de Onboarding)
// sepan qué forma deben tener los datos que le pasan a esta tarjeta.
export interface Feature {
    icon: string;
    iconLib: typeof Ionicons | typeof MaterialIcons | typeof Entypo;
    text: string;
}

// Definimos las props que el componente FeatureCard necesita recibir.
interface FeatureCardProps {
    feature: Feature;
    theme: {
        surface: string;
        background: string;
        border: string;
        primary: string;
        text: string;
    };
}

// --- COMPONENTE ---
const FeatureCard: React.FC<FeatureCardProps> = ({ feature, theme }) => {
    const FeatureIcon = feature.iconLib;

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
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                    },
                ]}
            >
                <FeatureIcon name={feature.icon as any} size={24} color={theme.primary} />
            </View>
            <Text style={[styles.featureText, { color: theme.text }]}>{feature.text}</Text>
        </View>
    );
};

// --- ESTILOS ---
// Estos estilos son específicos y encapsulados para este componente.
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

export default FeatureCard;
