import ClientCard from '@/components/cards/ClientCard';
import MainHeader from '@/components/headers/MainHeader';
import ClientsSummary from '@/components/ui/ClientsSummary';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useClientsList } from '@/hooks/useClientsList';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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
    } = useClientsList();

    const renderEmptyListComponent = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                <Ionicons name="receipt-outline" size={48} color={theme.textSecondary} />
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
                        <ClientsSummary
                            totalDebt={summaryData.totalDebt}
                            clientsWithDebt={summaryData.clientsWithDebt}
                        />
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
        paddingTop: 12,
        paddingBottom: 110, // Espacio para el TabBar absoluto
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
});
