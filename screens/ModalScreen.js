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
  const [job, setJob] = useState(null);
  const [age, setAge] = useState(null);

  const incompleteForm = !image || !job || !age;

  const updateUserProfile = () => {
    setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      displayName: user.displayName,
      photoURL: image,
      job: job,
      age: age,
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
        Step 2: Occupation
      </Text>
      <TextInput
        value={job}
        onChangeText={text => setJob(text)}
        style={tw("text-center text-xl pb-2")} 
        placeholder="Enter Your Occupation"
      />
      <Text style={tw("text-center p-4 font-bold text-green-400")}>
        Step 3: Age
      </Text>
      <TextInput
        value={age}
        onChangeText={text => setAge(text)}
        style={tw("text-center text-xl pb-2")} 
        placeholder="Enter Your Age"
        keyboardType="numeric"
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
