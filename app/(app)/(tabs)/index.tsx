import ClientCard from '@/components/cards/ClientCard';
import MainHeader from '@/components/headers/MainHeader';
import ClientsSummary from '@/components/ui/ClientsSummary';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useClientsList } from '@/hooks/useClientsList';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Index() {
    const theme = Colors[useColorScheme() || 'light'];
    
    // Custom Hook encapsula la Lógica (Búsqueda, Memoria, Botón Atrás)
    const {
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        summaryData,
        displayedClients,
        handleClientPress,
        page,
        handleNextPage,
        handlePrevPage,
        totalPages,
    } = useClientsList();

    const renderEmptyListComponent = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                <Ionicons name="receipt" size={48} color={theme.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery ? 'Sin resultados' : 'Lista vacía'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {searchQuery
                    ? 'No encontramos a nadie con ese nombre o teléfono.'
                    : "Presiona 'Agregar' para registrar a tu primer cliente y empezar a cobrar."}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <MainHeader
                setSearchQuery={setSearchQuery}
                setIsSearchOpen={setIsSearchOpen}
                isSearchOpen={isSearchOpen}
            />

            <FlatList
                data={displayedClients}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                ListHeaderComponent={
                    !isSearchOpen ? (
                        <View>
                            <ClientsSummary
                                totalDebt={summaryData.totalDebt}
                                totalCredit={summaryData.totalCredit}
                                totalClients={summaryData.totalClients}
                            />
                            {totalPages > 1 && (
                                <View style={styles.pagination}>
                                    <TouchableOpacity 
                                        disabled={page === 1} 
                                        onPress={handlePrevPage}
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
                                        onPress={handleNextPage}
                                        style={[styles.pageButton, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }, page === totalPages && { opacity: 0.3 }]}
                                    >
                                        <Ionicons name="chevron-forward" size={20} color={theme.text} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ) : null
                }
                renderItem={useCallback(({ item }: { item: any }) => (
                    <ClientCard
                        item={item}
                        onPress={handleClientPress}
                        isPending={false}
                    />
                ), [handleClientPress])}
                ListEmptyComponent={renderEmptyListComponent}
                ListFooterComponent={null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
        marginTop: 40,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 10,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
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
    pageButtonText: {
        fontSize: 14,
        fontWeight: '600',
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
