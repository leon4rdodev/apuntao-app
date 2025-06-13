// apuntao-app-master/components/clientsScreen/ActionModal.tsx

import CustomButton from '@/components/ui/CustomButton';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import React, { useEffect } from 'react';
import {
    BackHandler,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    useColorScheme,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

/**
 * @component ActionModal
 * @description Un modal "bottom sheet" personalizado, construido con Views y Animated API.
 * Está específicamente optimizado para Android.
 */
const ActionModal = ({
    isVisible,
    onClose,
    title,
    children,
    actions,
}: {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions: any[];
}) => {
    const theme = Colors[useColorScheme() || 'light'];

    // Maneja el botón de "atrás" de Android para cerrar el modal
    useEffect(() => {
        const backAction = () => {
            if (isVisible) {
                onClose();
                return true; // Previene que la app se cierre o navegue hacia atrás
            }
            return false; // Permite el comportamiento por defecto si el modal no está visible
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        // Función de limpieza que se ejecuta cuando el componente se desmonta
        return () => backHandler.remove();
    }, [isVisible, onClose]);

    // Si no es visible, no renderizamos nada para optimizar el rendimiento
    if (!isVisible) {
        return null;
    }

    return (
        // Contenedor principal que se posiciona sobre toda la app
        <View style={styles.container}>
            {/* Overlay oscuro con animación de fade y que cierra el modal al tocarlo */}
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View
                    style={styles.modalOverlay}
                    entering={FadeIn.duration(250)}
                    exiting={FadeOut.duration(250)}
                />
            </TouchableWithoutFeedback>

            {/* Contenedor que empuja el modal hacia la parte inferior de la pantalla */}
            <View style={styles.modalPositioner} pointerEvents="box-none">
                <Animated.View
                    // Evita que los toques en el modal se propaguen al overlay
                    onTouchStart={(e) => e.stopPropagation()}
                    // Animación de entrada y salida del modal
                    entering={SlideInDown.duration(300).springify().damping(20).stiffness(150)}
                    exiting={SlideOutDown.duration(200)}
                    style={[styles.modalContent, { backgroundColor: theme.surface }]}
                >
                    {/* El ScrollView permite que el contenido se desplace si el teclado lo empuja */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        contentContainerStyle={styles.scrollContentContainer}
                        keyboardShouldPersistTaps="handled" // Mejora la interacción con los inputs dentro del scroll
                    >
                        <View style={styles.handleContainer}>
                            <View style={[styles.handle, { backgroundColor: theme.border }]} />
                        </View>

                        <CustomText size="large" weight="bold" style={styles.modalTitle}>
                            {title}
                        </CustomText>

                        {/* Contenido dinámico (inputs, etc.) */}
                        <View>{children}</View>

                        {/* Botones de acción apilados verticalmente */}
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
        zIndex: 1000, // Un zIndex alto para asegurar que esté por encima de todo
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
        maxHeight: '100%', // Límite para que no cubra toda la pantalla
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden', // Esencial para que el ScrollView respete los bordes redondeados
    },
    scrollContentContainer: {
        // El padding se aplica aquí, dentro del ScrollView
        paddingHorizontal: 24,
        paddingBottom: 370, // Espacio de seguridad en la parte inferior
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
