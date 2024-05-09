import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Logo() {
  return (
   
    <View style={styles.container}>
      <Text style={styles.doulaapp}>Doula</Text>
    </View>
   
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 165,
    height: 160,
    backgroundColor: '#EF3939',
    borderRadius: 200
  },
  doulaapp:{
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 30,
    lineHeight: 30,
    color: '#FFFFFF'
  }
});
