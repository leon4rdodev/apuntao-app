import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../ui/CustomButton';
import PaginationDot from './ui/PaginationDot';

interface Props {
    step: number;
    totalSteps: number;
    theme: any;
    onNext: () => void;
    onLoginPress: () => void;
    onRegisterPress: () => void;
}

export default function OnboardingFooter({
    step,
    totalSteps,
    theme,
    onNext,
    onLoginPress,
    onRegisterPress,
}: Props) {
    const isLast = step === totalSteps - 1;

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: theme.surface, borderTopColor: theme.border },
            ]}
        >
            <View style={styles.dotsContainer}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <PaginationDot key={index} index={index} activeIndex={step} theme={theme} />
                ))}
            </View>

            <CustomButton
                title={isLast ? 'EMPEZAR PRUEBA GRATIS' : 'Siguiente'}
                onPress={isLast ? onRegisterPress : onNext}
                iconName={isLast ? 'rocket-outline' : 'arrow-forward'}
                buttonStyle={[styles.primaryButton, { backgroundColor: theme.primary }]}
                textStyle={{ color: theme.textOnPrimary }}
                iconColor={theme.textOnPrimary}
            />

            <CustomButton
                title="¿Ya tienes una cuenta? Inicia Sesión"
                onPress={onLoginPress}
                activeOpacity={0.7}
                // ✅ CORRECCIÓN: Añadimos 'backgroundColor: "transparent"' para anular el fondo por defecto.
                buttonStyle={[styles.secondaryButton, { backgroundColor: 'transparent' }]}
                textStyle={[styles.secondaryButtonText, { color: theme.primary }]}
            />
        </SafeAreaView>
    );
}

// ... tus estilos permanecen igual
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderTopWidth: 1,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        marginBottom: 10,
    },
    primaryButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        paddingVertical: 12,
        marginTop: 8,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
