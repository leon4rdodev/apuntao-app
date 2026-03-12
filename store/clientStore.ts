import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createSQLiteStorage } from '@/utils/sqliteStorage';
import { 
    getFirestore, 
    collection, 
    doc, 
    onSnapshot, 
    query, 
    where, 
    addDoc, 
    updateDoc 
} from '@react-native-firebase/firestore';
import type { Client, Transaction } from '@/types';
import { useNotificationStore } from './notificationStore';

interface ClientState {
    clients: Client[];
    isLoading: boolean;
    unsubscribeSnapshot: (() => void) | null;
    actions: {
        startFirestoreSync: (uid: string) => void;
        stopFirestoreSync: () => void;
        addClient: (
            clientData: Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>,
            initialDebt?: number
        ) => Promise<Client>;
        updateClient: (clientId: string, updatedData: Pick<Client, 'name' | 'phone'>) => Promise<void>;
        deleteClient: (clientId: string) => Promise<void>;
        addTransaction: (clientId: string, transaction: Omit<Transaction, 'id'>) => Promise<void>;
        deleteTransaction: (clientId: string, transactionId: string) => Promise<void>;
        getClientById: (id: string) => Client | undefined;
        initializeClientsFromStorage: () => Promise<void>;
        mergeClients: () => void;
        processSyncQueue: () => Promise<void>;
    };
}

let currentUid: string | null = null;

const sqliteStorage = createSQLiteStorage('clients_v1.db');

export const useClientStore = create<ClientState>()(
    persist(
        (set, get) => ({
            clients: [],
            isLoading: false, 
            unsubscribeSnapshot: null,
            actions: {
                // ... (resto de las acciones igual)


        // 🔥 INICIA LA SINCRONIZACIÓN EN TIEMPO REAL CON FIRESTORE
        startFirestoreSync: (uid: string) => {
            currentUid = uid;
            
            const db = getFirestore();
            const { unsubscribeSnapshot } = get();
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
            }

            set({ isLoading: true });

            const clientsRef = collection(db, 'users', uid, 'clients');
            const q = query(clientsRef, where('deleted', '!=', true));

            const unsubscribe = onSnapshot(
                q,
                (querySnapshot) => {
                    const clientsList: Client[] = [];
                    querySnapshot.forEach((doc: any) => {
                        const data = doc.data();
                        
                        clientsList.push({
                            id: doc.id,
                            name: data.name || 'Cliente sin nombre',
                            phone: data.phone,
                            debt: typeof data.debt === 'number' ? Math.max(0, data.debt) : 0,
                            transactions: Array.isArray(data.transactions) ? data.transactions : [],
                            lastModified: data.lastModified || Date.now(),
                            deleted: data.deleted || false,
                        });
                    });
                    
                    clientsList.sort((a, b) => b.lastModified - a.lastModified);
                    set({ clients: clientsList, isLoading: false });
                },
                (error) => {
                    console.error('Error escuchando la colección de clientes:', error);
                    useNotificationStore.getState().show({
                        message: 'Error de conexión con la base de datos.',
                        type: 'error'
                    });
                }
            );

            set({ unsubscribeSnapshot: unsubscribe });
        },

        stopFirestoreSync: () => {
            const { unsubscribeSnapshot } = get();
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
                set({ unsubscribeSnapshot: null });
            }
            // Limpia los datos locales de memoria al cerrar sesión
            set({ clients: [], isLoading: false });
            currentUid = null;
        },

        addClient: async (clientData, initialDebt = 0) => {
            if (!currentUid) throw new Error("No hay usuario autenticado.");
            
            const db = getFirestore();
            
            // Si hay deuda inicial, preparamos la primera transacción
            const transactions: Transaction[] = [];
            if (initialDebt > 0) {
                transactions.push({
                    id: `txn_${Date.now()}_init`,
                    amount: initialDebt,
                    type: 'Deuda',
                    date: Date.now(),
                });
            }

            const newClient = {
                name: clientData.name,
                phone: clientData.phone || null,
                debt: initialDebt,
                transactions: transactions,
                lastModified: Date.now(),
                deleted: false,
            };

            const clientsRef = collection(db, 'users', currentUid, 'clients');
            const docRef = await addDoc(clientsRef, newClient);

            return { id: docRef.id, ...newClient } as Client;
        },

        updateClient: async (clientId, updatedData) => {
            if (!currentUid) return;
            const db = getFirestore();
            const now = Date.now();
            
            const clientRef = doc(db, 'users', currentUid, 'clients', clientId);
            await updateDoc(clientRef, {
                ...updatedData,
                lastModified: now
            });
        },

        deleteClient: async (clientId) => {
            if (!currentUid) return;
            const db = getFirestore();
            const clientRef = doc(db, 'users', currentUid, 'clients', clientId);
            await updateDoc(clientRef, {
                deleted: true,
                lastModified: Date.now()
            });
        },

        addTransaction: async (clientId, transaction) => {
            if (!currentUid) return;
            const db = getFirestore();
            
            const client = get().clients.find(c => c.id === clientId);
            if (!client) return;

            const debtChange = transaction.type === 'Deuda' ? transaction.amount : -transaction.amount;
            const newDebt = Math.max(0, client.debt + debtChange);
            const newTx: Transaction = {
                ...transaction,
                id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            };

            const clearTransactions = newDebt === 0;
            const finalTransactions = clearTransactions ? [] : [newTx, ...client.transactions];

            const clientRef = doc(db, 'users', currentUid, 'clients', clientId);
            await updateDoc(clientRef, {
                debt: newDebt,
                transactions: finalTransactions,
                lastModified: Date.now()
            });
        },

        deleteTransaction: async (clientId, transactionId) => {
            if (!currentUid) return;
            const db = getFirestore();

            const client = get().clients.find(c => c.id === clientId);
            if (!client) return;

            const tx = client.transactions.find(t => t.id === transactionId);
            if (!tx) return;

            const debtChange = tx.type === 'Deuda' ? -tx.amount : tx.amount;
            const newDebt = Math.max(0, client.debt + debtChange);
            const remaining = client.transactions.filter(t => t.id !== transactionId);
            const clearAll = newDebt === 0;

            const clientRef = doc(db, 'users', currentUid, 'clients', clientId);
            await updateDoc(clientRef, {
                debt: newDebt,
                transactions: clearAll ? [] : remaining,
                lastModified: Date.now()
            });
        },

        getClientById: (id) => get().clients.find((c) => c.id === id),

        // Mocks para evitar crasheos en componentes que no han sido refactorizados todavía
        initializeClientsFromStorage: async () => {},
        mergeClients: () => {},
        processSyncQueue: async () => {},
    },
}),
{
    name: 'client-storage',
    storage: createJSONStorage(() => sqliteStorage),
    partialize: (state) => ({ clients: state.clients } as any),
}
)
);



