import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { Transaction } from '@/types';
import { formatDate, formatMoney } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

/**
 * @component TransactionHistory
 * @description Muestra la lista de transacciones del cliente o un estado vacío.
 */
const TransactionHistory = ({
    transactions,
    onDelete,
}: {
    transactions: Transaction[];
    onDelete: (tx: Transaction) => void;
}) => {
    const theme = Colors[useColorScheme() || 'light'];
    const sortedTransactions = useMemo(
        () => [...transactions].sort((a, b) => b.date - a.date),
        [transactions]
    );

    return (
        <View style={[styles.card, { backgroundColor: theme.surface,borderColor: theme.border }]}>
            <CustomText
                size="small"
                weight="bold"
                color={theme.textSecondary}
                style={styles.cardTitle}
            >
                Historial de Movimientos
            </CustomText>
            {sortedTransactions.length > 0 ? (
                sortedTransactions.map((tx) => (
                    <View
                        key={tx.id}
                        style={[styles.transactionRow, { borderTopColor: theme.border }]}
                    >
                        <View style={{ flex: 1 }}>
                            <CustomText size="medium" weight="medium" style={{ color: tx.type === 'Pago' ? theme.success : theme.error }}>
                                {tx.type}
                            </CustomText>
                            <CustomText
                                size="small"
                                color={theme.textSecondary}
                                style={{ marginTop: 2 }}
                            >
                                {formatDate(tx.date)}
                            </CustomText>
                        </View>
                        <CustomText
                            size="medium"
                            weight="bold"
                            color={tx.type === 'Pago' ? theme.success : theme.error}
                        >
                            {tx.type === 'Pago' ? '-' : '+'}${formatMoney(tx.amount)}
                        </CustomText>
                        <TouchableOpacity onPress={() => onDelete(tx)} style={styles.deleteIcon}>
                            <Ionicons name="trash-outline" size={20} color={theme.error} />
                        </TouchableOpacity>
                    </View>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={48} color={theme.textSecondary} />
                    <CustomText color={theme.textSecondary} style={styles.emptyStateText}>
                        No hay movimientos registrados.
                    </CustomText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 16,
        borderWidth: 1,
        marginVertical:18,
    },
    cardTitle: {
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopWidth: 1,
    },
    deleteIcon: {
        paddingLeft: 16, // Aumenta el área de toque
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 8,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TransactionHistory;
