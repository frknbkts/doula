import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ImageBackground} from 'react-native';
import BottomBar from '../components/BottomBar';
import { auth } from '../firebase';
import { doc, onSnapshot, getFirestore, updateDoc, arrayRemove } from "firebase/firestore";
import * as Clipboard from 'expo-clipboard';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';

const db = getFirestore();

async function DeleteUser(params) {
  // params[0] code params[1] user
  try {
    const ref = doc(db, "doula", params[0]);
    await updateDoc(ref, {
      user: arrayRemove(params[1])
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export default function TakvimScreen({route, navigation}) {
    const { name, code } = route.params;
    const [users, setUsers] = useState([]);
    const [admin, setAdmin] = useState([]);
    useEffect(() => {
      const unsub = onSnapshot(doc(db, "doula", code), { includeMetadataChanges: true },  (doc) => {
        setUsers(doc.data().user);
        setAdmin(doc.data().user[0])
      });
    }, []);

    const copyToClipboard = () => {
      Clipboard.setString(code);
    };

    const fetchCopiedText = async () => {
      const text = await Clipboard.getString();
      setCopiedText(text);
    };
   
  
    return (
      
      <ImageBackground source={require('../images/doula.jpg')} style={styles.container}>
        <View style={[styles.flex1, {justifyContent: 'flex-end'}]}>
          <TouchableOpacity onPress={() => navigation.navigate('Announcements', {name:name, code:code})} style={styles.banner}>
            <Text style={styles.txt}>📢 Process 📢</Text>
          
          </TouchableOpacity>
          
        </View>
        
        <View style={styles.flex5}>
          <Text style={styles.txt}>{name} Nurse</Text>
         
          {/* <FlatList style = {{backgroundColor: '#ddffff', width: '100%', borderRadius: 5}}
             data={users}
             keyExtractor={({ item }, index) => index}
             renderItem={({ item }, index) => 
              (
              <View style={styles.flatlistview}>
                <Text style = {[item == auth.currentUser?.email ? styles.green : styles.black]}>{item}</Text>
                {auth.currentUser?.email == admin && item != admin ? (
                <TouchableOpacity onPress={() => DeleteUser([code, item])} style={styles.deleteUser}>
                  <Text style={{color: 'red'}}>❌</Text>
                </TouchableOpacity>
                ) : <Text></Text>}
              </View>
              )
          }/> */}

          <Calendar
            onDayPress={day => {
              console.log('selected day', day);
            }}
          />
        
        </View>

        <View style={styles.flex1}>
          <TouchableOpacity style={styles.banner} onPress={copyToClipboard}>
            <Text style={styles.txt}>Click to Copy Period Code 📋</Text>
          </TouchableOpacity>
        </View>
       
        <BottomBar name={name} code={code} styles={styles.input} navigation = {navigation}/>
      </ImageBackground>
     
    );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#9BCCBA',
    alignItems: 'center',
    width: '100%'
  },
  banner: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10
  },
  txt:{
    fontSize: 25,
    color: 'red'
  },
  flex1:{
    flex: 1,
    justifyContent: 'center'
  },
  flex1row:{
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '90%'
  },
  flex5:{
    flex: 5,
    width: '90%'
  },
  tinyLogo:{
    width: 35,
    height: 35,
    resizeMode: 'stretch'
  },
  mic:{
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 30,
    borderColor: 'gray',
    borderWidth: 2
  },
  open:{
    backgroundColor: 'green',
  },
  close:{
    backgroundColor: 'red',
  },
  green:{
    color: 'green'
  },
  deleteUser:{
    backgroundColor: '#9BCCBA',
    width: 30,
    height:30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50
  },
  flatlistview:{
    borderBottomWidth: 2,
    borderColor: 'red',
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems: 'center',
    padding: 7
  }

});

 
