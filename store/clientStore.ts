/**
 * @file store/clientStore.ts
 * @description Store de Zustand para gestionar los clientes.
 * Usa Firestore como única fuente de verdad con persistencia offline nativa.
 * onSnapshot entrega primero desde el caché local (sin red) y luego sincroniza
 * en segundo plano — arquitectura offline-first sin capas adicionales.
 */

import { create } from 'zustand';
import {
    getFirestore,
    collection,
    doc,
    onSnapshot,
    query,
    where,
    setDoc,
    updateDoc,
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
    };
}

let currentUid: string | null = null;

export const useClientStore = create<ClientState>()((set, get) => ({
    clients: [],
    isLoading: false,
    unsubscribeSnapshot: null,
    actions: {

        // 🔥 INICIA LA SINCRONIZACIÓN EN TIEMPO REAL CON FIRESTORE
        // Firestore entrega caché local primero (offline-first) y sincroniza en segundo plano.
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
                { includeMetadataChanges: false },
                (querySnapshot) => {
                    const clientsList: Client[] = [];
                    querySnapshot.forEach((docSnap: any) => {
                        const data = docSnap.data();
                        clientsList.push({
                            id: docSnap.id,
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
                    console.error('[clientStore] Error en onSnapshot:', error);
                    set({ isLoading: false });
                    useNotificationStore.getState().show({
                        message: 'Error de conexión con la base de datos.',
                        type: 'error',
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
            set({ clients: [], isLoading: false });
            currentUid = null;
        },

        addClient: async (clientData, initialDebt = 0) => {
            if (!currentUid) throw new Error('No hay usuario autenticado.');

            const db = getFirestore();
            const clientsRef = collection(db, 'users', currentUid, 'clients');
            // doc() genera un ID real localmente — sin necesidad de red.
            const docRef = doc(clientsRef);

            const transactions: Transaction[] = [];
            if (initialDebt > 0) {
                transactions.push({
                    id: `txn_${Date.now()}_init`,
                    amount: initialDebt,
                    type: 'Deuda',
                    date: Date.now(),
                });
            }

            const newClientData = {
                name: clientData.name,
                phone: clientData.phone || undefined,
                debt: initialDebt,
                transactions,
                lastModified: Date.now(),
                deleted: false,
            };

            const localClient: Client = {
                id: docRef.id,
                ...newClientData
            };

            // 1. Actualización Optimista (Instantánea en la UI)
            set({ clients: [localClient, ...get().clients].sort((a,b) => b.lastModified - a.lastModified) });

            // 2. Sincronización en segundo plano (Fire-and-forget)
            setDoc(docRef, newClientData).catch((e) => {
                if (
                    !e?.message?.toLowerCase().includes('offline') &&
                    !e?.message?.toLowerCase().includes('network')
                ) {
                    console.error('[clientStore] Error inesperado al guardar cliente:', e);
                }
            });

            return localClient;
        },

        updateClient: async (clientId, updatedData) => {
            if (!currentUid) return;

            const now = Date.now();
            
            // 1. Actualización Optimista
            set({
                clients: get().clients.map(c => 
                    c.id === clientId ? { ...c, ...updatedData, lastModified: now } : c
                )
            });

            // 2. Sincronización en segundo plano
            const db = getFirestore();
            const clientRef = doc(db, 'users', currentUid, 'clients', clientId);
            updateDoc(clientRef, { ...updatedData, lastModified: now }).catch(e => console.error(e));
        },

        deleteClient: async (clientId) => {
            if (!currentUid) return;

            const now = Date.now();

            // 1. Actualización Optimista (lo ocultamos de la UI localmente)
            set({
                clients: get().clients.map(c => 
                    c.id === clientId ? { ...c, deleted: true, lastModified: now } : c
                )
            });

            // 2. Sincronización en segundo plano
            const db = getFirestore();
            const clientRef = doc(db, 'users', currentUid, 'clients', clientId);
            updateDoc(clientRef, { deleted: true, lastModified: now }).catch(e => console.error(e));
        },

        addTransaction: async (clientId, transaction) => {
            if (!currentUid) return;

            const client = get().clients.find((c) => c.id === clientId);
            if (!client) return;

            const now = Date.now();
            const debtChange = transaction.type === 'Deuda' ? transaction.amount : -transaction.amount;
            const newDebt = Math.max(0, client.debt + debtChange);
            const newTx: Transaction = {
                ...transaction,
                id: `txn_${now}_${Math.random().toString(36).substring(2, 9)}`,
            };

            const clearTransactions = newDebt === 0;
            const finalTransactions = clearTransactions ? [] : [newTx, ...client.transactions];

            // 1. Actualización Optimista
            set({
                clients: get().clients.map(c => 
                    c.id === clientId 
                    ? { ...c, debt: newDebt, transactions: finalTransactions, lastModified: now } 
                    : c
                ).sort((a,b) => b.lastModified - a.lastModified)
            });

            // 2. Sincronización en segundo plano
            const db = getFirestore();
            const clientRef = doc(db, 'users', currentUid, 'clients', clientId);
            updateDoc(clientRef, {
                debt: newDebt,
                transactions: finalTransactions,
                lastModified: now,
            }).catch(e => console.error(e));
        },

        deleteTransaction: async (clientId, transactionId) => {
            if (!currentUid) return;

            const client = get().clients.find((c) => c.id === clientId);
            if (!client) return;

            const tx = client.transactions.find((t) => t.id === transactionId);
            if (!tx) return;

            const now = Date.now();
            const debtChange = tx.type === 'Deuda' ? -tx.amount : tx.amount;
            const newDebt = Math.max(0, client.debt + debtChange);
            const remaining = client.transactions.filter((t) => t.id !== transactionId);
            const finalTransactions = newDebt === 0 ? [] : remaining;

            // 1. Actualización Optimista
            set({
                clients: get().clients.map(c => 
                    c.id === clientId 
                    ? { ...c, debt: newDebt, transactions: finalTransactions, lastModified: now } 
                    : c
                ).sort((a,b) => b.lastModified - a.lastModified)
            });

            // 2. Sincronización en segundo plano
            const db = getFirestore();
            const clientRef = doc(db, 'users', currentUid, 'clients', clientId);
            updateDoc(clientRef, {
                debt: newDebt,
                transactions: finalTransactions,
                lastModified: now,
            }).catch(e => console.error(e));
        },

        getClientById: (id) => get().clients.find((c) => c.id === id),
    },
}));
