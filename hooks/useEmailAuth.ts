import { useState } from 'react';
import { Keyboard } from 'react-native';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from '@react-native-firebase/auth';
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    serverTimestamp 
} from '@react-native-firebase/firestore';
import { useNotification } from '@/store/notificationStore';
import { useSessionStore } from '@/store/sessionStore';
import { generateUniqueReferralCode, validateReferralCode, reserveReferralCode, applyReferralRewards } from '@/utils/referral';
import { REFERRAL_CONFIG } from '@/constants';

export function useEmailAuth() {
    const showNotification = useNotification();
    const setAccount = useSessionStore((state) => state.setAccount);

    const [colmadoName, setColmadoName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        Keyboard.dismiss();
        if (!colmadoName.trim() || !email.trim() || !password) {
            showNotification({
                message: 'Completa todos los campos requeridos.',
                type: 'error',
            });
            return;
        }

        if (password.length < 6) {
            showNotification({
                message: 'La contraseña debe tener al menos 6 caracteres.',
                type: 'error',
            });
            return;
        }

        setIsLoading(true);
        try {
            const auth = getAuth();
            const db = getFirestore();

            let referrerId: string | null = null;
            if (referralCode.trim()) {
                const code = referralCode.trim().toUpperCase();
                referrerId = await validateReferralCode(code);
                if (!referrerId) {
                    showNotification({
                        message: 'El código de referido no es válido.',
                        type: 'error',
                    });
                    setIsLoading(false);
                    return;
                }
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const user = userCredential.user;

            const trialDays = referrerId ? REFERRAL_CONFIG.REFERRED_FREE_DAYS : 7;
            const now = new Date();
            const expirationDate = new Date(now);
            expirationDate.setDate(now.getDate() + trialDays);
            const formattedTrialEnd = expirationDate.toISOString();

            const userCode = await generateUniqueReferralCode();

            const defaultSub = { 
                status: 'trial', 
                plan: 'none' as const,
                trialEndDate: formattedTrialEnd,
            };
            const userRef = doc(db, 'users', user.uid);
            
            const userData: any = {
                colmadoName: colmadoName.trim(),
                email: user.email,
                subscription: defaultSub,
                referralCode: userCode,
                referralCount: 0,
                referralCredits: 0,
                createdAt: serverTimestamp(),
            };
            if (referrerId) {
                userData.referredBy = referrerId;
            }
            
            await setDoc(userRef, userData, { merge: true });
            await reserveReferralCode(userCode, user.uid);

            if (referrerId) {
                await applyReferralRewards(user.uid, referrerId);
            }

            setAccount({
                colmadoName: colmadoName.trim(),
                email: user.email || '',
                subscription: defaultSub as any,
                phoneNumber: '',
                referralCode: userCode,
                referredBy: referrerId,
                referralCount: 0,
                referralCredits: 0,
            });

        } catch (error: any) {
            console.error('Error en registro con email:', error);
            let errorMessage = 'Error al registrar la cuenta.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este correo electrónico ya está en uso.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'El correo electrónico no es válido.';
            }
            showNotification({
                message: errorMessage,
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!email.trim() || !password) {
            showNotification({
                message: 'Por favor, ingresa tu correo y contraseña.',
                type: 'error',
            });
            return;
        }

        setIsLoading(true);
        try {
            const auth = getAuth();
            await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (error: any) {
            console.error('Error iniciando sesión con email:', error);
            showNotification({
                message: 'Correo electrónico o contraseña incorrectos.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        colmadoName,
        setColmadoName,
        email,
        setEmail,
        password,
        setPassword,
        referralCode,
        setReferralCode,
        isLoading,
        handleRegister,
        handleLogin,
    };
}
