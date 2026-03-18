/**
 * Paleta de colores rediseñada para una mayor consistencia y escalabilidad.
 * Los nombres son semánticos, describiendo el "propósito" del color, no el color en sí.
 */

// --- COLORES BASE ---
// Definimos los colores principales una sola vez para reutilizarlos.
const BRAND_PRIMARY = '#16a34a'; // Verde principal de la marca (Apunta'o)

// --- PALETA EXPORTADA ---
export const Colors = {
    light: {
        // --- Marca (Brand) ---
        primary: BRAND_PRIMARY,
        primaryLight: '#dcfce7', // Un tono más claro para fondos o highlights sutiles
        primaryDark: '#14532d', // Un tono más oscuro para estados "presionado" (pressed)

        // --- Texto ---
        text: '#111827', // Texto principal (casi negro, un gris muy oscuro)
        textSecondary: '#6b7280', // Texto secundario, para subtítulos o placeholders (gris medio)
        textOnPrimary: '#ffffff', // Texto que va sobre un fondo de color primario (blanco)

        // --- Fondos y Superficies (La clave de la consistencia) ---
        background: '#f8fafc',
        green: '#f0fdf4', // Fondo principal de la app (un gris muy claro, casi blanco)
        surface: '#ffffff', // Fondo para elementos que "flotan" sobre el fondo (tarjetas, modales)

        // --- Bordes y Separadores ---
        border: '#e5e7eb', // Borde estándar para inputs, tarjetas, etc.
        borderSubtle: '#f3f4f6', // Un borde aún más sutil para separadores de listas

        // --- Semánticos (Estados) ---
        success: '#22c55e',
        successLight: '#dcfce7',
        error: '#ef4444',
        errorLight: '#fee2e2',
        warning: '#f59e0b',
        warningLight: '#fef3c7',
        info: '#3b82f6',

        // --- Compatibilidad con Expo Router Tabs ---
        tint: BRAND_PRIMARY,
        tabIconDefault: '#6b7280', // Coincide con textSecondary
        tabIconSelected: BRAND_PRIMARY,

        // Input
        inputBackground: '#F3F4F6', // Fondo de inputs, un gris claro

        // Botón (Estado Deshabilitado)
        buttonDisabled: '#E2E8F0',
        buttonTextDisabled: '#94A3B8',
    },
    dark: {
        // --- Marca (Brand) ---
        primary: '#22c55e',
        primaryLight: '#166534',
        primaryDark: '#15803d',

        // --- Texto ---
        text: '#f1f1f1',
        textSecondary: '#aaaaaa',
        textOnPrimary: '#ffffff',

        // --- Fondos y Superficies ---
        background: '#0f0f0f', // Similar al fondo de YouTube
        surface: '#1e1e1e', // Para tarjetas u otros elementos elevados

        // --- Bordes y Separadores ---
        border: '#3d3d3d',
        borderSubtle: '#2a2a2a',

        // --- Semánticos (Estados) ---
        success: '#4ade80',
        successLight: '#14532d',
        error: '#f87171',
        errorLight: '#450a0a',
        warning: '#facc15',
        warningLight: '#78350f',
        info: '#60a5fa',

        // --- Compatibilidad con Expo Router Tabs ---
        tint: '#22c55e',
        tabIconDefault: '#aaaaaa',
        tabIconSelected: '#22c55e',
        green: '#f0fdf4',

        // Input
        inputBackground: '#2c2c2c', // Fondo de inputs similar a YouTube en dark mode

        // Botón (Estado Deshabilitado)
        buttonDisabled: '#3d3d3d', // Original border
        buttonTextDisabled: '#aaaaaa', // Original textSecondary
    },
};
