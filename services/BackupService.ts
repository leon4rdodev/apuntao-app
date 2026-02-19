
import * as FileSystem from 'expo-file-system';
import { Client } from '@/types';

// Definimos la carpeta raíz para los backups
const BACKUP_ROOT = `${FileSystem.documentDirectory}backups/Master`;

/**
 * Servicio para gestionar las copias de seguridad locales
 * Mantiene un historial de 30 días de los datos completos.
 */
export class BackupService {
    
    /**
     * Inicializa la estructura de directorios si no existe
     */
    static async initialize() {
        try {
            const dirInfo = await FileSystem.getInfoAsync(BACKUP_ROOT);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(BACKUP_ROOT, { intermediates: true });
            }
        } catch (error) {
            console.error('Error inicializando BackupService:', error);
        }
    }

    /**
     * Crea un backup completo del estado actual de los clientes
     * @param clients - Lista completa de clientes
     * @param action - Nombre de la acción que disparó el backup (ej: 'ADD_CLIENT')
     */
    static async createBackup(clients: Client[], action: string = 'UNKNOWN') {
        try {
            await this.initialize();
            
            const now = new Date();
            const dateFolder = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-mm-ss
            
            const folderPath = `${BACKUP_ROOT}/${dateFolder}`;
            
            // Asegurar que la carpeta del día existe
            const folderInfo = await FileSystem.getInfoAsync(folderPath);
            if (!folderInfo.exists) {
                await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
            }

            const fileName = `backup_${timeString}_${action}.json`;
            const filePath = `${folderPath}/${fileName}`;
            
            const backupData = {
                timestamp: now.getTime(),
                action,
                clients,
            };

            await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));
            console.log(`✅ Backup creado: ${filePath}`);

            // Ejecutar limpieza asincrona (no bloquear el flujo principal)
            this.cleanupOldBackups();

        } catch (error) {
            console.error('❌ Error creando backup:', error);
        }
    }

    /**
     * Elimina carpetas de backups con más de 30 días de antigüedad
     */
    static async cleanupOldBackups() {
        try {
            const files = await FileSystem.readDirectoryAsync(BACKUP_ROOT);
            const now = new Date();
            const retentionDays = 30;

            for (const folderName of files) {
                // Asumimos que el nombre de la carpeta es una fecha YYYY-MM-DD
                const folderDate = new Date(folderName);
                
                // Si la fecha no es válida, saltamos (para no borrar cosas que no son fechas)
                if (isNaN(folderDate.getTime())) continue;

                const diffTime = Math.abs(now.getTime() - folderDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                if (diffDays > retentionDays) {
                    const params = { intermediates: true };
                    // En algunas versiones de expo, deleteAsync no acepta opciones, pero intentemos ser standard
                    await FileSystem.deleteAsync(`${BACKUP_ROOT}/${folderName}`, { idempotent: true });
                    console.log(`🗑️ Backup antiguo eliminado: ${folderName}`);
                }
            }
        } catch (error) {
            console.error('Error limpiando backups antiguos:', error);
        }
    }

    /**
     * Obtiene la lista de backups disponibles (útil para debug o restauración futura)
     */
    static async getBackupsList() {
        try {
            const folders = await FileSystem.readDirectoryAsync(BACKUP_ROOT);
            return folders;
        } catch (error) {
            return [];
        }
    }

    /**
     * Empaqueta todos los backups en un ZIP y permite compartirlo/guardarlo
     */
    static async exportBackups(): Promise<void> {
        try {
            console.log("📦 Iniciando exportación de backups...");
            const JSZip = require('jszip');
            const zip = new JSZip();
            const folders = await FileSystem.readDirectoryAsync(BACKUP_ROOT);

            // Recorrer carpetas de fechas
            for (const folder of folders) {
                const folderPath = `${BACKUP_ROOT}/${folder}`;
                const folderInfo = await FileSystem.getInfoAsync(folderPath);

                if (folderInfo.isDirectory) {
                    const files = await FileSystem.readDirectoryAsync(folderPath);
                    const folderZip = zip.folder(folder); // Crear carpeta en el ZIP

                    // Recorrer archivos dentro de la fecha
                    for (const file of files) {
                        const filePath = `${folderPath}/${file}`;
                        const content = await FileSystem.readAsStringAsync(filePath);
                        folderZip?.file(file, content);
                    }
                }
            }

            // Generar el archivo ZIP en base64
            const content = await zip.generateAsync({ type: 'base64' });
            
            // Guardar temporalmente
            const tempFile = `${FileSystem.cacheDirectory}apuntao_backups.zip`;
            await FileSystem.writeAsStringAsync(tempFile, content, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Compartir
            const Sharing = require('expo-sharing');
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(tempFile);
            } else {
                console.warn("Sharing is not available on this device");
            }

        } catch (error) {
            console.error("❌ Error exportando backups:", error);
            throw error; // Re-lanzar para manejar en la UI
        }
    }
}
