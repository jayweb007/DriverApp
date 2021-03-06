import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Platform,
  Pressable,
  Image,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { ENV_GOOGLE_DIRECTION_KEY } from "@env";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NewOrderPopup from "../components/NewOrderPopup";

import { Auth, API, graphqlOperation } from "aws-amplify";
import { getCar, listOrders } from "../src/graphql/queries";
import { updateCar, updateOrder } from "../src/graphql/mutations";

const droppingOff = { latitude: 6.50359, longitude: 3.37254 }; //Use it as Drivers location to test DROPPING OFF
const myAndroidPhone = { latitude: 6.4796062, longitude: 3.3885727 };
const { width, height } = Dimensions.get("window");

//
const Home = ({ latlng }) => {
  const mapRef = useRef();
  const [car, setCar] = useState(null);
  const [order, setOrder] = useState(null);
  const [newOrders, setNewOrders] = useState([]);

  //getting IMAGE
  const getImage = (type) => {
    if (type === "UberX") {
      return require("../assets/images/top-UberX.png");
    }
    if (type === "UberXL") {
      return require("../assets/images/top-UberXL.png");
    }

    return require("../assets/images/top-Comfort.png");
  };

  //getting CAR DETAILS from server via useEFFECT
  const fetchCar = async () => {
    try {
      const userData = await Auth.currentAuthenticatedUser();
      const carData = await API.graphql(
        graphqlOperation(getCar, {
          id: userData.attributes.sub,
        })
      );
      setCar(carData.data.getCar);
    } catch (err) {
      console.error(err);
    }
  };

  //fecth NEW Orders from server
  const fetchOders = async () => {
    try {
      const ordersData = await API.graphql(
        graphqlOperation(listOrders, { filter: { status: { eq: "NEW" } } })
      );
      setNewOrders(ordersData.data.listOrders.items);
      //
    } catch (e) {
      console.log(e);
    }
  };

  //using useEFFECT to call the Function
  useEffect(() => {
    fetchCar();
    fetchOders();
  }, [car]);

  //
  const onAccept = async (newOrder) => {
    try {
      const input = {
        id: newOrder.id,
        status: "PICKING_UP_CLIENT",
        carId: car.id,
      };
      const orderData = await API.graphql(
        graphqlOperation(updateOrder, { input })
      );

      setOrder(orderData.data.updateOrder);
    } catch (e) {}

    setNewOrders(newOrders.slice(1));
  };
  //
  const onDecline = () => {
    setNewOrders(newOrders.slice(1));
  };

  // update car and set it to active i.e DRIVER goes LIVE.
  const onGoButton = async () => {
    try {
      const userData = await Auth.currentAuthenticatedUser();
      const input = {
        id: userData.attributes.sub,
        isActive: !car.isActive,
      };
      const updatedCarData = await API.graphql(
        graphqlOperation(updateCar, {
          input: input,
        })
      );

      setCar(updatedCarData.data.updateCar);
      //
    } catch (e) {
      console.error(e);
    }
  };

  // To get Driver's POSITION when driving(on motion)...you need to show this to USER on MAP
  const onUserLocationChange = async (event) => {
    const { latitude, longitude, heading } = event.nativeEvent.coordinate;

    try {
      const userData = await Auth.currentAuthenticatedUser();
      const input = {
        id: userData.attributes.sub,
        latitude,
        longitude,
        heading,
      };
      const updatedCarData = await API.graphql(
        graphqlOperation(updateCar, {
          input: input,
        })
      );

      setCar(updatedCarData.data.updateCar);
      //
    } catch (e) {
      console.error(e);
    }
  };

  // distance and duration to USER
  const goingToUser = (event) => {
    if (order) {
      setOrder({
        ...order,
        distance: event.distance,
        duration: event.duration,
        pickedup: order.pickedup || event.distance < 0.2, //this shows u picked up USER
        isFinished: order.pickedup && event.distance < 0.2, //this shows you complete USERS TRIP
      });

      setTimeout(() => {
        mapRef.current.fitToSuppliedMarkers(["drivers", "destination"], {
          edgePadding: { top: 100, right: 100, bottom: 120, left: 100 },
          animated: true,
        });
      }, 2000);
    }
  };

  //getting destination from DRIVER to USER and from USER to USER Destination
  const getDestination = () => {
    if (order && order.pickedup) {
      //USER to USER destination, TO TEST: set Driver Location to user's location
      return {
        latitude: order.destLatitude,
        longitude: order.destLongitude,
      };
    }
    //DRIVER to USER destination TO TEST: set USER location here
    return {
      latitude: order.originLatitude,
      longitude: order.originLongitude,
    };
  };

  // const onLayout = () => {
  //   setTimeout(() => {
  //     mapRef.current.fitToSuppliedMarkers(["drivers", "destination"], {
  //       edgePadding: { top: 100, right: 100, bottom: 120, left: 100 },
  //       animated: true,
  //     });
  //   }, 2000);
  // };

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
            {order?.user?.username}'s Ride Complete {""}
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
              {order.duration ? order.duration.toFixed(0) : "0"} min
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
            Dropping off {order?.user?.username}
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
              {order.duration ? order.duration.toFixed(0) : "0"} min
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
            Picking up {order?.user?.username}
          </Text>
        </View>
      );
    }

    if (car?.isActive) {
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
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType={Platform.OS == "android" ? "mutedStandard" : "mutedStandard"}
        showsUserLocation={true}
        followsUserLocation={true}
        onUserLocationChange={onUserLocationChange}
        initialRegion={{
          latitude: latlng?.latitude ? latlng.latitude : 6.50359,
          longitude: latlng?.longitude ? latlng.longitude : 3.37254,
          // latitudeDelta: 0.0222,
          // longitudeDelta: 0.0121,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        // onLayout={onLayout}
      >
        {car && (
          <Marker
            key={car.id}
            coordinate={{
              latitude: car?.latitude,
              longitude: car?.longitude,
            }}
            identifier="drivers"
            // pinColor="black"
          >
            <Image
              style={{
                width: 50,
                height: 50,
                resizeMode: "contain",
                transform: [
                  {
                    rotate: `${car?.heading ? car?.heading : 1}deg`,
                  },
                ],
              }}
              source={getImage(car.type)}
            />
          </Marker>
        )}

        {order && (
          <Marker
            coordinate={getDestination()}
            pinColor="red"
            title="Destination"
            description="destination"
            identifier="destination"
          />
        )}

        {order && (
          <MapViewDirections
            origin={{ latitude: car?.latitude, longitude: car?.longitude }} //Driver's POSITION
            destination={getDestination()} //User's POSITION
            onReady={goingToUser}
            apikey={ENV_GOOGLE_DIRECTION_KEY}
            strokeWidth={4}
            strokeColor="black"
            timePrecision="now"
            mode="DRIVING"
          />
        )}
      </MapView>

      <Pressable
        onPress={() => console.warn("Balance")}
        style={[
          styles.balanceButton,
          { top: Platform.OS == "android" ? 50 : 50 },
        ]}
      >
        <Text style={{ color: "whitesmoke", fontSize: 25, fontWeight: "bold" }}>
          <Text style={{ color: "green", fontSize: 25, fontWeight: "bold" }}>
            ???
          </Text>{" "}
          0.00
        </Text>
      </Pressable>

      <Pressable
        onPress={() => console.warn("Menu")}
        style={[
          styles.iconsButton,
          { top: Platform.OS == "android" ? 50 : 50, left: 15 },
        ]}
      >
        <Entypo name="menu" size={30} color="#4a4a4a" />
      </Pressable>
      <Pressable
        onPress={() => console.warn("Search")}
        style={[
          styles.iconsButton,
          { top: Platform.OS == "android" ? 50 : 50, right: 15 },
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
          {
            bottom: 200,
            backgroundColor: car?.isActive ? "#E02401" : "#0779E4",
          },
        ]}
      >
        {car?.isActive ? (
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

      {/* if driver car is active AND if there is new order greater than zero AND if driver dont have order */}
      {car?.isActive && newOrders.length > 0 && !order && (
        <NewOrderPopup
          newOrders={newOrders[0]}
          onDecline={onDecline}
          duration={2}
          distance={1.5}
          onAccept={() => onAccept(newOrders[0])}
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
