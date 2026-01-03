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
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TabParamList } from '../types/TabParamList';
import MainHeader from '../components/MainHeader';
import CreatePost from '../screens/CreatePost';
import CommentsScreen from '../screens/CommentsScreen';
import { Ionicons } from '@expo/vector-icons';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createMaterialTopTabNavigator<TabParamList>();

const TabNavigator = () => {
    const { colors } = useTheme();

    return (
        <View style={{ flex: 1 }}>
            <MainHeader />
            <Tab.Navigator
                screenOptions={{
                    tabBarShowIcon: true,
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.subText,
                    tabBarStyle: {
                        backgroundColor: colors.card,
                        borderTopColor: colors.border,
                    },
                    tabBarIndicatorStyle: {
                        backgroundColor: colors.primary,
                    },
                }}
            >
                <Tab.Screen
                    name="Feed"
                    component={FeedScreenScreen}
                    options={{
                        tabBarLabel: 'Feed',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "newspaper" : "newspaper-outline"} size={20} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Chat"
                    component={ChatListScreen}
                    options={{
                        tabBarLabel: 'Chat',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={20} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarLabel: 'Profile',
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "person" : "person-outline"} size={20} color={color} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </View>
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
                        <Stack.Screen name="ChatScreen" component={ChatScreen} />
                        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
                        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
                        <Stack.Screen name="CreatePost" component={CreatePost} />
                        <Stack.Screen name="CommentsScreen" component={CommentsScreen} />
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
