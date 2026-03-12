import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.header,
                {
                    backgroundColor: theme.surface,
                    borderBottomColor: theme.border,
                    paddingTop: insets.top,
                },
            ]}
        >
            <View style={styles.contentContainer}>
                {isSearchOpen ? (
                    <View style={styles.searchContainer}>
                        <CustomInput 
                            onChangeText={setSearchQuery} 
                            autoFocus 
                            placeholder='Buscar cliente...'
                            containerStyle={styles.searchInput}
                        />
                    </View>
                ) : (
                    <>
                        {/* Placeholder invisible a la izquierda para equilibrio si no fuera absoluto */}
                        <View style={styles.leftSpace} />
                        
                        <View style={styles.absoluteCenter} pointerEvents="none">
                            <View style={styles.headerContent}>
                                <Ionicons
                                    name="book-outline"
                                    size={22}
                                    color={theme.primary}
                                    style={styles.bookIcon}
                                />
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
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 60,
        marginTop: 4,
        position: 'relative',
    },
    leftSpace: {
        width: 44,
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
        height: 46,
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