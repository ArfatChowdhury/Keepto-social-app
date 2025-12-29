import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View, Text } from 'react-native';

import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { RootStackParamList } from '../types/navigation';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SignInScreen from '../screens/SignInScreen';
import SignupScreen from '../screens/SignupScreen';
import FeedScreenScreen from '../screens/FeedScreenScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/tabParamList';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.subText,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                },
            }}
        >
            <Tab.Screen
                name="Feed"
                component={FeedScreenScreen}
                options={{
                    tabBarLabel: 'Feed',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ color, fontSize: size }}>🏠</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ color, fontSize: size }}>👤</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ color, fontSize: size }}>⚙️</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

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

                    <>
                        <Stack.Screen name="MainTabs" component={TabNavigator} />
                        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="SignInScreen" component={SignInScreen} />
                        <Stack.Screen name="SignupScreen" component={SignupScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
