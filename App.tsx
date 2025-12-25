import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Signup from './src/screens/Signup';

export default function App() {
  return (
    <View style={styles.container}>
     <Signup/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  },
});
