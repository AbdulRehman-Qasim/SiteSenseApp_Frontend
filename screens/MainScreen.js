import React, { useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Image } from "expo-image";


const MainScreen = ({ navigation }) => {
  // Handle Android back button press
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit App", "Are you sure you want to quit the app?", [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => BackHandler.exitApp() },
      ]);
      return true; // prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.navLeft}
        >
          <Ionicons name="chevron-back" size={28} color="#EF9C66" />
        </TouchableOpacity>

        <Image
          source={require("../assets/favicon7.png")}
          style={styles.navLogo}
        />

        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-circle-sharp" size={36} color="#EF9C66" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Image
          source={require("../assets/favicon.gif")}
          style={{ width: 270, height: 270, marginBottom: 30, marginTop: -10 }}
          contentFit="contain"
          autoPlay // This prop works here
        />
        <Text style={styles.heading}>Welcome Inspector!</Text>
        <Text style={[styles.subtext, { textAlign: "center" }]}>
          Upload your checklist or let me generate one for you. I’ll guide you
          through each question step by step.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button1}
            onPress={() => navigation.navigate("UploadChecklist")}
          >
            <Text style={styles.button1Text}>Upload Checklist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button2}
            onPress={() => navigation.navigate("AiChecklist")}
          >
            <Text style={styles.button2Text}>Generate Checklist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc", marginBottom: -10 },
  navbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    backgroundColor: "#ffffffff",
    borderBottomWidth: 0.7,
    borderBottomColor: "#8f9a99ff",
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 90,
  },
  heading: {
    fontSize: 28,
    fontWeight: "900",
    fontFamily: "Helvetica Neue",
    letterSpacing: 1.5,
    color: "#000000ff",
    marginBottom: 10,
  },
  subtext: {
    fontSize: 18,
    color: "gray",
    marginBottom: 70,
    lineHeight: 20,
    paddingLeft: 30,
    paddingRight: 30,
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", gap: 15 },
  button1: {
    backgroundColor: "#00809D",
    flex: 1,
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  button2: {
    flex: 1,
    backgroundColor: "#EF9C66",
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  button1Text: { color: "#f8fafc", fontWeight: "bold", fontSize: 16 },
  button2Text: { color: "#000000ff", fontWeight: "bold", fontSize: 16 },
  navLogo: { width: 170, height: 40, resizeMode: "contain" },
});
