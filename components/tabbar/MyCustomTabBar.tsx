// components/MyCustomTabBar.tsx
import { Colors } from '@/constants/Colors';
import { AntDesign } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RouteConfig = {
    [key: string]: {
        icon: keyof typeof AntDesign.glyphMap;
        label: string;
    };
};

const ROUTE_CONFIG: RouteConfig = {
    index: { icon: 'home', label: 'Inicio' },
    agregar: { icon: 'pluscircleo', label: 'Agregar' },
    cuenta: { icon: 'user', label: 'Cuenta' },
    ayuda: { icon: 'questioncircleo', label: 'Ayuda' },
};

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme || 'light'];

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
            icon: 'questioncircleo',
            label: route.name,
        };

        return (
            <TouchableOpacity
                key={route.key}
                onPress={() => handlePress(route, isFocused)}
                style={styles.tabButton} // El estilo del botón ya está aplicado aquí
            >
                <AntDesign
                    name={routeConfig.icon}
                    size={24}
                    color={isFocused ? theme.primary : '#aaa'}
                    style={[
                        styles.icon,
                        {
                            backgroundColor: isFocused ? theme.primaryLight : theme.surface,
                        },
                    ]}
                />
                <Text
                    style={[
                        styles.label,
                        {
                            color: isFocused ? theme.primary : '#888',
                            fontWeight: isFocused ? '800' : '500',
                        },
                    ]}
                >
                    {routeConfig.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
        >
            {state.routes.map((route, index) => renderTab(route, index))}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        // justifyContent: 'space-evenly', // <-- CAMBIO 1: Eliminamos esta línea
        borderTopWidth: 1,
        paddingBottom: 10,
        paddingHorizontal: 10,
        paddingTop: -10,
    },
    tabButton: {
        flex: 1, // <-- CAMBIO 2: Añadimos flex: 1
        alignItems: 'center',
        justifyContent: 'center', // <-- CAMBIO 3: Añadimos esto para centrar verticalmente
    },
    icon: {
        paddingHorizontal: 24,
        paddingVertical: 6,
        borderRadius: 50,
        // Opcional: un pequeño margen inferior para separar del texto
        marginBottom: 2,
    },
    label: {
        fontSize: 12,
    },
});
