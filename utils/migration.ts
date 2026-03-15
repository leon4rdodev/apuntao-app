import { getFirestore, writeBatch, doc, collection } from '@react-native-firebase/firestore';

/**
 * Migra datos de la arquitectura antigua a la nueva estructura de Firebase.
 * @param jsonData El JSON completo exportado del negocio antiguo.
 * @param uid El UID del usuario actual en Firebase.
 */
export async function migrateLegacyData(jsonData: any, uid: string) {
    if (!jsonData || !uid) {
        throw new Error('JSON de migración o UID no proporcionado');
    }

    const db = getFirestore();
    const batch = writeBatch(db);
    const now = Date.now();

    // 1. Mapear datos del Negocio (Perfil del Usuario)
    const userRef = doc(db, 'users', uid);
    batch.set(userRef, {
        colmadoName: jsonData.colmadoName || 'Mi Negocio',
        phoneNumber: jsonData.phoneNumber || null,
        updatedAt: now, // Usamos número para consistencia con el resto de la app
    }, { merge: true });

    // 2. Procesar Clientes
    if (Array.isArray(jsonData.clients)) {
        const clientsCollection = collection(db, 'users', uid, 'clients');
        
        jsonData.clients.forEach((oldClient: any) => {
            // Saltamos si está marcado como borrado
            if (oldClient.deleted) return;

            // Generamos una referencia para el nuevo documento de cliente
            const clientRef = doc(clientsCollection);

            // Estructura del nuevo cliente compatible con el sistema actual
            const newClient = {
                id: clientRef.id,
                name: oldClient.name || 'Sin Nombre',
                phone: oldClient.phone || null,
                debt: Number(oldClient.debt) || 0,
                // Mapeamos transacciones si existen
                transactions: Array.isArray(oldClient.transactions) 
                    ? oldClient.transactions.map((tx: any) => ({
                        id: tx.id || `txn_${now}_${Math.random().toString(36).substr(2, 5)}`,
                        date: Number(tx.date) || now,
                        amount: Number(tx.amount) || 0,
                        type: tx.type === 'Pago' ? 'Pago' : 'Deuda',
                    }))
                    : [],
                lastModified: Number(oldClient.lastModified) || now,
                createdAt: now,
                deleted: false,
            };

            batch.set(clientRef, newClient);
        });
    }

    // 3. Ejecutar la migración
    try {
        await batch.commit();
        console.log('Migración completada con éxito');
        return { success: true, message: 'Datos migrados correctamente' };
    } catch (error) {
        console.error('Error durante la migración:', error);
        throw error;
    }
}
