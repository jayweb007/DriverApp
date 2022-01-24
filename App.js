import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, View } from "react-native";
import Home from "./screens/Home";
import Amplify, { API, graphqlOperation, Auth } from "aws-amplify";
import config from "./src/aws-exports";
import { withAuthenticator } from "aws-amplify-react-native";
import { getCar } from "./src/graphql/queries";
import { createCar } from "./src/graphql/mutations";

Amplify.configure({ ...config, Analytics: { disabled: true } });

//
const App = () => {
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
      {/* <SafeAreaView> */}
      <Home />
      {/* </SafeAreaView> */}
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
