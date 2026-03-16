// apuntao-app-master/utils/formatters.ts

/**
 * Utilidades de formateo
 * Contiene funciones para formatear datos para mostrar
 */

import { REGEX } from '../constants';

// formatName, formatNumberWithCommas, formatMoney, parseFormattedNumber (SIN CAMBIOS)
export const formatName = (name: string): string => {
    return name
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const formatNumberWithCommas = (value: string): string => {
    // Si hay un punto, separamos la parte entera de la decimal para no aplicar comas a los decimales
    const parts = value.split('.');
    parts[0] = parts[0].replace(REGEX.NUMBERS_ONLY, '').replace(REGEX.NUMBER_FORMAT, ',');
    if (parts.length > 1) {
        // Solo permitimos una parte decimal (tomamos la primera encontrada)
        return `${parts[0]}.${parts[1].replace(REGEX.NUMBERS_ONLY, '').slice(0, 2)}`;
    }
    return parts[0];
};

export const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('es-DO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(REGEX.NUMBERS_ONLY, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

    if (match) {
        let formatted = '';
        if (match[1]) formatted = `(${match[1]}`;
        if (match[2]) formatted += `) ${match[2]}`;
        if (match[3]) formatted += `-${match[3]}`;
        return formatted;
    }
    return value;
};

// --- FUNCIÓN MODIFICADA ---
/**
 * Formatea una fecha para mostrar en formato legible para República Dominicana.
 * @param dateInput - La fecha como timestamp, objeto Date o string ISO.
 * @returns Fecha formateada legible.
 */
export const formatDate = (dateInput: number | Date | string): string => {
    try {
        const date = new Date(dateInput);

        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            // ✅ CAMBIO CLAVE: Especificamos la zona horaria correcta para RD.
            // La lista de zonas horarias IANA es el estándar.
            timeZone: 'America/Santo_Domingo',
        };

        // Usamos 'es-DO' para el formato de idioma (nombres de meses/días).
        let formattedDate = new Intl.DateTimeFormat('es-DO', options).format(date);

        // Pequeños ajustes para que se vea más natural en español.
        formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        // Eliminado el reemplazo de ' de ' por ' del ' que causaba 'del marzo'
        formattedDate = formattedDate.replace(/\s?[ap]\.\s?m\./i, (match) =>
            match.trim().toLowerCase()
        );

        return formattedDate;
    } catch (error) {
        console.error('Error al formatear la fecha:', error);
        return 'Fecha inválida';
    }
};

/**
 * Formatea una fecha en 3 líneas separadas para mejor legibilidad en tarjetas.
 * @param dateInput - La fecha como timestamp, objeto Date o string ISO.
 * @returns String con saltos de línea (\n).
 */
export const formatDateThreeLines = (dateInput: number | Date | string): string => {
    try {
        const date = new Date(dateInput);
        const config = { timeZone: 'America/Santo_Domingo' };

        // Línea 1: Día de la semana y número (ej: Lunes 16)
        const line1 = new Intl.DateTimeFormat('es-DO', { 
            ...config, 
            weekday: 'long', 
            day: 'numeric' 
        }).format(date);

        // Línea 2: Mes y Año (ej: de marzo 2026)
        const line2 = new Intl.DateTimeFormat('es-DO', { 
            ...config, 
            month: 'long', 
            year: 'numeric' 
        }).format(date);

        // Línea 3: Hora (ej: 11:32 a. m.)
        const line3 = new Intl.DateTimeFormat('es-DO', { 
            ...config, 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        }).format(date).replace(/\s?[ap]\.\s?m\./i, (match) => match.trim().toLowerCase());

        // Capitalizar primera letra de la línea 1 y añadir "de" a la línea 2
        const capitalizedLine1 = line1.charAt(0).toUpperCase() + line1.slice(1);
        const formattedLine2 = `de ${line2}`;

        return `${capitalizedLine1}\n${formattedLine2}\n${line3}`;
    } catch (error) {
        return 'Fecha\ninválida\n--:--';
    }
};

export const parseFormattedNumber = (formattedNumber: string): number => {
    return Number.parseFloat(formattedNumber.replace(/,/g, ''));
};
