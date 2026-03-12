// components/tabbar/MyCustomTabBar.tsx
import { Colors } from '@/constants/Colors';
import { AntDesign } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RouteConfig = {
    [key: string]: {
        icon: keyof typeof AntDesign.glyphMap;
        label: string;
    };
};

const ROUTE_CONFIG: RouteConfig = {
    index: { icon: 'home', label: 'Inicio' },
    agregar: { icon: 'plus-circle', label: 'Agregar' },
    cuenta: { icon: 'user', label: 'Cuenta' },
    ayuda: { icon: 'question-circle', label: 'Ayuda' },
};

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme || 'light'];
    const insets = useSafeAreaInsets();

    const handlePress = (route: any, isFocused: boolean) => {
        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }
    };

    const renderTab = (route: any, index: number) => {
        const isFocused = state.index === index;
        const routeConfig = ROUTE_CONFIG[route.name] || {
            icon: 'question-circle',
            label: route.name,
        };

        return (
            <TouchableOpacity
                key={route.key}
                activeOpacity={0.7}
                onPress={() => handlePress(route, isFocused)}
                style={styles.tabButton}
            >
                <View style={[
                    styles.iconContainer, 
                    isFocused && { backgroundColor: theme.primaryLight }
                ]}>
                    <AntDesign
                        name={routeConfig.icon}
                        size={24}
                        color={isFocused ? theme.primary : theme.textSecondary}
                    />
                </View>
                <Text
                    style={[
                        styles.label,
                        {
                            color: isFocused ? theme.primary : theme.textSecondary,
                            fontWeight: isFocused ? '700' : '500',
                        },
                    ]}
                >
                    {routeConfig.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View
            style={[
                styles.container,
                { 
                    backgroundColor: theme.surface, 
                    borderTopColor: theme.border,
                    // Usamos el inset inferior pero aseguramos un mínimo de 18 para que no se vea pegado
                    // en dispositivos sin barra de gestos (como algunos Android o iPhone con botón home)
                    paddingBottom: Math.max(insets.bottom, 18),
                },
            ]}
        >
            {state.routes.map((route, index) => renderTab(route, index))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: 14,
        paddingHorizontal: 8,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 100, // Valor alto para asegurar forma de píldora
        marginBottom: 4,
        overflow: 'hidden', // Crucial para asegurar que el fondo respete los bordes
    },
    label: {
        fontSize: 12,
        textAlign: 'center',
    },
});
