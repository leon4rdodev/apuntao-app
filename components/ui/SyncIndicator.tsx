import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClientStore } from '@/store/clientStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useRef } from 'react';

export default function SyncIndicator() {
    const theme = Colors[useColorScheme() || 'light'];
    const hasPendingWrites = useClientStore((state) => state.hasPendingWrites);
    const fadeAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (hasPendingWrites) {
            // Animación de pulso cuando está sincronizando
            Animated.loop(
                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 0.3,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            fadeAnim.setValue(1);
        }
    }, [hasPendingWrites]);

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <Ionicons
                    name={hasPendingWrites ? 'cloud-upload-outline' : 'cloud-done-outline'}
                    size={20}
                    color={hasPendingWrites ? theme.textSecondary : theme.success}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
