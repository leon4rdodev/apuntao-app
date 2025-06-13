// apuntao-app-master/context/ClientContext.tsx

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '../constants';
import type { Client, ClientContextType, Transaction } from '../types';
import { handleError } from '../utils/network';
import { getFromStorage, saveToStorage } from '../utils/storage';

const ClientContext = createContext<ClientContextType | null>(null);

const normalizeClient = (client: Partial<Client>): Client => ({
    id: client.id || `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: client.name || 'Cliente sin nombre',
    phone: client.phone || undefined,
    debt: typeof client.debt === 'number' ? Math.max(0, client.debt) : 0,
    transactions: Array.isArray(client.transactions) ? client.transactions : [],
    lastModified: client.lastModified || Date.now(),
});

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const saveClientsToStorage = useCallback(async (clientsToSave: Client[]) => {
        try {
            await saveToStorage(STORAGE_KEYS.CLIENTS, clientsToSave);
        } catch (error) {
            console.error('Error al guardar clientes en el almacenamiento:', error);
            handleError(error, 'ClientContext.saveClientsToStorage');
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const handler = setTimeout(() => {
                saveClientsToStorage(clients);
            }, 500);
            return () => clearTimeout(handler);
        }
    }, [clients, isLoading, saveClientsToStorage]);

    useEffect(() => {
        const loadClientsFromStorage = async () => {
            setIsLoading(true);
            try {
                const storedData = await getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS);
                if (storedData && Array.isArray(storedData)) {
                    setClients(storedData.map(normalizeClient));
                }
            } catch (error) {
                console.error('Error al cargar clientes del almacenamiento:', error);
                handleError(error, 'ClientContext.loadClients');
                setClients([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadClientsFromStorage();
    }, []);

    const clearClients = useCallback(() => {
        setClients([]);
        saveToStorage(STORAGE_KEYS.CLIENTS, []);
    }, []);

    const restoreClients = useCallback((newClientsData: Client[] | string) => {
        try {
            let parsedClients: any[] =
                typeof newClientsData === 'string'
                    ? JSON.parse(newClientsData).data || JSON.parse(newClientsData)
                    : newClientsData;

            if (!Array.isArray(parsedClients)) {
                throw new Error('Los datos proporcionados para restaurar no son un array válido.');
            }
            const normalizedClients = parsedClients.map(normalizeClient);
            setClients(normalizedClients);
        } catch (error) {
            console.error('Error al restaurar clientes desde backup:', error);
            handleError(error, 'ClientContext.restoreClients');
        }
    }, []);

    const addClient = useCallback(
        (clientData: Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>): Client => {
            const newClient = normalizeClient(clientData);
            setClients((prevClients) => [...prevClients, newClient]);
            return newClient;
        },
        []
    );

    const updateClient = useCallback(
        (clientId: string, updatedData: Pick<Client, 'name' | 'phone'>) => {
            setClients((prevClients) =>
                prevClients.map((client) =>
                    client.id === clientId
                        ? { ...client, ...updatedData, lastModified: Date.now() }
                        : client
                )
            );
        },
        []
    );

    const deleteClient = useCallback((clientId: string) => {
        setClients((prevClients) => prevClients.filter((c) => c.id !== clientId));
    }, []);

    // ✅ --- IMPLEMENTACIÓN COMPLETA Y CORREGIDA ---
    const addTransaction = useCallback((clientId: string, transaction: Omit<Transaction, 'id'>) => {
        setClients((prevClients) =>
            prevClients.map((client) => {
                if (client.id !== clientId) return client;

                const debtChange =
                    transaction.type === 'Deuda' ? transaction.amount : -transaction.amount;
                const newDebt = Math.max(0, client.debt + debtChange);
                const newTransactionWithId: Transaction = {
                    ...transaction,
                    id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                };

                return {
                    ...client,
                    debt: newDebt,
                    // Mantenemos tu lógica de optimización, pero asegurando que la nueva transacción se añade.
                    transactions:
                        newDebt === 0 ? [] : [newTransactionWithId, ...client.transactions],
                    lastModified: Date.now(),
                };
            })
        );
    }, []);

    // ✅ --- IMPLEMENTACIÓN COMPLETA Y CORREGIDA ---
    const deleteTransaction = useCallback((clientId: string, transactionId: string) => {
        setClients((prevClients) =>
            prevClients.map((client) => {
                if (client.id !== clientId) return client;

                const transactionToDelete = client.transactions.find((t) => t.id === transactionId);
                if (!transactionToDelete) return client;

                const debtChange =
                    transactionToDelete.type === 'Deuda'
                        ? -transactionToDelete.amount
                        : transactionToDelete.amount;
                const newDebt = Math.max(0, client.debt + debtChange);
                const updatedTransactions = client.transactions.filter(
                    (t) => t.id !== transactionId
                );

                return {
                    ...client,
                    debt: newDebt,
                    // Mantenemos tu lógica de optimización.
                    transactions: newDebt === 0 ? [] : updatedTransactions,
                    lastModified: Date.now(),
                };
            })
        );
    }, []);

    const contextValue = useMemo<ClientContextType>(
        () => ({
            clients,
            isLoading,
            addClient,
            updateClient,
            deleteClient,
            addTransaction,
            deleteTransaction,
            restoreClients,
            getClientById: (id: string) => clients.find((c) => c.id === id),
            clearClients,
        }),
        [
            clients,
            isLoading,
            addClient,
            updateClient,
            deleteClient,
            addTransaction,
            deleteTransaction,
            restoreClients,
            clearClients,
        ]
    );

    return <ClientContext.Provider value={contextValue}>{children}</ClientContext.Provider>;
};

export const useClientContext = (): ClientContextType => {
    const context = useContext(ClientContext);
    if (context === null) {
        throw new Error('useClientContext debe ser utilizado dentro de un ClientProvider');
    }
    return context;
};
