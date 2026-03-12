import { useState, useMemo, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useClientStore } from '@/store/clientStore';

/**
 * Hook para manejar la lista principal de clientes, búsquedas, 
 * cálculos de resúmenes (deuda total) y la pulsación hacia atrás en Android.
 */
export function useClientsList() {
    const router = useRouter();
    const clients = useClientStore((state) => state.clients); 
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Filtramos borrados una sola vez y reutilizamos en ambos cálculos
    const validClients = useMemo(
        () => clients.filter((c) => !c.deleted),
        [clients]
    );

    const summaryData = useMemo(() => {
        const clientsWithDebt = validClients.filter((c) => c.debt > 0);
        const totalDebt = clientsWithDebt.reduce((sum, client) => sum + client.debt, 0);
        return {
            totalDebt,
            clientsWithDebt: clientsWithDebt.length,
        };
    }, [validClients]);

    const displayedClients = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase().trim();
        if (lowerCaseQuery) {
            return validClients.filter(
                (client) =>
                    client.name.toLowerCase().includes(lowerCaseQuery) ||
                    client.phone?.replace(/-/g, '').includes(lowerCaseQuery.replace(/-/g, ''))
            );
        }

        return [...validClients]
            .filter((c) => c.debt > 0)
            .sort((a, b) => b.debt - a.debt)
            .slice(0, 50);
    }, [validClients, searchQuery]);


    const handleClientPress = useCallback((clientId: string) => {
        router.push(`/(app)/clients/${clientId}`);
    }, [router]);

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

    return {
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        summaryData,
        displayedClients,
        handleClientPress,
    };
}
