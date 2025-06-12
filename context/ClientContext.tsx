/**
 * @file ClientContext.tsx
 * @description Este archivo define el contexto de React para la gestión global del estado de los clientes.
 * Proporciona funcionalidades CRUD para clientes y sus transacciones, además de persistencia de datos.
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
import { handleError } from '../utils/network';
import { getFromStorage, saveToStorage } from '../utils/storage';

/**
 * @description Contexto de React para gestionar el estado global de los clientes.
 * Se inicializa en `null` y su valor es proporcionado por `ClientProvider`.
 */
const ClientContext = createContext<ClientContextType | null>(null);

/**
 * Normaliza un objeto de cliente para asegurar que todas las propiedades requeridas
 * existan y tengan valores por defecto seguros. Esto previene errores con datos
 * incompletos o malformados.
 * @param {Partial<Client>} client - El objeto de cliente, posiblemente incompleto, a normalizar.
 * @returns {Client} Un objeto `Client` con su estructura y valores garantizados.
 */
const normalizeClient = (client: Partial<Client>): Client => ({
    id: client.id || `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: client.name || 'Cliente sin nombre',
    phone: client.phone || undefined,
    debt: typeof client.debt === 'number' ? Math.max(0, client.debt) : 0,
    transactions: Array.isArray(client.transactions) ? client.transactions : [],
    lastModified: client.lastModified || Date.now(),
});

/**
 * Proveedor del Contexto de Clientes.
 * Este componente envuelve partes de la aplicación para proveerles acceso al estado
 * de los clientes y a las funciones para manipularlo (agregar, editar, etc.).
 * @param {{ children: ReactNode }} props - Las props del componente.
 * @returns {JSX.Element} El proveedor de contexto envolviendo a los hijos.
 */
export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Guarda la lista de clientes actual en el almacenamiento local de forma asíncrona.
     * @param {Client[]} clientsToSave - El array de clientes a guardar.
     */
    const saveClientsToStorage = useCallback(async (clientsToSave: Client[]) => {
        try {
            await saveToStorage(STORAGE_KEYS.CLIENTS, clientsToSave);
        } catch (error) {
            console.error('Error al guardar clientes en el almacenamiento:', error);
            handleError(error, 'ClientContext.saveClientsToStorage');
        }
    }, []);

    // Efecto para persistir los cambios en el estado de `clients` al almacenamiento local.
    // Se activa cuando `clients` cambia, pero solo después de que la carga inicial haya terminado (`!isLoading`).
    // Utiliza un debounce de 500ms para evitar escrituras excesivas durante cambios rápidos.
    useEffect(() => {
        if (!isLoading) {
            const handler = setTimeout(() => {
                saveClientsToStorage(clients);
            }, 500);
            return () => clearTimeout(handler);
        }
    }, [clients, isLoading, saveClientsToStorage]);

    // Efecto para cargar los datos iniciales desde el almacenamiento local al montar el componente.
    // Se ejecuta solo una vez gracias al array de dependencias vacío `[]`.
    // Normaliza los datos cargados para garantizar la integridad antes de establecer el estado.
    useEffect(() => {
        const loadClientsFromStorage = async () => {
            setIsLoading(true);
            try {
                const storedData = await getFromStorage<Client[]>(STORAGE_KEYS.CLIENTS);
                if (storedData && Array.isArray(storedData)) {
                    const normalizedData = storedData.map(normalizeClient);
                    setClients(normalizedData);
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

    /**
     * Restaura y reemplaza por completo la lista de clientes.
     * Esta función es útil para cargar datos desde un backup o una fuente externa.
     * @param {Client[] | string} newClientsData - Los nuevos datos, ya sea como array de `Client` o como string JSON.
     */
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

    /**
     * Agrega un nuevo cliente a la lista.
     * El ID, la deuda inicial y las transacciones se establecen automáticamente.
     * @param {Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>} clientData - Los datos del nuevo cliente.
     * @returns {Client} El objeto del cliente recién creado.
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
     * Actualiza los datos de un cliente existente.
     * @param {string} clientId - El ID del cliente a actualizar.
     * @param {Pick<Client, 'name' | 'phone'>} updatedData - Un objeto con los campos a actualizar.
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
     * @param {string} clientId - El ID del cliente a eliminar.
     */
    const deleteClient = useCallback((clientId: string) => {
        setClients((prevClients) => prevClients.filter((c) => c.id !== clientId));
    }, []);

    /**
     * Agrega una transacción a un cliente específico y recalcula su deuda.
     * Asigna un ID único a la transacción antes de agregarla.
     * @param {string} clientId - El ID del cliente al que se le agregará la transacción.
     * @param {Omit<Transaction, 'id'>} transaction - El objeto de la transacción a agregar (sin ID).
     */
    const addTransaction = useCallback((clientId: string, transaction: Omit<Transaction, 'id'>) => {
        setClients((prevClients) =>
            prevClients.map((client) => {
                if (client.id !== clientId) return client;

                const debtChange =
                    transaction.type === 'Deuda'
                        ? transaction.amount
                        : transaction.type === 'Pago'
                        ? -transaction.amount
                        : 0;

                const newDebt = Math.max(0, client.debt + debtChange);
                const newTransactionWithId: Transaction = {
                    ...transaction,
                    id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                };

                return {
                    ...client,
                    debt: newDebt,
                    transactions:
                        newDebt === 0 ? [] : [newTransactionWithId, ...client.transactions],
                    lastModified: Date.now(),
                };
            })
        );
    }, []);

    /**
     * Elimina una transacción de un cliente y recalcula su deuda.
     * @param {string} clientId - El ID del cliente al que pertenece la transacción.
     * @param {string} transactionId - El ID único de la transacción a eliminar.
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
                        : transactionToDelete.type === 'Pago'
                        ? transactionToDelete.amount
                        : 0;

                const newDebt = Math.max(0, client.debt + debtChange);
                const updatedTransactions = client.transactions.filter(
                    (t) => t.id !== transactionId
                );

                return {
                    ...client,
                    debt: newDebt,
                    transactions: newDebt === 0 ? [] : updatedTransactions,
                    lastModified: Date.now(),
                };
            })
        );
    }, []);

    // Memoiza el objeto `contextValue` para evitar re-renderizados innecesarios en los
    // componentes consumidores del contexto. El objeto solo se recreará si alguna de sus
    // dependencias cambia (el estado `clients`, `isLoading`, o las funciones).
    const contextValue = useMemo<ClientContextType>(
        () => ({
            clients,
            isLoading,
            restoreClients,
            addClient,
            updateClient,
            deleteClient,
            addTransaction,
            deleteTransaction,
            getClientById: (id: string) => clients.find((c) => c.id === id),
        }),
        [
            clients,
            isLoading,
            restoreClients,
            addClient,
            updateClient,
            deleteClient,
            addTransaction,
            deleteTransaction,
        ]
    );

    return <ClientContext.Provider value={contextValue}>{children}</ClientContext.Provider>;
};

/**
 * Hook personalizado para acceder al contexto de clientes de forma segura.
 * Proporciona una forma limpia de consumir el contexto en componentes funcionales.
 * @returns {ClientContextType} El valor del contexto, que incluye el estado y las funciones de manipulación.
 * @throws {Error} Lanza un error si el hook se utiliza fuera del árbol de un `ClientProvider`.
 */
export const useClientContext = (): ClientContextType => {
    const context = useContext(ClientContext);
    if (context === null) {
        throw new Error('useClientContext debe ser utilizado dentro de un ClientProvider');
    }
    return context;
};