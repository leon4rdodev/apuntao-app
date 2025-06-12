import { Colors } from '@/constants/Colors';
// Se asume que el tipo `Feature` (importado de aquí) se actualizará para
// incluir un campo opcional 'description' de tipo string.
import { Feature } from '@/constants/FeatureItems';
import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

interface FeatureItemProps {
    // Objeto de la característica, que ahora puede incluir una descripción opcional.
    feature: Feature;
}

/**
 * Componente que muestra un item con un ícono y un texto descriptivo,
 * representando una característica o funcionalidad. Ahora también puede mostrar
 * una descripción adicional debajo del texto principal.
 *
 * @component
 * @param {FeatureItemProps} props - Props que contiene la información de la característica.
 */
export default function FeatureItem({ feature }: FeatureItemProps) {
    const FeatureIcon = feature.iconLib;
    const theme = Colors[useColorScheme() || 'light'];

    return (
        <View style={[styles.item]}>
            <View
                style={[
                    styles.iconContainer,
                    {
                        borderColor: theme.border,
                    },
                ]}
            >
                <FeatureIcon name={feature.icon as any} size={30} color={theme.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                    {feature.text}
                </Text>
                {/* Renderiza la descripción si existe */}
                {feature.description && (
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                        {feature.description}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    featureText: {
        fontSize: 16,
        fontWeight: '500',
    },
    featureDescription: {
        fontSize: 14,
        marginTop: 4,
    },
});
