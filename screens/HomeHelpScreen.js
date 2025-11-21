import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  BackHandler,
  FlatList,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

const API_BASE = "https://invalid-times-cable-proxy.trycloudflare.com"; // ⚡️ apna backend ka URL lagana

const HomeHelpScreen = ({ navigation }) => {
  const [message, setMessage] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(null);

  // Modal states (for Save Report)
  const [modalVisible, setModalVisible] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [projectName, setProjectName] = useState('');

  // --- 👇 New State for Start Inspection Modal ---
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [startModalProjectName, setStartModalProjectName] = useState('');
  const [isSavingStartProject, setIsSavingStartProject] = useState(false);
  // ---------------------------------------------

  const [generatedChecklistId, setGeneratedChecklistId] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [checklistGenerated, setChecklistGenerated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [checklist, setChecklist] = useState([]); // stores generated questions


  // Track keyboard visibility
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        alert("Permission to access microphone is required!");
        return;
      }

      console.log("Starting recording..");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    console.log("Stopping recording..");
    setRecording(undefined);
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);

    // Audio file ko ElevenLabs STT API par bhejo
    await sendAudioToSTT(uri);
  };

  // ElevenLabs STT API call
const sendAudioToSTT = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "audio/m4a",
        name: "recording.m4a",
      });
      formData.append("model_id", "scribe_v1");

      const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
          "xi-api-key": "sk_deaa9ba81a934450f2f500dceefa2d97b76aea0a72d39611", // <-- ⚠️ USE YOUR NEW KEY
        },
        body: formData,
      });

      const data = await response.json();
      console.log("STT Response:", data);

      if (data.text) {
        // ✅ NEW CODE: Clean the text before setting it
        let transcribedText = data.text;
        
        // This regex removes anything inside (parentheses)
        transcribedText = transcribedText.replace(/\(.*?\)/g, '').trim();
        
        console.log("Cleaned Transcription:", transcribedText);
        
        // Only set the message if there's text left
        if (transcribedText) {
          setMessage(transcribedText); 
        } else {
          console.log("Transcription was only a sound effect, ignoring.");
        }

      } else {
        console.warn("No transcription text found:", data);
      }
    } catch (error) {
      console.error("STT error:", error);
    }
  };

// 👇 THIS IS THE CORRECT UPLOAD FUNCTION FOR YOUR BACKEND
// It sends the file to your `/api/checklists/generate` endpoint,
// which handles text extraction and AI generation on the server.
const handleFileUpload = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
        "text/plain", // txt
        "text/csv", // csv
        "application/json", // json
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      console.log("❌ User canceled file picking");
      return;
    }

    const file = result.assets[0];
    console.log("📄 Picked File:", file);

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream",
    });

    // --- Show UI loading state ---
    setChatMode(true);
    setIsGenerating(true);
    setChecklistGenerated(false);
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", text: `Uploading ${file.name}...` }]);
    // -----------------------------

    const token = await AsyncStorage.getItem("token"); 
    const response = await fetch(`${API_BASE}/api/checklists/generate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`, 
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Checklist generated:", data.checklist);
       // --- This is the same logic as handleSend ---
      setGeneratedChecklistId(data.checklist.id);
      setChecklist(data.checklist.items); 
      const questions = data.checklist.items.join("\n• ");
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "Here’s your generated checklist:\n\n• " + questions }
      ]);
      setChecklistGenerated(true);
      // ---------------------------------------------
    } else {
      console.error("❌ Server error:", data);
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: data.error || "Upload failed." }
      ]);
    }
  } catch (error) {
    console.error("⚠️ File upload error:", error);
    setMessages(prev => [
      ...prev,
      { role: "assistant", text: "Failed to upload file." }
    ]);
  }
  
  // --- Stop UI loading state ---
  setIsGenerating(false);
  setLoading(false);
  // ---------------------------
};
  // Handle back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Main'); // Replace 'Home' with your actual home route name
        return true;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => subscription.remove();
    }, [navigation])
  );



  const handleSend = async () => {
    if (!message.trim()) return;
    setChatMode(true); // ✅ switch navbar icon

    const newMsg = { role: "user", text: message };
    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    // 🧩 Mark generation started
    setIsGenerating(true);
    setChecklistGenerated(false);
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/checklists/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          goal: newMsg.text,
          // Project name is intentionally null, handled by backend
        })
      });

      const data = await res.json();
      console.log("Generated checklist:", data);

      if (data.checklist && data.checklist.items) {
        // ✅ Store checklist ID and data for later edit
        setGeneratedChecklistId(data.checklist.id);
        setChecklist(data.checklist.items); // store items for edit screen

        // ✅ Display formatted checklist in chat
        const questions = data.checklist.items.join("\n• ");
        setMessages(prev => [
          ...prev,
          { role: "assistant", text: "Here’s your generated checklist:\n\n• " + questions }
        ]);

        // ✅ Mark generation complete
        setChecklistGenerated(true);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", text: data.error || "Failed to generate checklist." }
        ]);
      }
    } catch (err) {
      console.error("Error generating checklist:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "Server error occurred." }
      ]);
    }

    // ✅ Stop loader
    setIsGenerating(false);
    setLoading(false);
  };

  // --- 👇 This function is correct for your "Start" button modal ---
  const handleSaveProjectNameAndStart = async () => {
    if (!startModalProjectName.trim()) {
      Alert.alert("Error", "Please enter a project name.");
      return;
    }

    setIsSavingStartProject(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/checklists/${generatedChecklistId}/projectName`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectName: startModalProjectName.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        Alert.alert("Error", errData.error || "Failed to save project name.");
      } else {
        // Success! Close modal and navigate
        setStartModalVisible(false);
        navigation.navigate("StartInspection", {
          checklistId: generatedChecklistId,
          checklistItems: checklist,
        });
      }
    } catch (err) {
      console.error("Save project name error:", err);
      Alert.alert("Error", "An error occurred while saving.");
    }
    setIsSavingStartProject(false);
  };

  const saveReportToPDF = async () => {
    // This is the old "Save Report" logic, not part of this request
    // ... (existing saveReportToPDF function) ...
  };



  // Render chat bubble
  const renderItem = ({ item }) => (
    <View
      style={{
        alignSelf: item.role === "user" ? "flex-end" : "flex-start",
        backgroundColor: item.role === "user" ? "#53c1dfff" : "#e9e7e6ff",
        borderRadius: 10,
        marginVertical: 5,
        padding: 10,
        maxWidth: "75%"
      }}
    >
      <Text style={{ color: item.role === "user" ? "#000000ff" : "#000" }}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navbar}>
        {chatMode ? (
          <TouchableOpacity
            onPress={() => {
              setChatMode(false);
              navigation.navigate('HomeHelp'); // Replace 'Home' with your actual home route name
            }}
            style={styles.navLeft}
          >
            <Ionicons name="chevron-back" size={28} color="#EF9C66" />
          </TouchableOpacity>
        ) : (
          // 👇 Default hamburger when not in inspection mode
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navLeft}>
            <Ionicons name="chevron-back" size={28} color="#EF9C66" />
          </TouchableOpacity>
        )}

        <Image source={require('../assets/favicon7.png')} style={styles.navLogo} />

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle-sharp" size={36} color="#EF9C66" />
        </TouchableOpacity>
      </View>


      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -10}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Body */}
            {!chatMode ? (
              <View style={styles.body}>
                {!keyboardVisible && (
                  <Image
                    // source={require("../assets/favicon.gif")}
                    style={{ width: 420, height: 250, marginBottom: 30, marginTop: -10 }}
                    contentFit="contain"
                    autoPlay
                  />
                )}
                <Text style={styles.heading}>Let our bot help you</Text>
                <Text style={[styles.subtext, { textAlign: 'center' }]}>
                  Start by uploading your project specifications
                  file or describing the task. The AI will createa
                  custom checklist for you.
                </Text>
              </View>
            ) : (
              <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={(_, i) => i.toString()}
                contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
              />
            )}

            {/* --- Buttons Section (This is all correct) --- */}
            {chatMode && !isGenerating && checklistGenerated && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between", 
                  marginVertical: 10,
                  paddingHorizontal: 10, 
                }}
              >
                {/* ✏️ Edit Checklist Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "#EF9C66",
                    padding: 15,
                    borderRadius: 10,
                    alignItems: "center",
                    flex: 1, 
                    marginRight: 5, 
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                  onPress={() =>
                    navigation.navigate("EditChecklist", {
                      checklistId: generatedChecklistId
                    })
                  }

                >
                  <Ionicons name="create-outline" size={20} color="#000000ff" />
                  <Text style={{ color: "#000000ff", fontWeight: "bold", marginLeft: 6 }}>
                    Edit
                  </Text>
                </TouchableOpacity>

                {/* 🧾 Start Inspection Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "#00809D",
                    padding: 15,
                    borderRadius: 10,
                    alignItems: "center",
                    flex: 1, 
                    marginLeft: 5, 
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                  // --- This OnPress is correct ---
                  onPress={() => {
                    setStartModalProjectName(''); // Clear input
                    setStartModalVisible(true); // Open the new modal
                  }}
                  // ---------------------------
                >
                  <Ionicons name="play-circle-outline" size={20} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "bold", marginLeft: 6 }}>
                    Start
                  </Text>
                </TouchableOpacity>
                
              </View>
            )}
            {/* --- End Buttons Section --- */}


            {/* Loader While Generating */}
            {isGenerating && (
              <View style={{ alignItems: "center", marginVertical: 20 }}>
                <ActivityIndicator size="large" color="#00809D" />
                <Text style={{ color: "#00809D", marginTop: 10 }}>Generating checklist...</Text>
              </View>
            )}


            {/* Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Describe your task..."
                  value={message}
                  onChangeText={setMessage}
                />
                {message.trim().length === 0 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={recording ? stopRecording : startRecording}
                      style={{ marginRight: 10 }}
                    >
                      <MaterialIcons
                        name={recording ? "stop" : "mic"}
                        size={28}
                        color={recording ? "red" : "#00809D"}
                      />
                    </TouchableOpacity>

                    {/* This upload button correctly calls your backend */}
                    <TouchableOpacity onPress={handleFileUpload}>
                      <Ionicons name="attach-sharp" size={28} color="#EF9C66" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={handleSend}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#00809D" />
                    ) : (
                      <Ionicons name="send" size={24} color="#00809D" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* --- Project Name Modal (Correct) --- */}
      <Modal
        visible={startModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setStartModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Project Name</Text>
            <Text style={styles.modalSubtitle}>
              Please assign a project name to start the inspection.
            </Text>
            <TextInput
              placeholder="Enter Project Name"
              value={startModalProjectName}
              onChangeText={setStartModalProjectName}
              style={styles.modalInput}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setStartModalVisible(false)}
                disabled={isSavingStartProject}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveProjectNameAndStart}
                disabled={isSavingStartProject}
              >
                {isSavingStartProject ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextSave}>Start</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* ------------------------------- */}


      {/* Report Modal (This is the old one for "Save Report", now unused) */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Save Report
            </Text>
            <TextInput
              placeholder="Enter Report Title"
              value={reportTitle}
              onChangeText={setReportTitle}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Enter Project Name"
              value={projectName}
              onChangeText={setProjectName}
              style={styles.modalInput}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={() => {
                  saveReportToPDF();
                }}
              >
                <Text style={styles.modalButtonTextSave}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeHelpScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc', marginBottom: -10 },
  navbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#ffffffff',
    borderBottomWidth: 0.7,
    borderBottomColor: '#8f9a99ff',
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
    fontWeight: 'bold',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 0,
    color: '#164788ff',
    marginBottom: 20,
  },
  subtext: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 70,
    lineHeight: 20,
    paddingLeft: 30,
    paddingRight: 30,
    letterSpacing: 1,
  },
  inputWrapper: { padding: 5, backgroundColor: '#f8fcfdff', marginBottom: -30 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c2b6b6ff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 50,
  },
  input: { flex: 1, fontSize: 18, paddingHorizontal: 10, paddingVertical: 8 },
  navLogo: { width: 170, height: 40, resizeMode: 'contain' },
  
  // --- 👇 [NEW] Modal Styles ---
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#eee",
    marginRight: 10,
  },
  modalButtonTextCancel: {
    color: "#333",
    fontWeight: "bold",
  },
  modalButtonSave: {
    backgroundColor: "#00809D",
  },
  modalButtonTextSave: {
    color: "#fff",
    fontWeight: "bold",
  },
  // -------------------------
});