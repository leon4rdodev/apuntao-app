import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, TextInput } from 'react-native';
import ActionModal from '@/components/clientsScreen/ActionModal';
import CustomInput from '@/components/input/CustomInput';
import CustomText from '@/components/ui/CustomText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface EditProfileModalProps {
    isVisible: boolean;
    initialName: string;
    onClose: () => void;
    onSave: (newName: string, setIsSaving: (s: boolean) => void) => void;
}

export default function EditProfileModal({
    isVisible,
    initialName,
    onClose,
    onSave,
}: EditProfileModalProps) {
    const theme = Colors[useColorScheme() || 'light'];
    
    // Estado local para evitar re-renders en la pantalla principal
    const [newName, setNewName] = useState(initialName);
    const [isSaving, setIsSaving] = useState(false);
    const newNameInputRef = useRef<TextInput>(null);

    // Sincronizar estado inicial al abrir el modal
    useEffect(() => {
        if (isVisible) {
            setNewName(initialName);
            const timer = setTimeout(() => {
                newNameInputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isVisible, initialName]);

    const handleSave = useCallback(() => {
        onSave(newName, setIsSaving);
    }, [newName, onSave]);

    const actions = useMemo(() => [
        {
            title: 'Cancelar',
            onPress: onClose,
            buttonStyle: { backgroundColor: theme.inputBackground, flex: 1, borderWidth: 1, borderColor: theme.borderSubtle },
            textStyle: { color: theme.textSecondary },
        },
        {
            title: 'Guardar',
            onPress: handleSave,
            isLoading: isSaving,
            iconName: 'checkmark',
        },
    ], [theme, onClose, handleSave, isSaving]);

    return (
        <ActionModal
            isVisible={isVisible}
            onClose={onClose}
            title="Editar Perfil"
            paddingBottom={400}
            actions={actions}
        >
            <View style={{ marginBottom: 12 }}>
                <CustomText size="small" weight="medium" style={{ marginBottom: 8, color: theme.textSecondary, marginLeft: 4 }}>
                    Nombre de tu Negocio
                </CustomText>
                <CustomInput
                    inputRef={newNameInputRef as any}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Ej. Colmado El Sol"
                    autoFocus={false}
                    onSubmitEditing={handleSave}
                    returnKeyType="done"
                    submitBehavior="submit"
                />
            </View>
        </ActionModal>
    );
}
