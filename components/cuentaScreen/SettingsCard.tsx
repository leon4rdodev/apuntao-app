import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomText from '@/components/ui/CustomText';
import CustomSwitch from '@/components/ui/CustomSwitch';
import ActionRow from '@/components/ui/ActionRow';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SettingsCardProps {
    isBiometricsSupported: boolean;
    biometricsEnabled: boolean;
    toggleBiometrics: (value: boolean) => void;
}

export default function SettingsCard({
    isBiometricsSupported,
    biometricsEnabled,
    toggleBiometrics,
}: SettingsCardProps) {
    const theme = Colors[useColorScheme() || 'light'];
    const router = useRouter();

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
            <CustomText
                size="small"
                weight="bold"
                color={theme.textSecondary}
                style={styles.cardTitle}
            >
                Ajustes y Soporte
            </CustomText>
            
            {isBiometricsSupported && (
                <View style={[styles.settingRow, { borderTopColor: theme.borderSubtle }]}>
                    <View style={styles.settingTextContainer}>
                        <Ionicons name="finger-print" size={22} color={theme.text} style={styles.settingIcon} />
                        <CustomText size="medium" weight="medium">Seguridad Biométrica</CustomText>
                    </View>
                    <CustomSwitch
                        value={biometricsEnabled}
                        onValueChange={toggleBiometrics}
                    />
                </View>
            )}
            
            <ActionRow
                icon="help-circle"
                text="Centro de Ayuda"
                onPress={() => router.push('/(app)/(tabs)/ayuda')}
                theme={theme}
            />
            
            <ActionRow
                icon="star"
                text="Calificar la App"
                onPress={() => Linking.openURL('market://details?id=com.leon4rdodev.apuntao')}
                theme={theme}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
        borderWidth: 1,
        paddingBottom: 0,
    },
    cardTitle: {
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderTopWidth: 1,
    },
    settingTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        marginRight: 12,
    },
});
