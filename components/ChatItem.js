import React, { Children } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewBase } from 'react-native';
import { auth } from '../firebase';
import { getFirestore, doc, arrayRemove, updateDoc} from "firebase/firestore"; 

const db = getFirestore();

async function DeleteMessage(params) {
  // params[0] code params[1] message
  try {
    const ref = doc(db, "doula", params[0]);
    await updateDoc(ref, {
      message: arrayRemove(params[1]),
      announcements: arrayRemove(params[1])
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export default function ChatItem(props) {
  let chat = props.message.split(" ");
  const user = chat[0];
  const time = chat[1];
  chat.shift()
  chat.shift()
  let message = "";
  for (let i = 0; i < chat.length; i++) {
    message+= chat[i]+ " "
    
  }
  return (
    <View style={[user == auth.currentUser?.email ?  styles.container2: styles.container] }>
        <View style={styles.row}>
            <Text style={styles.name}>
                    {user}
            </Text>
            <Text style={styles.name}>
                    {time}
            </Text>
        </View>
        <View style={[user == auth.currentUser?.email ?  styles.right: styles.left]}>
          <Text style={styles.txt}>
              {message}
          </Text>
          {user == auth.currentUser?.email ? (
            <TouchableOpacity onPress={() => DeleteMessage([props.code, props.message])}>
              <Text style={{color: 'red'}}>Delete</Text>
            </TouchableOpacity>
          ) : <></>}
        </View>
     
   
    </View>
   
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: 'white',
    marginBottom: 4,
    marginTop: 4,
    paddingLeft: 10,
    paddingRight: 10
  },
  container2: {
    borderRadius: 10,
    backgroundColor: '#ffff90',
    marginBottom: 4,
    marginTop: 4,
    paddingLeft: 10,
    paddingRight: 10
  },
  txt:{
    color: 'black',
    fontSize: 16,
  },
  name:{
    color: '#9BCCBA',
    fontSize: 10
  },
  row:{
      flexDirection: 'row',
      justifyContent: 'space-between'
  },
  right:{
    alignItems: 'flex-end'
  },
  left:{
    alignItems: 'flex-start'
  }
  
});
