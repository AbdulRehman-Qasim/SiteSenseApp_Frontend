import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert, // Using Alert as per your old file's request
    ActivityIndicator,
    Modal,
    SafeAreaView, // Added for status bar
    StatusBar, // Added for status bar
    Platform, // Added for status bar
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
// import { supabase } from "../config/supabase"; // 👈 REMOVED
import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 ADDED
import { Audio } from "expo-av";
// Note: This version uses the built-in Alert, not FancyAlert, to match your file.

const API_BASE = "https://invalid-times-cable-proxy.trycloudflare.com";

const SpecialInstructionScreen = ({ navigation, route }) => {
    const [instructions, setInstructions] = useState("");
    const [recording, setRecording] = useState(null);
    const [loadingStage, setLoadingStage] = useState(null); // "adding" | "starting" | null

    // --- 💡 NEW LOGIC ---
    // Get the checklistId from the previous screen (ChecklistPreview)
    const { checklistId } = route.params || {};
    // --- ---------------- ---

    // 🎙 Recording logic (Unchanged from your file)
    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== "granted") {
                alert("Permission to access microphone is required!");
                return;
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    };

    const stopRecording = async () => {
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        await sendAudioToSTT(uri);
    };

    const sendAudioToSTT = async (uri) => {
        try {
            const formData = new FormData();
            formData.append("file", { uri, type: "audio/m4a", name: "recording.m4a" });
            formData.append("model_id", "scribe_v1");

            const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
                method: "POST",
                headers: { "xi-api-key": "sk_deaa9ba81a934450f2f500dceefa2d97b76aea0a72d39611" },
                body: formData,
            });

            const data = await response.json();
            if (data.text) {
                setInstructions((prev) => (prev ? prev + " " + data.text : data.text));
            }
        } catch (error) {
            console.error("STT error:", error);
            Alert.alert("Error", "Failed to transcribe audio.");
        }
    };
    // --- End of Recording Logic ---


    // --- 💡 NEW: Navigate to Inspection ---
    const navigateToInspection = () => {
        setLoadingStage("starting"); // Show "Starting..."
        setTimeout(() => {
            setLoadingStage(null);
            navigation.navigate("StartInspection", {
                checklistId: checklistId,
            });
        }, 1800); // 1.8 second delay
    };

    // --- 💡 NEW: Handle Skip ---
    const handleSkip = () => {
        // Just navigate without saving
        navigateToInspection();
    };

    // --- 💡 NEW: Handle Save & Continue ---
    const handleSave = async () => {
        if (instructions.trim() === "") {
            Alert.alert("Required", "Please enter some instructions before continuing.");
            return;
        }

        setLoadingStage("adding"); // Show "Adding..."

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Error", "User not logged in");
                navigation.navigate("Login");
                setLoadingStage(null);
                return;
            }

            const res = await fetch(`${API_BASE}/api/checklists/${checklistId}/instructions`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ instructions: instructions.trim() }),
            });

            const data = await res.json();
            if (!res.ok) {
                if (data.error === "Invalid or expired token") {
                    Alert.alert("Session Expired", "Please log in again.");
                    navigation.navigate("Login");
                } else {
                    throw new Error(data.error || "Failed to save instructions.");
                }
            }

            // Success! Now navigate
            navigateToInspection();

        } catch (err) {
            Alert.alert("Error", err.message);
            setLoadingStage(null);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {/* Navbar (Your Design) */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navLeft}>
                    <Ionicons name="chevron-back" size={26} color="#EF9C66" />
                </TouchableOpacity>
                <Image source={require("../assets/favicon9.png")} style={styles.logoImage} />
                <View style={{ width: 50 }} />
            </View>

            {/* Body (Your Design) */}
            <View style={styles.body}>
                <View style={styles.textAreaWrapper}>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Type instructions here..."
                        placeholderTextColor="#999"
                        multiline
                        value={instructions}
                        onChangeText={setInstructions}
                    />
                    <TouchableOpacity
                        style={styles.micInside}
                        onPress={recording ? stopRecording : startRecording}
                    >
                        <FontAwesome5
                            name="microphone"
                            size={30}
                            color={recording ? "red" : "#00809D"}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                    <MaterialIcons name="info-outline" size={25} color="#00809D" />
                    <Text style={styles.infoText}>
                        These instructions will apply to the entire inspection
                    </Text>
                </View>

                {/* --- 💡 MODIFIED: Buttons now use new logic --- */}
                <View style={styles.buttonsRow}>
                    <TouchableOpacity
                        style={[styles.btn, { backgroundColor: "#00809D" }]}
                        onPress={handleSkip} // 👈 Use new handler
                    >
                        <Text style={styles.btnText1}>Skip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, { backgroundColor: "#EF9C66" }]}
                        onPress={handleSave} // 👈 Use new handler
                    >
                        <Text style={styles.btnText2}>Save & Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Fancy Loader Overlay (Your Design) */}
            <Modal transparent visible={!!loadingStage} animationType="fade">
                <View style={styles.loaderOverlay}>
                    <View style={styles.loaderBox}>
                        <ActivityIndicator size="large" color="#EF9C66" />
                        <Text style={styles.loaderText}>
                            {loadingStage === "adding"
                                ? "Adding special instructions..."
                                : "Starting your inspection..."}
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default SpecialInstructionScreen;

// --- 💡 STYLES (Your exact styles) 💡 ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    navbar: {
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 20, // 💡 Adjusted padding
        backgroundColor: "#fff",
        borderBottomWidth: 1, // 💡 Changed from 0.7
        borderBottomColor: "#E0E0E0", // 💡 Changed color
    },
    navLeft: { padding: 4 },
    logoImage: {
        width: 180, // 💡 Adjusted size
        height: 35, // 💡 Adjusted size
        resizeMode: "contain",
    },
    body: { flex: 1, marginTop: 40 }, // 💡 Added marginTop
    textAreaWrapper: {
        width: "100%",
        paddingHorizontal: 20,
        position: "relative",
    },
    textArea: {
        height: 250,
        borderColor: "#D1D5DB", // 💡 Changed color
        borderWidth: 1,
        borderRadius: 12, // 💡 Changed radius
        padding: 15,
        textAlignVertical: "top",
        fontSize: 16, // 💡 Changed size
        backgroundColor: "#fff",
        paddingRight: 50, // 💡 Changed padding
        lineHeight: 22, // 💡 Added line height
    },
    micInside: { position: "absolute", right: 30, bottom: 20 },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 15, // 💡 Changed size
        color: "#6B7280", // 💡 Changed color
        flex: 1,
        flexWrap: "wrap",
    },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 20, // 💡 Added padding
        marginTop: 10, // 💡 Changed margin
    },
    btn: {
        paddingVertical: 14, // 💡 Changed padding
        paddingHorizontal: 25,
        borderRadius: 10, // 💡 Changed radius
        marginLeft: 10, // 💡 Changed from marginRight
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    btnText1: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold", // 💡 Changed weight
    },
    btnText2: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold", // 💡 Changed weight
    },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.7)", // 💡 Changed opacity
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
    loaderBox: {
        alignItems: "center",
    },
    loaderText: {
        color: "#fff",
        fontSize: 16,
        marginTop: 15,
        textAlign: "center",
        fontWeight: "500",
    },
});