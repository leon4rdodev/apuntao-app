import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import React, { useCallback, useEffect, memo, useState } from 'react';
import {
    BackHandler,
    Keyboard,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    InteractionManager,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, {
    FadeIn,
    FadeOut,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    Easing,
} from 'react-native-reanimated';

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
 * @description Modal optimizado para alto rendimiento y animaciones fluidas.
 * Utiliza React.memo y Reanimated 3 para garantizar 60fps.
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
    const translateY = useSharedValue(600);
    const [shouldRender, setShouldRender] = useState(isVisible);

    // Sincronización de montaje/desmontaje con animaciones
    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            // Pequeño delay para asegurar que el componente esté montado antes de animar
            InteractionManager.runAfterInteractions(() => {
                translateY.value = withSpring(0, {
                    damping: 20,
                    stiffness: 90,
                    mass: 0.5,
                });
            });
        } else {
            translateY.value = withTiming(600, { 
                duration: 250,
                easing: Easing.out(Easing.cubic)
            }, (finished) => {
                if (finished) {
                    runOnJS(setShouldRender)(false);
                }
            });
        }
    }, [isVisible, translateY]);

    const handleClose = useCallback(() => {
        // Primero animamos localmente, el efecto de arriba se encargará de setShouldRender(false)
        translateY.value = withTiming(600, { 
            duration: 250,
            easing: Easing.out(Easing.cubic)
        }, (finished) => {
            if (finished) {
                runOnJS(onClose)();
            }
        });
    }, [translateY, onClose]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    useEffect(() => {
        const backAction = () => {
            if (isVisible) {
                handleClose();
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [handleClose, isVisible]);

    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            if (isVisible) {
                handleClose();
            }
        });

        return () => {
            keyboardDidHideListener?.remove();
        };
    }, [handleClose, isVisible]);

    if (!shouldRender) return null;

    return (
        <View style={styles.container} pointerEvents={isVisible ? 'auto' : 'none'}>
            <TouchableWithoutFeedback onPress={handleClose}>
                <Animated.View
                    style={styles.modalOverlay}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                />
            </TouchableWithoutFeedback>

            <View style={styles.modalPositioner} pointerEvents="box-none">
                <Animated.View
                    style={[styles.modalContent, { backgroundColor: theme.surface }, animatedStyle]}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        overScrollMode="never"
                        contentContainerStyle={[
                            styles.scrollContentContainer,
                            { paddingBottom: paddingBottom },
                        ]}
                        keyboardShouldPersistTaps="always"
                        scrollEventThrottle={16}
                    >
                        <View style={styles.handleContainer}>
                            <View style={[styles.handle, { backgroundColor: theme.borderSubtle }]} />
                        </View>

                        <CustomText size="large" weight="bold" style={styles.modalTitle}>
                            {title}
                        </CustomText>

                        <View>{children}</View>

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
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)', 
    },
    modalPositioner: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        maxHeight: '100%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
        overflow: 'hidden',
    },
    scrollContentContainer: {
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
        letterSpacing: -0.2,
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: 32,
        width: '100%',
        gap: 12,
    },
});

export default ActionModal;

