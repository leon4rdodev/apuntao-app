import FeatureItem from '@/components/ui/FeatureItem';
import { Feature } from '@/constants/FeatureItems';
import { Colors } from '@/constants/Colors';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated from 'react-native-reanimated';

const { height } = Dimensions.get('window');

export interface OnboardingStep {
    icon: string;
    iconLib: typeof Ionicons | typeof MaterialIcons | typeof Entypo;
    title: string;
    subtitle: string;
    features: Feature[];
}

interface Props {
    step: OnboardingStep;
    animatedStyle: any;
}

export default function OnboardingContent({ step, animatedStyle }: Props) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme || 'light'];
    const IconComponent = step.iconLib;

    return (
        <Animated.View style={[styles.content, animatedStyle]}>
            <View style={styles.stepHeader}>
                <IconComponent name={step.icon as any} size={40} color={theme.primary} />
            </View>
            <Text style={[styles.mainTitle, { color: theme.text }]}>{step.title}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{step.subtitle}</Text>
            <View style={styles.featuresContainer}>
                {step.features.map((feature, index) => (
                    <FeatureItem key={index} feature={feature} />
                ))}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 24,
        paddingTop: height * 0.05,
        paddingBottom: 24,
    },
    stepHeader: {
        alignItems: 'center',
        marginBottom: 24,
        height: 60,
        justifyContent: 'center',
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 36,
    },
    featuresContainer: { gap: 16 },
});
