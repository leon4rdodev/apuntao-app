import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { Transaction } from '@/types';
import { formatDate, formatMoney } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View, FlatList } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, { LinearTransition, FadeInDown, FadeOutDown } from 'react-native-reanimated';

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
    
    const handleDelete = (tx: Transaction) => {
        onDelete(tx);
    };

    const sortedTransactions = useMemo(
        () => [...transactions].sort((a, b) => b.date - a.date),
        [transactions]
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={theme.textSecondary} />
            <CustomText color={theme.textSecondary} style={styles.emptyStateText}>
                No hay movimientos registrados.
            </CustomText>
        </View>
    );

    const renderItem = ({ item: tx }: { item: Transaction }) => (
        <Animated.View
            key={tx.id}
            entering={FadeInDown}
            exiting={FadeOutDown}
            layout={LinearTransition}
            style={[styles.transactionRow, { borderTopColor: theme.borderSubtle }]}
        >
            <View style={{ flex: 1 }}>
                <CustomText size="medium" weight="medium" style={{ color: tx.type === 'Pago' ? theme.success : theme.text }}>
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
                color={tx.type === 'Pago' ? theme.success : theme.text}
            >
                {tx.type === 'Pago' ? '-' : '+'}${formatMoney(tx.amount)}
            </CustomText>
            <TouchableOpacity onPress={() => handleDelete(tx)} style={styles.deleteIcon}>
                <Ionicons name="trash-outline" size={20} color={theme.error} />
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
            <CustomText
                size="small"
                weight="bold"
                color={theme.textSecondary}
                style={styles.cardTitle}
            >
                Historial de Movimientos
            </CustomText>
            
            <View style={{ marginTop: 12 }}>
                {sortedTransactions.length === 0 ? (
                    renderEmptyState()
                ) : (
                    sortedTransactions.map((tx) => renderItem({ item: tx }))
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 8,
        marginBottom: 40,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1, // Para Android
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
        paddingVertical: 16,
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

export default React.memo(TransactionHistory);
