import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomInput from '../input/CustomInput';
import SyncIndicator from '../ui/SyncIndicator';
import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

interface MainHeaderProps {
    setSearchQuery: (query: string) => void;
    setIsSearchOpen: (isOpen: boolean) => void;
    isSearchOpen: boolean;
}
/**
 * Componente de encabezado principal que muestra un ícono de búsqueda y el título de la aplicación.
 * @component
 * @param {MainHeaderProps} props - Props que contiene la función a ejecutar al presionar el botón de búsqueda.
 */
export default function MainHeader({ setSearchQuery, setIsSearchOpen, isSearchOpen }: MainHeaderProps) {
    const [inputValue, setInputValue] = useState('');
    const toggleTheme = useUIStore((state) => state.toggleTheme);
    const themeMode = useUIStore((state) => state.themeMode);
    const systemColorScheme = useColorScheme(); // Usamos el hook local

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(inputValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [inputValue, setSearchQuery]);

    const onSearchPress = () => {
        setIsSearchOpen(!isSearchOpen);

        if (isSearchOpen) {
            setInputValue('');
            setSearchQuery(''); // Limpiar la búsqueda al abrir
        }
    };

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme || 'light'];
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.header,
                {
                    backgroundColor: theme.surface,
                    borderBottomColor: theme.borderSubtle,
                    paddingTop: insets.top,
                },
            ]}
        >
            <View style={styles.contentContainer}>
                {isSearchOpen ? (
                    <View style={styles.searchContainer}>
                        <CustomInput 
                            value={inputValue}
                            onChangeText={setInputValue} 
                            autoFocus 
                            placeholder='Buscar cliente...'
                            containerStyle={styles.searchInput}
                            icon="search-outline"
                        />
                    </View>
                ) : (
                    <>
                        {/* Botón de Cambio de Tema */}
                        <TouchableOpacity 
                            onPress={toggleTheme}
                            style={styles.themeButton}
                            accessibilityLabel="Cambiar tema"
                        >
                            <Ionicons 
                                name={colorScheme === 'dark' ? 'sunny-outline' : 'moon-outline'} 
                                size={24} 
                                color={theme.text} 
                            />
                        </TouchableOpacity>
                        
                        <View style={styles.absoluteCenter} pointerEvents="none">
                            <View style={styles.headerContent}>
                                <Text style={[styles.title, { color: theme.text }]}>Apunta&apos;o</Text>
                                <SyncIndicator />
                            </View>
                        </View>
                    </>
                )}

                <TouchableOpacity
                    onPress={onSearchPress}
                    style={styles.searchButton}
                    accessibilityLabel="Buscar"
                    accessibilityRole="button"
                >
                    <Ionicons
                        name={isSearchOpen ? 'close-outline' : 'search-outline'}
                        size={28}
                        color={theme.text}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 16,
        paddingBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Cambiado para separar los botones
        height: 60,
        marginTop: 4,
        position: 'relative',
    },
    themeButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    absoluteCenter: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 8,
    },
    searchInput: {
        height: 48,
        borderWidth: 0, // Quitamos el borde extra si el header ya tiene
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookIcon: {
        marginRight: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
});