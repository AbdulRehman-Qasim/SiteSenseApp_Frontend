import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ConfirmPaymentScreen({ navigation, route }) {
  const { plan, selectedMethod } = route.params || {}; // ✅ receive full plan + method
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Format card number
  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\D+/g, ""); // remove non-digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || "";
    setCardNumber(formatted);
  };

  // ✅ Format expiry MM/YY
  const handleExpiryChange = (text) => {
    const cleaned = text.replace(/\D+/g, "");
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    setExpiry(formatted);
  };

  const handleConfirmPayment = () => {
    // ✅ Validation
    const cleanedCard = cardNumber.replace(/\s/g, "");
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;

    if (!cardHolder || !cleanedCard || !expiry || !cvc) {
      Alert.alert("Error", "Please fill in all the fields before confirming.");
      return;
    }
    if (cleanedCard.length !== 16) {
      Alert.alert("Error", "Card number must be 16 digits.");
      return;
    }
    if (!expiryRegex.test(expiry)) {
      Alert.alert("Error", "Expiry must be in MM/YY format.");
      return;
    }
    if (cvc.length !== 3) {
      Alert.alert("Error", "CVC must be 3 digits.");
      return;
    }

    setLoading(true);

    // Simulate payment confirmation delay
    setTimeout(() => {
      setLoading(false);
      console.log({
        cardNumber: cleanedCard,
        expiry,
        cvc,
        cardHolder,
        plan,
        selectedMethod,
      });

      Alert.alert(
        "Payment Confirmed",
        `Plan: ${plan?.name}\nMethod: ${selectedMethod}\nDummy payment successful ✅`
      );

      navigation.navigate("HomeHelp"); // go back to home or success page
    }, 2000);
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

      <ScrollView contentContainerStyle={styles.body}>
        {/* Heading */}
        <Text style={styles.heading}>Payment Plan</Text>
        <Text style={styles.subHeading}>
          {plan?.name} - {plan?.price}
        </Text>
        <Text style={styles.planDetail}>Payment Via: {selectedMethod}</Text>

        {/* Card Form */}
        <View style={styles.cardForm}>
          <TextInput
            style={styles.input}
            placeholder="Card Holder Name"
            placeholderTextColor="#999"
            value={cardHolder}
            onChangeText={setCardHolder}
          />
          <TextInput
            style={styles.input}
            placeholder="Card Number (4242 4242 4242 4242)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            maxLength={19} // 16 digits + 3 spaces
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="MM/YY"
              placeholderTextColor="#999"
              value={expiry}
              onChangeText={handleExpiryChange}
              maxLength={5}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="CVC"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={cvc}
              onChangeText={setCvc}
              maxLength={3}
            />
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirmPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#f8fafc" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirm Payment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
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
  body: { padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", color: "#00809D", marginBottom: 10 },
  subHeading: { fontSize: 20, fontWeight: "600", color: "#00809D", marginBottom: 10 },
  planDetail: { fontSize: 16, color: "#333", marginBottom: 20 },
  cardForm: { marginVertical: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#bed2d0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfInput: { flex: 0.48 },
  confirmBtn: {
    backgroundColor: "#00809D",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "bold",
  },
});
