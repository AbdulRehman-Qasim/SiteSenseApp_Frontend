import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../config/supabase";

const EditProfileScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+92");
  const [mobileNumber, setMobileNumber] = useState("");
  const [supplies, setSupplies] = useState("");
  const [electricians, setElectricians] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loaderVisible, setLoaderVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) return;

        const metadata = currentUser.user_metadata || {};
        let phone = metadata.phone || "";
        if (phone.startsWith("0")) phone = phone.slice(1);

        setFullName(metadata.fullName || "");
        setEmail(currentUser.email || "");
        setMobileNumber(phone);
        setSupplies(metadata.region || "");
        setElectricians(metadata.role || "");
        setImage(metadata.profileImageUrl || null);
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showFancyAlert("Permission to access gallery is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🧩 Fancy popup trigger function
  const showFancyAlert = (message) => {
    setModalMessage(message);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // 🧩 Show loader for 3 seconds then hide
  const showLoader = (callback) => {
    setLoaderVisible(true);
    setTimeout(() => {
      setLoaderVisible(false);
      if (callback) callback();
    }, 3000);
  };

  const handleSave = async () => {
    showFancyAlert("Do you want to save these changes?");
  };

  const confirmSave = async () => {
    setModalVisible(false);
    showLoader(async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) return;

        // ✅ Upload image if local
        let imageUrl = image;
        if (image && image.startsWith("file://")) {
          const fileExt = image.split(".").pop();
          const fileName = `${currentUser.id}.${fileExt}`;
          const filePath = `profileImages/${fileName}`;
          const img = await fetch(image);
          const bytes = await img.blob();
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, bytes, { upsert: true });
          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          imageUrl = publicUrlData.publicUrl;
        }

        // ✅ Update Auth user
        const { error: authError } = await supabase.auth.updateUser({
          email,
          data: {
            fullName,
            phone: mobileNumber,
            region: supplies,
            role: "Inspector",
          },
        });
        if (authError) throw authError;

        // ✅ Update "User" table
        const { error: tableError } = await supabase
          .from("User")
          .update({
            fullName,
            email,
            phone: mobileNumber,
            region: supplies,
            role: "Inspector",
            updatedAt: new Date(),
          })
          .eq("uid", currentUser.id);

        if (tableError) throw tableError;

        showFancyAlert("Profile updated successfully!");
        setTimeout(() => navigation.navigate("Profile"), 1500);
      } catch (error) {
        console.log("Error updating profile:", error);
        showFancyAlert("Failed to update profile. Please try again!");
        setTimeout(() => navigation.navigate("Profile"), 1500);
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="chevron-back" size={24} color="#EF9C66" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Profile</Text>
      </View>
      <View style={styles.container}>
        {/* Profile Picture */}
        <View style={styles.imageContainer}>
          <Image
            source={image ? { uri: image } : require("../assets/favicon1.png")}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.uploadIcon} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.phoneRow}>
            <TextInput
              style={[styles.input, styles.codeInput]}
              value={countryCode}
              editable={false}
            />
            <TextInput
              style={[styles.input, styles.numberInput]}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
          </View>
          <Text style={styles.label}>Where do you get your supplies?</Text>
          <TextInput style={styles.input} value={supplies} onChangeText={setSupplies} />
          <Text style={styles.label}>Number of Electricians</Text>
          <TextInput
            style={styles.input}
            value={electricians}
            onChangeText={setElectricians}
            keyboardType="numeric"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🌟 Fancy Alert Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { opacity: fadeAnim }]}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            {modalMessage.includes("Do you want") ? (
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelBtn]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmBtn]}
                  onPress={confirmSave}
                >
                  <Text style={styles.saveText}>Yes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.saveText}>OK</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* 🌟 Loader Modal */}
      <Modal transparent visible={loaderVisible} animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#00809D" />
            <Text style={styles.loaderText}>Updating your profile...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomColor: "#ddd",
    marginTop: 30,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 110,
    color: "#00809D",
  },
  imageContainer: { alignItems: "center", marginBottom: 25 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  uploadIcon: {
    position: "absolute",
    bottom: 0,
    right: 135,
    backgroundColor: "#00809D",
    padding: 6,
    borderRadius: 20,
  },
  inputSection: { marginBottom: 30 },
  label: { fontSize: 16, color: "#000", marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  phoneRow: { flexDirection: "row", gap: 10 },
  codeInput: { flex: 1 },
  numberInput: { flex: 4 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#EF9C66", marginRight: 10 },
  saveButton: { backgroundColor: "#00809D", marginLeft: 10 },
  cancelText: { color: "#000", fontWeight: "600" },
  saveText: { color: "#fff", fontWeight: "600" },

  // 🌟 Fancy Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "80%",
    alignItems: "center",
    elevation: 10,
  },
  modalMessage: {
    fontSize: 17,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  confirmBtn: { backgroundColor: "#00809D" },
  cancelBtn: { backgroundColor: "#EF9C66" },

  // 🌟 Loader Styles
  loaderOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderBox: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    elevation: 10,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 15,
    color: "#00809D",
    fontWeight: "600",
  },
});
