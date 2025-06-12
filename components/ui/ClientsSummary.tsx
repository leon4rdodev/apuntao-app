import { Colors } from '@/constants/Colors';
import { formatMoney } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

/**
 * Props del componente ClientsSummary
 */
interface ClientsSummaryProps {
    /** Deuda total de todos los clientes */
    totalDebt: number;
    /** Número de clientes con deuda */
    clientsWithDebt: number;
}

/**
 * Componente de resumen de clientes
 * @param totalDebt - Deuda total
 * @param clientsWithDebt - Número de clientes con deuda
 */
export default function ClientsSummary({ totalDebt, clientsWithDebt }: ClientsSummaryProps) {
    const formattedDebt = formatMoney(totalDebt);
    
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme || 'light'];

    return (
        <>
            <View style={(styles.card, { backgroundColor: theme.surface })}>
                <View style={styles.amountSection}>
                    <Text style={(styles.amount, { color: theme.text })}>RD$ {formattedDebt}</Text>
                    <Text style={(styles.subtitle, { color: theme.textSecondary })}>
                        Deuda total
                    </Text>
                </View>

                <View style={styles.statsSection}>
                    <Ionicons name="people" size={16} color={theme.primary} />
                    <Text style={styles.statsText}>
                        {clientsWithDebt} {clientsWithDebt === 1 ? 'cliente' : 'clientes'}
                    </Text>
                </View>
            </View>

            {totalDebt > 0 && (
                <Text style={(styles.separatorText, { color: theme.textSecondary })}>
                    Clientes con más deuda
                </Text>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    amountSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    amount: {
        fontSize: 32,
        fontWeight: '700',
      
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    statsSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    statsText: {
        fontSize: 16,
        color: '#374151',
        marginLeft: 8,
        fontWeight: '500',
    },
    separatorText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
});
