import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Signup from './src/screens/Signup';
import { AuthContextProvider } from './src/context/authContex';

export default function App() {
  return (
    <AuthContextProvider>
      <View style={styles.container}>
        <Signup />
        <StatusBar style="auto" />
      </View>
    </AuthContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: '8%',
    flex: 1,
  },
});
