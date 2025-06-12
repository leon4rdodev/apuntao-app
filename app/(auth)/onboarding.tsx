import OnboardingContent from '@/components/onboarding/OnboardingContent';
import OnboardingFooter from '@/components/onboarding/OnboardingFooter';
import { Colors } from '@/constants/Colors';
import { ONBOARDING_STEPS } from '@/constants/FeatureItems';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import {
    runOnJS,
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
    }, [opacity, step]);

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const handleNext = () => {
        if (step < ONBOARDING_STEPS.length - 1) {
            opacity.value = withTiming(0, { duration: 300 }, (finished) => {
                if (finished) {
                    runOnJS(setStep)(step + 1);
                }
            });
        }
    };

    const handleLogin = () => {
        router.replace('/(auth)/login');
    };

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
                key={step}
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
                onLogin={handleLogin}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
});