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
        text: 'Adiós al Cuaderno de Papel',
        description:
            'Tu información se respalda automáticamente en la nube. ¡Nunca más pierdas una cuenta!',
    },
    {
        icon: 'cash-outline',
        iconLib: Ionicons,
        text: 'Control Total de tu Dinero',
        description:
            'Registra deudas y pagos al instante. Mira quién te debe y cuánto con un solo toque.',
    },
    {
        icon: 'people-circle-outline',
        iconLib: Ionicons,
        text: 'Únete a la Comunidad',
        description:
            "Más de 1,000 colmaderos y negociantes ya usan y confían en Apunta'o para crecer.",
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
        title: '¡Que no se te escape ni un peso!',
        subtitle:
            'Digitaliza tu cuaderno de fiado y ten el control total de tus cuentas por cobrar, sin enredos.',
        features: [
            {
                icon: 'person-add-outline',
                iconLib: Ionicons,
                text: 'Anota Quién te Debe',
                description:
                    'Crea un perfil para cada cliente con su nombre y teléfono. ¡Todo organizado!',
            },
            {
                icon: 'bar-chart-outline',
                iconLib: Ionicons,
                text: 'Registra Cada Movimiento',
                description:
                    'Apunta las deudas nuevas y los pagos (abonos) en segundos. Cero errores.',
            },
            {
                icon: 'logo-whatsapp',
                iconLib: Ionicons,
                text: 'Cobra con un Toque',
                description: 'Envía recordatorios de pago por WhatsApp directamente desde la app.',
            },
        ],
    },
    {
        icon: 'shield-checkmark-outline',
        iconLib: Ionicons,
        title: 'Tu Negocio, Seguro y Siempre Contigo',
        subtitle:
            "El cuaderno se puede mojar, perder o dañar. Con Apunta'o, tu información está protegida y accesible 24/7.",
        features: [
            {
                icon: 'cloud-upload-outline',
                iconLib: Ionicons,
                text: 'Respaldo en la Nube',
                description:
                    'Toda tu data se guarda automáticamente en la nube. ¡Seguridad total!',
            },
            {
                icon: 'phone-portrait-outline',
                iconLib: Ionicons,
                text: 'Sincronización Mágica',
                description:
                    'Usa la app en tu teléfono o tablet. Si cambias de equipo, tu información viaja contigo.',
            },
            {
                icon: 'lock-closed-outline',
                iconLib: Ionicons,
                text: 'Privacidad Garantizada',
                description:
                    'Tus datos son tuyos y de nadie más. Protegidos en tu cuenta personal.',
            },
        ],
    },
    {
        icon: 'rocket-outline',
        iconLib: Ionicons,
        title: 'Listo para Crecer tu Negocio',
        subtitle:
            "Únete a más de mil comerciantes que han transformado su negocio con Apunta'o. ¡Es tu turno de dejar de perder dinero!",
        features: [
            {
                icon: 'trending-up-outline',
                iconLib: Ionicons,
                text: 'Menos Pérdidas, Más Ganancias',
                description:
                    'Al tener un control claro, reduces las deudas olvidadas y aumentas tus ingresos.',
            },
            {
                icon: 'time-outline',
                iconLib: Ionicons,
                text: 'Ahorra Tiempo Valioso',
                description:
                    'La app calcula los totales por ti para que te dediques a lo más importante: vender.',
            },
            {
                icon: 'sparkles-outline',
                iconLib: Ionicons,
                text: 'Imagen Profesional',
                description:
                    'Impresiona a tus clientes con un sistema moderno y transparente. ¡Genera más confianza!',
            },
        ],
    },
];
