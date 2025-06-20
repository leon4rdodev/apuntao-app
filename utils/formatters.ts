/**
 * Utilidades de formateo
 * Contiene funciones para formatear datos para mostrar
 */

import { REGEX } from '../constants';

/**
 * Formatea un nombre aplicando capitalización correcta
 * @param name - Nombre a formatear
 * @returns Nombre formateado
 */
export const formatName = (name: string): string => {
    return name
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Formatea un número agregando comas como separadores de miles
 * @param value - Valor a formatear
 * @returns Valor formateado con comas
 */
export const formatNumberWithCommas = (value: string): string => {
    const cleaned = value.replace(REGEX.NUMBERS_ONLY, '');
    return cleaned.replace(REGEX.NUMBER_FORMAT, ',');
};

/**
 * Formatea un monto de dinero para mostrar
 * @param amount - Monto a formatear
 * @returns Monto formateado con comas
 */
export const formatMoney = (amount: number): string => {
    return amount.toString().replace(REGEX.NUMBER_FORMAT, ',');
};

/**
 * Formatea un número de teléfono con guiones
 * @param value - Número a formatear
 * @returns Número formateado como 000-000-0000
 */
export const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(REGEX.NUMBERS_ONLY, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

    if (match) {
        let formatted = match[1];
        if (match[2]) formatted += `-${match[2]}`;
        if (match[3]) formatted += `-${match[3]}`;
        return formatted;
    }
    return value;
};

/**
 * --- FUNCIÓN MODIFICADA ---
 * Formatea una fecha para mostrar en formato legible y amigable, incluyendo la hora.
 * @param dateInput - Fecha en formato ISO (ej. "2026-05-05T12:30:00.000Z") o un objeto Date.
 * @returns Fecha formateada como "Martes, 5 de mayo del 2026, 8:30 a. m."
 */
export const formatDate = (dateInput: string | Date): string => {
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

        // Opciones para el formato deseado
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long', // "Lunes", "Martes", etc.
            year: 'numeric', // "2026"
            month: 'long', // "enero", "febrero", etc.
            day: 'numeric', // "5"
            hour: 'numeric', // "8"
            minute: '2-digit', // "30"
            hour12: true, // Usar formato de 12 horas (AM/PM)
            timeZone: 'UTC',
        };

        // Usamos el localizador 'es-DO' para español de República Dominicana
        let formattedDate = new Intl.DateTimeFormat('es-DO', options).format(date);

        // `Intl` devuelve "martes, 5 de mayo de 2026, 8:30 a. m."
        // Ajustamos las mayúsculas y la preposición "de" por "del"
        formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        formattedDate = formattedDate.replace(' de ', ' del ');

        // El formato de hora puede variar (p. ej., 'a. m.' vs 'a.m.'). Normalizamos.
        formattedDate = formattedDate.replace(/\s?[ap]\.\s?m\./i, (match) =>
            match.trim().toLowerCase()
        );

        return formattedDate;
    } catch (error) {
        console.error('Error al formatear la fecha:', error);
        return 'Fecha inválida'; // Retornar un valor por defecto en caso de error
    }
};

/**
 * Convierte un string con formato de número a número
 * @param formattedNumber - Número formateado con comas
 * @returns Número parseado
 */
export const parseFormattedNumber = (formattedNumber: string): number => {
    return Number.parseFloat(formattedNumber.replace(/,/g, ''));
};
