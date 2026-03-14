import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useSessionStore } from '@/store/sessionStore';
import CustomText from '@/components/ui/CustomText';
import CustomButton from '@/components/ui/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { SUPPORT_CONTACT } from '@/constants';
import { Linking, Alert } from 'react-native';

interface Props {
    children: React.ReactNode;
}

export default function SubscriptionBlocker({ children }: Props) {
    const theme = Colors[useColorScheme() || 'light'];
    const subscription = useSessionStore((state) => state.subscription);

    const isRestricted =
        subscription.status === 'expired' ||
        subscription.status === 'cancelled' ||
        subscription.status === 'unknown';

    const handleRenewal = () => {
        const { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } = SUPPORT_CONTACT;
        const renewalMessage = WHATSAPP_MESSAGE.replace(
            'ayuda con la aplicación',
            "renovación de mi suscripción para Apunta'o."
        );
        const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(
            renewalMessage
        )}`;

        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Asegúrate de tener WhatsApp instalado en tu dispositivo.');
        });
    };

    if (!isRestricted) {
        return <>{children}</>;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.contentOverlay, { backgroundColor: theme.surface }]}>
                <Ionicons name="lock-closed-outline" size={80} color={theme.error} />
                <CustomText size="xlarge" weight="bold" style={styles.title} color={theme.text}>
                    ¡Tu Suscripción Finalizó!
                </CustomText>
                
                <CustomText size="medium" color={theme.textSecondary} style={styles.subtitle}>
                    Para seguir disfrutando de todas las funcionalidades de Apunta'o, es necesario que renueves tu suscripción. ¡No pierdas el control de tu negocio!
                </CustomText>

                <CustomButton
                    title="Renovar Ahora"
                    onPress={handleRenewal}
                    iconName="logo-whatsapp"
                    buttonStyle={[styles.button, { backgroundColor: theme.primary }]}
                    textStyle={{ color: theme.textOnPrimary }}
                    iconColor={theme.textOnPrimary}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    contentOverlay: {
        width: '100%',
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        marginTop: 24,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 100,
    },
});
