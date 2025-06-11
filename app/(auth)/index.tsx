// components/Counter.tsx
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

// import statusCodes along with GoogleSignin
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Somewhere in your code
interface UserInfo {
    // Add properties according to your Google Sign-In response type
    data: any; // Replace 'any' with specific type
}

interface GoogleSignInError {
    code: number;
    message: string;
}

// Type guard functions
function isSuccessResponse(response: any): response is { data: UserInfo } {
    return response && 'data' in response;
}

function isErrorWithCode(error: any): error is GoogleSignInError {
    return error && 'code' in error;
}
export default function Counter() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const signIn = async (): Promise<void> => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response)) {
                setUserInfo({ data: response.data });
            } else {
                console.error('Sign in failed:', response);
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch ((error as GoogleSignInError).code) {
                    case statusCodes.IN_PROGRESS:
                        // operation (eg. sign in) already in progress
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        // Android only, play services not available or outdated
                        break;
                    default:
                    // some other error happened
                }
            } else {
                console.error('Sign in error:', error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text>UserInfo: {userInfo ? JSON.stringify(userInfo) : 'No user info'}</Text>

            <Text style={styles.text}>Google Sign-In</Text>
            <Button title="Sign In with Google" onPress={signIn} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
        backgroundColor: '#4285F4',
        color: '#fff',
        padding: 10,
    }
});
