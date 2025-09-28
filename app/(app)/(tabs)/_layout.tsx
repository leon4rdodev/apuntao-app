import CustomTabBar from '@/components/tabbar/MyCustomTabBar';
import { Tabs } from 'expo-router';
// NOTA: El modal de renovación fue movido a ../_layout.tsx

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                animation: 'fade',
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
