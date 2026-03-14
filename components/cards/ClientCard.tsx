import { Colors } from '@/constants/Colors';
import type { Client } from '@/types';
import { formatMoney } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Props del componente ClientCard
 */
interface ClientCardProps {
    /** Cliente a mostrar */
    item: Client;
    /** Acción al presionar la tarjeta */
    onPress: (id: string) => void;
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
     * Retorna el nivel de deuda con su color asociado y texto descriptivo.
     */
    const getDebtLevel = (debt: number) => {
        if (debt === 0) return { text: 'Al día', color: theme.success };
        if (debt < 2000) return { text: 'Baja', color: theme.success };
        if (debt < 7000) return { text: 'Media', color: theme.warning };
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
                    borderColor: theme.borderSubtle,
                },
            ]}
            onPress={() => onPress(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                            {item.name}
                        </Text>
                        {isPending && (
                            <Ionicons name="cloud-upload-outline" size={16} color={theme.warning} style={{ marginLeft: 6 }} />
                        )}
                    </View>
                    <View style={styles.debtRow}>
                        <Text style={[styles.debtLabel, { color: theme.textSecondary }]}>Debe</Text>
                        <Text style={[styles.debtAmount, { color: item.debt > 0 ? theme.error : theme.success }]}>
                            ${formattedDebt}
                        </Text>
                    </View>
                </View>

                <View style={styles.rightSection}>
                    <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
                        <Text style={[styles.badgeText, { color }]}>{text}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.border} style={styles.chevron} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        borderRadius: 24, // Consistencia con perfiles
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    info: {
        flex: 1,
        marginRight: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    debtRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    debtLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    debtAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    rightSection: {
        alignItems: 'flex-end',
        gap: 10,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chevron: {
        marginRight: -4,
    },
});

export default React.memo(ClientCard);
