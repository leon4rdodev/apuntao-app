import ClientCard from '@/components/cards/ClientCard';
import MainHeader from '@/components/headers/MainHeader';
import ClientsSummary from '@/components/ui/ClientsSummary';
import { Colors } from '@/constants/Colors';
import { useClientContext } from '@/context/ClientContext';
import { Ionicons } from '@expo/vector-icons';
import { useClientStore } from '@/store/clientStore';

// Importa useFocusEffect de expo-router
import { useRouter, useFocusEffect } from 'expo-router';
// Importa useCallback de react
import React, { useMemo, useState, useCallback } from 'react';
import { BackHandler, FlatList, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function Index() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();
    const clients = useClientStore((state) => state.clients); 
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const summaryData = useMemo(() => {
        const clientsWithDebt = clients.filter((c) => c.debt > 0);
        const totalDebt = clientsWithDebt.reduce((sum, client) => sum + client.debt, 0);
        return {
            totalDebt,
            clientsWithDebt: clientsWithDebt.length,
        };
    }, [clients]);

    const displayedClients = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase().trim();
        if (lowerCaseQuery) {
            return clients.filter(
                (client) =>
                    client.name.toLowerCase().includes(lowerCaseQuery) ||
                    client.phone?.replace(/-/g, '').includes(lowerCaseQuery.replace(/-/g, ''))
            );
        }
        return [...clients]
            .filter((c) => c.debt > 0)
            .sort((a, b) => b.debt - a.debt)
            .slice(0, 10);
    }, [clients, searchQuery]);

    const handleClientPress = (clientId: string) => {
        router.push(`/(app)/clients/${clientId}`);
    };

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (isSearchOpen) {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    return true;
                }
                return false;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [isSearchOpen])
    );

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
                renderItem={({ item }) => (
                    <ClientCard item={item} onPress={() => handleClientPress(item.id)} />
                )}
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
        padding: 18
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
