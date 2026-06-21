import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ProfileCardProps {
    account: any;
    onEdit: () => void;
}

export default function ProfileCard({ account, onEdit }: ProfileCardProps) {
    const theme = Colors[useColorScheme() || 'light'];

    if (!account) {
        return (
            <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                <ActivityIndicator color={theme.primary} size="large" />
                <CustomText style={{ marginTop: 12, color: theme.textSecondary }}>
                    Sincronizando perfil...
                </CustomText>
            </View>
        );
    }

    return (
        <View style={styles.profileCard}>
            <View style={[styles.profileIconContainer, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="storefront" style={styles.profileIcon} color={theme.primary} />
            </View>

            <View style={styles.nameRow}>
                <CustomText size="xlarge" weight="bold" style={styles.userName}>
                    {account.colmadoName}
                </CustomText>
                <TouchableOpacity onPress={onEdit} style={styles.inlineEditButton}>
                    <Ionicons name="create" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>
            <CustomText size="medium" color={theme.textSecondary} style={styles.userPhone}>
                {account.email}
            </CustomText>
        </View>
    );
}

const styles = StyleSheet.create({
    profileCard: {
        alignItems: 'center',
        paddingBottom: 24,
        borderRadius: 24,
        marginBottom: 20,
    },
    profileIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileIcon: {
        fontSize: 32,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 4,
    },
    inlineEditButton: {
        padding: 6,
        borderRadius: 100,
    },
    userName: { textAlign: 'center' },
    userPhone: { textAlign: 'center' },
});
