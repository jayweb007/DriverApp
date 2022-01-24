import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Platform,
  Pressable,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { ENV_GOOGLE_DIRECTION_KEY } from "@env";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NewOrderPopup from "../components/NewOrderPopup";

const droppingOff = { latitude: 6.50359, longitude: 3.37254 }; //Use it as Drivers location to test DROPPING OFF
const { width, height } = Dimensions.get("window");

//
const Home = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [showAcceptButton, setShowAcceptButton] = useState(true);
  const [myPosition, setMyPosition] = useState(null);
  const [order, setOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    id: "1",
    type: "UberX",

    originLatitude: 6.50659,
    originLongitude: 3.37454,

    destLatitude: 6.51945,
    destLongitude: 3.37198,

    user: {
      name: "Dorcas",
      rating: 4.7,
    },
  });

  const onAccept = () => {
    setOrder(newOrder);

    setShowAcceptButton(!showAcceptButton);
  };

  const onDecline = () => {
    setNewOrder(null);
  };

  const onGoButton = () => {
    setIsOnline(!isOnline);
  };
  // To get Driver's POSITION
  const onUserLocationChange = (event) => {
    setMyPosition(event.nativeEvent.coordinate);
  };

  // distance and duration to USER
  const goingToUser = (event) => {
    if (order) {
      setOrder({
        ...order,
        distance: event.distance,
        duration: event.duration,
        pickedup: order.pickedup || event.distance < 0.2,
        isFinished: order.pickedup && event.distance < 0.2,
      });
    }
  };

  //getting destination from DRIVER to USER & from USER to USER Destination
  const getDestination = () => {
    if (order && order.pickedup) {
      //USER to USER destination, TO TEST: set Driver Loation to user's location
      return {
        latitude: order.destLatitude,
        longitude: order.destLongitude,
      };
    }
    //DRIVER to USER destination
    return {
      latitude: order.originLatitude,
      longitude: order.originLongitude,
    };
  };

  //bottom NAV Views
  const bottomTitle = () => {
    // if (true)
    if (order && order.isFinished) {
      return (
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "red",
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: "whitesmoke",
              }}
            >
              COMPLETE {order.type}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 20,
              color: "#00000099",
              fontWeight: "500",
              marginTop: 5,
            }}
          >
            {order.user.name}'s Ride Complete {""}
            <FontAwesome name="thumbs-up" size={20} color="#FABB51" />
          </Text>
        </View>
      );
    }

    if (order && order.pickedup) {
      return (
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 25,
                fontWeight: "500",
                color: "#0F0E0E",
              }}
            >
              {order.duration ? order.duration.toFixed(1) : "0"} min
            </Text>
            <View style={[styles.user, { backgroundColor: "red" }]}>
              <Entypo name="user" size={20} color="whitesmoke" />
            </View>
            <Text
              style={{
                fontSize: 25,
                fontWeight: "500",
                color: "#0F0E0E",
              }}
            >
              {order.distance ? order.distance.toFixed(1) : "0"} km
            </Text>
          </View>
          <Text
            style={{
              fontSize: 20,
              color: "#00000099",
              fontWeight: "500",
              marginTop: 5,
            }}
          >
            Dropping off {order.user.name}
          </Text>
        </View>
      );
    }

    if (order) {
      return (
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 25,
                fontWeight: "500",
                color: "#0F0E0E",
                // paddingLeft: 5,
              }}
            >
              {order.duration ? order.duration.toFixed(1) : "0"} min
            </Text>
            <View style={styles.user}>
              <Entypo name="user" size={20} color="whitesmoke" />
            </View>
            <Text
              style={{
                fontSize: 25,
                fontWeight: "500",
                color: "#0F0E0E",
                // paddingLeft: 5,
                // paddingTop: 15,
              }}
            >
              {order.distance ? order.distance.toFixed(1) : "0"} km
            </Text>
          </View>
          <Text
            style={{
              fontSize: 20,
              color: "#00000099",
              fontWeight: "500",
              marginTop: 5,
            }}
          >
            Picking up {order.user.name}
          </Text>
        </View>
      );
    }
    if (isOnline) {
      return (
        <Text style={{ fontSize: 25, color: "#3E7C17", fontWeight: "500" }}>
          You're online
        </Text>
      );
    }
    return (
      <Text style={{ fontSize: 25, color: "#4a4a4a", fontWeight: "500" }}>
        You're offline
      </Text>
    );
  };

  //
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType={Platform.OS == "android" ? "mutedStandard" : "mutedStandard"}
        showsUserLocation={true}
        onUserLocationChange={onUserLocationChange}
        initialRegion={{
          latitude: 6.50359,
          longitude: 3.37254,
          latitudeDelta: 0.0222,
          longitudeDelta: 0.0121,
        }}
      >
        {order && (
          <MapViewDirections
            origin={myPosition} //Driver's POSITION
            destination={getDestination()} //User's POSITION
            onReady={goingToUser}
            apikey={ENV_GOOGLE_DIRECTION_KEY}
            strokeWidth={4}
            strokeColor="black"
          />
        )}
      </MapView>

      <Pressable
        onPress={() => console.warn("Balance")}
        style={[
          styles.balanceButton,
          { top: Platform.OS == "android" ? 40 : 20 },
        ]}
      >
        <Text style={{ color: "whitesmoke", fontSize: 25, fontWeight: "bold" }}>
          <Text style={{ color: "green", fontSize: 25, fontWeight: "bold" }}>
            ₦
          </Text>{" "}
          0.00
        </Text>
      </Pressable>

      <Pressable
        onPress={() => console.warn("Menu")}
        style={[
          styles.iconsButton,
          { top: Platform.OS == "android" ? 40 : 20, left: 15 },
        ]}
      >
        <Entypo name="menu" size={30} color="#4a4a4a" />
      </Pressable>
      <Pressable
        onPress={() => console.warn("Search")}
        style={[
          styles.iconsButton,
          { top: Platform.OS == "android" ? 40 : 20, right: 15 },
        ]}
      >
        <FontAwesome name="search" size={24} color="#4a4a4a" />
      </Pressable>
      <Pressable
        onPress={() => console.warn("SafeGuard")}
        style={[styles.iconsButton, { bottom: 200, left: 15 }]}
      >
        <MaterialIcons name="verified-user" size={24} color="#0779E4" />
      </Pressable>
      <Pressable
        onPress={() => console.warn("Message")}
        style={[styles.iconsButton, { bottom: 200, right: 15 }]}
      >
        <MaterialCommunityIcons
          name="message-alert"
          size={24}
          color="#4a4a4a"
        />
      </Pressable>
      <Pressable
        onPress={onGoButton}
        style={[
          styles.goButton,
          { bottom: 200, backgroundColor: isOnline ? "#E02401" : "#0779E4" },
        ]}
      >
        {isOnline ? (
          <Text
            style={{ color: "whitesmoke", fontSize: 30, fontWeight: "bold" }}
          >
            END
          </Text>
        ) : (
          <Text
            style={{ color: "whitesmoke", fontSize: 30, fontWeight: "bold" }}
          >
            GO
          </Text>
        )}
      </Pressable>

      <View style={styles.bottomContainer}>
        <Ionicons name="options-outline" size={30} color="#4a4a4a" />
        {bottomTitle()}

        <Entypo name="menu" size={30} color="#4a4a4a" />
      </View>

      {newOrder && showAcceptButton && (
        <NewOrderPopup
          newOrder={newOrder}
          onAccept={onAccept}
          onDecline={onDecline}
          duration={2}
          distance={1.5}
        />
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    // height: height,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: width,
    height: height,
  },
  iconsButton: {
    position: "absolute",
    width: 45,
    height: 45,
    backgroundColor: "white",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "lightgrey",
    shadowOpacity: 55,
  },
  goButton: {
    position: "absolute",
    width: 80,
    height: 80,
    // left: width / 2 - 37,

    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "lightgrey",
    shadowOpacity: 100,
  },
  balanceButton: {
    position: "absolute",
    width: 130,
    height: 50,
    // left: width / 2 - 37,
    backgroundColor: "#191919",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "lightgrey",
    shadowOpacity: 100,
  },
  user: {
    backgroundColor: "green",
    width: 40,
    height: 40,
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    // borderWidth: 5,
    // borderTopWidth: 5,
    // borderRightWidth: 0,
    // borderBottomWidth: 5,
    // borderLeftWidth: 5,
    // borderColor: "whitesmoke",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 30,
    width: width,
    height: height / 5,
    backgroundColor: "white",
    shadowColor: "lightgrey",
    shadowOpacity: 25,
  },
});