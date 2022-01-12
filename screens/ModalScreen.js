import { doc, serverTimestamp, setDoc } from "@firebase/firestore";
import { useNavigation } from "@react-navigation/core";
import React, { useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity } from "react-native";
import tw from "tailwind-rn";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";

const ModalScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [drinking, setDrinking] = useState(null);
  const [walking, setWalking] = useState(null);
  const [handicap, setHandicap] = useState(null);
  const [age, setAge] = useState(null);

  const incompleteForm = !image || !drinking || !age || !walking || !handicap;

  const updateUserProfile = () => {
    setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      displayName: user.displayName,
      photoURL: image,
      handicap: handicap,
      age: age,
      drinking: drinking,
      walking: walking,
      timestamp: serverTimestamp(),
    })
      .then(() => {
        navigation.navigate("Home")
      })
      .catch(error => {
        alert(error.message);
      });
  };

  return (
    <View style={tw("flex-1 items-center pt-1")}>
      <Image 
        style={tw("h-12 w-full top-3")}
        resizeMode="contain"
        source={require("../images/logo.png")}
      />

      <Text style={tw("text-xl text-gray-500 p-5 font-bold top-2")}>
        Welcome, {user.displayName}
      </Text>
      <Text style={tw("text-center p-4 font-bold text-green-400")}>
        Step 1: Profile Pic
      </Text>
      <TextInput
        value={image}
        onChangeText={text => setImage(text)}
        style={tw("text-center text-xl pb-2")} 
        placeholder="Enter a Profile Pic URL"
      />
      <Text style={tw("text-center p-4 font-bold text-green-400")}>
        Step 2: Age
      </Text>
      <TextInput
        value={age}
        onChangeText={text => setAge(text)}
        style={tw("text-center text-xl pb-2")} 
        placeholder="Enter Your Age"
        keyboardType="numeric"
      />
      <Text style={tw("text-center p-4 font-bold text-green-400")}>
        Step 3: Handicap
      </Text>
      <TextInput
        value={handicap}
        onChangeText={text => setHandicap(text)}
        style={tw("text-center text-xl pb-2")} 
        placeholder="Enter Your Handicap"
        keyboardType="numeric"
      />
      <Text style={tw("text-center p-4 font-bold text-green-400")}>
        Step 4: Walking
      </Text>
      <TextInput
        value={walking}
        onChangeText={text => setWalking(text)}
        style={tw("text-center text-xl pb-2")} 
        placeholder="Yes or No"
      />
      <Text style={tw("text-center p-4 font-bold text-green-400")}>
        Step 5: Drinking
      </Text>
      <TextInput
        value={drinking}
        onChangeText={text => setDrinking(text)}
        style={tw("text-center text-xl pb-2")} 
        placeholder="Yes or No"
      />
      <TouchableOpacity
        onPress={updateUserProfile} 
        disabled={incompleteForm}
        style={[tw("w-64 p-3 rounded-xl absolute bottom-10"),
          incompleteForm ? tw("bg-gray-400") : tw("bg-green-400")
        ]}
      >
        <Text style={tw("text-center text-white text-xl")}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  )
}

export default ModalScreen
