import { getFirestore, collection, doc, getDoc, setDoc, runTransaction, serverTimestamp, increment } from '@react-native-firebase/firestore';
import { REFERRAL_CONFIG } from '@/constants';

function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${REFERRAL_CONFIG.REFERRAL_CODE_PREFIX}-${code}`;
}

export async function generateUniqueReferralCode(): Promise<string> {
    const db = getFirestore();
    const codesRef = collection(db, 'referralCodes');
    let code: string;
    let attempts = 0;
    do {
        code = generateCode();
        const snap = await getDoc(doc(codesRef, code));
        if (!snap.exists()) return code;
        attempts++;
    } while (attempts < 10);
    throw new Error('No se pudo generar un código único de referido');
}

export async function validateReferralCode(code: string): Promise<string | null> {
    const db = getFirestore();
    const ref = doc(db, 'referralCodes', code.trim().toUpperCase());
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data()?.uid || null;
}

export async function reserveReferralCode(code: string, uid: string): Promise<void> {
    const db = getFirestore();
    await setDoc(doc(db, 'referralCodes', code), {
        uid,
        createdAt: serverTimestamp(),
    });
}

export async function applyReferralRewards(newUserId: string, referrerId: string): Promise<void> {
    const db = getFirestore();
    const newUserRef = doc(db, 'users', newUserId);
    const referrerRef = doc(db, 'users', referrerId);

    await runTransaction(db, async (transaction) => {
        const newUserSnap = await transaction.get(newUserRef);
        const referrerSnap = await transaction.get(referrerRef);

        if (!newUserSnap.exists || !referrerSnap.exists) {
            throw new Error('Usuario no encontrado');
        }

        const newUserData = newUserSnap.data();
        const referrerData = referrerSnap.data();

        const referrerName = referrerData?.colmadoName || 'Un usuario';
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

        const referralRef = doc(collection(db, 'users', referrerId, 'referrals'));
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
