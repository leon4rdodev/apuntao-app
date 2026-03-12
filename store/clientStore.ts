// store/clientStore.ts
import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';
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
            clientData: Omit<Client, 'id' | 'debt' | 'transactions' | 'lastModified'>
        ) => Promise<Client>;
        updateClient: (clientId: string, updatedData: Pick<Client, 'name' | 'phone'>) => Promise<void>;
        deleteClient: (clientId: string) => Promise<void>;
        addTransaction: (clientId: string, transaction: Omit<Transaction, 'id'>) => Promise<void>;
        deleteTransaction: (clientId: string, transactionId: string) => Promise<void>;
        getClientById: (id: string) => Client | undefined;
        // Funciones dejadas vacías para no romper interfaces de AuthContext que no se hayan borrado totalmente
        initializeClientsFromStorage: () => Promise<void>;
        mergeClients: () => void;
        processSyncQueue: () => Promise<void>;
    };
}

let currentUid: string | null = null;

export const useClientStore = create<ClientState>((set, get) => ({
    clients: [],
    isLoading: true,
    unsubscribeSnapshot: null,
    actions: {
        // 🔥 INICIA LA SINCRONIZACIÓN EN TIEMPO REAL CON FIRESTORE
        startFirestoreSync: (uid: string) => {
            currentUid = uid;
            
            // Si ya hay una suscripción activa, no hacer nada o detenerla
            const { unsubscribeSnapshot } = get();
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
            }

            set({ isLoading: true });

            const unsubscribe = firestore()
                .collection('users')
                .doc(uid)
                .collection('clients')
                .where('deleted', '!=', true) // Solo traer los NO eliminados lógicamente (o los que no tengan el campo deleted en true)
                .onSnapshot(
                    (querySnapshot) => {
                        const clientsList: Client[] = [];
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            
                            // Aseguramos que la data en Firestore se parezca a nuestra interface
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
                        
                        // Ordenar por lastModified descendente si se desea, o alfabéticamente
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

        addClient: async (clientData) => {
            if (!currentUid) throw new Error("No hay usuario autenticado.");
            
            const newClient = {
                name: clientData.name,
                phone: clientData.phone || null,
                debt: 0,
                transactions: [],
                lastModified: Date.now(),
                deleted: false,
            };

            // Firestore genera el ID automáticamente
            const docRef = await firestore()
                .collection('users')
                .doc(currentUid)
                .collection('clients')
                .add(newClient);

            return { id: docRef.id, ...newClient } as Client;
        },

        updateClient: async (clientId, updatedData) => {
            if (!currentUid) return;
            const now = Date.now();
            
            await firestore()
                .collection('users')
                .doc(currentUid)
                .collection('clients')
                .doc(clientId)
                .update({
                    ...updatedData,
                    lastModified: now
                });
        },

        deleteClient: async (clientId) => {
            if (!currentUid) return;
            // Soft delete en Firestore
            await firestore()
                .collection('users')
                .doc(currentUid)
                .collection('clients')
                .doc(clientId)
                .update({
                    deleted: true,
                    lastModified: Date.now()
                });
        },

        addTransaction: async (clientId, transaction) => {
            if (!currentUid) return;
            
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

            await firestore()
                .collection('users')
                .doc(currentUid)
                .collection('clients')
                .doc(clientId)
                .update({
                    debt: newDebt,
                    transactions: finalTransactions,
                    lastModified: Date.now()
                });
        },

        deleteTransaction: async (clientId, transactionId) => {
            if (!currentUid) return;

            const client = get().clients.find(c => c.id === clientId);
            if (!client) return;

            const tx = client.transactions.find(t => t.id === transactionId);
            if (!tx) return;

            const debtChange = tx.type === 'Deuda' ? -tx.amount : tx.amount;
            const newDebt = Math.max(0, client.debt + debtChange);
            const remaining = client.transactions.filter(t => t.id !== transactionId);
            const clearAll = newDebt === 0;

            await firestore()
                .collection('users')
                .doc(currentUid)
                .collection('clients')
                .doc(clientId)
                .update({
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
}));
