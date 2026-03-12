// apuntao-app-master/app/(app)/(tabs)/ayuda.tsx

import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useCallback } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    View,
    useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ActionRow from '@/components/ui/ActionRow';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/store/notificationStore';
import { ERROR_MESSAGES } from '@/constants';

// Array estático fuera del componente — no se recrea en cada render
const FAQS = [
    {
        q: '¿Mis datos están seguros?',
        a: 'Sí. Toda tu información se respalda de forma segura en la nube con Firebase. Solo tú tienes acceso a ella.',
    },
    {
        q: '¿Qué pasa si cambio o pierdo mi teléfono?',
        a: 'No hay problema. Al iniciar sesión con tu misma cuenta en un nuevo dispositivo, todos tus clientes y transacciones se restaurarán automáticamente.',
    },
    {
        q: '¿Cómo funciona la suscripción?',
        a: 'Comienzas con una prueba gratuita de 7 días con acceso a todas las funciones. Después, necesitarás una suscripción activa para seguir añadiendo clientes y transacciones.',
    },
    {
        q: '¿La aplicación funciona sin internet?',
        a: 'Sí. Puedes registrar clientes y transacciones sin conexión. La próxima vez que te conectes, la aplicación sincronizará automáticamente.',
    },
    {
        q: '¿Cómo elimino un cliente?',
        a: 'Para eliminar un cliente, asegúrate de que su deuda sea cero. Una vez en $0 aparecerá la opción para eliminarlo.',
    },
];

// Memoizado: nunca se re-renderiza porque props nunca cambian desde el padre
const FAQItem = React.memo(({ question, answer, borderColor }: {
    question: string;
    answer: string;
    borderColor: string;
}) => (
    <View style={[styles.faqItem, { borderTopColor: borderColor }]}>
        <CustomText size="medium" weight="bold" style={styles.faqQuestion}>
            {question}
        </CustomText>
        <CustomText size="medium" style={styles.faqAnswer}>
            {answer}
        </CustomText>
    </View>
));

export default function AyudaScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const insets = useSafeAreaInsets();
    const showNotification = useNotification();

    const handleWhatsAppPress = useCallback(() => {
        const phoneNumber = '18096654820';
        const message = "Hola, necesito ayuda con la aplicación Apunta'o.";
        const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Asegúrate de tener WhatsApp instalado en tu dispositivo.');
        });
    }, []);

    const handleEmailPress = useCallback(() => {
        const email = 'soporte@apuntao.app';
        const subject = "Soporte App Apunta'o";
        const url = `mailto:${email}?subject=${subject}`;
        Linking.openURL(url).catch(() => {
            showNotification({
                message: ERROR_MESSAGES.EMAIL_APP_UNAVAILABLE,
                type: 'error',
            });
        });
    }, [showNotification]);

    return (
        <View
            style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* --- Cabecera --- */}
                <View style={styles.header}>
                    <Ionicons name="help-buoy-outline" size={48} color={theme.primary} />
                    <CustomText size="xlarge" weight="bold" style={styles.title}>
                        Centro de Ayuda
                    </CustomText>
                    <CustomText size="medium" color={theme.textSecondary} style={styles.subtitle}>
                        Encuentra respuestas a tus dudas o contáctanos directamente.
                    </CustomText>
                </View>

                {/* --- Tarjeta de Preguntas Frecuentes --- */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <CustomText
                        size="small"
                        weight="bold"
                        color={theme.textSecondary}
                        style={styles.cardTitle}
                    >
                        Preguntas Frecuentes
                    </CustomText>
                    {FAQS.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.q}
                            answer={faq.a}
                            borderColor={theme.borderSubtle}
                        />
                    ))}
                </View>

                {/* --- Tarjeta de Contacto --- */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <CustomText
                        size="small"
                        weight="bold"
                        color={theme.textSecondary}
                        style={styles.cardTitle}
                    >
                        ¿Necesitas más ayuda?
                    </CustomText>
                    <ActionRow
                        icon="logo-whatsapp"
                        text="Contactar por WhatsApp"
                        onPress={handleWhatsAppPress}
                        theme={theme}
                    />
                    <ActionRow
                        icon="mail-outline"
                        text="Enviar un Email"
                        onPress={handleEmailPress}
                        theme={theme}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { padding: 18, paddingTop: 12, paddingBottom: 40 },
    header: { alignItems: 'center', marginBottom: 32 },
    title: { marginTop: 16, marginBottom: 8 },
    subtitle: { textAlign: 'center', maxWidth: '85%' },
    card: {
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 24,
        borderWidth: 1,
    },
    cardTitle: { textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    faqItem: { paddingVertical: 16, borderTopWidth: 1 },
    faqQuestion: { marginBottom: 6 },
    faqAnswer: { lineHeight: 22 },
});
