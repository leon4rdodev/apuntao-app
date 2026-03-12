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

    const summaryData = useMemo(() => {
        // Ignoramos los borrados (Soft Delete) para el resumen
        const validClients = clients.filter((c) => !c.deleted);
        const clientsWithDebt = validClients.filter((c) => c.debt > 0);
        const totalDebt = clientsWithDebt.reduce((sum, client) => sum + client.debt, 0);
        return {
            totalDebt,
            clientsWithDebt: clientsWithDebt.length,
        };
    }, [clients]);

    const displayedClients = useMemo(() => {
        // Filtrar borrados lógicos
        const validClients = clients.filter((c) => !c.deleted);

        const lowerCaseQuery = searchQuery.toLowerCase().trim();
        if (lowerCaseQuery) {
            return validClients.filter(
                (client) =>
                    client.name.toLowerCase().includes(lowerCaseQuery) ||
                    client.phone?.replace(/-/g, '').includes(lowerCaseQuery.replace(/-/g, ''))
            );
        }
        
        // Si no hay búsqueda, mostramos los que tienen deuda, ordenados de mayor a menor y top 10 temporal
        return [...validClients]
            .filter((c) => c.debt > 0)
            .sort((a, b) => b.debt - a.debt)
            .slice(0, 50); // Muestra hasta 50 clientes adeudados por defecto (o paginar en el futuro)
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
