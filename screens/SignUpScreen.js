import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase.js';
import { getFirestore, setDoc, doc } from "firebase/firestore";
import Logo from '../components/Logo';

function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [signup, setSignup] = useState('');

  const handleSignUp = () => {
    if (pass.length > 8) {
      createUserWithEmailAndPassword(auth, email, pass)
        .then(async (userCredential) => {
          const db = getFirestore();
          const uid = userCredential.user.uid;
          const accountCreationTime = new Date();

          try {
            await setDoc(doc(db, "users", uid), {
              user: email,
              role: "pregnant",
              creationTime: accountCreationTime
            });
          } catch (e) {
            console.log("Error adding user info: ", e);
          }

          setSignup('Sign Up Successful');
          navigation.navigate('Login');
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setSignup(errorMessage);
        });
    } else {
      setSignup('Password is too short.');
    }
  };

  return (
    <ImageBackground source={require('../images/login.jpg')} style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo />
      </View>
      <Text style={styles.signupMessage}>{signup}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={text => setEmail(text)}
          placeholderTextColor="#999"
        />
        <TextInput
          secureTextEntry
          style={styles.input}
          placeholder="Password"
          value={pass}
          onChangeText={text => setPass(text)}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupMessage: {
    fontSize: 18,
    color: '#ffdddd',
    marginBottom: 20,
  },
  inputContainer: {
    flex: 2,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
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
  signupButton: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  backButton: {
    backgroundColor: '#008CBA',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
