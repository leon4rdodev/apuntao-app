import CustomTabBar from '@/components/tabbar/MyCustomTabBar';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
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
