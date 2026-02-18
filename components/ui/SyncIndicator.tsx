import { Colors } from '@/constants/Colors';
import { useClientStore } from '@/store/clientStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useColorScheme } from 'react-native';

export default function SyncIndicator() {
    const theme = Colors[useColorScheme() || 'light'];
    const syncStatus = useClientStore((state) => state.syncStatus);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (syncStatus === 'pending' || syncStatus === 'error') {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            // Si está sincronizado, esperamos un poco y luego desvanecemos
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            }, 2000);
        }
    }, [syncStatus]);

    if (syncStatus === 'synced') return null;

    let iconName: keyof typeof Ionicons.glyphMap = 'checkmark-circle';
    let text = 'Guardado';
    let color = theme.success;

    if (syncStatus === 'pending') {
        iconName = 'cloud-upload-outline';
        text = 'Subiendo...';
        color = theme.warning;
    } else if (syncStatus === 'error') {
        iconName = 'cloud-offline-outline';
        text = 'Sin conexión';
        color = theme.error;
    }

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: theme.surface }]}>
            <Ionicons name={iconName} size={14} color={color} />
            <Text style={[styles.text, { color }]}>{text}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    text: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 4,
    },
});
