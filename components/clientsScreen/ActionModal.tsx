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
    useColorScheme,
} from 'react-native';
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
    const translateY = useSharedValue(500); // Empieza fuera de pantalla

    // Función para cerrar el modal
    const closeModal = useCallback(() => {
        translateY.value = withTiming(500, { duration: 200 }, (finished) => {
            if (finished) {
                runOnJS(onClose)();
            }
        });
    }, [translateY, onClose]);

    // Animación de entrada/salida
    useEffect(() => {
        if (isVisible) {
            translateY.value = withSpring(0, {
                damping: 14,
                stiffness: 150,
            });
        } else {
            translateY.value = withTiming(500, { duration: 200 }, (finished) => {
                if (finished) {
                    runOnJS(onClose)();
                }
            });
        }
    }, [isVisible, onClose, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    // Manejo del botón "atrás" de Android
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

    // Listener para cerrar modal cuando se cierre el teclado
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

    // No renderizar si no es visible (ya lo animamos para salir)
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

            {/* 
              --- CORRECCIÓN ---
              No se usa KeyboardAvoidingView. En su lugar, el ScrollView se encarga del ajuste
              y se añade un padding inferior grande para asegurar que el contenido sea desplazable.
            */}
            <View style={styles.modalPositioner} pointerEvents="box-none">
                <Animated.View
                    style={[styles.modalContent, { backgroundColor: theme.surface }, animatedStyle]}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        contentContainerStyle={[styles.scrollContentContainer, {paddingBottom: paddingBottom}]}
                        keyboardShouldPersistTaps="always"
                    >
                        <View style={styles.handleContainer}>
                            <View style={[styles.handle, { backgroundColor: theme.border }]} />
                        </View>

                        <CustomText size="large" weight="bold" style={styles.modalTitle}>
                            {title}
                        </CustomText>

                        <View>{children}</View>

                        <View style={styles.modalActions}>
                            {actions.map((action, index) => (
                                <CustomButton key={action.title || index} {...action} />
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalPositioner: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        maxHeight: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden',
    },
    scrollContentContainer: {
        paddingHorizontal: 24,
        // Este padding grande asegura que haya suficiente espacio para hacer scroll
        // y ver los botones incluso cuando el teclado está abierto en Android.
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
    },
    modalTitle: {
        marginBottom: 24,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'column',
        marginTop: 24,
        width: '100%',
        gap: 12,
    },
});

export default ActionModal;
