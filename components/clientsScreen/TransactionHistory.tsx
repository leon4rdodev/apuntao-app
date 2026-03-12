import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { Transaction } from '@/types';
import { formatDate, formatMoney } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View, useColorScheme, FlatList } from 'react-native';
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
            entering={FadeInDown}
            exiting={FadeOutDown}
            layout={LinearTransition}
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
            <TouchableOpacity onPress={() => handleDelete(tx)} style={styles.deleteIcon}>
                <Ionicons name="trash-outline" size={20} color={theme.error} />
            </TouchableOpacity>
        </Animated.View>
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
            
            <Animated.FlatList
                data={sortedTransactions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                // Previene que el FlatList intercepte el scroll del ScrollView padre
                scrollEnabled={false} 
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                itemLayoutAnimation={LinearTransition}
            />
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

export default React.memo(TransactionHistory);
