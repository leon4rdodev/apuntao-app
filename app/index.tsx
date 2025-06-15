// Archivo: app/index.tsx

import { SplashScreenUI } from '@/components/ui/SplashScreenUI';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import React from 'react';

export default function AppBootstrapScreen() {
    const { progress } = useAppBootstrap();

    return <SplashScreenUI progress={progress} />;
}
