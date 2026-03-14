import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import React, { useCallback, memo, useEffect } from 'react';
import {
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    Modal,
    ScrollView,
    Keyboard,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, { 
    useAnimatedStyle, 
    useAnimatedKeyboard,
    withTiming,
    useSharedValue,
    interpolate
} from 'react-native-reanimated';
import { useWindowDimensions } from 'react-native';

interface ActionModalProps {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions: any[];
    paddingBottom: number;
}

/**
 * @component ActionModal
 * @description Clean Modal implementation.
 * Focuses on stability and smooth positioning without interfering with child inputs.
 */
const ActionModal = memo(({
    isVisible,
    onClose,
    title,
    children,
    actions,
    paddingBottom,
}: ActionModalProps) => {
    const theme = Colors[useColorScheme() || 'light'];
    const { height: screenHeight } = useWindowDimensions();
    const isPresented = useSharedValue(0);
    const keyboard = useAnimatedKeyboard();

    const handleClose = useCallback(() => {
        Keyboard.dismiss();
        onClose();
    }, [onClose]);

    // Cerrar modal si el teclado desaparece manualmente
    useEffect(() => {
        if (!isVisible) return;
        
        const subscription = Keyboard.addListener('keyboardDidHide', () => {
            onClose();
        });

        return () => subscription.remove();
    }, [isVisible, onClose]);

    useEffect(() => {
        if (isVisible) {
            isPresented.value = withTiming(1, { duration: 300 });
        } else {
            isPresented.value = withTiming(0, { duration: 250 });
        }
    }, [isVisible]);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: isPresented.value,
    }));

    const contentStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            isPresented.value,
            [0, 1],
            [screenHeight, 0]
        );
        return {
            transform: [
                { translateY: translateY - keyboard.height.value }
            ],
        };
    });

    return (
        <Modal
            visible={isVisible}
            onRequestClose={handleClose}
            transparent={true}
            animationType="none"
            statusBarTranslucent
        >
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={handleClose}>
                    <Animated.View style={[styles.modalOverlay, overlayStyle]} />
                </TouchableWithoutFeedback>

                <Animated.View 
                    style={[
                        styles.modalContent, 
                        { backgroundColor: theme.surface }, 
                        contentStyle
                    ]}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: Math.max(paddingBottom, 24) }
                        ]}
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                    >
                        <View style={styles.handleContainer}>
                            <View style={[styles.handle, { backgroundColor: theme.borderSubtle }]} />
                        </View>

                        <CustomText size="large" weight="bold" style={styles.modalTitle}>
                            {title}
                        </CustomText>

                        <View style={styles.childrenContainer}>{children}</View>

                        <View style={styles.modalActions}>
                            {actions.map((action, index) => (
                                <View key={action.title || index} style={{ flex: 1 }}>
                                    <CustomButton
                                        title={action.title}
                                        onPress={action.onPress}
                                        buttonStyle={[action.buttonStyle]}
                                        textStyle={[{ fontSize: 16 }, action.textStyle]}
                                        iconName={action.iconName}
                                        iconColor={action.iconColor}
                                    />
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    modalContent: {
        width: '100%',
        maxHeight: '90%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
        overflow: 'hidden',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 14,
    },
    handle: {
        width: 44,
        height: 5,
        borderRadius: 2.5,
        opacity: 0.6,
    },
    modalTitle: {
        marginBottom: 24,
        textAlign: 'center',
    },
    childrenContainer: {
        width: '100%',
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: 32,
        width: '100%',
        gap: 12,
        marginBottom: 10,
    },
});

export default ActionModal;
