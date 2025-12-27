import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Signup from "../screens/Signup";
import SignIn from '../screens/SignIn';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen options={{ headerShown: false }}
                    index={true}
                    name="SignIn" component={SignIn} />
                <Stack.Screen options={{ headerShown: false }} name="Signup" component={Signup} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}