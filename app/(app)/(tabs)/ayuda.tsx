// app/(app)/(tabs)/ayuda.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ActionRow from '@/components/ui/ActionRow';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/store/notificationStore';
import { ERROR_MESSAGES, SUPPORT_CONTACT } from '@/constants';

// Array estático fuera del componente
const FAQS = [
    {
        q: '¿Mis datos están seguros?',
        a: "¡Totalmente! Apunta'o utiliza la tecnología de Google Firebase para respaldar tu información en tiempo real. Aunque pierdas tu teléfono, tus deudas y clientes siempre estarán a salvo en tu cuenta.",
    },
    {
        q: '¿Cómo funciona la seguridad biométrica?',
        a: 'Puedes activar la Huella o Rostro desde los Ajustes en tu pestaña de Cuenta. Una vez activo, la app te pedirá verificar tu identidad antes de realizar pagos, deudas, borrar movimientos o eliminar clientes.',
    },
    {
        q: '¿Puedo usar la app sin internet?',
        a: 'Sí, la app está diseñada para trabajar fuera de línea. Puedes anotar todo lo que necesites y, en cuanto recuperes la conexión, los datos se sincronizarán automáticamente con la nube.',
    },
    {
        q: '¿Por qué no puedo eliminar a un cliente?',
        a: 'Por seguridad, el sistema solo permite eliminar clientes que tengan su deuda en $0. De esta forma evitamos que borres accidentalmente a alguien que aún te debe dinero.',
    },
    {
        q: '¿Cómo funciona la suscripción?',
        a: 'Ofrecemos una prueba gratuita para que explores todas las funciones. Una vez vencida, puedes renovarla contactándonos directamente por WhatsApp para mantener tu negocio al día.',
    },
];

function FAQItem({ question, answer, borderColor }: {
    question: string;
    answer: string;
    borderColor: string;
}) {
    return (
        <View style={[styles.faqItem, { borderTopColor: borderColor }]}>
            <CustomText size="medium" weight="bold" style={styles.faqQuestion}>
                {question}
            </CustomText>
            <CustomText size="medium" style={styles.faqAnswer}>
                {answer}
            </CustomText>
        </View>
    );
}

export default function AyudaScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const insets = useSafeAreaInsets();
    const showNotification = useNotification();

    const handleWhatsAppPress = useCallback(() => {
        const url = `whatsapp://send?phone=${SUPPORT_CONTACT.WHATSAPP_NUMBER}&text=${encodeURIComponent(SUPPORT_CONTACT.WHATSAPP_MESSAGE)}`;
        Linking.openURL(url).catch(() => {
            showNotification({
                message: ERROR_MESSAGES.WHATSAPP_UNAVAILABLE,
                type: 'error',
            });
        });
    }, [showNotification]);

    const handleEmailPress = useCallback(() => {
        const url = `mailto:${SUPPORT_CONTACT.EMAIL_ADDRESS}?subject=${SUPPORT_CONTACT.EMAIL_SUBJECT}`;
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
                {/* --- Cabecera Premium --- */}
                <View style={styles.header}>
                    <View style={[styles.iconWrapper, { backgroundColor: theme.primaryLight }]}>
                        <Ionicons name="help-circle" size={32} color={theme.primary} />
                    </View>
                    <CustomText size="xxlarge" weight="bold" style={styles.title}>
                        Preguntas Frecuentes
                    </CustomText>
                    <CustomText size="medium" color={theme.textSecondary} style={styles.subtitle}>
                        Encuentra respuestas rápidas para aprovechar Apunta&apos;o al máximo.
                    </CustomText>
                </View>

                {/* --- Preguntas Frecuentes --- */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                    {FAQS.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.q}
                            answer={faq.a}
                            borderColor={index === 0 ? 'transparent' : theme.borderSubtle}
                        />
                    ))}
                </View>

                {/* --- Tarjeta de Soporte Directo --- */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                    <CustomText
                        size="small"
                        weight="bold"
                        color={theme.textSecondary}
                        style={styles.cardTitle}
                    >
                        ¿Necesitas hablar con nosotros?
                    </CustomText>
                    <ActionRow
                        icon="logo-whatsapp"
                        text="Contactar por WhatsApp"
                        onPress={handleWhatsAppPress}
                        theme={theme}
                    />
                    <ActionRow
                        icon="mail"
                        text="Enviar un Correo"
                        onPress={handleEmailPress}
                        theme={theme}
                    />
                </View>

                <CustomText size="small" color={theme.textSecondary} style={styles.footerText}>
                    Estamos disponibles para ayudarte de Lunes a Sábado de 9:00 AM a 6:00 PM.
                </CustomText>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { 
        padding: 20, 
        paddingBottom: 40 
    },
    header: { alignItems: 'center', marginBottom: 32 },
    iconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: { marginBottom: 10, textAlign: 'center' },
    subtitle: { textAlign: 'center', maxWidth: '85%', lineHeight: 22 },
    card: {
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 4, // Menos arriba para FAQ items
        paddingBottom: 4,
        marginBottom: 20,
        borderWidth: 1,
    },
    cardTitle: { 
        textTransform: 'uppercase', 
        letterSpacing: 0.5, 
        marginTop: 16,
        marginBottom: 12,
        marginLeft: 4,
    },
    faqItem: { paddingVertical: 20, borderTopWidth: 1 },
    faqQuestion: { marginBottom: 8, lineHeight: 24 },
    faqAnswer: { lineHeight: 22, opacity: 0.7 },
    footerText: { textAlign: 'center', marginTop: 12, opacity: 0.5, paddingHorizontal: 20 },
});

