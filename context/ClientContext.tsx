/**
 * @file ClientContext.tsx
 * @description Proveedor de contexto para gestionar el estado de los clientes en toda la aplicación.
 */

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
import { getFromStorage, saveToStorage } from '../utils/storage';

const ClientContext = createContext<ClientContextType | null>(null);

/**
 * Normaliza un objeto de cliente para asegurar que todos sus campos requeridos existan y tengan valores por defecto válidos.
 * @param {Partial<Client>} client - El objeto de cliente parcial.
 * @returns {Client} El objeto de cliente completo y normalizado.
 */
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

    /**
     * Guarda la lista de clientes actual en el almacenamiento local.
     * Esta función se ejecuta con un debounce implícito gracias a useEffect.
     * @param {Client[]} clientsToSave - La lista de clientes a guardar.
     */
    const saveClientsToStorage = useCallback(async (clientsToSave: Client[]) => {
        try {
            await saveToStorage(STORAGE_KEYS.CLIENTS, clientsToSave);
        } catch (error) {
            console.error('Error al guardar clientes en el almacenamiento:', error);
        }
    }, []);

    // Efecto para persistir los clientes en AsyncStorage 500ms después de cualquier cambio.
    useEffect(() => {
        if (!isLoading) {
            const handler = setTimeout(() => {
                saveClientsToStorage(clients);
            }, 500);
            return () => clearTimeout(handler);
        }
    }, [clients, isLoading, saveClientsToStorage]);

    // Efecto para cargar los clientes desde AsyncStorage al iniciar la app.
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
                setClients([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadClientsFromStorage();
    }, []);

    /** Limpia el estado de clientes, útil al cerrar sesión. */
    const clearClients = useCallback(() => {
        setClients([]);
        // La limpieza del storage se hace en la función logout del apiService.
    }, []);

    /**
     * Reemplaza la lista actual de clientes con datos nuevos.
     * @param {Client[]} newClientsData - El nuevo array de clientes.
     */
    const setAllClients = useCallback((newClientsData: Client[]) => {
        try {
            if (!Array.isArray(newClientsData)) {
                throw new Error('Los datos proporcionados para restaurar no son un array válido.');
            }
            const normalizedClients = newClientsData.map(normalizeClient);
            setClients(normalizedClients);
        } catch (error) {
            console.error('Error al establecer todos los clientes:', error);
        }
    }, []);

    /**
     * Agrega un nuevo cliente a la lista.
     * @param {Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>} clientData - Datos del nuevo cliente.
     * @returns {Client} El cliente recién creado.
     */
    const addClient = useCallback(
        (clientData: Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>): Client => {
            const newClient = normalizeClient(clientData);
            setClients((prevClients) => [...prevClients, newClient]);
            return newClient;
        },
        []
    );

    /**
     * Actualiza el nombre y/o teléfono de un cliente existente.
     * @param {string} clientId - ID del cliente a actualizar.
     * @param {Pick<Client, 'name' | 'phone'>} updatedData - Nuevos datos para el cliente.
     */
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

    /**
     * Elimina un cliente de la lista.
     * @param {string} clientId - ID del cliente a eliminar.
     */
    const deleteClient = useCallback((clientId: string) => {
        setClients((prevClients) => prevClients.filter((c) => c.id !== clientId));
    }, []);

    /**
     * Agrega una transacción a un cliente y recalcula su deuda.
     * @param {string} clientId - ID del cliente.
     * @param {Omit<Transaction, 'id'>} transaction - La nueva transacción.
     */
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
                    transactions: [newTransactionWithId, ...client.transactions],
                    lastModified: Date.now(),
                };
            })
        );
    }, []);

    /**
     * Elimina una transacción de un cliente y recalcula su deuda.
     * @param {string} clientId - ID del cliente.
     * @param {string} transactionId - ID de la transacción a eliminar.
     */
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
                    transactions: updatedTransactions,
                    lastModified: Date.now(),
                };
            })
        );
    }, []);

    const contextValue = useMemo<ClientContextType>(
        () => ({
            clients,
            isLoading,
            setClients: setAllClients,
            addClient,
            updateClient,
            deleteClient,
            addTransaction,
            deleteTransaction,
            getClientById: (id: string) => clients.find((c) => c.id === id),
            clearClients,
        }),
        [
            clients,
            isLoading,
            setAllClients,
            addClient,
            updateClient,
            deleteClient,
            addTransaction,
            deleteTransaction,
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
