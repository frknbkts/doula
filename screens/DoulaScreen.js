import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, ActivityIndicator, ImageBackground, Modal } from 'react-native';
import Channel from '../components/Channel';
import { auth } from '../firebase';
import { getFirestore, collection, query, setDoc, getDocs, doc, arrayUnion, updateDoc, getDoc } from "firebase/firestore";

function createCode() {
  let code = '';
  for (let i = 0; i < 9; i++) {
    let x = Math.round(Math.random() * 9);
    code += x;
  }
  return code;
}

const db = getFirestore();

async function CreateDoula(params) {
  try {
    let kod = createCode();
    await setDoc(doc(db, "doula", kod), {
      doctorId: [auth.currentUser?.uid],
      name: params,
      code: kod,
      user: [auth.currentUser?.email],
      messages: []
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

async function joinDoula(params) {
  console.log(params);
  try {
    const ref = doc(db, "doula", params);
    await updateDoc(ref, {
      user: arrayUnion(auth.currentUser?.email)
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export default function DoulaScreen({ navigation }) {
  const [cDoula, setcDoula] = useState('');
  const [jDoula, setjDoula] = useState('');
  const [createText, setCreateText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('pregnant');
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      await getUserData(); // Fetch user data and update userType
      getData(); // Fetch initial data
    };

    fetchData(); // Call fetchData when component mounts
  }, []);

  async function getUserData() {
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        const role = docSnapshot.data().role;
        setUserType(role);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.log("Error in get user data: ", error);
    }
  }

  async function getData() {
    let s = [];
    const q = query(collection(db, "doula"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      doc.data().user.forEach((i) => {
        if (i === auth.currentUser?.email) s = [...s, doc.data()];
      });
    });
    setData(s);
    setLoading(false);
  }

  async function updateUsername() {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { username: username });
    } catch (error) {
      console.error("Error updating username: ", error);
    }
  }

  const handleSignOut = () => {
    auth.signOut()
      .then(() => {
        navigation.replace("Login");
      })
      .catch(error => alert(error.message));
  }

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSubmitUsername = () => {
    console.log('Username:', username);
    updateUsername(); // Update the username in Firebase
    handleCloseModal();
  };

  return (
    <ImageBackground source={require('../images/doula.jpg')} style={styles.homescreen}>
      <View style={styles.banner}><Text style={styles.bannerText}>Doulalar</Text></View>

      <View style={styles.flex2}>
        <Text style={styles.createText}>{createText}</Text>

        {userType !== "pregnant" && (
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Doula Name"
              value={cDoula}
              onChangeText={text => setcDoula(text)}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                if (cDoula.length > 2) {
                  CreateDoula(cDoula);
                  setCreateText('Doula was Created.');
                  setcDoula("");
                } else {
                  setCreateText('Doula name is too short.');
                }
                getData();
              }}
            >
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Doula Code"
            value={jDoula}
            onChangeText={text => setjDoula(text)}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => {
              joinDoula(jDoula);
              setCreateText('Joined the Doula.');
              getData();
            }}
          >
            <Text style={styles.buttonText}>Join</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.openModalButton}
          onPress={handleOpenModal}
        >
          <Text style={styles.buttonText}>Enter Username</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.flex6}>
        {loading ? (
          <ActivityIndicator size="large" color="#ff0000" />
        ) : (
          <FlatList
            style={styles.flatList}
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }, index) => (
              <Channel key={index} onPress={() => navigation.navigate('Messages')} doulaName={item.name} doulaCode={item.code} navigation={navigation} />
            )}
          />
        )}
      </View>

      <Text style={styles.userEmail}>{auth.currentUser?.email}</Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter Username</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSubmitUsername}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  homescreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    backgroundColor: '#EF3939',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 10,
  },
  bannerText: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  flex2: {
    flex: 2,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  createText: {
    fontSize: 18,
    color: '#ffdddd',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
    gap: 5,
  },
  input: {
    flex: 2,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    height: 50,
    fontSize: 18,
    paddingLeft: 15,
    paddingRight: 15,
    marginHorizontal: 5,
  },
  createButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#008CBA',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  openModalButton: {
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: '80%',
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
  flex6: {
    flex: 6,
    width: '100%',
  },
  flatList: {
    paddingTop: 130,
    width: '100%',
    paddingHorizontal: 20,
  },
  userEmail: {
    fontSize: 16,
    color: '#ffffff',
    marginVertical: 20,
  },
  signOutText: {
    fontSize: 18,
    color: '#ff0000',
    marginBottom: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    height: 50,
    fontSize: 18,
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
});

