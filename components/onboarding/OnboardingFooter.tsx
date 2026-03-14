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
            edges={['bottom']}
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
                buttonStyle={[
                    styles.primaryButton,
                    { 
                        backgroundColor: theme.primary,
                    }
                ]}
                textStyle={{ color: theme.textOnPrimary }}
                iconColor={theme.textOnPrimary}
            />

            <CustomButton
                title="¿Ya tienes una cuenta? Inicia Sesión"
                onPress={onLoginPress}
                activeOpacity={0.7}
                buttonStyle={[styles.secondaryButton, { backgroundColor: 'transparent' }]}
                textStyle={[styles.secondaryButtonText, { color: theme.primary }]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 24,
        marginBottom: 12,
    },
    primaryButton: {
        paddingVertical: 14,
        borderRadius: 100,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        paddingVertical: 8,
        marginTop: 4,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
