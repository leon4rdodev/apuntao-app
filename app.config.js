import 'dotenv/config';

export default {
    expo: {
        name: "Apunta'o",
        slug: 'apuntao-app',
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: 'apuntaoapp',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        splash: {
            image: './assets/images/icon.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
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
            softwareKeyboardLayoutMode: 'pan',
            package: 'com.leon4rdodev.apuntao',
            googleServicesFile: './google-services.json',
        },
        web: {
            bundler: 'metro',
            output: 'static',
            favicon: './assets/images/icon.png',
        },
        plugins: [
            'expo-router',
            'expo-font',
            ['@react-native-firebase/app', { ios: {} }],
            ['@react-native-firebase/auth', { ios: {} }],
            ['@react-native-firebase/crashlytics', { ios: {} }],
        ],
        experiments: {
            typedRoutes: true,
        },
        extra: {
            router: {},
            eas: {
                "projectId": "080d32b9-65da-4cdd-8fbf-36bcd79f67d5"
            },
        },
    },
};