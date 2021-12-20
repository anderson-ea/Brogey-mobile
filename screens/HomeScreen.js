import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import tw from 'tailwind-rn';
import useAuth from '../hooks/useAuth';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import Swiper from "react-native-deck-swiper";
import { collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where } from '@firebase/firestore';
import { db } from '../firebase';
import generateId from '../lib/generateId';

// const DUMMY_DATA = [
//   {
//     firstName: "Eric",
//     lastName: "Anderson",
//     job: "Software Developer",
//     photoURL: "https://avatars.githubusercontent.com/u/59844963?v=4",
//     age: 31,
//     id: 123,
//   },
//   {
//     firstName: "Tiger",
//     lastName: "Woods",
//     job: "Pro Golfer",
//     photoURL: "https://i.imgur.com/C4FkYKT.jpeg",
//     age: 45,
//     id: 456,
//   },
// ];

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const swipeRef = useRef(null);

  useLayoutEffect(
    () => 
      onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (!snapshot.exists()) {
          navigation.navigate("Modal");
        }
      }),
    []
  );

  useEffect(() => {
    let unsub;

    const fetchCards = async () => {
      const passes = await getDocs(collection(db, "users", user.uid, "passes")).then(
        (snapshot) => snapshot.docs.map((doc) => doc.id)
      );

      const swipes = await getDocs(collection(db, "users", user.uid, "swipes")).then(
        (snapshot) => snapshot.docs.map((doc) => doc.id)
      );

      const passedUserIds = passes.length > 0 ? passes : ["test"];
      const swipedUserIds = swipes.length > 0 ? swipes : ["test"];

      unsub = onSnapshot(
        query(
          collection(db, "users"), 
          where("id", "not-in", [...passedUserIds, ...swipedUserIds])
        ), 
        (snapshot) => {
          setProfiles(
            snapshot.docs
              .filter((doc) => doc.id !== user.uid)
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
          );
        }
      );
    };
    fetchCards();
    return unsub;
  }, [db]);

  const swipeLeft = (cardIndex) => {
    if(!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];
    console.log(`You swiped PASS on ${userSwiped.displayName}`);

    setDoc(doc(db, "users", user.uid, "passes", userSwiped.id), userSwiped);
  };

  const swipeRight = async (cardIndex) => {
    if(!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];
    const loggedInProfile = await (
      await getDoc(doc(db, "users", user.uid))
    ).data();

    // Check if user already swiped on you...
    getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then(
      (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          // User was second to match...
          // Create a match
          console.log(`Awesome, you MATCHED with ${userSwiped.displayName}`);

          setDoc(doc(db, "matches", generateId(user.uid, userSwiped.id)), {
            users: {
              [user.uid]: loggedInProfile,
              [userSwiped.id]: userSwiped
            },
            usersMatched: [user.uid, userSwiped.id],
            timestamp: serverTimestamp(),
          });

          navigation.navigate("Match", {
            loggedInProfile,
            userSwiped,
          });
        } else {
          // User was first to swipe...
          console.log(
            `You swiped on ${userSwiped.displayName} (${userSwiped.job})`
          );
        }
        setDoc(
          doc(db, "users", user.uid, "swipes", userSwiped.id),
          userSwiped
        );
      }
    );
  };

  return (
    <SafeAreaView style={tw("flex-1")}>
      {/* Header */}
        <View style={tw("flex-row items-center justify-between px-5")}>
          <TouchableOpacity onPress={logout}>
            <Image 
              style={tw("h-10 w-10 rounded-full")} 
              source={{ uri: user.photoURL }} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
            <Image style={tw("h-14 w-14")} source={require("../images/smallLogo.png")} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
            <MaterialCommunityIcons name="chat" size={30} color="green" />
          </TouchableOpacity>
        </View>
      {/* End of Header */}
      {/* Cards */}
      <View style={tw("flex-1 -mt-6")}>
        <Swiper
          ref={swipeRef}
          containerStyle={{ backgroundColor: "transparent" }}
          cards={profiles}
          stackSize={5}
          cardIndex={0}
          animateCardOpacity
          verticalSwipe={false}
          onSwipedLeft={() => {
            swipeLeft(cardIndex);
            console.log('SWIPE PASS')
          }}
          onSwipedRight={() => {
            swipeRight(cardIndex);
            console.log('SWIPE MATCH')
          }}
          overlayLabels={{
            left: {
              title: "NOPE",
              style: {
                label: {
                  textAlign: "right",
                  color: "red",
                },
              },
            },
            right: {
              title: "MATCH",
              style: {
                label: {
                  color: "#4DED30",
                },
              },
            }
          }}
          renderCard={(card) => card ? (
            <View key={card.id} style={tw("relative bg-white h-3/4 rounded-xl")}>
              <Image 
                style={tw("absolute top-0 h-full w-full rounded-xl")}
                source={{ uri: card.photoURL}} 
              />
              <View 
                style={[
                  tw(
                    "absolute bottom-0 bg-white w-full flex-row justify-between items-center h-20 px-6 py-2 rounded-b-xl"
                  ),
                  styles.cardShadow,
                ]}
              >
                <View>
                  <Text style={tw("text-xl font-bold")}>
                    {card.displayName}
                  </Text>
                  <Text>{card.job}</Text>
                </View>
                <Text style={tw("text-2xl font-bold")}>{card.age}</Text>
              </View>
            </View>
          ) : (
            <View
              style={[
                tw(
                  "relative bg-white h-3/4 rounded-xl justify-center items-center"
                ),
                styles.cardShadow,
              ]}
            >
              <Text style={tw("font-bold pb-5")}>No more profiles</Text>
              <Image 
                style={tw("h-20 w-full")}
                height={100}
                width={100}
                source={{ uri: "https://links.papareact.com/6gb" }}
              />
            </View>
          )
        }
      />
      </View>
      <View style={tw("flex flex-row justify-evenly bottom-8")}>
        <TouchableOpacity 
          onPress={() => swipeRef.current.swipeLeft()} 
          style={tw("items-center justify-center rounded-full w-16 h-16 bg-red-200")}>
          <FontAwesome name="thumbs-o-down" size={24} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => swipeRef.current.swipeRight()} 
          style={tw("items-center justify-center rounded-full w-16 h-16 bg-green-200")}>
          <FontAwesome name="thumbs-o-up" size={24} />
        </TouchableOpacity>
      </View>      
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width:0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
})