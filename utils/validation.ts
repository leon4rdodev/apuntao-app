/**
 * Utilidades de validación
 * Contiene funciones para validar datos de entrada
 */

import { REGEX, APP_LIMITS } from "../constants"

/**
 * Valida si un número de teléfono tiene el formato correcto
 * @param phone - Número de teléfono a validar
 * @returns true si el formato es válido
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  return REGEX.PHONE.test(phone)
}

/**
 * Valida si un nombre es válido
 * @param name - Nombre a validar
 * @returns true si el nombre es válido
 */
export const isValidName = (name: string): boolean => {
  const trimmedName = name.trim()
  return trimmedName.length >= APP_LIMITS.MIN_NAME_LENGTH && REGEX.NAME_ALLOWED_CHARS.test(trimmedName)
}

/**
 * Valida si una deuda es válida
 * @param debt - Monto de deuda a validar
 * @returns true si la deuda es válida
 */
export const isValidDebt = (debt: number): boolean => {
  return !isNaN(debt) && debt >= 0
}

/**
 * Valida si un monto es válido
 * @param amount - Monto a validar
 * @returns true si el monto es válido
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0
}

/**
 * Valida los datos de un cliente
 * @param name - Nombre del cliente
 * @param debt - Deuda del cliente
 * @param phone - Teléfono del cliente (opcional)
 * @returns Objeto con el resultado de la validación
 */
export const validateClientData = (
  name: string,
  debt: number,
  phone?: string,
): { isValid: boolean; error?: string } => {
  if (!isValidName(name)) {
    return {
      isValid: false,
      error:
        name.trim().length < APP_LIMITS.MIN_NAME_LENGTH
          ? "El nombre debe tener al menos 3 caracteres"
          : "El nombre contiene caracteres no válidos",
    }
  }

  if (debt > 0 && !isValidDebt(debt)) {
    return {
      isValid: false,
      error: "La deuda debe ser un número válido"
    }
  }

  if (phone && phone.trim() !== "" && !isValidPhoneNumber(phone)) {
    return {
      isValid: false,
      error: "El número de teléfono debe estar en el formato 000-000-0000",
    }
  }

  return { isValid: true }
}
