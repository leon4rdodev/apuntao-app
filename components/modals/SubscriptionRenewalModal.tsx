import ActionModal from '@/components/clientsScreen/ActionModal';
import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { SUPPORT_CONTACT } from '@/constants';
import { useSubscriptionModalStore } from '@/store/subscriptionModalStore';
import { Subscription } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Alert, View, useColorScheme } from 'react-native';

const getStatusText = (status: Subscription['status']) => {
    switch (status) {
        case 'expired':
            return 'Expirada';
        case 'cancelled':
            return 'Cancelada';
        case 'unknown':
            return 'Inactiva (Desconocido)';
        case 'trial':
            return 'de Prueba';
        default:
            return 'Inactiva';
    }
};

const handleWhatsAppRenewal = (hideModal: () => void) => {
    hideModal();
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

export default function SubscriptionRenewalModal() {
    const theme = Colors[useColorScheme() || 'light'];
    const { isVisible, status, hideModal } = useSubscriptionModalStore();

    const statusText = getStatusText(status);

    // Lógica para títulos más persuasivos
    const isRestricted = status === 'expired' || status === 'cancelled';

    const titleText = isRestricted
        ? '¡Tu Suscripción Finalizó!'
        : `¡Mantén el Control de tu Negocio!`;

    const subtitleText = isRestricted
        ? "Para seguir disfrutando de todas las funcionalidades de Apunta'o, como añadir movimientos y clientes, es necesario que renueves tu suscripción. ¡No te quedes atrás!"
        : 'Te invitamos a activar tu suscripción. Esto asegura que tus datos estén siempre seguros en la nube y te permite un control ilimitado de todas tus cuentas por cobrar.';

    const ModalContent = (
        <View style={styles.contentContainer}>
            <Ionicons name="sparkles-outline" size={60} color={theme.primary} />
            <CustomText size="large" weight="bold" style={styles.mainTitle}>
                {titleText}
            </CustomText>
            <CustomText size="medium" color={theme.textSecondary} style={styles.subtitle}>
                {subtitleText}
            </CustomText>

            <View style={[styles.statusBadge, { backgroundColor: theme.errorLight }]}>
                <CustomText size="medium" weight="bold" color={theme.text}>
                    Estado Actual:{' '}
                    <CustomText weight="bold" color={theme.error}>
                        {statusText}
                    </CustomText>
                </CustomText>
            </View>

            <CustomButton
                title="Renovar Ahora"
                onPress={() => handleWhatsAppRenewal(hideModal)}
                iconName="logo-whatsapp"
                buttonStyle={{ backgroundColor: theme.primary, marginTop: 20 }}
                textStyle={{ color: theme.textOnPrimary }}
                iconColor={theme.textOnPrimary}
            />

            <CustomButton
                title="Entendido, cerrarme esta ventana"
                onPress={hideModal}
                buttonStyle={{ backgroundColor: 'transparent' }}
                textStyle={{ color: theme.textSecondary, fontSize: 14 }}
            />
        </View>
    );

    const actions: any[] = []; 

    return (
        <ActionModal
            paddingBottom={16}
            isVisible={isVisible}
            onClose={hideModal}
            title={'Aviso Importante'}
            actions={actions}
        >
            {ModalContent}
        </ActionModal>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    mainTitle: {
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    statusBadge: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
        // Usaremos el errorLight del tema para un fondo más amigable pero claro
    },
});
