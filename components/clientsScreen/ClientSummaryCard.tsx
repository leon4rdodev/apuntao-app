import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { Client } from '@/types';
import { formatMoney, formatPhoneNumber } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import CustomButton from '../ui/CustomButton';

/**
 * @component ClientSummaryCard
 * @description Muestra la información principal del cliente, incluyendo deuda y datos de contacto.
 */
const ClientSummaryCard = ({ client, onEdit }: { client: Client; onEdit: () => void }) => {
    const theme = Colors[useColorScheme() || 'light'];
    const handleCall = () =>
        client.phone && Linking.openURL(`tel:${client.phone.replace(/-/g, '')}`);
    const handleWhatsApp = () =>
        client.phone && Linking.openURL(`https://wa.me/1${client.phone.replace(/-/g, '')}`);

    const debtColor = client.debt > 0 ? theme.error : theme.success;

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.summaryHeader}>
                <CustomText size="xlarge" weight="bold" style={styles.clientName}>
                    {client.name}
                </CustomText>
                <TouchableOpacity onPress={onEdit}>
                    <Ionicons name="pencil-outline" size={22} color={theme.primary} />
                </TouchableOpacity>
            </View>

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

            {client.phone && (
                <View style={[styles.contactSection, { borderTopColor: theme.border }]}>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color={theme.textSecondary} />
                        <CustomText size="medium" weight="medium">
                            {formatPhoneNumber(client.phone)}
                        </CustomText>
                    </View>
                    <View style={styles.contactActions}>
                        <CustomButton
                            title="Llamar"
                            onPress={handleCall}
                            iconName="call"
                            buttonStyle={[styles.contactButton, { backgroundColor: theme.info }]}
                            textStyle={{ color: theme.textOnPrimary }}
                            iconColor={theme.textOnPrimary}
                        />
                        <CustomButton
                            title="WhatsApp"
                            onPress={handleWhatsApp}
                            iconName="logo-whatsapp"
                            buttonStyle={[styles.contactButton, { backgroundColor: '#25D366' }]}
                            textStyle={{ color: theme.textOnPrimary }}
                            iconColor={theme.textOnPrimary}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

// Se han agregado los estilos faltantes para que el componente funcione
const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 18,
        borderWidth: 1,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    clientName: {
        flex: 1,
        marginRight: 10,
        lineHeight: 34, // Ajusta la altura de línea para textos grandes
    },
    debtLabel: {
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    debtAmount: {
        fontSize: 48, // Se mantiene un tamaño grande específico para la deuda
        textAlign: 'center',
        marginBottom: 16,
    },
    contactSection: {
        borderTopWidth: 1,
        marginTop: 12,
        paddingTop: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
