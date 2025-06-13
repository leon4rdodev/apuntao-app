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
        <View style={[styles.container]}>
            <View
                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
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
    container: {
        marginBottom: 8, // Espacio antes de que empiece la lista de clientes
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden', // Asegura que los bordes redondeados se apliquen a los hijos
        marginBottom: 24,
    },
    amountSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    amount: {
        fontSize: 40, // <-- AUMENTADO: Texto de la deuda más grande
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'uppercase', // Estilo adicional para diferenciar
        letterSpacing: 0.5,
    },
    statsSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderTopWidth: 1,
    },
    statsText: {
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },
    separatorText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
});
