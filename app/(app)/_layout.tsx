import { Tabs } from 'expo-router';

import CustomTabBar from '@/components/tabbar/MyCustomTabBar';
import { ClientProvider } from '@/context/ClientContext';

export default function TabLayout() {
    return (
        <ClientProvider>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    
                }}
                tabBar={(props) => <CustomTabBar {...props} />}
            >
                <Tabs.Screen name="index" />
                <Tabs.Screen name="agregar" />
                <Tabs.Screen name="cuenta" />
                <Tabs.Screen name="ayuda" />
            </Tabs>
        </ClientProvider>
    );
}
