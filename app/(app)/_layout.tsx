// app/_layout.tsx
import { Tabs } from 'expo-router';

import CustomTabBar from '@/components/MyCustomTabBar';


export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
            }}
            tabBar={props => <CustomTabBar {...props} />}
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="agregar" />
            <Tabs.Screen name="cuenta" />
            <Tabs.Screen name="ayuda" />
        </Tabs>
    );
}
