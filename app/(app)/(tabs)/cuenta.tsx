// app/(app)/(tabs)/cuenta.tsx

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SubscriptionCard from '@/components/cards/SubscriptionCard';

import ProfileCard from '@/components/cuentaScreen/ProfileCard';
import SettingsCard from '@/components/cuentaScreen/SettingsCard';
import EditProfileModal from '@/components/cuentaScreen/EditProfileModal';

import { useCuenta } from '@/hooks/useCuenta';

export default function CuentaScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const insets = useSafeAreaInsets();
    
    const {
        account,
        isBiometricsSupported,
        biometricsEnabled,
        isEditing,
        isLogoutVisible,
        actions,
    } = useCuenta();

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <ProfileCard 
                    account={account} 
                    onEdit={actions.openEdit} 
                />

                <SubscriptionCard />

                <SettingsCard 
                    isBiometricsSupported={isBiometricsSupported}
                    biometricsEnabled={biometricsEnabled}
                    toggleBiometrics={actions.toggleBiometrics}
                />

                <View style={{ marginTop: 12 }}>
                    <CustomButton
                        title="Cerrar Sesión"
                        onPress={actions.openLogout}
                        buttonStyle={{ backgroundColor: 'transparent', borderColor: theme.border, borderWidth: 1 }}
                        textStyle={{ color: theme.error, fontWeight: '600' }}
                        iconName="log-out"
                        iconColor={theme.error}
                    />
                </View>

                <CustomText size="small" color={theme.textSecondary} style={styles.appVersion}>
                    Versión {require('../../../package.json').version}
                </CustomText>
            </ScrollView>

            <EditProfileModal 
                isVisible={isEditing}
                initialName={account?.colmadoName || ''}
                onClose={actions.closeEdit}
                onSave={actions.handleUpdateName}
            />

            <ConfirmModal
                isVisible={isLogoutVisible}
                onClose={actions.closeLogout}
                onConfirm={actions.signOut}
                title="Cerrar Sesión"
                description="¿Estás seguro? Se cerrará tu sesión en este dispositivo y tendrás que volver a ingresar."
                confirmText="Salir"
                isDestructive={true}
                confirmIconName="log-out"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { 
        padding: 20, 
        paddingBottom: 40, 
    },
    appVersion: { 
        textAlign: 'center', 
        marginTop: 32, 
        opacity: 0.6 
    },
});
