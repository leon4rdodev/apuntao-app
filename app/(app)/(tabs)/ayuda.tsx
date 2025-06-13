// apuntao-app-master/app/(app)/(tabs)/ayuda.tsx

import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
    useColorScheme,
} from 'react-native';

import ActionRow from '@/components/ui/ActionRow';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';

// Un pequeño componente local para renderizar cada pregunta y respuesta
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const theme = Colors[useColorScheme() || 'light'];
    return (
        <View style={[styles.faqItem, { borderTopColor: theme.borderSubtle }]}>
            <CustomText size="medium" weight="bold" style={styles.faqQuestion}>
                {question}
            </CustomText>
            <CustomText size="medium" color={theme.textSecondary} style={styles.faqAnswer}>
                {answer}
            </CustomText>
        </View>
    );
};

export default function AyudaScreen() {
    const theme = Colors[useColorScheme() || 'light'];

    // --- Datos para las Preguntas Frecuentes ---
    const faqs = [
        {
            q: '¿Mis datos están seguros?',
            a: 'Sí. Toda tu información se respalda de forma segura en una carpeta privada dentro de tu propia cuenta de Google Drive. Solo tú tienes acceso a ella.',
        },
        {
            q: '¿Qué pasa si cambio o pierdo mi teléfono?',
            a: 'No hay problema. Al iniciar sesión con tu misma cuenta de Google en un nuevo dispositivo, todos tus clientes y transacciones se restaurarán automáticamente.',
        },
        {
            q: '¿Cómo funciona la suscripción?',
            a: 'Comienzas con una prueba gratuita de 7 días con acceso a todas las funciones. Después, necesitarás una suscripción activa para seguir añadiendo clientes y transacciones.',
        },
        {
            q: '¿La aplicación funciona sin internet?',
            a: 'Sí. Puedes registrar clientes y transacciones sin conexión a internet. La próxima vez que te conectes, la aplicación sincronizará automáticamente tus datos con tu respaldo en Google Drive.',
        },
        {
            q: '¿Cómo elimino un cliente?',
            a: 'Para poder eliminar un cliente, primero debes asegurarte de que su deuda sea cero. Puedes registrar los pagos necesarios hasta que el balance llegue a $0 y luego aparecerá la opción para eliminarlo.',
        },
    ];

    // --- Funciones para Contactar a Soporte ---
    const handleWhatsAppPress = () => {
        // Reemplaza este número con tu número de soporte oficial
        const phoneNumber = '18091234567';
        const message = "Hola, necesito ayuda con la aplicación Apunta'o.";
        const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Asegúrate de tener WhatsApp instalado en tu dispositivo.');
        });
    };

    const handleEmailPress = () => {
        // Reemplaza con tu email de soporte
        const email = 'soporte@apuntao.app';
        const subject = "Soporte App Apunta'o";
        const url = `mailto:${email}?subject=${subject}`;

        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'No se pudo abrir la aplicación de correo.');
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
                <View
                    style={[
                        styles.card,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                >
                    <CustomText
                        size="small"
                        weight="bold"
                        color={theme.textSecondary}
                        style={styles.cardTitle}
                    >
                        Preguntas Frecuentes
                    </CustomText>
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.q} answer={faq.a} />
                    ))}
                </View>

                {/* --- Tarjeta de Contacto --- */}
                <View
                    style={[
                        styles.card,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                >
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        padding: 24,
        paddingTop: Constants.statusBarHeight + 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        maxWidth: '85%',
    },
    card: {
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 24,
        borderWidth: 1,
    },
    cardTitle: {
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    faqItem: {
        paddingVertical: 16,
        borderTopWidth: 1,
    },
    faqQuestion: {
        marginBottom: 6,
    },
    faqAnswer: {
        lineHeight: 22,
    },
});
