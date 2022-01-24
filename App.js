import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, View } from "react-native";
import Home from "./screens/Home";
import Amplify from "aws-amplify";
import config from "./src/aws-exports";

Amplify.configure(config);

const App = () => {
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

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
