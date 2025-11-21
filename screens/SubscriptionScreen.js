import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const SubscriptionScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            {/* Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Menu")}
                    style={styles.navLeft}
                >
                    <Ionicons name="chevron-back" size={26} color="#EF9C66" />
                </TouchableOpacity>

                {/* Logo */}
                <Image
                    source={require("../assets/favicon7.png")}
                    style={styles.logoImage}
                />

                <View style={{ width: 26 }} />
            </View>

            {/* Body - Subscription Cards */}
            <View style={styles.cardContainer}>
                {/* Basic Plan */}
<View style={styles.card}>
  <Text style={styles.planTitle}>Basic Plan</Text>
  <Text style={styles.planPrice}>$5 / month</Text>
  <Text style={styles.planFeatures}>✔ Access to basic checklists</Text>
  <Text style={styles.planFeatures}>✔ Limited storage</Text>
  <TouchableOpacity
    style={[styles.subscribeBtn, { backgroundColor: "#00809D" }]}
    onPress={() =>
      navigation.navigate("Payment", {
        plan: {
          name: "Basic",
          price: "$5 / month",
          duration: "1 Month",
          description: "Perfect for individuals who need simple checklist features.",
          features: "Access to basic checklists, Limited storage",
        },
      })
    }
  >
    <Text style={styles.btnText}>Choose Basic</Text>
  </TouchableOpacity>
</View>

{/* Pro Plan */}
<View style={styles.card}>
  <Text style={styles.planTitle}>Pro Plan</Text>
  <Text style={styles.planPrice}>$15 / month</Text>
  <Text style={styles.planFeatures}>✔ Unlimited checklists</Text>
  <Text style={styles.planFeatures}>✔ Extended storage</Text>
  <Text style={styles.planFeatures}>✔ Priority support</Text>
  <TouchableOpacity
    style={[styles.subscribeBtn, { backgroundColor: "#EF9C66" }]}
    onPress={() =>
      navigation.navigate("Payment", {
        plan: {
          name: "Pro",
          price: "$15 / month",
          duration: "1 Month",
          description: "For power users who want more flexibility and storage.",
          features: "Unlimited checklists, Extended storage, Priority support",
        },
      })
    }
  >
    <Text style={styles.btnText}>Choose Pro</Text>
  </TouchableOpacity>
</View>

{/* Premium Plan */}
<View style={styles.card}>
  <Text style={styles.planTitle}>Premium Plan</Text>
  <Text style={styles.planPrice}>$25 / month</Text>
  <Text style={styles.planFeatures}>✔ All Pro features</Text>
  <Text style={styles.planFeatures}>✔ Team collaboration</Text>
  <Text style={styles.planFeatures}>✔ Advanced analytics</Text>
  <TouchableOpacity
    style={[styles.subscribeBtn, { backgroundColor: "#00809D" }]}
    onPress={() =>
      navigation.navigate("Payment", {
        plan: {
          name: "Premium",
          price: "$25 / month",
          duration: "1 Month",
          description: "Ideal for teams and businesses with collaboration needs.",
          features: "All Pro features, Team collaboration, Advanced analytics",
        },
      })
    }
  >
    <Text style={styles.btnText}>Choose Premium</Text>
  </TouchableOpacity>
</View>

            </View>
        </View>
    );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFB",
    },
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
    navLeft: {
        padding: 2,
        marginTop: 8,
        marginBottom: -5,
    },
    logoImage: {
        width: 140,
        height: 40,
        alignSelf: "center",
        marginTop: 13,
        marginBottom: -5,
    },
    cardContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 4,
    },
    planTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    planPrice: {
        fontSize: 18,
        fontWeight: "600",
        color: "#00809D",
        marginBottom: 10,
    },
    planFeatures: {
        fontSize: 14,
        color: "#555",
        marginBottom: 4,
    },
    subscribeBtn: {
        marginTop: 15,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    btnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
