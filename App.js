import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F0E8' }} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3F0E8" />
        <AppNavigator />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
