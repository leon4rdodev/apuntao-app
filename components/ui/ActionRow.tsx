import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";
import CustomText from "./CustomText";

const ActionRow = ({
    icon,
    text,
    onPress,
    theme,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    onPress: () => void;
    theme: any;
}) => (
    <TouchableOpacity style={[styles.actionRow, { borderTopColor: theme.border }]} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name={icon} size={24} color={theme.primary} />
        <CustomText size="medium" style={styles.actionText}>
            {text}
        </CustomText>
        <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
    </TouchableOpacity>
);

export default ActionRow;

const styles = StyleSheet.create({
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopWidth: 1,
    },
    actionText: {
        flex: 1,
        marginLeft: 16,
    },
});