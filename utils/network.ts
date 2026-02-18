/**
 * Utilidades de red
 * Contiene funciones para manejo de conexiones y requests
 */

import { APP_CONFIG, ERROR_MESSAGES } from "../constants"

/**
 * Verifica si hay conexión a internet
 * @returns Promise que resuelve true si hay conexión
 */
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch("https://www.google.com", { method: "HEAD" })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Realiza una petición HTTP con reintentos automáticos
 * @param url - URL de la petición
 * @param options - Opciones de la petición
 * @param maxRetries - Número máximo de reintentos
 * @returns Promise con la respuesta
 */
export const makeRequest = async (
  url: string,
  options: RequestInit,
  maxRetries = APP_CONFIG.MAX_API_RETRIES,
): Promise<Response> => {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      const isConnected = await checkNetworkConnection()
      if (!isConnected) {
        throw new Error(ERROR_MESSAGES.NO_CONNECTION)
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers as Record<string, string>),
          Accept: "application/json",
          "Content-Type":
            options.method === "PATCH"
              ? "application/json"
              : (options.headers as Record<string, string>)?.["Content-Type"],
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        // Espera exponencial entre reintentos
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }
  }

  throw lastError!
}

/**
 * Maneja errores de la aplicación de forma centralizada
 * @param error - Error capturado
 * @param context - Contexto donde ocurrió el error
 */
export const handleError = (error: any, context: string): void => {
  const errorMessage = error instanceof Error ? error.message : "Error desconocido"
  console.error(`Error en ${context}:`, error)

  // Aquí se podría integrar un servicio de logging como Sentry
  // Sentry.captureException(error, { tags: { context } });
}
