import { Colors } from '@/constants/Colors';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

// Importamos nuestro nuevo componente y su tipo de datos 'Feature'.
import FeatureCard, { Feature } from '@/components/ui/FeatureCard';

const { height } = Dimensions.get('window');

// --- INTERFACES ---
interface OnboardingStep {
    icon: string;
    iconLib: typeof Ionicons | typeof MaterialIcons | typeof Entypo;
    title: string;
    subtitle: string;
    features: Feature[]; // Usamos la interfaz 'Feature' importada
}

interface OnboardingScreenProps {
    onFinish?: () => void;
    onLogin?: () => void;
}

// --- DATA ---
const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        icon: 'book-outline',
        iconLib: Ionicons,
        title: '¿Te han quedado mal con los fiados?',
        subtitle:
            "¡Se acabó esa vaina! Con Apunta'o, vas a tener todo controlado sin complicaciones.",
        features: [
            {
                icon: 'person-add-alt-1',
                iconLib: MaterialIcons,
                text: 'Registra todos tus clientes fácilmente.',
            },
            { icon: 'bar-graph', iconLib: Entypo, text: 'Anota deudas y abonos al instante.' },
            {
                icon: 'logo-whatsapp',
                iconLib: Ionicons,
                text: 'Cobra a tus clientes por WhatsApp.',
            },
        ],
    },
    {
        icon: 'shield-checkmark-outline',
        iconLib: Ionicons,
        title: 'Tu información segura y a la mano',
        subtitle:
            'Olvida los cuadernos perdidos y las cuentas confusas. Todo se guarda en la nube.',
        features: [
            {
                icon: 'cloud-upload-outline',
                iconLib: Ionicons,
                text: 'Respaldo automático en la nube.',
            },
            {
                icon: 'phone-portrait-outline',
                iconLib: Ionicons,
                text: 'Accede desde cualquier teléfono.',
            },
            {
                icon: 'lock-closed-outline',
                iconLib: Ionicons,
                text: 'Solo tú puedes ver tus datos.',
            },
        ],
    },
    {
        icon: 'rocket-outline',
        iconLib: Ionicons,
        title: 'Listo para empezar',
        subtitle: 'Únete a cientos de comerciantes que ya no pierden dinero.',
        features: [
            { icon: 'gift', iconLib: Ionicons, text: 'Prueba todas las funciones por 7 días.' },
            {
                icon: 'card-outline',
                iconLib: Ionicons,
                text: 'Sin necesidad de tarjeta de crédito.',
            },
            {
                icon: 'close-circle-outline',
                iconLib: Ionicons,
                text: 'Cancela cuando quieras, sin líos.',
            },
        ],
    },
];

// --- COMPONENTES AUXILIARES (Solo los que pertenecen a esta pantalla) ---
const PaginationDot: React.FC<{ index: number; activeIndex: number; theme: any }> = ({
    index,
    activeIndex,
    theme,
}) => {
    const animatedStyle = useAnimatedStyle(() => {
        const isActive = index === activeIndex;
        const scale = withTiming(isActive ? 1.3 : 1, { duration: 200 });
        const backgroundColor = withTiming(isActive ? theme.primary : theme.border, {
            duration: 200,
        });
        return { transform: [{ scale }], backgroundColor };
    }, [activeIndex]);

    return <Animated.View style={[styles.dot, animatedStyle]} />;
};

// --- COMPONENTE PRINCIPAL ---
export default function OnboardingScreen({ onFinish, onLogin }: OnboardingScreenProps) {
    const [step, setStep] = useState<number>(0);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme || 'light'];
    const router = useRouter();

    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 500 });
    }, [opacity, step]);

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const handleNext = (): void => {
        if (step < ONBOARDING_STEPS.length - 1) {
            opacity.value = withTiming(0, { duration: 300 }, (finished) => {
                if (finished) {
                    runOnJS(setStep)(step + 1);
                }
            });
        }
    };

    const handleStart = (): void => onFinish?.();
    const handleLogin = (): void => (onLogin ? onLogin() : router.replace('/(auth)/login'));

    const currentStep = ONBOARDING_STEPS[step];
    const IconComponent = currentStep.iconLib;

    return (
        <View
            style={[
                styles.safeArea,
                { backgroundColor: theme.background, paddingTop: Constants.statusBarHeight },
            ]}
        >
            <ScrollView
                style={{ backgroundColor: theme.background }}
                showsVerticalScrollIndicator={false}
                bounces={false}
                key={step}
            >
                <Animated.View style={[styles.content, contentAnimatedStyle]}>
                    <View style={styles.stepHeader}>
                        <IconComponent
                            name={currentStep.icon as any}
                            size={40}
                            color={theme.primary}
                        />
                    </View>
                    <Text style={[styles.mainTitle, { color: theme.text }]}>
                        {currentStep.title}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {currentStep.subtitle}
                    </Text>
                    <View style={styles.featuresContainer}>
                        {currentStep.features.map((feature, index) => (
                            <FeatureCard key={index} feature={feature} theme={theme} />
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>

            <View
                style={[
                    styles.bottomNav,
                    { backgroundColor: theme.surface, borderTopColor: theme.border },
                ]}
            >
                <View style={styles.dotsContainer}>
                    {ONBOARDING_STEPS.map((_, index) => (
                        <PaginationDot key={index} index={index} activeIndex={step} theme={theme} />
                    ))}
                </View>
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                    onPress={step === ONBOARDING_STEPS.length - 1 ? handleStart : handleNext}
                    activeOpacity={0.8}
                >
                    {step === ONBOARDING_STEPS.length - 1 ? (
                        <>
                            <Ionicons name="rocket" size={20} color={theme.textOnPrimary} />
                            <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
                                EMPEZAR PRUEBA GRATIS
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
                                Siguiente
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color={theme.textOnPrimary} />
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleLogin}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
                        ¿Ya tienes una cuenta?
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    content: {
        paddingHorizontal: 24,
        paddingTop: height * 0.05,
        paddingBottom: 24,
    },
    stepHeader: {
        alignItems: 'center',
        marginBottom: 24,
        height: 60,
        justifyContent: 'center',
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    featuresContainer: { gap: 16 },
    bottomNav: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    primaryButton: {
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        paddingVertical: 12,
        marginTop: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
