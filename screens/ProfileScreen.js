import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { supabase } from "../config/supabase";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!currentUser) return;

        const { data, error } = await supabase
          .from("User")
          .select("fullName, email, region")
          .eq("uid", currentUser.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setUser({
            name: data.fullName || "No name provided",
            email: data.email || "No email provided",
            region: data.region || "No region set",
          });
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    setLoggingOut(true);

    setTimeout(async () => {
      const { error } = await supabase.auth.signOut();
      setLoggingOut(false);

      if (!error) navigation.replace("Login");
      else console.error("Error signing out: ", error);
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 🔹 Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate("Menu")}>
          <Ionicons name="chevron-back" size={24} color="#EF9C66" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
          <MaterialCommunityIcons name="pencil-circle" size={30} color="#EF9C66" />
        </TouchableOpacity>
      </View>

      {/* 🔹 Body Content */}
      <View style={styles.bodyContainer}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00809D" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            <Image
              source={{
                uri: user?.profilePic || "https://via.placeholder.com/100",
              }}
              style={styles.profileImage}
            />
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.region}>{user?.region}</Text>

            {/* --- Profile Options --- */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <View style={styles.cardLeft}>
                <Ionicons
                  name="person-circle-sharp"
                  size={27}
                  color="#EF9C66"
                />
                <Text style={styles.cardText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF9C66" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
              <View style={styles.cardLeft}>
                <MaterialIcons name="logout" size={27} color="red" />
                <Text style={[styles.cardText, { color: "red" }]}>Logout</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* 🔹 Fancy Logout Confirmation Modal */}
      <Modal
        transparent
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons
              name="log-out-outline"
              size={48}
              color="#EF9C66"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.modalTitle}>Logout?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to log out?
            </Text>
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

      {/* 🔹 Fancy Logging Out Loader */}
      <Modal transparent visible={loggingOut} animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#EF9C66" />
            <Text style={styles.loaderText}>Logging out...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 57,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#dad2d2ff",
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00809D",
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingBottom: 80,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    marginTop: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    color: "#333",
  },
  email: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  region: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 2,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  logoutCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    marginTop: 15,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#333",
  },

  // 🔹 Fancy Logout Modal
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

  // 🔹 Loader Modal
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
});
