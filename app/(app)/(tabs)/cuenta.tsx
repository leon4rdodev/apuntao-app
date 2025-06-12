import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, useColorScheme, View } from "react-native";


export default function Index() {
    const theme = Colors[useColorScheme() || 'light'];
    
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text>Cuenta</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});