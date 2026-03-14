import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { getFromStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import { View } from 'react-native';

export default function Index() {
    const { session, isLoading } = useAuth();
    const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

    useEffect(() => {
        (async () => {
            const onboarded = await getFromStorage<boolean>(STORAGE_KEYS.HAS_ONBOARDED);
            setHasOnboarded(!!onboarded);
        })();
    }, []);

    // Esperar a que el layout raíz resuelva el splash screen.
    // Retornar un View vacío evita flashes de UI blanca.
    if (isLoading || hasOnboarded === null) {
        return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
    }

    if (session) {
        return <Redirect href="/(app)/(tabs)" />;
    } else if (hasOnboarded) {
        return <Redirect href="/(auth)/login" />;
    } else {
        return <Redirect href="/(auth)/onboarding" />;
    }
}
