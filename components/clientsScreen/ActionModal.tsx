import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import React, { useCallback, useEffect } from 'react';
import {
    BackHandler,
    Keyboard,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
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
} from 'react-native-reanimated';

const ActionModal = ({
    isVisible,
    onClose,
    title,
    children,
    actions,
    paddingBottom,
}: {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions: any[];
    paddingBottom: number;
}) => {
    const theme = Colors[useColorScheme() || 'light'];
    const translateY = useSharedValue(500);

    const closeModal = useCallback(() => {
        translateY.value = withTiming(500, { duration: 200 }, (finished) => {
            if (finished) {
                runOnJS(onClose)();
            }
        });
    }, [translateY, onClose]);

    // Sincronización de velocidad con el teclado nativo (aprox 250ms)
    useEffect(() => {
        if (isVisible) {
            // Cambiamos de spring a timing para un ascenso linear a la par del teclado
            translateY.value = withTiming(0, { duration: 250 });
        } else {
            translateY.value = withTiming(500, { duration: 200 });
        }
    }, [isVisible, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: Math.max(0, translateY.value) }], // CLAVE: Limita valores negativos
    }));

    useEffect(() => {
        const backAction = () => {
            if (isVisible) {
                closeModal();
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [closeModal, isVisible]);

    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            if (isVisible) {
                closeModal();
            }
        });

        return () => {
            keyboardDidHideListener?.remove();
        };
    }, [closeModal, isVisible]);

    if (!isVisible) return null;

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={closeModal}>
                <Animated.View
                    style={styles.modalOverlay}
                    entering={FadeIn.duration(250)}
                    exiting={FadeOut.duration(250)}
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
                        contentContainerStyle={[
                            styles.scrollContentContainer,
                            { paddingBottom: paddingBottom },
                        ]}
                        keyboardShouldPersistTaps="always"
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
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Overlay un poco más suave
    },
    modalPositioner: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        maxHeight: '100%',
        borderTopLeftRadius: 32, // Bordes mucho más redondeados
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05, // Sombra más sutil
        shadowRadius: 10,
        elevation: 8,
        overflow: 'hidden',
    },
    scrollContentContainer: {
        paddingHorizontal: 24,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 16, // Más espacio para respirar
    },
    handle: {
        width: 48,
        height: 5,
        borderRadius: 2.5,
    },
    modalTitle: {
        marginBottom: 24,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row', // Botones lado a lado en lugar de apilados
        marginTop: 32,
        width: '100%',
        gap: 8,
    },
    actionButton: {
        // Eliminado para usar estilos de CustomButton (pill-shaped)
    },
});

export default ActionModal;
