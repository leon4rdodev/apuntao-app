import { getFirestore, doc, getDoc, runTransaction, serverTimestamp, increment } from '@react-native-firebase/firestore';
import { REFERRAL_CONFIG } from '@/constants';

function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

export function generateReferralCode(uid: string): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const hash = hashCode(uid);
    let code = '';
    let n = hash;
    for (let i = 0; i < 5; i++) {
        code = chars[n % chars.length] + code;
        n = Math.floor(n / chars.length);
    }
    return `${REFERRAL_CONFIG.REFERRAL_CODE_PREFIX}-${code}`;
}

export async function applyReferralRewards(newUserId: string, referrerId: string): Promise<void> {
    const db = getFirestore();
    const newUserRef = doc(db, 'users', newUserId);
    const referrerRef = doc(db, 'users', referrerId);

    await runTransaction(db, async (transaction) => {
        const newUserSnap = await transaction.get(newUserRef);
        const referrerSnap = await transaction.get(referrerRef);

        if (!newUserSnap.exists || !referrerSnap.exists) {
            return;
        }

        const newUserData = newUserSnap.data();
        const now = new Date();

        const currentTrialEnd = newUserData?.subscription?.trialEndDate
            ? new Date(newUserData.subscription.trialEndDate)
            : now;
        const newTrialEnd = new Date(currentTrialEnd);
        newTrialEnd.setDate(newTrialEnd.getDate() + REFERRAL_CONFIG.REFERRED_FREE_DAYS);

        transaction.update(newUserRef, {
            referredBy: referrerId,
            [`subscription.trialEndDate`]: newTrialEnd.toISOString(),
        });

        const referralRef = doc(db, 'users', referrerId, 'referrals', newUserId);
        transaction.set(referralRef, {
            referredUid: newUserId,
            referredName: newUserData?.colmadoName || 'Nuevo usuario',
            date: Date.now(),
            status: 'pending',
            commissionPercentage: REFERRAL_CONFIG.REFERRER_COMMISSION,
        });

        transaction.update(referrerRef, {
            referralCount: increment(1),
        });
    });
}

export async function findReferrerByCode(code: string): Promise<string | null> {
    const db = getFirestore();
    const ref = doc(db, 'referralCodes', code.trim().toUpperCase());
    try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
            return snap.data()?.uid || null;
        }
    } catch {
        // Firestore rules might block reading referralCodes collection
        // Fallback: try to find user by querying their own doc
        // This is best-effort; without proper rules, commission tracking
        // requires a Cloud Function
    }
    return null;
}
