import CustomText from '@/components/ui/CustomText';
import { useSessionStore } from '@/store/sessionStore';
import { Client } from '@/types';
import { formatMoney, formatPhoneNumber } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import CustomButton from '../ui/CustomButton';
import { Colors } from '@/constants/Colors';

/**
 * @component ClientSummaryCard
 * @description Muestra la información principal del cliente, incluyendo deuda y datos de contacto.
 */
const ClientSummaryCard = ({ client, onEdit }: { client: Client; onEdit: () => void }) => {
    const theme = Colors[useColorScheme() || 'light'];
    const handleCall = () =>
        client.phone && Linking.openURL(`tel:${client.phone.replace(/-/g, '')}`);
    const handleWhatsApp = () => {
        if (!client.phone) return;
        
        const colmadoName = useSessionStore.getState().account?.colmadoName || "el colmado";
        const cleanPhone = client.phone.replace(/\D/g, '');
        
        let message = `Hola ${client.name}, te saludo de ${colmadoName}. `;
        if (client.debt > 0) {
            message += `Te escribo para recordarte tu balance pendiente de $${formatMoney(client.debt)}. ¡Muchas gracias!`;
        } else {
            message += `¡Muchas gracias por estar al día con tu cuenta!`;
        }

        Linking.openURL(`whatsapp://send?phone=1${cleanPhone}&text=${encodeURIComponent(message)}`);
    };

    const debtColor = client.debt > 0 ? theme.error : theme.success;

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
            <View style={styles.summaryHeader}>
                <CustomText size="xlarge" weight="bold" style={styles.clientName}>
                    {client.name}
                </CustomText>
                <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                    <Ionicons name="create-outline" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={[styles.debtContainer, { backgroundColor: theme.background }]}>
                 <CustomText
                    size="small"
                    weight="medium"
                    color={theme.textSecondary}
                    style={styles.debtLabel}
                >
                    Deuda Total
                </CustomText>

                <CustomText size="xxlarge" weight="bold" color={debtColor} style={styles.debtAmount}>
                    ${formatMoney(client.debt)}
                </CustomText>
            </View>

            {client.phone && (
                <View style={[styles.contactSection]}>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color={theme.textSecondary} />
                        <CustomText size="medium" weight="medium" color={theme.textSecondary}>
                            {formatPhoneNumber(client.phone)}
                        </CustomText>
                    </View>
                    <View style={styles.contactActions}>
                        <CustomButton
                            title="Llamar"
                            onPress={handleCall}
                            iconName="call"
                            buttonStyle={[styles.contactButton, { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.borderSubtle }]}
                            textStyle={{ color: theme.textSecondary }}
                            iconColor={theme.textSecondary}
                        />
                        <CustomButton
                            title="Mensaje"
                            onPress={handleWhatsApp}
                            iconName="logo-whatsapp"
                            buttonStyle={[styles.contactButton, { backgroundColor: '#dcfce7', borderWidth: 0 }]}
                            textStyle={{ color: '#166534' }}
                            iconColor="#166534"
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32, // Mayor espaciado hacia abajo
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1, // Para Android
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    clientName: {
        flex: 1,
        marginRight: 10,
    },
    editButton: {
        padding: 8,
        borderRadius: 100,
    },
    debtContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 4,
    },
    debtLabel: {
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    debtAmount: {
        fontSize: 42, 
    },
    contactSection: {
        marginTop: 20, // Mayor espaciado interno antes de contacto
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        justifyContent: 'center',
    },
    contactActions: {
        flexDirection: 'row',
        gap: 12,
    },
    contactButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 100,
    },
});

export default React.memo(ClientSummaryCard, (prevProps, nextProps) => {
    return (
        prevProps.client.id === nextProps.client.id &&
        prevProps.client.debt === nextProps.client.debt &&
        prevProps.client.phone === nextProps.client.phone &&
        prevProps.client.name === nextProps.client.name
    );
});
