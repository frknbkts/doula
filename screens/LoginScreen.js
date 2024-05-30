import Logo from '../components/Logo'
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground } from 'react-native';


import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase.js'

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [login, setLogin] = useState('')

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        setLogin('Login Succesfull')

        navigation.replace('Content')

        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setLogin(errorCode)
      });
  }

  return (
    <ImageBackground source={require('../images/login.jpg')} style={styles.container}>
      <View style={styles.flex1}>
        <Logo />
      </View>

      <Text style={styles.txt}>{login}</Text>
      <View style={styles.flex2}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={text => setEmail(text)}
          placeholderTextColor="#999"
        />
        <TextInput
          secureTextEntry={true}
          value={pass}
          placeholder="Password"
          onChangeText={text => setPass(text)}
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.txtBtn}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSign} onPress={() => navigation.navigate('Sign Up')}>
          <Text style={styles.txtBtn}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9BCCBA',
  },
  flex1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex2: {
    flex: 2,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#EF3939',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    width: '100%',
  },
  btnSign: {
    backgroundColor: '#A53B3B',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    width: '100%',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    height: 50,
    marginTop: 10,
    paddingLeft: 15,
    fontSize: 18,
    width: '100%',
  },
  txt: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 20,
  },
  txtBtn: {
    fontSize: 18,
    color: '#ffffff',
  },
});

export default LoginScreen;