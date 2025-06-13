import ClientCard from '@/components/cards/ClientCard';
import MainHeader from '@/components/headers/MainHeader';
import ClientsSummary from '@/components/ui/ClientsSummary';
import { Colors } from '@/constants/Colors';
import { useClientContext } from '@/context/ClientContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function Index() {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();

    // 1. Obtener datos y estado de carga del contexto
    const { clients, isLoading } = useClientContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // 2. Calcular datos para el resumen. Se memoiza para evitar recálculos innecesarios.
    const summaryData = useMemo(() => {
        const clientsWithDebt = clients.filter((c) => c.debt > 0);
        const totalDebt = clientsWithDebt.reduce((sum, client) => sum + client.debt, 0);
        return {
            totalDebt,
            clientsWithDebt: clientsWithDebt.length,
        };
    }, [clients]);

    // 3. Lógica para filtrar y ordenar los clientes a mostrar
    const displayedClients = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase().trim();

        // Si hay una consulta de búsqueda, filtramos por nombre o teléfono
        if (lowerCaseQuery) {
            return clients.filter(
                (client) =>
                    client.name.toLowerCase().includes(lowerCaseQuery) ||
                    // Permite buscar por teléfono con o sin guiones
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

    // Muestra un indicador de carga mientras los datos se recuperan por primera vez
    if (isLoading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.text, marginTop: 10 }}>Cargando datos...</Text>
            </View>
        );
    }

    // Componente para mostrar cuando la lista está vacía
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
            <MainHeader setSearchQuery={setSearchQuery} setIsSearchOpen={setIsSearchOpen} isSearchOpen={isSearchOpen}/>

            <FlatList
                data={displayedClients}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 18,
        paddingVertical: 18,
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
