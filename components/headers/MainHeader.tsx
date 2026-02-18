import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import CustomInput from '../input/CustomInput';
import SyncIndicator from '../ui/SyncIndicator';

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

    const onSearchPress = () => {
        setIsSearchOpen(!isSearchOpen);

        if (isSearchOpen) {
            setSearchQuery(''); // Limpiar la búsqueda al abrir
        }
    };

    const theme = Colors[useColorScheme() || 'light'];

    return (
        <View
            style={[
                styles.header,
                {
                    backgroundColor: theme.surface,
                    borderBottomColor: theme.border,
                    paddingTop: Constants.statusBarHeight,
                },
            ]}
        >
            {isSearchOpen ? (
                <View style={[styles.headerContent, { marginRight: 18 }]}>
                    <CustomInput onChangeText={setSearchQuery} autoFocus placeholder='Buscar cliente...'/>
                </View>
            ) : (
                <View style={styles.headerContent}>
                    <Ionicons
                        name="book-outline"
                        size={24}
                        color={theme.primary}
                        style={styles.bookIcon}
                    />
                    <Text style={[styles.title, { color: theme.text }]}>Apunta&apos;o</Text>
                    <SyncIndicator />
                </View>
            )}

            <TouchableOpacity
                onPress={onSearchPress}
                style={styles.searchButton}
                accessibilityLabel="Buscar"
                accessibilityRole="button"
            >
                <Ionicons
                    name={isSearchOpen ? 'exit-outline' : 'search-outline'}
                    size={28}
                    color={theme.text}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 100,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderBottomWidth: 1,
        paddingHorizontal: 18,
    },
    searchButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookIcon: {
        marginRight: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
});