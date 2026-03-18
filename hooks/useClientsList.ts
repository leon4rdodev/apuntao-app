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
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // Filtramos borrados una sola vez y reutilizamos en ambos cálculos
    const validClients = useMemo(
        () => clients.filter((c) => !c.deleted),
        [clients]
    );

    const summaryData = useMemo(() => {
        const totalClients = validClients.length;
        const totalDebt = validClients.reduce((sum, client) => sum + client.debt, 0);
        return {
            totalDebt,
            totalClients,
        };
    }, [validClients]);

    const filteredClients = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase().trim();
        if (!lowerCaseQuery) {
            return [...validClients].sort((a, b) => {
                if (b.debt !== a.debt) return b.debt - a.debt;
                return b.lastModified - a.lastModified;
            });
        }

        const queryPhone = lowerCaseQuery.replace(/\D/g, '');

        return validClients
            .filter((client) => {
                const nameMatch = client.name.toLowerCase().includes(lowerCaseQuery);
                const phoneMatch = queryPhone && client.phone?.replace(/\D/g, '').includes(queryPhone);
                return nameMatch || phoneMatch;
            })
            .sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();

                // 1. Exact Match Priority
                const isExactA = nameA === lowerCaseQuery;
                const isExactB = nameB === lowerCaseQuery;
                if (isExactA && !isExactB) return -1;
                if (!isExactA && isExactB) return 1;

                // 2. Starts With Priority
                const startsA = nameA.startsWith(lowerCaseQuery);
                const startsB = nameB.startsWith(lowerCaseQuery);
                if (startsA && !startsB) return -1;
                if (!startsA && startsB) return 1;

                // 3. Fallback to default sort (Debt then lastModified)
                if (b.debt !== a.debt) return b.debt - a.debt;
                return b.lastModified - a.lastModified;
            });
    }, [validClients, searchQuery]);

    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

    const displayedClients = useMemo(() => {
        if (searchQuery.trim()) return filteredClients; 
        
        return filteredClients.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    }, [filteredClients, page, searchQuery]);

    useMemo(() => {
        setPage(1);
    }, [searchQuery]);

    useMemo(() => {
        if (page > 1 && displayedClients.length === 0 && totalPages > 0) {
            setPage(totalPages);
        }
    }, [displayedClients, totalPages, page]);


    const handleNextPage = useCallback(() => {
        setPage((p) => (p < totalPages ? p + 1 : p));
    }, [totalPages]);

    const handlePrevPage = useCallback(() => {
        setPage((p) => (p > 1 ? p - 1 : p));
    }, []);

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
        summaryData: {
            totalDebt: summaryData.totalDebt,
            totalClients: summaryData.totalClients,
        },
        displayedClients,
        handleClientPress,
        page,
        setPage,
        handleNextPage,
        handlePrevPage,
        totalPages,
    };
}
