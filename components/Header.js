import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import tw from 'tailwind-rn';
import { useNavigation } from '@react-navigation/core';

const Header = ({ title, callEnabled }) => {
  const navigation = useNavigation();
  return (
    <View style={tw("p-2 flex-row items-center justify-between")}>
      <View style={tw("flex flex-row items-center")}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw("p-2")}> 
          <Ionicons name="chevron-back-outline" size={34} color="#28a31f" />
        </TouchableOpacity>
        <Text style={tw("text-2xl font-bold pl-2")}>{title}</Text>
      </View>

      {callEnabled && (
        <TouchableOpacity style={tw("rounded-full mr-4 p-3 bg-green-200")}>
          <Foundation style={tw("")} name="telephone" size={20} color="green" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;
