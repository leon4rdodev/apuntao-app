import 'dotenv/config';

export default {
    expo: {
        name: "Apunta'o",
        slug: 'apuntao-app',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: 'apuntaoapp',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        splash: {
            image: './assets/images/icon.png',
            resizeMode: 'contain',
            backgroundColor: '#00000000',
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: 'com.leon4rdodev.apuntao',
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/images/icon.png',
                backgroundColor: '#ffffff',
            },
            edgeToEdgeEnabled: true,
            package: 'com.leon4rdodev.apuntao',
        },
        web: {
            bundler: 'metro',
            output: 'static',
            favicon: './assets/images/icon.png',
        },
        plugins: ['expo-router'],
        experiments: {
            typedRoutes: true,
        },
        extra: {
            router: {},
            eas: {
                projectId: '862586eb-5c93-4ade-8be7-631697fedd07',
            },
            API_URL: process.env.EXPO_PUBLIC_API_URL,
            WEB_CLIENT_ID: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
        },
    },
};
