import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/appNavigator/appNavigator';
import { AuthContextProvider } from './src/context/authContex';
import { ThemeProvider } from './src/context/themeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthContextProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthContextProvider>
    </ThemeProvider>
  );
}
