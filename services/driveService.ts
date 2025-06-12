/**
 * @file GoogleDriveService.ts
 * @description Servicio encapsulado para manejar todas las operaciones con la API de Google Drive.
 */

import { API_URLS, DRIVE_CONFIG, ERROR_MESSAGES } from '../constants';
import { handleError, makeRequest } from '../utils/network';
import { getAccessToken } from '../utils/storage';

/**
 * Clase estática que provee una interfaz para interactuar con Google Drive.
 * Abstrae la complejidad de la API de Google Drive para operaciones comunes
 * como buscar, crear, subir y descargar archivos.
 */
export class GoogleDriveService {
    /**
     * Realiza una petición autenticada a la API de Google Drive.
     * Es el método base para todas las interacciones con la API.
     * @private
     * @param {string} endpoint - El endpoint de la API al que se va a llamar (ej. 'files').
     * @param {RequestInit} [options={}] - Opciones para la petición fetch.
     * @returns {Promise<Response>} La respuesta cruda de la API.
     * @throws {Error} Si el token de acceso no está disponible o si la petición falla.
     */
    private static async _fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const token = await getAccessToken();
        if (!token) {
            throw new Error(ERROR_MESSAGES.TOKEN_UNAVAILABLE);
        }

        const url = `${API_URLS.GOOGLE_DRIVE_BASE}${endpoint}`;
        const finalOptions: RequestInit = {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            return await makeRequest(url, finalOptions);
        } catch (error) {
            handleError(error, `GoogleDriveService._fetch on endpoint: ${endpoint}`);
            throw error; // Re-lanza el error para que el método que llama pueda manejarlo.
        }
    }

    /**
     * Busca un recurso (archivo o carpeta) en Google Drive usando una consulta.
     * @private
     * @param {string} query - La consulta 'q' para la API de Google Drive.
     * @returns {Promise<string | null>} El ID del primer recurso encontrado, o null si no se encuentra.
     */
    private static async _searchByQuery(query: string): Promise<string | null> {
        const params = new URLSearchParams({
            q: query,
            fields: 'files(id)',
        });

        try {
            const response = await this._fetch(`files?${params.toString()}`);
            const data = await response.json();
            return data.files?.length > 0 ? data.files[0].id : null;
        } catch (error) {
            // Un error en la búsqueda no debería detener la app, se loguea y retorna null.
            handleError(error, 'GoogleDriveService._searchByQuery');
            return null;
        }
    }

    /**
     * Busca un archivo por su nombre dentro de una carpeta opcional.
     * @param {string} fileName - Nombre del archivo a buscar.
     * @param {string} [parentFolderId] - ID de la carpeta contenedora (opcional).
     * @returns {Promise<string | null>} El ID del archivo o null si no se encuentra.
     */
    static async searchFile(fileName: string, parentFolderId?: string): Promise<string | null> {
        let query = `name='${fileName}' and trashed=false`;
        if (parentFolderId) {
            query += ` and '${parentFolderId}' in parents`;
        }
        return this._searchByQuery(query);
    }

    /**
     * Busca una carpeta por su nombre.
     * @param {string} folderName - Nombre de la carpeta a buscar.
     * @returns {Promise<string | null>} El ID de la carpeta o null si no se encuentra.
     */
    static async searchFolder(folderName: string): Promise<string | null> {
        const query = `name='${folderName}' and mimeType='${DRIVE_CONFIG.FOLDER_MIME_TYPE}' and trashed=false`;
        return this._searchByQuery(query);
    }

    /**
     * Crea una nueva carpeta en Google Drive.
     * @param {string} folderName - Nombre de la carpeta a crear.
     * @param {string} [parentFolderId] - ID de la carpeta padre donde se creará (opcional).
     * @returns {Promise<string>} El ID de la carpeta recién creada.
     * @throws {Error} Si la creación de la carpeta falla.
     */
    static async createFolder(folderName: string, parentFolderId?: string): Promise<string> {
        const metadata: { name: string; mimeType: string; parents?: string[] } = {
            name: folderName,
            mimeType: DRIVE_CONFIG.FOLDER_MIME_TYPE,
        };

        if (parentFolderId) {
            metadata.parents = [parentFolderId];
        }

        const response = await this._fetch('files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadata),
        });

        const data = await response.json();
        if (!data.id) {
            throw new Error('No se pudo obtener el ID de la carpeta creada.');
        }
        return data.id;
    }

    /**
     * Actualiza el contenido de un archivo existente.
     * @private
     * @param {string} fileId - ID del archivo a actualizar.
     * @param {any} content - Contenido a escribir en el archivo (se convertirá a JSON).
     * @returns {Promise<any>} La respuesta de la API.
     */
    private static async _updateFile(fileId: string, content: any): Promise<any> {
        const response = await this._fetch(
            `${API_URLS.GOOGLE_DRIVE_UPLOAD_FILES}/${fileId}?uploadType=media`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': DRIVE_CONFIG.JSON_MIME_TYPE },
                body: JSON.stringify(content),
            }
        );
        return response.json();
    }

    /**
     * Crea un nuevo archivo con contenido.
     * @private
     * @param {string} fileName - Nombre del nuevo archivo.
     * @param {any} content - Contenido a escribir.
     * @param {string} folderId - ID de la carpeta donde se creará el archivo.
     * @returns {Promise<any>} La respuesta de la API.
     */
    private static async _createFile(
        fileName: string,
        content: any,
        folderId: string
    ): Promise<any> {
        // La creación con contenido se hace en dos pasos:
        // 1. Crear los metadatos del archivo.
        const metadata = {
            name: fileName,
            parents: [folderId],
            mimeType: DRIVE_CONFIG.JSON_MIME_TYPE,
        };
        const metaResponse = await this._fetch('files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadata),
        });
        const fileData = await metaResponse.json();
        if (!fileData.id) {
            throw new Error('Falló la creación de metadatos del archivo.');
        }

        // 2. Subir el contenido al archivo recién creado.
        return this._updateFile(fileData.id, content);
    }

    /**
     * Sube un archivo a Google Drive. Si ya existe, actualiza su contenido.
     * @param {string} folderId - ID de la carpeta destino.
     * @param {string} fileName - Nombre del archivo.
     * @param {any} content - Contenido del archivo (se convertirá a JSON).
     * @returns {Promise<any>} La respuesta de la API de Google Drive.
     */
    static async uploadOrUpdateFile(
        folderId: string,
        fileName: string,
        content: any
    ): Promise<any> {
        const existingFileId = await this.searchFile(fileName, folderId);

        if (existingFileId) {
            return this._updateFile(existingFileId, content);
        } else {
            return this._createFile(fileName, content, folderId);
        }
    }

    /**
     * Descarga y parsea el contenido de un archivo desde Google Drive.
     * @param {string} fileId - ID del archivo a descargar.
     * @returns {Promise<any>} El contenido del archivo parseado como JSON.
     */
    static async downloadFile(fileId: string): Promise<any> {
        const response = await this._fetch(`files/${fileId}?alt=media`);
        const textContent = await response.text();

        try {
            return JSON.parse(textContent);
        } catch (parseError) {
            handleError(parseError, 'GoogleDriveService.downloadFile - JSON parse error');
            // Devuelve el texto plano si no se puede parsear como JSON.
            return textContent;
        }
    }
}
