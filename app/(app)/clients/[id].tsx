// app/(app)/clients/[id].tsx

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import BackButton from '@/components/ui/BackButton';
import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';

import ClientSummaryCard from '@/components/clientsScreen/ClientSummaryCard';
import MainActionButtons from '@/components/clientsScreen/MainActionButtons';
import DangerZone from '@/components/clientsScreen/DangerZone';
import TransactionHistory from '@/components/clientsScreen/TransactionHistory';

// Nuevos componentes refactorizados
import ClientActionModal from '@/components/clientsScreen/ClientActionModal';
import ClientConfirmModal from '@/components/clientsScreen/ClientConfirmModal';
import { useClientDetail } from '@/hooks/useClientDetail';

export default function ClientDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = Colors[useColorScheme() || 'light'];
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const {
        client,
        modalConfig,
        confirmConfig,
        actions
    } = useClientDetail(id);

    if (!client) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: insets.bottom }]}>
                <View style={styles.notFoundContainer}>
                    <Ionicons name="alert-circle" size={60} color={theme.error} />
                    <CustomText size="large" weight="bold" style={{ marginVertical: 16 }}>
                        Cliente no encontrado
                    </CustomText>
                    <CustomButton title="Volver al inicio" onPress={() => router.back()} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: insets.bottom }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <BackButton />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ClientSummaryCard client={client} onEdit={actions.handleEditOpen} />
                
                <MainActionButtons
                    onPay={actions.handlePayOpen}
                    onAddDebt={actions.handleAddDebtOpen}
                />
                
                <DangerZone
                    debt={client.debt}
                    onSettleDebt={actions.handleSettleDebt}
                    onDeleteClient={actions.handleDeleteClient}
                />
                
                <TransactionHistory
                    transactions={client.transactions}
                    onDelete={actions.handleDeleteTransaction}
                />
            </ScrollView>

            <ClientActionModal
                config={modalConfig}
                client={client}
                onClose={actions.closeModal}
                onSaveTransaction={actions.handleSaveTransaction}
                onUpdateClient={actions.handleUpdateClient}
            />

            <ClientConfirmModal
                config={confirmConfig}
                onClose={actions.closeConfirm}
                onConfirm={actions.confirmAction}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingTop: 110, paddingHorizontal: 20 },
    notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});
