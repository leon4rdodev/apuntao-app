import CustomButton from '@/components/ui/CustomButton';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

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
        <View style={styles.dangerZone}>
            {debt > 0 && (
                <CustomButton
                    title={'Saldar Deuda'}
                    onPress={onSettleDebt}
                    buttonStyle={[styles.secondaryButton, { backgroundColor: 'transparent', borderColor: theme.border, borderWidth: 1 }]}
                    iconName="checkmark-circle-outline"
                    iconColor={theme.primary}
                    textStyle={{ color: theme.text, fontWeight: '500' }}
                />
            )}
            {debt === 0 && (
            <CustomButton
                title="Eliminar Cliente"
                onPress={onDeleteClient}
                buttonStyle={[styles.secondaryButton, { backgroundColor: 'transparent', borderColor: theme.border, borderWidth: 1 }]}
                iconName="trash-outline"
                iconColor={theme.error}
                textStyle={{ color: theme.error, fontWeight: '500' }}
            />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    dangerZone: {
        alignItems: 'center',
        gap: 8,
        marginBottom: 32,
        marginTop: 8,
    },
    secondaryButton: {
        paddingVertical: 14,
        width: '100%',
        borderRadius: 100, // Forma de píldora
    },
});

export default React.memo(DangerZone);
