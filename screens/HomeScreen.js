import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity, FlatList } from 'react-native';
import BottomBar from '../components/BottomBar';
import ChatItem from '../components/ChatItem';
import { auth } from '../firebase';
import { doc, onSnapshot, getFirestore, updateDoc, arrayUnion } from "firebase/firestore";

const db = getFirestore();

export default function HomeScreen({route, navigation}) {
    const { name, code } = route.params;
    const [message, setMessage] = useState([])
    const [sendMessage, setSendMessage] = useState("")
   

    useEffect(() => {
      const unsub = onSnapshot(doc(db, "doula", code), { includeMetadataChanges: true },  (doc) => {
        if(doc.data().message != undefined)
        {
          setMessage(doc.data().message.reverse());
        }
      });
    }, []);

    async function createMessage(params) {
      try {
        const ref = doc(db, "doula", code);
        var today = new Date()
        await updateDoc(ref, {
          message: arrayUnion(auth.currentUser?.email + " " + (today.getDate()<10?'0':'')+ today.getDate() + "." + (today.getMonth()+ 1<10?'0':'') + Number(today.getMonth() + 1) + "." +Number(today.getYear() - 100)+ "/" + (today.getHours()<10?'0':'')+ today.getHours() + ":" + (today.getMinutes()<10?'0':'')+ today.getMinutes() + " " + params
          )
        });
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
    
    return (
      <View style={styles.homescreen}>
        
        <View style={styles.banner}><Text style={styles.txt}>{name}</Text></View>
        <View  style={styles.chat}>
          <FlatList
              inverted
              data={message}
              keyExtractor={({ item }, index) => index}
              renderItem={({ item }, index) => 
                  (<ChatItem message = {item} code= {code}/>)
              }
          />

        </View>
        
        <View style= {styles.input}>
          <TextInput
            onChangeText={text => setSendMessage(text)}
            style={styles.btn}
            placeholder='Message'
            value={sendMessage}
          />
          <TouchableOpacity style={styles.send}
            onPress={() => {
              createMessage(sendMessage)
              setSendMessage("")
              }
            }
          >
            <Text style={styles.txt}>↑</Text>
          </TouchableOpacity>
        </View>
 
        <BottomBar name={name} code={code} styles={styles.input} navigation = {navigation}/>
      </View>
    );
}

const styles = StyleSheet.create({
  homescreen: {
    flex: 1,
    backgroundColor: '#F8E8E8'
  },
  btn:{
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderColor: '#ffffff',
    borderWidth: 1,
    padding: 10,
    width:'90%'
  },
  banner: {
    flex: 1,
    backgroundColor: '#EF3939',
    width: '100%',
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    lineHeight: 30,
    fontSize: 30,
    paddingTop: 30
  },
  input: {
    flexDirection: 'row'
  },
  txt: {
    flex: 1,
    fontSize: 30,
    color: '#ffffff'
  },
  chat: {
    flex:10
  },
  send:{
    backgroundColor: '#9BCCBA',
    justifyContent:'center',
    alignItems: 'center',
    borderRadius: 10,
    width: '10%'
  }
});
