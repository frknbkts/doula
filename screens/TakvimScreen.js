import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ImageBackground } from 'react-native';
import BottomBar from '../components/BottomBar';
import { auth } from '../firebase';
import { doc, onSnapshot, getFirestore, updateDoc, arrayRemove } from "firebase/firestore";
import * as Clipboard from 'expo-clipboard';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { getDoc, setDoc } from "firebase/firestore";
import { arrayUnion, writeBatch } from "firebase/firestore";
import DropDownPicker from 'react-native-dropdown-picker';
import { Image } from 'react-native';








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

export default function TakvimScreen({ route, navigation }) {
  const { name, code } = route.params;
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState([]);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "doula", code), { includeMetadataChanges: true }, (doc) => {
      setUsers(doc.data().user);
      setAdmin(doc.data().user[0])
    });
  }, []);
  const [userType, setUserType] = useState(null);
  const [creationTime, setCreationTime] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [startingDay, setStartingDay] = useState(null);
  const [mode, setMode] = useState('start');
  const [currentRange, setCurrentRange] = useState([]);
  const [examinationType, setExaminationType] = useState('BPUT');



  /* COlORS

    Blood pressure & urine tests. #59CF35  BPUT

    Routine check-up

    Anatomy ultrasound. #50cebb  AU

    Birth plan discussion. #5063CE  BPD


  */


  const handleDayPress = (day) => {

    if(userType !== 'doctor')
      return false


    const { dateString } = day;
    let color = '#59CF35'
    if (examinationType === 'AU')
      color = '#50cebb'

    else if (examinationType === 'BPD')
      color = '#5063CE'


    console.log("Examination Type: " + examinationType);
    console.log("Color: " + color);

    if (mode === 'start') {
      // Set the selected day as the starting day

      setMarkedDates({ ...markedDates, [dateString]: { startingDay: true, color: color } });
      setStartingDay(dateString);
      setMode('end');
    } else if (mode === 'end') {
      const startDate = new Date(startingDay);
      const endDate = new Date(dateString);

      if (endDate >= startDate) {
        // Calculate the days between the start and end dates
        const daysInBetween = getDaysInBetween(startDate, endDate);

        // Create an array to store the days in the selected range
        const range = daysInBetween.map((date) => date.toISOString().split('T')[0]);

        // Add the selected range to the current range
        setCurrentRange([...currentRange, ...range]);

        // Mark the days in the selected range
        const updatedMarkedDates = { ...markedDates };
        range.forEach((date) => {
          updatedMarkedDates[date] = { color: color, textColor: 'white' };
        });
        updatedMarkedDates[startingDay].startingDay = true;
        updatedMarkedDates[dateString].endingDay = true;

        setMarkedDates(updatedMarkedDates);
        setStartingDay(null);
        setMode('start');
      } else {
        // If the end date is before the start date, reset the mode and marking
        setMarkedDates({});
        setStartingDay(null);
        setMode('start');
      }
    }
  };

  const getDaysInBetween = (startDate, endDate) => {
    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const fetchAllRanges = async () => {
    try {
      // Get the document snapshot for the specified doula code
      const docRef = doc(db, "doula", code);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        // Extract the marked dates data from the document snapshot
        const fetchedMarkedDates = docSnapshot.data().markedDates || [];

        // Convert the fetched data into the desired format
        const transformedMarkedDates = fetchedMarkedDates.reduce((acc, dateObj) => {
          const { date, ...rest } = dateObj;
          acc[date] = rest;
          return acc;
        }, {});

        // Update the markedDates state with the transformed data
        setMarkedDates(transformedMarkedDates);

        console.log("Marked dates fetched successfully:", transformedMarkedDates);
      } else {
        console.log("Document does not exist");
      }
    } catch (error) {
      console.error("Error fetching marked dates:", error);
      // Handle the error as needed
    }
  };

  

  const clearCalendar = async () => {
    setMarkedDates(null)
    console.log("Cleared successfully");
  };


  const uploadAllRanges = async () => {
    console.log("Upload all ranges button pressed");
    try {
      const batch = [];

      // Iterate over the markedDates state
      for (const date in markedDates) {
        const { startingDay, endingDay, color } = markedDates[date];
        const dateData = {
          date,
          startingDay: !!startingDay, // Convert to boolean
          endingDay: !!endingDay, // Convert to boolean
          color: color || 'default_color' // Default color if not provided
        };

        // Push each marked date to the batch
        batch.push(dateData);
      }

      // Upload the batch to Firestore
      const ref = doc(db, "doula", code);
      await updateDoc(ref, {
        markedDates: batch
      });

      console.log("Marked dates uploaded successfully.");
    } catch (error) {
      console.error("Error uploading ranges: ", error);
    }
  };





  const copyToClipboard = () => {
    Clipboard.setString(code);
  };



  useEffect(() => {
    const fetchData = async () => {
      await getUserData(); // Fetch user data and update userType
      if (userType !== 'doctor') fetchAllRanges()
    };

    fetchData(); // Call fetchData when component mounts
  }, []);


  async function getUserData() {//
    try {
      console.log("getUserData function");
      console.log(auth.currentUser.uid);
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        // Access the role field from the document data
        const role = docSnapshot.data().role;
        const creationTime = docSnapshot.data().creationTime.toDate();
        setUserType(role);
        setCreationTime(creationTime);

        console.log("User role: ", role);
        console.log("Creation Time: ", creationTime);

      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.log("Error in get user data: ", error);
    }
  }

  const [open, setOpen] = useState(false);



  return (

    <ImageBackground source={require('../images/doula.jpg')} style={styles.container}>
      <View style={[styles.flex1, { justifyContent: 'flex-end' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Announcements', { name: name, code: code })} style={styles.banner}>
          <Text style={styles.txt}>📢 Process 📢</Text>

        </TouchableOpacity>

      </View>

      <View style={styles.flex5}>
        <Text style={styles.calendar}>{name} Nurse</Text>
        <Calendar
          style={styles.txt}

          
            onDayPress = { handleDayPress }
   

          markingType={'period'}
          markedDates={markedDates}
        />


        <View style={styles.flex7}>
          {userType === 'doctor' && (
            <View style={styles.comboBox}>
              <DropDownPicker
                open={open}
                value={examinationType}
                items={[
                  { label: 'Blood pressure & urine tests', value: 'BPUT' },
                  { label: 'Anatomy ultrasound.', value: 'AU' },
                  { label: 'Birth plan discussion.', value: 'BPD' }
                ]}
                setOpen={setOpen}
                setValue={setExaminationType}

              />
            </View>
          )}


          {userType === 'doctor' && (
            <View style={styles.flex6}>

              {mode !== 'end' && (
                <TouchableOpacity style={styles.taskBtn} onPress={uploadAllRanges}>
                  <Text style={styles.txt2}>Upload All Ranges</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.taskBtn} onPress={fetchAllRanges}>
                <Text style={styles.txt2}>Fetch Ranges</Text>
              </TouchableOpacity>


              <TouchableOpacity style={styles.taskBtn} onPress={clearCalendar}>
                <Text style={styles.txt2}>Clear Calendar</Text>
              </TouchableOpacity>

            </View>
          )}

          {userType !== 'doctor' && (
            <Image
              source={require('../assets/Colors Instruction.jpeg')} // Local image
              // source={{ uri: 'https://example.com/image.jpg' }} // Remote image
              style={{ width: '100%', height: '50%' }} // Adjust the width and height as needed
            />
          )}
        </View>
        {/* 

        Blood pressure & urine tests. #59CF35  BPUT

        Routine check-up

        Anatomy ultrasound. #50cebb  AU

        Birth plan discussion. #5063CE  BPD
        
        */}


      </View>

      <View style={styles.flex1}>
        <TouchableOpacity style={styles.banner} onPress={copyToClipboard}>
          <Text style={styles.txt}>Click to Copy Period Code 📋</Text>
        </TouchableOpacity>
      </View>

      <BottomBar name={name} code={code} styles={styles.input} navigation={navigation} />
    </ImageBackground>

  );
}

const styles = StyleSheet.create({
  comboBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  container: {
    flex: 1,
    backgroundColor: '#9BCCBA',
    alignItems: 'center',
    width: '100%'
  },
  taskBtn: {
    backgroundColor: '#E2E2E2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
    width: '100%',
    paddingBottom: 10
  },
  banner: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10
  },
  txt: {
    fontSize: 25,
    color: 'red'
  },

  txt2: {
    fontSize: 25,
    color: 'black',
    fontWeight: 'bold'
  },
  flex1: {
    flex: 1,
    justifyContent: 'center'
  },
  flex1row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '90%'
  },
  flex5: {
    flex: 5,
    width: '90%'
  },
  flex6: {
    gap: 3
  },

  flex7: {
    paddingTop: 5,
    gap: 55
  },
  tinyLogo: {
    width: 35,
    height: 35,
    resizeMode: 'stretch'
  },
  mic: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 30,
    borderColor: 'gray',
    borderWidth: 2
  },
  open: {
    backgroundColor: 'green',
  },
  close: {
    backgroundColor: 'red',
  },
  green: {
    color: 'green'
  },
  deleteUser: {
    backgroundColor: '#9BCCBA',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50
  },
  flatlistview: {
    borderBottomWidth: 2,
    borderColor: 'red',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 7
  }

});


