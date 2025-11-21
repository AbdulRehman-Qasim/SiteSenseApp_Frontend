import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PaymentScreen = ({ route, navigation }) => {
  const { plan } = route.params;
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleNext = () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    // Navigate to confirm screen with plan + method
    navigation.navigate("ConfirmPayment", { plan, selectedMethod });
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navLeft}
        >
          <Ionicons name="chevron-back" size={26} color="#EF9C66" />
        </TouchableOpacity>
        <Image
          source={require("../assets/favicon7.png")}
          style={styles.logoImage}
        />
        <View style={{ width: 26 }} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.heading}>{plan.name} Plan</Text>
        <Text style={styles.planDetail}>{plan.description}</Text>
        <Text style={styles.planDetail}>💰 Price: {plan.price}</Text>
        <Text style={styles.planDetail}>⏳ Duration: {plan.duration}</Text>
        <Text style={styles.planDetail}>
          ✨ Features:{" "}
          {plan.features ||
            "Premium support, unlimited access, secure storage"}
        </Text>

        <Text style={styles.subHeading}>Select Payment Method</Text>

        {["Stripe", "JazzCash", "Easypaisa"].map((method) => (
          <TouchableOpacity
            key={method}
            style={[
              styles.paymentOption,
              selectedMethod === method && styles.selectedOption,
            ]}
            onPress={() => setSelectedMethod(method)}
          >
            <Text
              style={{ color: selectedMethod === method ? "#fff" : "#333" }}
            >
              {method}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.payButton}
          onPress={handleNext}
        >
          <Text style={styles.payButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  navbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 35,
    backgroundColor: "#fff",
    borderBottomWidth: 0.7,
    borderBottomColor: "#bed2d0",
  },
  navLeft: { padding: 2, marginTop: 8, marginBottom: -5 },
  logoImage: {
    width: 140,
    height: 40,
    alignSelf: "center",
    marginTop: 13,
    marginBottom: -5,
  },
  body: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", color: "#00809D", marginBottom: 10 },
  planDetail: { fontSize: 16, color: "#333", marginBottom: 5 },
  subHeading: { fontSize: 20, fontWeight: "600", color: "#00809D", marginTop: 20, marginBottom: 10 },
  paymentOption: { padding: 15, borderWidth: 1, borderColor: "#00809D", borderRadius: 10, marginBottom: 10 },
  selectedOption: { backgroundColor: "#00809D" },
  optionText: { fontSize: 16, color: "#333" },
  payButton: { marginTop: 20, backgroundColor: "#EF9C66", padding: 15, borderRadius: 10, alignItems: "center" },
  payButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
