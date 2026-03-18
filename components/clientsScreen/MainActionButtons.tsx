import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import CustomButton from '../ui/CustomButton';

/**
 * @component MainActionButtons
 * @description Contiene los botones de acción principales para añadir o pagar deudas.
 */
const MainActionButtons = ({ onPay, onAddDebt }: { onPay: () => void; onAddDebt: () => void }) => {
    const theme = Colors[useColorScheme() || 'light'];
    return (
        <View style={styles.actionsContainer}>
            <CustomButton
                title="Pago"
                onPress={onPay}
                iconName="add-circle"
                buttonStyle={[
                    styles.mainActionButton,
                    { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 },
                ]}
                textStyle={{ color: theme.success, fontSize: 18, fontWeight: '600' }}
                iconColor={theme.success}
            />
            <CustomButton
                title="Deuda"
                onPress={onAddDebt}
                iconName="remove-circle"
                buttonStyle={[
                    styles.mainActionButton,
                    { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 },
                ]}
                textStyle={{ color: theme.error, fontSize: 18, fontWeight: '600' }}
                iconColor={theme.error}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    mainActionButton: {
        flex: 1,
        paddingVertical: 18,
        borderRadius: 100,
        height: 'auto',
    },
});

export default React.memo(MainActionButtons);
