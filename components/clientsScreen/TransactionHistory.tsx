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
    const [page, setPage] = React.useState(1);
    const itemsPerPage = 10;
    
    const handleDelete = (tx: Transaction) => {
        onDelete(tx);
    };

    const sortedTransactions = useMemo(
        () => [...transactions].sort((a, b) => b.date - a.date),
        [transactions]
    );

    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
    const paginatedTransactions = useMemo(
        () => sortedTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage),
        [sortedTransactions, page]
    );

    // Reset page if transactions change and current page becomes empty
    React.useEffect(() => {
        if (page > 1 && paginatedTransactions.length === 0 && totalPages > 0) {
            setPage(totalPages);
        }
    }, [paginatedTransactions, totalPages, page]);

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
                {paginatedTransactions.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <>
                        {paginatedTransactions.map((tx) => renderItem({ item: tx }))}
                        
                        {totalPages > 1 && (
                            <View style={styles.pagination}>
                                <TouchableOpacity 
                                    disabled={page === 1} 
                                    onPress={() => setPage(p => p - 1)}
                                    style={[styles.pageButton, page === 1 && { opacity: 0.3 }]}
                                >
                                    <Ionicons name="chevron-back" size={20} color={theme.text} />
                                    <CustomText size="small" weight="medium">Anterior</CustomText>
                                </TouchableOpacity>

                                <CustomText size="small" weight="bold" color={theme.textSecondary}>
                                    Página {page} de {totalPages}
                                </CustomText>

                                <TouchableOpacity 
                                    disabled={page === totalPages} 
                                    onPress={() => setPage(p => p + 1)}
                                    style={[styles.pageButton, page === totalPages && { opacity: 0.3 }]}
                                >
                                    <CustomText size="small" weight="medium">Siguiente</CustomText>
                                    <Ionicons name="chevron-forward" size={20} color={theme.text} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
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
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        marginTop: 8,
    },
    pageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
});

export default React.memo(TransactionHistory);
