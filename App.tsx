import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AppNavigator from './src/appNavigator/appNavigator';
import { AuthContextProvider } from './src/context/authContex';

export default function App() {
  return (
    <AuthContextProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: '8%',
    flex: 1,
  },
});
