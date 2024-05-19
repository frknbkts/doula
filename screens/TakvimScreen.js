import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ImageBackground, TextInput, Alert } from 'react-native';
import BottomBar from '../components/BottomBar';
import { auth } from '../firebase';
import { doc, onSnapshot, getFirestore, updateDoc, arrayRemove } from "firebase/firestore";
import * as Clipboard from 'expo-clipboard';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { getDoc, setDoc } from "firebase/firestore";
import { arrayUnion, writeBatch } from "firebase/firestore";
import DropDownPicker from 'react-native-dropdown-picker';
import { Image } from 'react-native';
import Checkbox from 'expo-checkbox';








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

  const [open, setOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bloodPressure, setBloodPressure] = useState('');


  const getTodayDate = () => {// ##### Change the day here
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, '0');

    // return `${year}-${month}-${day}`;

    return "2024-05-02";
  };


  const [userType, setUserType] = useState(null);
  const [creationTime, setCreationTime] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [startingDay, setStartingDay] = useState(null);
  const [mode, setMode] = useState('start');
  const [currentRange, setCurrentRange] = useState([]);
  const [examinationType, setExaminationType] = useState('BPUT');
  let todayDate



  /* COlORS

    Blood pressure & urine tests. #59CF35  BPUT

    Routine check-up

    Anatomy ultrasound. #50cebb  AU

    Birth plan discussion. #5063CE  BPD


  */


  const handleDayPress = (day) => {

    if (userType !== 'doctor')
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

  let markedDatesV;
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
        markedDatesV = transformedMarkedDates

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
      todayDate = getTodayDate()
      console.log("TD" + todayDate);
      await getUserData();
      await fetchAllRanges().then(() => {
        const newDate = {
          [todayDate]: {
            ...markedDatesV[todayDate], // Spread existing properties
            marked: true, // Add or override the marked property
            dotColor: "#FF5044"
          }
        };
        console.log(newDate);

        setMarkedDates(prevDates => ({
          ...prevDates,
          ...newDate
        }));

        todayTest(todayDate)
      });
    };

    fetchData();

    // // Mark today's date
    // const today = getTodayDate();
    // setMarkedDates((prev) => ({
    //   ...prev,
    //   [today]: { marked: true, dotColor: 'red' } // Add dotColor or any other marking style you prefer
    // }));
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

  const showModal = () => {
    // Function to clear calendar or perform any other action
    // Set modalVisible to true to show the popup
    setModalVisible(true);
  };

  const closeModal = () => {
    // Function to close the modal
    setModalVisible(false);
  };

  const checkBloodPressure = (pressure) => {


    if (pressure <= 60) {
      Alert.alert(
        "Düşük Tansiyon Uyarısı",
        "- Tansiyonuz Düşük\n" +
        "1. Dengeli Beslenme\n" +
        "Düşük tansiyon durumunda, düzenli ve dengeli beslenmek önemlidir. Özellikle yüksek karbonhidratlı ve düşük glisemik indeksli gıdalar tüketmek, kan şekerinin dengelenmesine ve tansiyonun artmasına yardımcı olur.\n\n" +
        "2. Sıvı Alımı\n" +
        "Yeterli miktarda su içmek, vücudun sıvı dengesini korumaya yardımcı olurken tansiyon düşüklüğünün semptomlarını da hafifletebilir. Özellikle sabahları yataktan kalktıktan sonra ve yemeklerden önce su içmek faydalı olacaktır.\n\n" +
        "3. Tuz Tüketimi\n" +
        "Tuzlu yiyecekler ve tuz içeren içecekler tansiyonu yükseltebilir. Bu nedenle düşük tansiyonu olan kişilerin tuz tüketimine dikkat etmeleri önemlidir.\n"
      );
    } else if (pressure > 80) {
      Alert.alert(
        "Yüksek Tansiyon Uyarısı",
        "- Tansiyonuz Yüksek\n" +
        "1. Sol tarafınıza yatarak dinlenin. Hamilelikte tansiyon yükselmesi anne ve bebeğin oksijen teminini tehlikeye sokar. Bu nedenle enerji sarfiyatını en aza indirgeyip vücudu dinlendirmek gerekir."
      );
    }
  };

  const uploadCompletedTest = async (testType) => {
    console.log("Uploading tests");
    todayDate = getTodayDate()
    console.log(todayDate);

    try {
      // Create a document reference
      const docRef = doc(db, "doula", code);


      // Set the data to be uploaded
      if (testType == "BPUT") {
        console.log(bloodPressure, urineTest);

        const data = {
          [todayDate]: {
            bloodPressure: bloodPressure, // Assuming bloodPressure is the value you want to upload
            urineTest: urineTest,

          }
        };

        // Upload the data to Firestore
        await updateDoc(docRef, {
          completedTests: arrayUnion(data) // Assuming you want to store multiple tests in an array
        });
      }
      else if (testType == "AU") {
        console.log(AUtest);

        const data = {
          [todayDate]: {
            anatomyUltrasonicTest: AUtest, // Assuming bloodPressure is the value you want to upload

          }
        };

        // Upload the data to Firestore
        await updateDoc(docRef, {
          completedTests: arrayUnion(data) // Assuming you want to store multiple tests in an array
        });
      }



      console.log("Completed tests uploaded successfully.");
    } catch (error) {
      console.error("Error uploading completed tests: ", error);
    }
  };

  const fetchCompletedTest = async () => {
    try {
      // Get the document snapshot for the specified doula code
      const docRef = doc(db, "doula", code);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        // Extract the marked dates data from the document snapshot
        const fetchedMarkedDates = docSnapshot.data().completedTests || [];


        // Function to format test data
        const formatTestData = (data) => {
          return data.map((item, index) => {
            const date = Object.keys(item)[0];
            const test = item[date];

            let testDetails = `Test ${index + 1}:\nDate: ${date}\n`;

            if ('bloodPressure' in test) {
              testDetails += `Blood Pressure: ${test.bloodPressure}\n`;
            }
            if ('urineTest' in test) {
              testDetails += `Urine Test: ${test.urineTest ? 'Yes' : 'No'}\n`;
            }
            if ('anatomyUltrasonicTest' in test) {
              testDetails += `Anatomy Ultrasonic Test: ${test.anatomyUltrasonicTest ? 'Yes' : 'No'}\n`;
            }

            return testDetails.trim(); // Remove any trailing newline character
          }).join('\n\n');
        };
        // Update the markedDates state with the transformed data

        // setMarkedDates(transformedMarkedDates);
        // markedDatesV = transformedMarkedDates

        // Function to display test data in an alert

        const formattedData = formatTestData(fetchedMarkedDates);
        Alert.alert('Completed Tasks', formattedData);


        console.log("Completed test fetched successfully:", fetchedMarkedDates);
      } else {
        console.log("Document does not exist");
      }
    } catch (error) {
      console.error("Error fetching completed test:", error);
      // Handle the error as needed
    }
  };


  const submitBloodPressure = () => {
    checkBloodPressure(bloodPressure);
    uploadCompletedTest("BPUT")
    closeModal();
  };

  const submitAnatomyUltrasound = () => {
    uploadCompletedTest("AU")
    closeModal();
  };


  const [showBPUT, setshowBPUT] = useState(false)
  const [showAU, setshowAU] = useState(false)
  // const [showBPD, setshowBPD] = useState(false)

  const [urineTest, seturineTest] = useState(false)
  const [AUtest, setAUtest] = useState(false)
  // const [BPDtest, setBPDtest] = useState(false)


  //       Blood pressure & urine tests. #59CF35  BPUT

  //       Routine check - up

  //       Anatomy ultrasound. #50cebb  AU

  //       Birth plan discussion. #5063CE  BPD

  const todayTest = (today) => {

    // Check if today's date has the color '#59CF35' in markedDates
    console.log("QQQQQQ" + today);
    if (markedDatesV !== null) {

      console.log("AAAAAAAAAAAAAAAAAAAAAAAAAaa:" + markedDatesV[today]?.color);
      console.log(markedDatesV);
      if (markedDatesV[today]?.color === '#59CF35') {
        console.log("Blood pressure & urine tests (BPUT) Day");
        setshowBPUT(true)
      } else if (markedDatesV[today]?.color === '#50cebb') {
        console.log("Anatomy ultrasound test (AU) Day");
        setshowAU(true)
      }
      else if (markedDatesV[today]?.color === '#5063CE') {
        console.log("Birth plan discussion (BPD) Day");

      }
    }
  }


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


          onDayPress={handleDayPress}


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
            <View style={styles.flex6}>
              <Image
                source={require('../assets/Colors Instruction.jpeg')} // Local image
                // source={{ uri: 'https://example.com/image.jpg' }} // Remote image
                style={{ width: '100%', height: '50%' }} // Adjust the width and height as needed
              />
              <TouchableOpacity style={styles.taskBtn} onPress={showModal}>
                <Text style={styles.txt2}>Do tasks</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.taskBtn} onPress={fetchCompletedTest}>
                <Text style={styles.txt2}>Completed tasks</Text>
              </TouchableOpacity>


              {/* Popup screen  */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
              >

                <View style={styles.modalContainer}>

                  {showBPUT && (
                    <View style={{ alignItems: 'center' }}
                    >
                      <View style={styles.row}>

                        <Text style={styles.popupHeader}>Urine Test:</Text>
                        <Checkbox value={urineTest} onValueChange={seturineTest} color="#59CF35" />
                      </View>

                      <Text style={styles.popupHeader}>Enter blood pressure</Text>

                      <TextInput
                        style={[styles.input, { fontSize: 20, color: 'white', fontWeight: 'bold' }]}
                        placeholder="Blood pressure"
                        placeholderTextColor="gray"
                        onChangeText={setBloodPressure}
                        value={bloodPressure}
                        keyboardType="numeric"
                      />

                      <TouchableOpacity style={styles.inPopupBtn} onPress={submitBloodPressure}>
                        <Text style={styles.txt2}>Submit BPUT</Text>
                      </TouchableOpacity>
                    </View>


                  )}

                  {showAU && (
                    <View style={{ alignItems: 'center' }}
                    >
                      <View style={styles.row}>

                        <Text style={styles.popupHeader}>Anatomy Ultrasound Test:</Text>
                        <Checkbox value={AUtest} onValueChange={setAUtest} color="#50cebb" />
                      </View>

                      <TouchableOpacity style={styles.inPopupBtn} onPress={submitAnatomyUltrasound}>
                        <Text style={styles.txt2}>Submit AU</Text>
                      </TouchableOpacity>
                    </View>


                  )}

                  {/* <Text style={styles.txt}>This is a popup screen</Text> */}
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.txt}>Close</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
              {/* Popup screen end  */}

            </View>
          )}
        </View>
        {/* 

        Blood pressure & urine tests. #59CF35  BPUT

        Routine check-up

        Anatomy ultrasound. #50cebb  AU

        Birth plan discussion. #5063CE  BPD
        
        */}


      </View>

      <View style={styles.flex2}>
        <TouchableOpacity style={styles.banner} onPress={copyToClipboard}>
          <Text style={styles.txt}>Click to Copy Period Code 📋</Text>
        </TouchableOpacity>
      </View>

      <BottomBar name={name} code={code} styles={styles.input} navigation={navigation} />
    </ImageBackground>

  );
}

const styles = StyleSheet.create({
  flex2: {
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18
  },
  inPopupBtn: {
    backgroundColor: '#E2E2E2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
    width: '100%',
  },
  popupHeader: {
    fontSize: 25,
    color: 'white',
    paddingBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  input: {
    height: 60,
    width: 160,
    textAlign: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: 'white', // Change text color to blue
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent black color
  },
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
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',

  },
  txt3: {
    fontSize: 25,
    color: 'white',
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


