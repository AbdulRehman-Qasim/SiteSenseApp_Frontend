import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const MenuScreen = ({ navigation }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    { title: "My Profile", icon: "person-outline", screen: "Profile" },
    { title: "Subscription", icon: "subscriptions", screen: "Subscription" },
    { title: "About App", icon: "info-outline", screen: "About" },
    { title: "Help", icon: "help-outline", screen: "Help" },
    { title: "Logout", icon: "logout" },
  ];

  const handlePress = (item) => {
    if (item.title === "Logout") {
      setShowLogoutModal(true);
    } else if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    setLoggingOut(true);
    setTimeout(() => {
      setLoggingOut(false);
      navigation.replace("Login");
    }, 3000);
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Main")}
          style={styles.navLeft}
        >
          {/* <Ionicons name="chevron-back" size={26} color="#EF9C66" /> */}
        </TouchableOpacity>

        <Image source={require("../assets/favicon7.png")} style={styles.logoImage} />
        <View style={{ width: 26 }} />
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, item.title === "Logout" && styles.logoutCard]}
            onPress={() => handlePress(item)}
          >
            <MaterialIcons
              name={item.icon}
              size={26}
              color={item.title === "Logout" ? "#FF4D4D" : "#EF9C66"}
              style={styles.cardIcon}
            />
            <Text
              style={[
                styles.cardText,
                item.title === "Logout" && styles.logoutText,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fancy Logout Modal */}
      <Modal
        transparent
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="log-out-outline" size={48} color="#EF9C66" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Logout?</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fancy Logging Out Loader */}
      <Modal transparent visible={loggingOut} animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#EF9C66" />
            <Text style={styles.loaderText}>Logging out...</Text>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home-outline" size={22} color="#6B7280" />
          <Text style={styles.navLabelInactive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Checklists")}
        >
          <Ionicons name="list-outline" size={22} color="#6B7280" />
          <Text style={styles.navLabelInactive}>Checklists</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Projects")}
        >
          <Ionicons name="file-tray-full-outline" size={22} color="#6B7280" />
          <Text style={styles.navLabelInactive}>Projects</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("PreviousChat")}
        >
          <Ionicons name="time-outline" size={22} color="#6B7280" />
          <Text style={styles.navLabelInactive}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Reports")}
        >
          <Ionicons name="document-text-outline" size={22} color="#6B7280" />
          <Text style={styles.navLabelInactive}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
          <Text style={styles.navLabelActive}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MenuScreen;

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
  logoImage: { width: 140, height: 40, alignSelf: "center", marginTop: 13, marginBottom: -5 },
  body: { padding: 20, paddingBottom: 120 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdfdfd",
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: { marginRight: 12 },
  cardText: { fontSize: 18, fontWeight: "500", color: "#333" },
  logoutText: { color: "#FF4D4D", fontWeight: "bold" },

  // Fancy Logout Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    marginBottom: 6,
  },
  modalText: { fontSize: 15, color: "#555", textAlign: "center" },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#f2f2f2" },
  confirmButton: { backgroundColor: "#EF9C66" },
  cancelText: { color: "#333", fontWeight: "600" },
  confirmText: { color: "#fff", fontWeight: "600" },

  // Loader Modal
  loaderOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 18,
    alignItems: "center",
    width: "70%",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
  },

  // Bottom Navigation
  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: Platform.OS === "android" ? 40 : 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: "#00809D",
    margin: 6,
    height: 58,
    borderRadius: 12,
  },
  navLabelActive: { fontSize: 11, color: "#fff", marginTop: 2, fontWeight: "600" },
  navLabelInactive: { fontSize: 11, color: "#141416ff", marginTop: 2, fontWeight: "500" },
});
