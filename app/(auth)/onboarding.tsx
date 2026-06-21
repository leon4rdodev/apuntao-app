import OnboardingContent from '@/components/onboarding/OnboardingContent';
import OnboardingFooter from '@/components/onboarding/OnboardingFooter';
import { Colors } from '@/constants/Colors';
import { ONBOARDING_STEPS } from '@/constants/FeatureItems';
import { STORAGE_KEYS } from '@/constants';
import { saveToStorage } from '@/utils/storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

export default function OnboardingScreen() {
    const [step, setStep] = useState(0);
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();

    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 500 });
    }, [step]);

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const handleNext = () => {
        if (step < ONBOARDING_STEPS.length - 1) {
            opacity.value = withTiming(0, { duration: 300 });
            setTimeout(() => {
                setStep(s => s + 1);
            }, 300);
        }
    };

    /**
     * Marca el onboarding como completado y navega a la pantalla de login.
     * El hook de protección se encargará de que esta pantalla no se vuelva a mostrar.
     */
    const handleCompleteOnboarding = useCallback(async () => {
        await saveToStorage(STORAGE_KEYS.HAS_ONBOARDED, true);
        router.replace('/(auth)/register');
    }, [router]);

    const handleCompleteOnboardingLogin = useCallback(async () => {
        await saveToStorage(STORAGE_KEYS.HAS_ONBOARDED, true);
        router.replace('/(auth)/login');
    }, [router]);


    return (
        <View
            style={[
                styles.safeArea,
                { backgroundColor: theme.background, paddingTop: Constants.statusBarHeight },
            ]}
        >
            <ScrollView
                style={{ backgroundColor: theme.background }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <OnboardingContent
                    step={ONBOARDING_STEPS[step]}
                    animatedStyle={contentAnimatedStyle}
                />
            </ScrollView>

            <OnboardingFooter
                step={step}
                totalSteps={ONBOARDING_STEPS.length}
                theme={theme}
                onNext={handleNext}
                onLoginPress={handleCompleteOnboardingLogin}
                onRegisterPress={handleCompleteOnboarding}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
});
