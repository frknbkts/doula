import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import App from './App'; // Replace './App' with the path to your main component




AppRegistry.registerComponent('main', () => App);

if (Platform.OS === 'web') {
    const rootTag = document.getElementById('root') || document.getElementById('main');
    AppRegistry.runApplication('main', { rootTag });
}