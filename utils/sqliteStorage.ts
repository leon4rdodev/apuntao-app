import { StateStorage } from 'zustand/middleware';
import * as SQLite from 'expo-sqlite';

const TABLE_NAME = 'zustand_persistence';

/**
 * Motor de persistencia para Zustand basado en SQLite.
 */
export const createSQLiteStorage = (dbName: string = 'apuntao_local.db'): StateStorage => {
    const dbPromise = SQLite.openDatabaseAsync(dbName).then(async (db) => {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
                id TEXT PRIMARY KEY NOT NULL,
                value TEXT NOT NULL
            );
        `);
        return db;
    });

    return {
        getItem: async (name: string): Promise<string | null> => {
            const db = await dbPromise;
            const result = await db.getFirstAsync<{ value: string }>(
                `SELECT value FROM ${TABLE_NAME} WHERE id = ?`,
                [name]
            );
            return result ? result.value : null;
        },
        setItem: async (name: string, value: string): Promise<void> => {
            const db = await dbPromise;
            await db.runAsync(
                `INSERT OR REPLACE INTO ${TABLE_NAME} (id, value) VALUES (?, ?)`,
                [name, value]
            );
        },
        removeItem: async (name: string): Promise<void> => {
            const db = await dbPromise;
            await db.runAsync(
                `DELETE FROM ${TABLE_NAME} WHERE id = ?`,
                [name]
            );
        },
    };
};

