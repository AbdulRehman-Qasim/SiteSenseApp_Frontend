import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  Platform, // 💡 Added Platform
  StatusBar, // 💡 Added StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
// import { supabase } from "../config/supabase"; // 👈 REMOVED
import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 ADDED

const API_BASE = "https://invalid-times-cable-proxy.trycloudflare.com";

export default function UploadChecklistScreen({ navigation }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checklistFileName, setChecklistFileName] = useState(null);
  const [checklistFile, setChecklistFile] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newChecklistData, setNewChecklistData] = useState(null);

  // 📂 File Picker (This is correct)
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/json",
          "text/csv",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setChecklistFile(file);
        setChecklistFileName(file.name);
        setSelectedFile(file);
      }
    } catch (error) {
      console.log("Error picking document:", error);
      Alert.alert("Error", "Failed to pick file");
    }
  };

  // 📤 Submit checklist (This is correct)
  const handleSubmit = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "Please select a file before submitting.");
      return;
    }
    setLoading(true);
    try {
      await uploadChecklist();
    } catch (error) {
      console.error("Error uploading checklist:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Upload checklist to backend (--- 💡 MODIFIED 💡 ---) ---
  const uploadChecklist = async () => {
    
    // --- 💡 START OF FIX 💡 ---
    // Get token from AsyncStorage, not Supabase
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Error", "User not logged in. Please log in again.");
      navigation.navigate("Login"); // Send to login
      return;
    }
    // --- 💡 END OF FIX 💡 ---

    if (!checklistFile || !checklistFile.uri) {
      Alert.alert("Error", "No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("projectName", checklistFileName || "Untitled Project");
    formData.append("file", {
      uri: checklistFile.uri,
      name: checklistFileName,
      type: checklistFile.mimeType || "application/octet-stream",
    });

    try {
      const res = await fetch(`${API_BASE}/api/checklists/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // Now uses the correct token
        body: formData,
      });

      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("Non-JSON response:", responseText);
        Alert.alert("Error", "Server did not return JSON. See logs.");
        return;
      }

      if (res.ok) {
        setNewChecklistData(data.checklist);
        setShowSuccessModal(true);
      } else {
        // Handle token error
        if (data.error === "Invalid or expired token") {
            Alert.alert("Session Expired", "Please log in again.");
            navigation.navigate("Login");
        } else {
            console.error("Server error:", data);
            Alert.alert("Error", data.error || "Upload failed");
        }
      }
    } catch (err) {
      console.error("Request failed:", err);
      Alert.alert("Error", "Network or server error");
    }
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
          source={require("../assets/favicon8.png")} // Make sure this path is correct
          style={styles.logoImage}
        />
        <View style={{ width: 26 }} />
      </View>

      {/* Upload Box */}
      <TouchableOpacity style={styles.uploadBox} onPress={pickFile}>
        <Ionicons name="cloud-upload-outline" size={60} color="#EF9C66" />
        <Text style={styles.uploadText}>Click to Select the File</Text>
        <Text style={styles.supportedText}>
          Supported formats: Word, PDF, CSV, JSON
        </Text>
        {selectedFile && (
          <Text style={styles.fileName}>Selected File: {selectedFile.name}</Text>
        )}
      </TouchableOpacity>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button1]} onPress={pickFile}>
          <Text style={styles.buttonText1}>Replace File</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button2} onPress={handleSubmit}>
          <Text style={styles.buttonText2}>Submit Checklist</Text>
        </TouchableOpacity>
      </View>

      {/* Loader */}
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loaderText}>
            Uploading your checklist, please be patient...
          </Text>
        </View>
      )}

      {/* ✅ Fancy Success Modal */}
      <Modal transparent={true} visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalBox}>
            <Ionicons name="checkmark-circle" size={70} color="#EF9C66" />
            <Text style={styles.successModalTitle}>Success!</Text>
            <Text style={styles.successModalText}>
              Your checklist has been uploaded.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate("ChecklistPreview", {
                  // 💡 Pass the ID, not the whole object, for consistency
                  checklistId: newChecklistData.id, 
                });
              }}
            >
              <Text style={styles.successButtonText}>View Checklist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Your styles are unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  navbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 35,
    backgroundColor: "#ffffffff",
    borderBottomWidth: 0.7,
    borderBottomColor: "#bed2d0",
  },
  navLeft: {
    padding: 2,
    marginTop: 8,
    marginBottom: -5,
  },
  logoImage: {
    width: 160,
    height: 40,
    alignSelf: "center",
    marginTop: 13,
    marginBottom: -5,
  },
  uploadBox: {
    marginTop: 140,
    borderWidth: 2,
    borderColor: "#bed2d0",
    borderRadius: 12,
    padding: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
    marginLeft: 30,
    marginRight: 30,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "500",
    color: "#00809D",
    letterSpacing: 1,
  },
  supportedText: {
    marginTop: 6,
    fontSize: 17,
    color: "#777",
    textAlign: "center",
  },
  fileName: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    fontSize: 15,
    fontWeight: "500",
    color: "#00809D",
    textAlign: "center",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  loaderText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    marginTop: 20,
    marginLeft: 30,
    marginRight: 30,
  },
  button1: {
    backgroundColor: "#00809D",
    flex: 1,
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 4,
  },
  button2: {
    flex: 1,
    backgroundColor: "#EF9C66",
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 4,
  },
  buttonText1: {
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonText2: {
    color: "#000000ff",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  successModalBox: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    elevation: 5,
    alignItems: "center",
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00809D",
    marginTop: 15,
    marginBottom: 8,
  },
  successModalText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
  },
  successButton: {
    backgroundColor: "#EF9C66",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  successButtonText: {
    color: "#000000ff",
    fontSize: 16,
    fontWeight: "700",
  },
});