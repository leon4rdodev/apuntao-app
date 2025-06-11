// components/MyCustomTabBar.tsx
import { AntDesign } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors';

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme || 'light'];

    return (
        <View
            style={{
                flexDirection: 'row',
                height: 100,
                backgroundColor: theme.tabNabBg,
                justifyContent: 'space-evenly',
                alignItems: 'center',
            }}
        >
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const iconName: keyof typeof AntDesign.glyphMap =
                    route.name === 'index'
                        ? 'home'
                        : route.name === 'agregar'
                          ? 'pluscircleo'
                          : route.name === 'cuenta'
                            ? 'user'
                            : route.name === 'ayuda'
                              ? 'questioncircleo'
                              : 'questioncircleo';

                const label =
                    route.name === 'index'
                        ? 'Inicio'
                        : route.name === 'agregar'
                          ? 'Agregar'
                          : route.name === 'cuenta'
                            ? 'Cuenta'
                            : route.name === 'ayuda'
                              ? 'Ayuda'
                              : route.name;

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        style={{ alignItems: 'center', marginBottom: 16 }}
                    >
                        <AntDesign
                            name={iconName}
                            size={24}
                            color={isFocused ? theme.primary : '#aaa'}
                            style={{
                                backgroundColor: isFocused ? theme.primaryLight : theme.tabNabBg,
                                paddingHorizontal: 24,
                                paddingVertical: 8,
                                borderRadius: 50,
                            }}
                        />
                        <Text
                            style={{
                                fontSize: 12,
                                color: isFocused ? theme.primary : '#888',
                                fontWeight: isFocused ? '800' : '500',
                            }}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
