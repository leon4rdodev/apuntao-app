import { Colors } from '@/constants/Colors';
import { formatMoney } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Props del componente ClientsSummary
 */
interface ClientsSummaryProps {
    /** Deuda total de todos los clientes (solo deudas positivas) */
    totalDebt: number;
    /** Saldo a favor total (crédito de los clientes, opcional) */
    totalCredit?: number;
    /** Número total de clientes */
    totalClients: number;
}

/**
 * Componente de tarjeta de resumen que muestra la deuda total y el número de clientes.
 * Presenta la información clave de un vistazo en un formato de tarjeta limpio y moderno.
 * @param totalDebt - Deuda total
 * @param totalClients - Número total de clientes
 */
export default function ClientsSummary({ totalDebt, totalCredit = 0, totalClients }: ClientsSummaryProps) {
    const formattedDebt = formatMoney(totalDebt);
    const formattedCredit = formatMoney(totalCredit);
    const colorScheme = useColorScheme() || 'light';
    const theme = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.amountsContainer}>
                    <View>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>POR COBRAR</Text>
                        <Text style={[styles.amount, { color: theme.text }]}>${formattedDebt}</Text>
                    </View>
                    {totalCredit > 0 && (
                        <View style={styles.creditSpacing}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>A FAVOR DE CLIENTES</Text>
                            <Text style={[styles.amount, { color: theme.success }]}>+${formattedCredit}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.badgeContainer}>
                    <Text style={[styles.badgeLabel, { color: theme.textSecondary }]}>CLIENTES</Text>
                    <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
                        <Ionicons name="people-circle" size={16} color={theme.primary} />
                        <Text style={[styles.badgeText, { color: theme.primary }]}>
                            {totalClients}
                        </Text>
                    </View>
                </View>
            </View>

            {totalClients > 0 && (
                <View style={styles.separator}>
                    <View style={[styles.line, { backgroundColor: theme.borderSubtle }]} />
                    <Text style={[styles.separatorText, { color: theme.textSecondary }]}>
                        {totalDebt > 0 ? 'Resumen de cartera' : 'Todos al día'}
                    </Text>
                    <View style={[styles.line, { backgroundColor: theme.borderSubtle }]} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Cambio de center a flex-start por si hay dos filas de montos
        paddingVertical: 10,
    },
    amountsContainer: {
        flexDirection: 'column',
    },
    creditSpacing: {
        marginTop: 12,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    amount: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -1,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    badgeContainer: {
        alignItems: 'flex-end',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '700',
    },
    badgeLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.2,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 8,
        gap: 12,
    },
    line: {
        flex: 1,
        height: 1,
    },
    separatorText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.6,
    },
});
