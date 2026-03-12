import CustomButton from '@/components/ui/CustomButton';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';

/**
 * @component DangerZone
 * @description Sección con acciones secundarias o destructivas.
 */
const DangerZone = ({
    debt,
    onSettleDebt,
    onDeleteClient,
}: {
    debt: number;
    onSettleDebt: () => void;
    onDeleteClient: () => void;
}) => {
    const theme = Colors[useColorScheme() || 'light'];
    return (
        // Se aplica el color del borde desde el tema para consistencia
        <View style={[styles.dangerZone, { borderTopColor: theme.border }]}>
            {debt > 0 && (
                <CustomButton
                    title={'Saldar Deuda'}
                    onPress={onSettleDebt}
                    buttonStyle={[styles.secondaryButton, { borderColor: theme.primary }]}
                    iconName="checkmark-circle-outline"
                    iconColor={theme.primary}
                    textStyle={{ color: theme.primary }}
                />
            )}
            {debt === 0 && (
            <CustomButton
                title="Eliminar Cliente"
                onPress={onDeleteClient}
                buttonStyle={[styles.secondaryButton, { borderColor: theme.error }]}
                iconName="trash-outline"
                iconColor={theme.error}
                textStyle={{ color: theme.error }}
            />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    dangerZone: {
        alignItems: 'center',
        gap: 18,
    },
    secondaryButton: {
        paddingVertical: 10,
        width: '100%',
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
});

export default React.memo(DangerZone);
