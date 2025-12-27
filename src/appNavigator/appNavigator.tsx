import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from 'react-native';
import Signup from "../screens/Signup";
import SignIn from '../screens/SignIn';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';
import { useAuth } from '../context/authContex';
import { useTheme } from '../context/themeContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useAuth();
    const { colors } = useTheme();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    // Main Stack
                    <>
                        <Stack.Screen name="Profile" component={Profile} />
                        <Stack.Screen name="Settings" component={Settings} />
                    </>
                ) : (
                    // Auth Stack
                    <>
                        <Stack.Screen name="SignIn" component={SignIn} />
                        <Stack.Screen name="Signup" component={Signup} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
