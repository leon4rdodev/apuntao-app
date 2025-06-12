import MainHeader from "@/components/headers/MainHeader";
import { Colors } from "@/constants/Colors";
import { useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";


export default function Index() {
    const theme = Colors[useColorScheme() || 'light'];
    const [searchQuery, setSearchQuery] = useState('');
    
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <MainHeader setSearchQuery={setSearchQuery} />
            <Text style={{ color: theme.text, padding: 20 }}>
                Search Query: {searchQuery}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }, 
});