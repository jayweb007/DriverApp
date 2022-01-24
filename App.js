import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, View } from "react-native";
import Home from "./screens/Home";

const App = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <SafeAreaView>
        <Home />
      </SafeAreaView>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
    // alignItems: "center",
    // justifyContent: "center",
  },
});
