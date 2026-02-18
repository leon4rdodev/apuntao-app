/**
 * Utilidades de almacenamiento
 * Contiene funciones para manejo de AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { STORAGE_KEYS } from "../constants"
import { handleError } from "./network"

/**
 * Guarda datos en AsyncStorage de forma segura
 * @param key - Clave de almacenamiento
 * @param data - Datos a guardar
 */ 
export const saveToStorage = async <T>(key: string, data: T)
: Promise<void> =>
{
  try {
    const jsonData = JSON.stringify(data)
    await AsyncStorage.setItem(key, jsonData)
  } catch (error: any) {
    handleError(error, `saveToStorage - ${key}`)
    throw error
  }
}

/**
 * Obtiene datos de AsyncStorage de forma segura
 * @param key - Clave de almacenamiento
 * @returns Datos parseados o null si no existen
 */
export const getFromStorage = async <T>(key: string)
: Promise<T | null> =>
{
  try {
    const jsonData = await AsyncStorage.getItem(key)
    return jsonData ? JSON.parse(jsonData) : null;
  } catch (error: any) {
    handleError(error, `getFromStorage - ${key}`)
    return null;
  }
}

/**
 * Elimina datos de AsyncStorage
 * @param key - Clave de almacenamiento
 */
export const removeFromStorage = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key)
  } catch (error: any) {
    handleError(error, `removeFromStorage - ${key}`)
    throw error
  }
}

/**
 * Verifica si existe una clave en AsyncStorage
 * @param key - Clave a verificar
 * @returns true si la clave existe
 */
export const existsInStorage = async (key: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(key)
    return value !== null
  } catch (error: any) {
    handleError(error, `existsInStorage - ${key}`)
    return false
  }
}

/**
 * Obtiene el token de acceso almacenado
 * @returns Token de acceso o null
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const authData = await getFromStorage<any>(STORAGE_KEYS.APP_SESSION)
    return authData?.accessToken || null
  } catch (error: any) {
    handleError(error, "getAccessToken")
    return null
  }
}
