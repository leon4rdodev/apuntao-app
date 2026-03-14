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
    /** Deuda total de todos los clientes */
    totalDebt: number;
    /** Número de clientes con deuda */
    clientsWithDebt: number;
}

/**
 * Componente de tarjeta de resumen que muestra la deuda total y el número de clientes.
 * Presenta la información clave de un vistazo en un formato de tarjeta limpio y moderno.
 * @param totalDebt - Deuda total
 * @param clientsWithDebt - Número de clientes con deuda
 */
export default function ClientsSummary({ totalDebt, clientsWithDebt }: ClientsSummaryProps) {
    const formattedDebt = formatMoney(totalDebt);
    const colorScheme = useColorScheme() || 'light';
    const theme = Colors[colorScheme];

    return (
        <View>
            <View
                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
            >
                {/* Sección Principal: Monto de la Deuda */}
                <View style={styles.amountSection}>
                    <Text style={[styles.amount, { color: theme.text }]}>RD$ {formattedDebt}</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Deuda total
                    </Text>
                </View>

                {/* Sección Secundaria: Estadísticas de Clientes */}
                <View style={[styles.statsSection, { borderTopColor: theme.borderSubtle }]}>
                    <Ionicons name="people-outline" size={20} color={theme.primary} />
                    <Text style={[styles.statsText, { color: theme.text }]}>
                        {clientsWithDebt}{' '}
                        {clientsWithDebt === 1 ? 'cliente debe' : 'clientes deben'}
                    </Text>
                </View>
            </View>

            {/* Separador de texto (si hay clientes) */}
            {clientsWithDebt > 0 && (
                <Text style={[styles.separatorText, { color: theme.textSecondary }]}>
                    {totalDebt > 0 ? 'Clientes con más deuda' : 'Clientes sin deuda'}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24, // Bordes más suaves
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 24,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03, // Sombra muy sutil
        shadowRadius: 12,
        elevation: 2,
    },
    amountSection: {
        alignItems: 'center',
        paddingVertical: 32, // Más aire
    },
    amount: {
        fontSize: 44, // Un poco más grande
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
    },
    statsText: {
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },
    separatorText: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
