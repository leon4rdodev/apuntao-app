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
import { formatDate } from '@/utils/formatters';

export function useEmailAuth() {
    const showNotification = useNotification();
    const setAccount = useSessionStore((state) => state.setAccount);

    const [colmadoName, setColmadoName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const user = userCredential.user;

            // 🎁 Asignar automáticamente 7 días de prueba gratis
            const trialDays = 7;
            const now = new Date();
            const expirationDate = new Date(now);
            expirationDate.setDate(now.getDate() + trialDays);
            const formattedTrialEnd = formatDate(expirationDate);

            const defaultSub = { 
                status: 'trial', 
                plan: 'none' as const,
                trialEndDate: formattedTrialEnd,
            };
            const userRef = doc(db, 'users', user.uid);
            
            await setDoc(userRef, {
                colmadoName: colmadoName.trim(),
                email: user.email,
                subscription: defaultSub,
                createdAt: serverTimestamp(),
            }, { merge: true });

            setAccount({
                colmadoName: colmadoName.trim(),
                email: user.email || '',
                subscription: defaultSub as any,
                phoneNumber: '',
            });

            // AuthContext will detect the change and route to home
            
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
            // AuthContext detectará la sesión
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
        isLoading,
        handleRegister,
        handleLogin,
    };
}
