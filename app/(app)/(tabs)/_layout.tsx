import CustomTabBar from '@/components/tabbar/MyCustomTabBar';
import { Tabs } from 'expo-router';
// NOTA: El modal de renovación fue movido a ../_layout.tsx

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarHideOnKeyboard: true, // Evita artefactos visuales sobre el teclado
                animation: 'none',
                tabBarStyle: { position: 'absolute', borderTopWidth: 0, elevation: 0 },
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            {/* Pestañas visibles */}
            <Tabs.Screen name="index" />
            <Tabs.Screen name="agregar" />
            <Tabs.Screen name="cuenta" />
            <Tabs.Screen name="ayuda" />
        </Tabs>
    );
}
