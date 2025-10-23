import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
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
                title="Añadir Pago"
                onPress={onPay}
                iconName="arrow-down-circle-outline"
                buttonStyle={[
                    styles.mainActionButton,
                    { backgroundColor: theme.successLight, height: 90 },
                ]}
                textStyle={{ color: theme.success, fontSize: 20 }}
                iconColor={theme.success}
            />
            <CustomButton
                title="Añadir Deuda"
                onPress={onAddDebt}
                iconName="arrow-up-circle-outline"
                buttonStyle={[
                    styles.mainActionButton,

                    { backgroundColor: theme.errorLight, height: 90 },
                ]}
                textStyle={{ color: theme.error, fontSize: 20 }}
                iconColor={theme.error}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    actionsContainer: {
        flexDirection: 'column',
        gap: 16,
        marginBottom: 18,
    },
    mainActionButton: {
        flex: 1,
        paddingVertical: 24,
    },
});

export default MainActionButtons;
