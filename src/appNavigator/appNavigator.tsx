import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from 'react-native';
import SignupScreen from "../screens/SignupScreen";
import SignInScreen from '../screens/SignInScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
                        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
                        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
                    </>
                ) : (
                    // Auth Stack
                    <>
                        <Stack.Screen name="SignInScreen" component={SignInScreen} />
                        <Stack.Screen name="SignupScreen" component={SignupScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
