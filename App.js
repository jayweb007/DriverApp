import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import Home from "./screens/Home";
import Amplify, { API, graphqlOperation, Auth } from "aws-amplify";
import config from "./src/aws-exports";
import * as Location from "expo-location";
import { withAuthenticator } from "aws-amplify-react-native";
import { getCar } from "./src/graphql/queries";
import { createCar } from "./src/graphql/mutations";

Amplify.configure({ ...config, Analytics: { disabled: true } });

//
const App = () => {
  const [latlng, setLatLng] = useState({});

  const checkPermission = async () => {
    const hasPermission = await Location.requestForegroundPermissionsAsync();
    if (hasPermission.status === "granted") {
      const permission = await askPermission();
      return permission;
    }
    return true;
  };

  const askPermission = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    return permission.status === "granted";
  };

  const getLocation = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;
      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync();
      setLatLng({ latitude: latitude, longitude: longitude });
    } catch (e) {}
  };

  useEffect(() => {
    checkPermission();
    getLocation();
    console.log(latlng);
  }, []);

  //
  useEffect(() => {
    const updateUserCar = async () => {
      //Get Authenticated User
      const authenticateduser = await Auth.currentAuthenticatedUser({
        bypassCache: true,
      });

      if (!authenticateduser) {
        return;
      }
      // check if User has a Car
      const carData = await API.graphql(
        graphqlOperation(getCar, {
          id: authenticateduser.attributes.sub,
        })
      );
      // console.log(carData.data.getCar);

      if (carData.data.getCar) {
        console.log("User already has a Car assigned");
        return;
      }

      //if not, create a Car for User
      const newCar = {
        id: authenticateduser.attributes.sub,
        type: "UberX",
        userId: authenticateduser.attributes.sub,
      };
      await API.graphql(
        graphqlOperation(createCar, {
          input: newCar,
        })
      );
    };

    updateUserCar();
  }, []);

  //
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Home latlng={latlng} />
    </View>
  );
};

export default withAuthenticator(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
