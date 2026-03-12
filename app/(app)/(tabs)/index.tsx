import ClientCard from '@/components/cards/ClientCard';
import MainHeader from '@/components/headers/MainHeader';
import ClientsSummary from '@/components/ui/ClientsSummary';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useClientsList } from '@/hooks/useClientsList';
import React from 'react';
import { FlatList, StyleSheet, Text, useColorScheme, View } from 'react-native';

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
            <Ionicons name="sad-outline" size={60} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery ? 'No se encontraron resultados' : 'Aún no tienes clientes'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {searchQuery
                    ? 'Intenta con otro nombre o teléfono.'
                    : "Presiona 'Agregar' para registrar tu primer cliente."}
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
                // ✨ SOLUCIÓN PARA TOCAR LAS CARDS CON EL TECLADO ABIERTO ✨
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    !isSearchOpen ? (
                        <ClientsSummary
                            totalDebt={summaryData.totalDebt}
                            clientsWithDebt={summaryData.clientsWithDebt}
                        />
                    ) : null
                }
                renderItem={({ item }) => {
                    return (
                        <ClientCard
                            item={item}
                            onPress={() => handleClientPress(item.id)}
                            isPending={false}
                        />
                    );
                }}
                ListEmptyComponent={renderEmptyListComponent}
            />
        </View>
    );
}

// ... tus estilos permanecen igual
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 18,
        paddingBottom: 100, // Espacio para el TabBar absoluto
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 50,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
    },
});
