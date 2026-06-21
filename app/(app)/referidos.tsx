import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSessionStore } from '@/store/sessionStore';
import { useAuth } from '@/context/AuthContext';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import { generateReferralCode, saveReferralCodeMapping } from '@/utils/referral';
import { useNotification } from '@/store/notificationStore';

export default function ReferidosScreen() {
    const theme = Colors[useColorScheme() || 'light'];
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { session: account } = useAuth();
    const showNotification = useNotification();

    const referralCode = useSessionStore((state) => state.referralCode);
    const referralCount = useSessionStore((state) => state.referralCount);
    const referralCredits = useSessionStore((state) => state.referralCredits);
    const setReferralCode = useSessionStore((state) => state.setReferralCode);

    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const ensureReferralCode = async () => {
            if (referralCode || !account || isGenerating) return;
            setIsGenerating(true);
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const code = generateReferralCode(user.uid);
                setReferralCode(code);
                try {
                    const db = getFirestore();
                    await updateDoc(doc(db, 'users', user.uid), {
                        referralCode: code,
                    });
                    saveReferralCodeMapping(code, user.uid);
                } catch (err) {
                    console.warn('Could not save referral code:', err);
                }
            }
            setIsGenerating(false);
        };
        ensureReferralCode();
    }, [referralCode, account]);

    const handleShare = useCallback(async () => {
        if (!referralCode) {
            showNotification({ message: 'Código de referido no disponible', type: 'error' });
            return;
        }
        const storeName = account?.colmadoName || 'Mi Colmado';
        const message = `🎯 ¡Te invito a usar Apunta'o! La app para controlar las cuentas del crédito de tu colmado.\n\nUsa mi código de referido: ${referralCode}\n\n📲 Descárgala y obtén 1 mes gratis al registrarte con mi código.`;
        try {
            await Share.share({ message });
        } catch (error) {
            console.error('Error al compartir:', error);
        }
    }, [referralCode, account, showNotification]);

    const handleCopy = useCallback(async () => {
        if (!referralCode) {
            showNotification({ message: 'Código de referido no disponible', type: 'error' });
            return;
        }
        try {
            await Share.share({ message: referralCode });
            showNotification({ message: 'Código copiado al portapapeles', type: 'success' });
        } catch (error) {
            console.error('Error al copiar:', error);
            showNotification({ message: 'No se pudo copiar el código', type: 'error' });
        }
    }, [referralCode, showNotification]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
            <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <CustomText size="large" weight="bold" style={{ flex: 1, textAlign: 'center', marginRight: 36 }}>
                    Invita y Gana
                </CustomText>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!referralCode ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={theme.primary} size="large" />
                        <CustomText style={{ marginTop: 12, color: theme.textSecondary }}>
                            Generando tu código...
                        </CustomText>
                    </View>
                ) : (
                    <>
                        <View style={styles.heroSection}>
                            <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
                                <Ionicons name="gift-outline" size={40} color={theme.primary} />
                            </View>
                            <CustomText size="medium" color={theme.textSecondary} style={styles.heroSubtitle}>
                                Comparte tu código y gana recompensas
                            </CustomText>
                        </View>

                        <View style={[styles.codeCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                            <CustomText size="small" weight="bold" color={theme.textSecondary} style={styles.codeLabel}>
                                TU CÓDIGO DE REFERIDO
                            </CustomText>
                            <View style={[styles.codeBadge, { backgroundColor: theme.primaryLight }]}>
                                <CustomText size="xxlarge" weight="bold" color={theme.primary}>
                                    {referralCode}
                                </CustomText>
                            </View>

                            <View style={styles.actionsRow}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { borderColor: theme.border }]}
                                    onPress={handleCopy}
                                >
                                    <Ionicons name="copy-outline" size={22} color={theme.primary} />
                                    <CustomText size="medium" weight="bold" style={{ color: theme.primary, marginTop: 6 }}>
                                        Copiar
                                    </CustomText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                    onPress={handleShare}
                                >
                                    <Ionicons name="share-outline" size={22} color={theme.textOnPrimary} />
                                    <CustomText size="medium" weight="bold" style={{ color: theme.textOnPrimary, marginTop: 6 }}>
                                        Compartir
                                    </CustomText>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.statsCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                            <CustomText size="small" weight="bold" color={theme.textSecondary} style={styles.statsTitle}>
                                TUS ESTADÍSTICAS
                            </CustomText>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Ionicons name="people-outline" size={32} color={theme.primary} />
                                    <CustomText size="xlarge" weight="bold" style={{ marginTop: 8 }}>
                                        {referralCount}
                                    </CustomText>
                                    <CustomText size="small" color={theme.textSecondary}>
                                        Referidos
                                    </CustomText>
                                </View>
                                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                                <View style={styles.statItem}>
                                    <Ionicons name="cash-outline" size={32} color={theme.success} />
                                    <CustomText size="xlarge" weight="bold" style={{ marginTop: 8 }}>
                                        {referralCredits > 0 ? `RD$ ${referralCredits}` : 'RD$ 0'}
                                    </CustomText>
                                    <CustomText size="small" color={theme.textSecondary}>
                                        Comisiones
                                    </CustomText>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                            <CustomText size="small" weight="bold" color={theme.textSecondary} style={styles.infoTitle}>
                                CÓMO FUNCIONA
                            </CustomText>
                            <View style={styles.infoStep}>
                                <View style={[styles.stepDot, { backgroundColor: theme.primary }]}>
                                    <CustomText size="small" weight="bold" color={theme.textOnPrimary}>1</CustomText>
                                </View>
                                <CustomText size="medium" color={theme.textSecondary} style={styles.stepText}>
                                    Comparte tu código con otros dueños de colmados.
                                </CustomText>
                            </View>
                            <View style={styles.infoStep}>
                                <View style={[styles.stepDot, { backgroundColor: theme.primary }]}>
                                    <CustomText size="small" weight="bold" color={theme.textOnPrimary}>2</CustomText>
                                </View>
                                <CustomText size="medium" color={theme.textSecondary} style={styles.stepText}>
                                    Ellos obtienen 1 mes gratis al registrarse con tu código.
                                </CustomText>
                            </View>
                            <View style={styles.infoStep}>
                                <View style={[styles.stepDot, { backgroundColor: theme.primary }]}>
                                    <CustomText size="small" weight="bold" color={theme.textOnPrimary}>3</CustomText>
                                </View>
                                <CustomText size="medium" color={theme.textSecondary} style={styles.stepText}>
                                    Tú ganas el 40% de su primera suscripción.
                                </CustomText>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        padding: 8,
        borderRadius: 100,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    heroSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroSubtitle: {
        textAlign: 'center',
    },
    codeCard: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        marginBottom: 20,
    },
    codeLabel: {
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 1,
    },
    codeBadge: {
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
    },
    statsCard: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        marginBottom: 20,
    },
    statsTitle: {
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 1,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 56,
    },
    infoCard: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        marginBottom: 20,
    },
    infoTitle: {
        marginBottom: 20,
        letterSpacing: 1,
    },
    infoStep: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 12,
    },
    stepDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    stepText: {
        flex: 1,
        lineHeight: 22,
    },
});
