
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

            const content = JSON.stringify(backupData, null, 2);
            await FileSystem.writeAsStringAsync(filePath, content);
            console.log(`✅ Backup creado: ${filePath}`);

            // 🔥 INTENTAR GUARDAR EN EXTERNO (si está configurado)
            await this.copyToExternalStorage(fileName, content, dateFolder);

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
            throw error;
        }
    }

    static async setupExternalStorage(): Promise<boolean> {
        try {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            
            if (permissions.granted) {
                const uri = permissions.directoryUri;
                const { saveToStorage } = require('@/utils/storage');
                
                await saveToStorage('EXTERNAL_BACKUP_URI', uri);
                console.log('✅ URI de respaldo externo guardada:', uri);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error configurando almacenamiento externo:', error);
            return false;
        }
    }

    /**
     * Intenta guardar una copia del backup en la carpeta externa configurada.
     */
    /**
     * Intenta guardar una copia del backup en la carpeta externa configurada.
     */
    private static async copyToExternalStorage(fileName: string, content: string, dateFolder: string) {
        try {
            const { getFromStorage } = require('@/utils/storage');
            const rootExternalUri = await getFromStorage('EXTERNAL_BACKUP_URI');

            if (!rootExternalUri) return;

            // Obtener (o crear) la subcarpeta del día
            const targetFolderUri = await this.getExternalDateFolderUri(rootExternalUri, dateFolder);
            
            if (!targetFolderUri) {
                 console.warn('⚠️ No se pudo obtener la carpeta del día en almacenamiento externo.');
                 return;
            }

            const mimeType = 'application/json';
            
            // Crear el archivo en la subcarpeta
            const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                targetFolderUri,
                fileName,
                mimeType
            );

            await FileSystem.writeAsStringAsync(newFileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
            console.log(`🌍 Backup copiado externamente en ${dateFolder}: ${newFileUri}`);

        } catch (error) {
            console.warn('⚠️ Fallo respaldo externo:', error);
        }
    }

    /**
     * Obtiene la URI de la subcarpeta de fecha (ej: 2023-10-27) dentro del root externo.
     * Usa caché para evitar escanear directorios en cada operación.
     */
    private static async getExternalDateFolderUri(rootUri: string, folderName: string): Promise<string | null> {
        try {
            const { getFromStorage, saveToStorage } = require('@/utils/storage');
            const cacheKey = `EXT_URI_CACHE_${folderName}`;
            
            // 1. Intentar obtener del caché
            const cachedUri = await getFromStorage(cacheKey);
            if (cachedUri) {
                // Verificar rápidamente si sigue siendo accesible (opcional, pero SAF a veces revoca)
                // Para mantenerlo rápido, asumimos que es válido. Si falla al escribir, el usuario se enterará.
                return cachedUri;
            }

            // 2. Si no está en caché, buscar en el directorio root
            // SAF no tiene "exists()", hay que listar.
            const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(rootUri);
            
            // Buscar si ya existe la carpeta (SAF devuelve URIs, necesitamos decodificarlas o buscar por nombre si expone eso)
            // Desafortunadamente SAF devuelve URIs completas. 
            // TRUCO: Intentar crearla. Si ya existe, SAF suele lanzar error o devolver la existente dependiendo de la implementación.
            // Pero en Android SAF, makeDirectoryAsync suele fallar si existe.
            
            // Vamos a iterar y decodificar es lento. Mejor estrategia:
            // Intentar crear la carpeta directamente. 
            try {
                const newFolderUri = await FileSystem.StorageAccessFramework.makeDirectoryAsync(rootUri, folderName);
                // Si tiene éxito, guardamos en caché
                await saveToStorage(cacheKey, newFolderUri);
                return newFolderUri;
            } catch (e: any) {
                // Si falla, probablemente ya existe. 
                // En ese caso, TENEMOS que buscarla en la lista para obtener su URI.
                // No hay de otra.
                
                // Nota: Los nombres de archivo en las URIs de SAF están URL-encoded.
                // Una carpeta llamada "2023-10-27" tendrá ese string en su URI.
                const targetUri = files.find(uri => decodeURIComponent(uri).endsWith(folderName) || decodeURIComponent(uri).endsWith(folderName + '/'));
                
                if (targetUri) {
                    await saveToStorage(cacheKey, targetUri);
                    return targetUri;
                } else {
                    console.error('❌ No se pudo crear ni encontrar la carpeta externa:', folderName);
                    return null;
                }
            }

        } catch (error) {
            console.error('Error gestionando carpetas externas:', error);
            return null; // Fallback: guardar en raíz si esto falla? No, mejor no guardar para no desordenar.
        }
    }
}
