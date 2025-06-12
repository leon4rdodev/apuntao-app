import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    if (!loaded) {
        return null;
    }

    const backgroundColor = colorScheme === 'dark' ? '#111827' : '#f8fafc';

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={{ flex: 1, backgroundColor }}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        animation: 'fade_from_bottom',
                    }}
                />
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </View>
        </ThemeProvider>
    );
}
