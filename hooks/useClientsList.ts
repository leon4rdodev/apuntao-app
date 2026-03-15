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
        if (lowerCaseQuery) {
            return validClients.filter(
                (client) =>
                    client.name.toLowerCase().includes(lowerCaseQuery) ||
                    client.phone?.replace(/\D/g, '').includes(lowerCaseQuery.replace(/\D/g, ''))
            );
        }

        return [...validClients].sort((a, b) => {
            // Priorizamos los que tienen deuda, y luego por fecha de modificación
            if (b.debt !== a.debt) return b.debt - a.debt;
            return b.lastModified - a.lastModified;
        });
    }, [validClients, searchQuery]);

    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

    const displayedClients = useMemo(() => {
        if (searchQuery.trim()) return filteredClients; // No paginar en búsqueda (o podrías si quieres)
        
        return filteredClients.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    }, [filteredClients, page, searchQuery]);

    // Reset page if search query changes
    useMemo(() => {
        setPage(1);
    }, [searchQuery]);

    // Reset page if current page becomes empty (e.g. after deletion)
    useMemo(() => {
        if (page > 1 && displayedClients.length === 0 && totalPages > 0) {
            setPage(totalPages);
        }
    }, [displayedClients, totalPages, page]);


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
        totalPages,
    };
}
