import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";



const Stack = createNativeStackNavigator();
export default function AppNavigator() {
    return (
        <NavigationContainer>
        <Stack.Navigator>
        <Stack.Screen name= "Signup" component = { Signup } />
            </Stack.Navigator>
            </NavigationContainer>
    );
}