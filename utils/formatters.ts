/**
 * Utilidades de formateo
 * Contiene funciones para formatear datos para mostrar
 */

import { REGEX } from "../constants"

/**
 * Formatea un nombre aplicando capitalización correcta
 * @param name - Nombre a formatear
 * @returns Nombre formateado
 */
export const formatName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Formatea un número agregando comas como separadores de miles
 * @param value - Valor a formatear
 * @returns Valor formateado con comas
 */
export const formatNumberWithCommas = (value: string): string => {
  const cleaned = value.replace(REGEX.NUMBERS_ONLY, "")
  return cleaned.replace(REGEX.NUMBER_FORMAT, ",")
}

/**
 * Formatea un monto de dinero para mostrar
 * @param amount - Monto a formatear
 * @returns Monto formateado con comas
 */
export const formatMoney = (amount: number): string => {
  return amount.toString().replace(REGEX.NUMBER_FORMAT, ",")
}

/**
 * Formatea un número de teléfono con guiones
 * @param value - Número a formatear
 * @returns Número formateado como 000-000-0000
 */
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(REGEX.NUMBERS_ONLY, "")
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)

  if (match) {
    let formatted = match[1]
    if (match[2]) formatted += `-${match[2]}`
    if (match[3]) formatted += `-${match[3]}`
    return formatted
  }
  return value
}

/**
 * Formatea una fecha para mostrar en formato legible
 * @param dateString - Fecha en formato ISO
 * @returns Fecha formateada como DD/MM/YYYY HH:MM
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Convierte un string con formato de número a número
 * @param formattedNumber - Número formateado con comas
 * @returns Número parseado
 */
export const parseFormattedNumber = (formattedNumber: string): number => {
  return Number.parseFloat(formattedNumber.replace(/,/g, ""))
}
