import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { getFirestore, doc, arrayRemove, updateDoc} from "firebase/firestore"; 
import { auth } from '../firebase';
const db = getFirestore();

async function DeleteDoula(params) {
  try {
    const ref = doc(db, "doula", params);
    await updateDoc(ref, {
      user: arrayRemove(auth.currentUser?.email)
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export default function Channel(props) {
  return (
   
    <TouchableOpacity onPress={() => props.navigation.navigate('Mesajlar', {name: props.doulaName, code: props.doulaCode})} style={styles.container}>

        <TouchableOpacity onPress={() => DeleteDoula(props.doulaCode)} style={styles.deleteDoula}>
          <Text style={{color: 'red'}}>❌</Text>
        </TouchableOpacity>

        <View style={styles.logoContent}>
          <View style={styles.logo}>
            <Text style={styles.logotxt}>
              {props.doulaName[0]}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.txt}>
            {props.doulaName}
          </Text>
          <Text style={styles.codetxt}>
            Doula Code: {props.doulaCode}
          </Text>
        </View>

    </TouchableOpacity>
   
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#EF3939',
    fontSize: 26,
    marginBottom: 15,
    flexDirection: 'row',
    height: 100
    
  },
  logo:{
    backgroundColor:'#fff',
    borderRadius: 100,
    width: 75,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20
 
  },
  logoContent:{
    flex: 1
  },
  txt:{
    color: 'white',
    fontSize: 26,

  },
  logotxt:{
    color: 'red',
    fontSize: 32
  },
  codetxt:{
    color: 'white',
    fontSize: 14,
    color: '#FFD700'
  },
  content:{
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 2
  },
  deleteDoula:{
    backgroundColor: '#F5F5F5',
    width: 30,
    height:30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    position: 'absolute',
    right: 0,
    top: 0
  }
   
  
});
