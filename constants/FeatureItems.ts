import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';

export interface Feature {
    icon: string;
    iconLib: typeof Ionicons | typeof MaterialIcons | typeof Entypo;
    text: string;
    description?: string; // Ahora la descripción es parte del tipo
}

export interface OnboardingStep {
    icon: string;
    iconLib: typeof Ionicons | typeof MaterialIcons | typeof Entypo;
    title: string;
    subtitle: string;
    features: Feature[];
}

/**
 * Características que se muestran en la pantalla de Login.
 * Son concisas y refuerzan el valor principal antes de iniciar sesión.
 */
export const LoginFeatures: Feature[] = [
    {
        icon: 'book-outline',
        iconLib: Ionicons,
        text: 'Adiós al Caos del Papel',
        description:
            'Digitaliza tus cuentas y libérate del cuaderno. Tu información, siempre segura y a mano.',
    },
    {
        icon: 'cash-outline',
        iconLib: Ionicons,
        text: 'Control de tus Finanzas',
        description:
            'Visualiza deudas y abonos en tiempo real. Ten la claridad de cuánto tienes por cobrar.',
    },
    {
        icon: 'shield-checkmark-outline',
        iconLib: Ionicons,
        text: 'Seguridad de Clase Mundial',
        description:
            "Tus datos están protegidos y respaldados automáticamente. Tu negocio nunca se detiene.",
    },
];

/**
 * Pasos detallados del Onboarding.
 * Guían al usuario a través del problema, la solución y los beneficios.
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        icon: 'wallet-outline',
        iconLib: Ionicons,
        title: 'Tu Negocio en la\nPalma de tu Mano',
        subtitle:
            'Digitaliza tu cuaderno de fiado y recupera la tranquilidad. Maneja tus cuentas con precisión profesional.',
        features: [
            {
                icon: 'person-add-outline',
                iconLib: Ionicons,
                text: 'Registro Inteligente',
                description:
                    'Crea perfiles para tus clientes y mantén su historial de pagos bajo control.',
            },
            {
                icon: 'bar-chart-outline',
                iconLib: Ionicons,
                text: 'Balance al Instante',
                description:
                    'Apunta deudas y abonos en segundos. Nuestra app calcula los totales automáticamente.',
            },
            {
                icon: 'logo-whatsapp',
                iconLib: Ionicons,
                text: 'Cobros Efectivos',
                description: 'Envía estados de cuenta por WhatsApp con un solo toque. Más profesional.',
            },
        ],
    },
    {
        icon: 'shield-checkmark-outline',
        iconLib: Ionicons,
        title: 'Información Blindada\ny Segura',
        subtitle:
            "El cuaderno se pierde, Apunta'o no. Tus datos se sincronizan en la nube para que nunca pierdas ni un centavo.",
        features: [
            {
                icon: 'cloud-upload-outline',
                iconLib: Ionicons,
                text: 'Respaldo Infinito',
                description:
                    'Toda tu data se guarda automáticamente en servidores seguros. Protección 24/7.',
            },
            {
                icon: 'phone-portrait-outline',
                iconLib: Ionicons,
                text: 'Acceso en Cualquier Lugar',
                description:
                    'Cambia de teléfono sin miedo. Al iniciar sesión, todo tu progreso estará esperando por ti.',
            },
            {
                icon: 'lock-closed-outline',
                iconLib: Ionicons,
                text: 'Seguridad Biométrica',
                description:
                    'Asegura tus transacciones con Huella o Rostro. Solo tú tienes el control final.',
            },
        ],
    },
    {
        icon: 'rocket-outline',
        iconLib: Ionicons,
        title: 'Lleva tu Negocio al\nSiguiente Nivel',
        subtitle:
            "Únete a miles de comerciantes que han dejado atrás el caos y hoy disfrutan de un negocio más rentable.",
        features: [
            {
                icon: 'trending-up-outline',
                iconLib: Ionicons,
                text: 'Adiós a las Deudas Olvidadas',
                description:
                    'Recupera ese dinero que antes se quedaba en el olvido y aumenta tus ganancias.',
            },
            {
                icon: 'time-outline',
                iconLib: Ionicons,
                text: 'Máxima Eficiencia',
                description:
                    'Ahorra horas de cálculos manuales al final del día. Enfócate en vender.',
            },
            {
                icon: 'sparkles-outline',
                iconLib: Ionicons,
                text: 'Prestigio y Confianza',
                description:
                    'Impresiona a tus clientes con un sistema moderno y transparente. ¡Véndeles confianza!',
            },
        ],
    },
];
