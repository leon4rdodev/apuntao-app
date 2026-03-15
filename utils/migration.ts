/**
 * @file utils/migration.ts
 * @description Utilidad refinada para migrar datos de clientes y movimientos desde el formato antiguo
 * al nuevo esquema de Firestore. Solo importa la colección de clientes y sus transacciones.
 */

import { getFirestore, writeBatch, collection, doc } from '@react-native-firebase/firestore';

interface LegacyTransaction {
    id: string;
    date: number;
    amount: number;
    type: 'Deuda' | 'Pago';
}

interface LegacyClient {
    id: string;
    name: string;
    debt: number;
    transactions: LegacyTransaction[];
    lastModified: number;
    phone?: string;
}

interface LegacyData {
    clients: LegacyClient[];
}

/**
 * Migra solo los clientes y sus movimientos al perfil del usuario.
 * No modifica el documento de perfil del usuario.
 */
export async function migrateLegacyData(uid: string, data: LegacyData) {
    const db = getFirestore();
    const batch = writeBatch(db);
    const now = Date.now();

    const clients = data.clients || [];
    const userClientsRef = collection(db, 'users', uid, 'clients');

    for (const oldClient of clients) {
        // Generamos o usamos el ID del cliente
        const clientRef = doc(userClientsRef, oldClient.id);

        const newClient = {
            name: oldClient.name || 'Sin nombre',
            phone: oldClient.phone || null,
            debt: Number(oldClient.debt) || 0,
            transactions: Array.isArray(oldClient.transactions) 
                ? oldClient.transactions.map(t => ({
                    id: t.id,
                    date: Number(t.date) || now,
                    amount: Number(t.amount) || 0,
                    type: t.type === 'Pago' ? 'Pago' : 'Deuda'
                }))
                : [],
            lastModified: Number(oldClient.lastModified) || now,
            deleted: false,
        };

        batch.set(clientRef, newClient, { merge: true });
    }

    await batch.commit();
    return clients.length;
}
