import React from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { ConfirmConfig } from '@/hooks/useClientDetail';

interface ClientConfirmModalProps {
    config: ConfirmConfig;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ClientConfirmModal({ config, onClose, onConfirm }: ClientConfirmModalProps) {
    if (!config) return null;

    return (
        <ConfirmModal
            isVisible={!!config}
            onClose={onClose}
            title={config.title}
            description={config.description}
            confirmText={config.confirmText}
            isDestructive={config.isDestructive}
            iconName={config.iconName}
            onConfirm={onConfirm}
        />
    );
}
