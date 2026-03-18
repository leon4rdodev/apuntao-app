import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { Transaction } from '@/types';
import { formatDate, formatDateThreeLines, formatMoney } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, { LinearTransition, FadeInDown, FadeOutDown } from 'react-native-reanimated';

/**
 * @component TransactionHistory
 * @description Muestra la lista de transacciones del cliente o un estado vacío con diseño monocromático y tarjetas.
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
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                <Ionicons name="receipt" size={40} color={theme.textSecondary} />
            </View>
            <CustomText weight="bold" style={[styles.emptyStateText, { color: theme.text }]}>
                Sin movimientos aún
            </CustomText>
            <CustomText color={theme.textSecondary} style={styles.emptyStateSubtitle}>
                Los pagos y deudas del cliente aparecerán listados aquí cronológicamente.
            </CustomText>
        </View>
    );

    const renderItem = ({ item: tx }: { item: Transaction }) => {
        const isPayment = tx.type === 'Pago';
        const statusColor = isPayment ? theme.success : theme.error;
        
        return (
            <Animated.View
                key={tx.id}
                entering={FadeInDown}
                exiting={FadeOutDown}
                layout={LinearTransition}
                style={[
                    styles.transactionCard,
                    { borderTopColor: theme.borderSubtle }
                ]}
            >
                <View style={styles.infoContainer}>
                    <CustomText 
                        size="medium" 
                        weight="bold" 
                        style={{ color: isPayment ? theme.success : theme.text }}
                    >
                        {isPayment ? 'Pago' : 'Deuda'}
                    </CustomText>
                    <CustomText
                        size="small"
                        color={theme.textSecondary}
                        style={{ marginTop: 2, lineHeight: 18 }}
                    >
                        {formatDateThreeLines(tx.date)}
                    </CustomText>
                </View>

                <View style={styles.amountContainer}>
                    <CustomText
                        size="medium"
                        weight="bold"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={{ color: statusColor, textAlign: 'right' }}
                    >
                        {isPayment ? '-' : '+'}${formatMoney(tx.amount)}
                    </CustomText>
                </View>

                <TouchableOpacity 
                    onPress={() => handleDelete(tx)} 
                    style={styles.deleteButton}
                >
                    <Ionicons name="trash" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <CustomText
                    size="small"
                    weight="bold"
                    color={theme.textSecondary}
                    style={styles.cardTitle}
                >
                    Historial de Movimientos
                </CustomText>
                
                {transactions.length > 0 && (
                    <View style={[styles.countBadge, { backgroundColor: theme.primary + '10' }]}>
                        <Ionicons name="receipt" size={14} color={theme.primary} style={{ marginRight: 4 }} />
                        <CustomText size="small" weight="bold" color={theme.primary}>
                            {transactions.length}
                        </CustomText>
                    </View>
                )}
            </View>
            
            <View>
                {paginatedTransactions.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <>
                        {totalPages > 1 && (
                            <View style={styles.pagination}>
                                <TouchableOpacity 
                                    disabled={page === 1} 
                                    onPress={() => setPage((p) => (p > 1 ? p - 1 : p))}
                                    style={[styles.pageButton, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }, page === 1 && { opacity: 0.3 }]}
                                >
                                    <Ionicons name="chevron-back" size={20} color={theme.text} />
                                </TouchableOpacity>

                                <View style={[styles.pageIndicatorContainer, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                                    <Text style={[styles.pageIndicatorText, { color: theme.textSecondary }]}>
                                        <Text style={{ color: theme.text, fontWeight: '800' }}>{page}</Text> de {totalPages}
                                    </Text>
                                </View>

                                <TouchableOpacity 
                                    disabled={page === totalPages} 
                                    onPress={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                                    style={[styles.pageButton, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }, page === totalPages && { opacity: 0.3 }]}
                                >
                                    <Ionicons name="chevron-forward" size={20} color={theme.text} />
                                </TouchableOpacity>
                            </View>
                        )}

                        {paginatedTransactions.map((tx) => renderItem({ item: tx }))}
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardTitle: {
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    countBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 50,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        marginBottom: 0,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    amountContainer: {
        marginLeft: 8,
        marginRight: 8,
        maxWidth: '40%',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
        borderRadius: 32,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.1)',
        marginTop: 8,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
    },
    emptyStateText: {
        fontSize: 18,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 20,
        gap: 12,
    },
    pageButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    pageIndicatorContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 22,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    pageIndicatorText: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default React.memo(TransactionHistory);
