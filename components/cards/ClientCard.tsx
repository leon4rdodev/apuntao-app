/**
 * Muestra una tarjeta con información resumida de un cliente.
 */

import { Colors } from '@/constants/Colors';
import type { Client } from '@/types';
import { formatMoney } from '@/utils/formatters';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

/**
 * Props del componente ClientCard
 */
interface ClientCardProps {
    /** Cliente a mostrar */
    item: Client;
    /** Acción al presionar la tarjeta */
    onPress: () => void;
    /** Indicar si tiene cambios pendientes de subir */
    isPending?: boolean;
}

/**
 * Componente de tarjeta de cliente
 */
const ClientCard: React.FC<ClientCardProps> = ({ item, onPress, isPending }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme || 'light'];

    /**
     * Retorna el nivel de deuda con su color asociado.
     */
    const getDebtLevel = (debt: number) => {
        if (debt < 1000) return { text: 'Baja', color: theme.success };
        if (debt < 5000) return { text: 'Media', color: theme.warning };
        return { text: 'Alta', color: theme.error };
    };

    const { text, color } = getDebtLevel(item.debt);
    const formattedDebt = formatMoney(item.debt);

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.content}>
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                        {isPending && (
                            <View style={{ marginLeft: 6 }}>
                                <FontAwesome name="cloud-upload" size={14} color={theme.warning} />
                            </View>
                        )}
                        <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
                            <Text style={[styles.badgeText, { color }]}>{text}</Text>
                        </View>
                    </View>
                    <Text style={[styles.debt, {color: theme.textSecondary}]}>Debe: ${formattedDebt}</Text>
                </View>

                <View style={styles.arrow}>
                    <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 17,
        fontWeight: '600',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    debt: {
        fontSize: 16,
        fontWeight: '500',
    },
    arrow: {
        marginLeft: 12,
    },
});

export default ClientCard;
