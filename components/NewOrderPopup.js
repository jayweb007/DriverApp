import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

//
const NewOrderPopup = ({
  newOrder,
  onDecline,
  onAccept,
  duration,
  distance,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDecline}
        style={[
          styles.cancelButton,
          { position: "absolute", top: 40, left: 20 },
        ]}
      >
        <Text style={{ color: "whitesmoke", fontSize: 20, fontWeight: "bold" }}>
          <Text style={{ color: "red", fontSize: 20, fontWeight: "bold" }}>
            X
          </Text>{" "}
          DECLINE
        </Text>
      </Pressable>
      <Pressable
        onPress={onAccept}
        style={[
          styles.cancelButton,
          { position: "absolute", top: 40, right: 20 },
        ]}
      >
        <Text style={{ color: "whitesmoke", fontSize: 20, fontWeight: "bold" }}>
          <Ionicons name="checkmark-sharp" size={25} color="green" />
          ACCEPT
        </Text>
      </Pressable>

      <View style={styles.popupContainer}>
        <View style={styles.title}>
          <Text
            style={{ fontSize: 25, fontWeight: "bold", color: "whitesmoke" }}
          >
            {newOrder.type}
          </Text>
          <View style={styles.user}>
            <Entypo name="user" size={30} color="whitesmoke" />
          </View>
          <FontAwesome name="star" size={20} color="whitesmoke" />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "500",
              color: "whitesmoke",
              paddingLeft: 5,
            }}
          >
            {newOrder.user.rating}
          </Text>
        </View>
        <View style={styles.time}>
          <Text
            style={{
              fontSize: 40,
              fontWeight: "500",
              color: "whitesmoke",
              paddingLeft: 5,
            }}
          >
            {duration} min
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "500",
              color: "whitesmoke",
              paddingLeft: 5,
              paddingTop: 15,
            }}
          >
            {distance} km
          </Text>
        </View>
        <View style={styles.text}>
          <FontAwesome
            name="star"
            size={20}
            color="whitesmoke"
            style={{ marginTop: 5 }}
          />
          <Text
            style={{
              fontSize: 25,
              fontWeight: "500",
              color: "whitesmoke",
              paddingLeft: 5,
              paddingTop: 5,
            }}
          >
            Toward your destination
          </Text>
        </View>
      </View>
    </View>
  );
};

export default NewOrderPopup;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#00000099",
  },
  cancelButton: {
    width: 130,
    height: 50,
    backgroundColor: "#191919",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "lightgrey",
    shadowOpacity: 100,
  },
  popupContainer: {
    position: "absolute",
    height: 290,
    bottom: 70,
    width: "100%",
    backgroundColor: "black",
    borderRadius: 10,
    shadowColor: "lightgrey",
    shadowOpacity: 25,
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  time: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
  },
  text: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  user: {
    backgroundColor: "#548CFF",
    width: 60,
    height: 60,
    marginHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    borderWidth: 5,
    // borderTopWidth: 5,
    // borderRightWidth: 0,
    // borderBottomWidth: 5,
    // borderLeftWidth: 5,
    borderColor: "whitesmoke",
  },
});
