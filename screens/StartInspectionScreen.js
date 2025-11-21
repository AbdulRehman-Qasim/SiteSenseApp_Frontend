import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";

const API_BASE = "https://invalid-times-cable-proxy.trycloudflare.com";

const StartInspectionScreen = ({ navigation, route }) => {
  const { checklistId } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isContinuing, setIsContinuing] = useState(false);
  const scrollRef = useRef(null);
  const [recording, setRecording] = useState(null);
  const sessionIdRef = useRef(null);

  const [stagedImages, setStagedImages] = useState([]);

  const [modalInfo, setModalInfo] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onClose: null,
  });

  // --- 👇 [NEW] States for Additional Info Flow ---
  const [showAdditionalInfoModal, setShowAdditionalInfoModal] = useState(false); // First (Yes/No) modal
  const [showTextInputModal, setShowTextInputModal] = useState(false); // Second (Input) modal
  const [additionalInfo, setAdditionalInfo] = useState(""); // Holds text from the input
  const [isSavingInfo, setIsSavingInfo] = useState(false); // Loader for saving info

  // --- 👇 [CHANGED] Renamed for clarity ---
  const [showReportGenModal, setShowReportGenModal] = useState(false); // Was showCompletionModal
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);


  const showFancyAlert = (title, message, type = 'info', onClose = null) => {
    setModalInfo({ visible: true, title, message, type, onClose });
  };

  // ... (useEffect for permissions is unchanged) ...
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showFancyAlert('Permission needed', 'Photo library access is required to upload images.', 'error');
      }
    })();
  }, []);

  // ... (useEffect for initiateChatSession is unchanged, still uses showFancyAlert) ...
  useEffect(() => {
    const initiateChatSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/chats/start/${checklistId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          console.log("✅ Chat session started:", data);
          const sid = data.session?.id || data.sessionId || null;
          setSessionId(sid);
          sessionIdRef.current = sid;
          setMessages([{ from: "bot", text: data.firstMessage?.question || data.firstQuestion || "Started" }]);
        } else {
          console.error("❌ Error starting chat:", data.error || data);
          showFancyAlert("Error", data.error || "Failed to start inspection", 'error');
        }
      } catch (err) {
        console.error("Chat session start error:", err);
        showFancyAlert("Error", "Failed to start inspection (network)", 'error');
      }
    };
    initiateChatSession();
  }, [checklistId]);

  // ... (startRecording is unchanged, still uses showFancyAlert) ...
  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        showFancyAlert("Permission Required", "Microphone access is required!", 'error');
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

  // ... (stopRecording is unchanged) ...
  const stopRecording = async () => {
    console.log("Stopping recording..");
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);
    await sendAudioToSTT(uri);
  };

  // ... (sendAudioToSTT is unchanged, but ⚠️ REMOVE YOUR API KEY ⚠️) ...
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
          "xi-api-key": "sk_deaa9ba81a934450f2f500dceefa2d97b76aea0a72d39611", // 👈 REGENERATE THIS KEY
        },
        body: formData,
      });
      const data = await response.json();
      console.log("STT Response:", data);
      if (data.text) {
        // --- 👇 [NEW] Clean the text ---
        let transcribedText = data.text;
        transcribedText = transcribedText.replace(/\(.*?\)/g, '').trim();
        console.log("Cleaned Transcription:", transcribedText);
        if (transcribedText) setAnswer(transcribedText);
      } else {
        console.warn("No transcription text found:", data);
      }
    } catch (error) {
      console.error("STT error:", error);
    }
  };

  const handleNextQuestion = async () => {
    if (isContinuing) return;

    if (!answer.trim() && stagedImages.length === 0) {
      showFancyAlert("Info", "Please provide an answer or add an image.", 'info');
      return;
    }

    setIsContinuing(true);
    const sid = sessionIdRef.current;
    if (!sid) {
      showFancyAlert("Error", "Session not initialized.", 'error');
      setIsContinuing(false);
      return;
    }

    // ... (Optimistic UI logic is unchanged) ...
    const answerToSend = answer;
    const imagesToUpload = [...stagedImages];
    setAnswer("");
    setStagedImages([]);
    if (answerToSend.trim()) {
      setMessages(prev => [...prev, { from: "user", text: answerToSend }]);
    }
    if (imagesToUpload.length > 0) {
      setMessages(prev => [...prev, { from: 'user', images: imagesToUpload.map(img => img.uri) }]);
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      // ... (FormData logic is unchanged) ...
      const formData = new FormData();
      formData.append("answer", answerToSend);
      imagesToUpload.forEach((asset) => {
        formData.append("files", {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        });
      });

      const res = await fetch(`${API_BASE}/chats/continue/${sid}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send answer");

      if (data.nextMessage) {
        const botReply = data.nextMessage.question || "Next question";
        setMessages(prev => [...prev, { from: "bot", text: botReply }]);
      } else {
        // --- 💡 [CHANGED] ---
        // Inspection is finished! Start the new "additional info" flow.
        setMessages(prev => [...prev, { from: "bot", text: "✅ Inspection completed. Great job!" }]);
        setShowAdditionalInfoModal(true); // <-- Show Yes/No modal first
      }

    } catch (err) {
      console.error("Chat continue error:", err);
      showFancyAlert("Error", err.message || "Network or server error.", 'error');
      // ... (Rollback UI is unchanged) ...
      setAnswer(answerToSend);
      setStagedImages(imagesToUpload);
      setMessages(prev =>
        prev.filter(msg => msg.text !== answerToSend && !msg.images)
      );
    } finally {
      setIsContinuing(false);
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };


  // --- 👇 [NEW] Handlers for the "Additional Info" (Yes/No) modal ---
  const handleAdditionalInfo_Yes = () => {
    setShowAdditionalInfoModal(false); // Close Yes/No modal
    setShowTextInputModal(true); // Open text input modal
  };

  const handleAdditionalInfo_No = () => {
    setShowAdditionalInfoModal(false); // Close Yes/No modal
    setShowReportGenModal(true); // Go straight to "Generate Report?" modal
  };


  // --- 👇 [NEW] Handlers for the "Text Input" modal ---
  const handleTextInput_Skip = () => {
    setShowTextInputModal(false); // Close text input modal
    setAdditionalInfo(""); // Clear text
    setShowReportGenModal(true); // Go to "Generate Report?" modal
  };

  const saveAdditionalInfo = async () => {
    if (isSavingInfo) return;
    setIsSavingInfo(true);

    const sid = sessionIdRef.current;
    if (!sid) {
      showFancyAlert("Error", "Session ID is missing.", 'error');
      setIsSavingInfo(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      // --- 💡 This is a GUESS for your API endpoint. ---
      // --- 💡 You must build this endpoint in your backend. ---
      const res = await fetch(`${API_BASE}/chats/info/${sid}`, {
        method: "PUT", // or POST
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ info: additionalInfo })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save information");
      }

      // Success!
      console.log("✅ Additional info saved");
      setIsSavingInfo(false);
      setShowTextInputModal(false);
      setAdditionalInfo(""); // Clear text
      setShowReportGenModal(true); // Now, show the report gen modal

    } catch (err) {
      console.error("Save info error:", err);
      setIsSavingInfo(false);
      showFancyAlert("Error", err.message || "Could not save info.", 'error');
    }
  };


  // --- 👇 [CHANGED] This is the "Generate Report?" modal ---
  const handleGenerateReport = async () => {
    setShowReportGenModal(false);
    setIsGeneratingReport(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("User not logged in");
      if (!sessionIdRef.current) throw new Error("Session ID is missing");

      const res = await fetch(`${API_BASE}/api/reports/generate/${sessionIdRef.current}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to generate report");
        } catch (e) {
          console.error("Raw server error:", errorText);
          throw new Error(errorText.includes('<') ? "Server error: Check API route" : errorText);
        }
      }

      const data = await res.json(); // <-- data.report is in here
      setIsGeneratingReport(false);

      // --- 👇 [THIS IS THE CHANGE] 👇 ---
      // Instead of showing an alert, we navigate to a new screen
      // and pass the 'report' object from our API as a parameter.
      navigation.navigate('ReportView', { report: data.report });
      // --- 👆 [END OF CHANGE] 👆 ---

    } catch (err) {
      console.error("Report generation error:", err);
      setIsGeneratingReport(false);

      // We keep the error alert
      showFancyAlert(
        "Error",
        err.message || "Failed to generate report.",
        "error",
        // We still reset to Home if the *report generation* fails
        () => navigation.reset({ index: 0, routes: [{ name: "HomeHelp" }] })
      );
    }
  };

  // --- 👇 [CHANGED] This is the "Generate Report?" modal's "No" button ---
  const handleDeclineReport = () => {
    setShowReportGenModal(false);
    navigation.reset({ index: 0, routes: [{ name: "HomeHelp" }] });
  };


  // ... (handleStageImages is unchanged, still uses showFancyAlert) ...
  const handleStageImages = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (result.canceled || !result.assets) {
        return;
      }

      setStagedImages(prev => [...prev, ...result.assets]);

    } catch (err) {
      console.error("Image picking error:", err);
      showFancyAlert("Error", "An error occurred while picking images.", 'error');
    }
  };

  // ... (clearStagedImage is unchanged) ...
  const clearStagedImage = (uri) => {
    setStagedImages(prev => prev.filter(img => img.uri !== uri));
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ... (Navbar is unchanged) ... */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navLeft}>
          {/* <Ionicons name="arrow-back" size={28} color="#EF9C66" /> */}
        </TouchableOpacity>
        <Image source={require("../assets/favicon6.png")} style={styles.navLogo} />
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-circle-sharp" size={36} color="#EF9C66" />
        </TouchableOpacity>
      </View>

      {/* ... (Main chat layout is unchanged) ... */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <ScrollView
              style={styles.chatScroll}
              ref={scrollRef}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.msgBubble,
                    msg.from === "user" ? styles.msgUser : styles.msgBot,
                    (msg.images && styles.imageMsgBubble)
                  ]}
                >
                  {msg.text ? (
                    <Text style={msg.from === "user" ? styles.msgUserText : styles.msgBotText}>
                      {msg.text}
                    </Text>
                  ) : null}

                  {msg.images ? (
                    <View style={styles.imageContainer}>
                      {msg.images.map((url, i) => (
                        <Image
                          key={i}
                          source={{ uri: url.startsWith('http') ? url : url }}
                          style={styles.thumbnail}
                          contentFit="cover"
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              ))}
            </ScrollView>
            {/* ... (Staged images area is unchanged) ... */}
            {stagedImages.length > 0 && (
              <View style={styles.stagingContainer}>
                <ScrollView horizontal={true}>
                  {stagedImages.map((img, i) => (
                    <View key={i} style={styles.stagedThumbnailContainer}>
                      <Image source={{ uri: img.uri }} style={styles.stagedThumbnail} />
                      <TouchableOpacity
                        style={styles.stagedClearButton}
                        onPress={() => clearStagedImage(img.uri)}
                      >
                        <Ionicons name="close-circle" size={24} color="#000" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            {/* ... (Input row is unchanged) ... */}
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Type your answer..."
                value={answer}
                onChangeText={setAnswer}
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={handleNextQuestion}
              />
              <View style={styles.buttonsRow}>
                <TouchableOpacity onPress={handleStageImages} style={styles.iconBtn}>
                  <Ionicons name="image-outline" size={22} color="#EF9C66" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={recording ? stopRecording : startRecording}
                  style={styles.iconBtn}
                >
                  <MaterialIcons
                    name={recording ? "stop" : "mic"}
                    size={22}
                    color={recording ? "red" : "#EF9C66"}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNextQuestion} style={styles.sendBtn} disabled={isContinuing}>
                  {isContinuing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Send</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* --- (FANCY ALERT MODAL is unchanged) --- */}
      <Modal
        transparent={true}
        visible={modalInfo.visible}
        animationType="fade"
        onRequestClose={() => setModalInfo(prev => ({ ...prev, visible: false, onClose: null }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {modalInfo.type === 'success' && (
              <Ionicons name="checkmark-circle" size={60} color="#EF9C66" />
            )}
            {modalInfo.type === 'error' && (
              <Ionicons name="close-circle" size={60} color="#e63946" />
            )}
            {modalInfo.type === 'info' && (
              <Ionicons name="information-circle" size={60} color="#00809D" />
            )}
            <Text style={[
              styles.modalTitle,
              modalInfo.type === 'success' && { color: '#EF9C66' },
              modalInfo.type === 'info' && { color: '#00809D' },
              modalInfo.type === 'error' && { color: '#e63946' }
            ]}>
              {modalInfo.title}
            </Text>
            <Text style={styles.modalMessage}>{modalInfo.message}</Text>
            <TouchableOpacity
              style={[
                styles.modalButton,
                modalInfo.type === 'success' && { backgroundColor: '#EF9C66' },
                modalInfo.type === 'info' && { backgroundColor: '#00809D' },
                modalInfo.type === 'error' && { backgroundColor: '#e63946' }
              ]}
              onPress={() => {
                if (modalInfo.onClose) {
                  modalInfo.onClose();
                }
                setModalInfo({ visible: false, title: '', message: '', type: 'info', onClose: null });
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- ("Generating Report" Loader is unchanged) --- */}
      <Modal
        transparent={true}
        visible={isGeneratingReport}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ActivityIndicator size="large" color="#EF9C66" />
            <Text style={[styles.modalTitle, { color: '#EF9C66' }]}>
              Generating Report
            </Text>
            <Text style={styles.modalMessage}>Please wait a moment...</Text>
          </View>
        </View>
      </Modal>


      {/* --- 👇 [NEW] "Additional Info?" (Yes/No) Modal --- */}
      <Modal
        transparent={true}
        visible={showAdditionalInfoModal}
        animationType="fade"
        onRequestClose={handleAdditionalInfo_No} // Treat back button as "No"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons name="information-circle-outline" size={60} color="#00809D" />
            <Text style={[styles.modalTitle, { color: '#00809D' }]}>
              Special Instructions?
            </Text>
            <Text style={styles.modalMessage}>
              Do you want to add any special instructions or additional information for this inspection?
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary, { marginRight: 10, flex: 1 }]}
                onPress={handleAdditionalInfo_No}
              >
                <Text style={styles.modalButtonSecondaryText}>No</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#00809D', marginLeft: 10, flex: 1 }]}
                onPress={handleAdditionalInfo_Yes}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- 👇 [NEW] "Text Input" Modal --- */}
      <Modal
        transparent={true}
        visible={showTextInputModal}
        animationType="fade"
        onRequestClose={handleTextInput_Skip} // Treat back button as "Skip"
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <Ionicons name="create-outline" size={60} color="#EF9C66" />
              <Text style={[styles.modalTitle, { color: '#EF9C66' }]}>
                Additional Information
              </Text>

              <TextInput
                style={styles.modalTextInput}
                placeholder="Type your instructions here..."
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={5}
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
              />

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary, { marginRight: 10, flex: 1 }]}
                  onPress={handleTextInput_Skip}
                  disabled={isSavingInfo}
                >
                  <Text style={styles.modalButtonSecondaryText}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#EF9C66', marginLeft: 10, flex: 1 }]}
                  onPress={saveAdditionalInfo}
                  disabled={isSavingInfo}
                >
                  {isSavingInfo ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>


      {/* --- 👇 [CHANGED] "Generate Report?" (Yes/No) Modal --- */}
      <Modal
        transparent={true}
        visible={showReportGenModal}
        animationType="fade"
        onRequestClose={handleDeclineReport}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#EF9C66" />
            <Text style={[styles.modalTitle, { color: '#EF9C66' }]}>
              Inspection Completed
            </Text>
            <Text style={styles.modalMessage}>
              Chat session finished successfully. Do you want to generate a report of this inspection?
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary, { marginRight: 10, flex: 1 }]}
                onPress={handleDeclineReport}
              >
                <Text style={styles.modalButtonSecondaryText}>No</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#EF9C66', marginLeft: 10, flex: 1 }]}
                onPress={handleGenerateReport}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default StartInspectionScreen;


// --- 👇 [MODIFIED] Added/Updated Modal Styles at the end ---
const styles = StyleSheet.create({
  // ... (all your existing styles from safeArea to stagedClearButton are unchanged) ...
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  navbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 45,
    backgroundColor: '#fff',
    borderBottomWidth: 0.7,
    borderBottomColor: '#bed2d0',
  },
  navLeft: { padding: 4 },
  navLogo: { width: 140, height: 30, resizeMode: 'contain' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#f8fafc' },
  chatScroll: { flex: 1, marginBottom: 8 },
  msgBubble: { marginVertical: 6, padding: 10, borderRadius: 10, maxWidth: '80%' },
  msgBot: { alignSelf: 'flex-start', backgroundColor: '#e6e6e6' },
  msgUser: { alignSelf: 'flex-end', backgroundColor: '#EF9C66' },
  msgBotText: { color: '#000' },
  msgUserText: { color: '#fff' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    backgroundColor: '#f8fafc'
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#c2b6b6', borderRadius: 10,
    paddingVertical: 16, paddingHorizontal: 12, backgroundColor: '#fff', fontSize: 15, marginRight: 8,
  },
  buttonsRow: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: '#ddd',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginRight: 6,
  },
  sendBtn: {
    backgroundColor: '#00809D', paddingHorizontal: 12, paddingVertical: 9,
    minHeight: 38,
    borderRadius: 10, justifyContent: 'center',
  },
  imageMsgBubble: {
    padding: 5,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    margin: 3,
    backgroundColor: '#eee',
  },
  stagingContainer: {
    height: 90,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  stagedThumbnailContainer: {
    position: 'relative',
    marginRight: 10,
  },
  stagedThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  stagedClearButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },

  // --- 👇 [MODIFIED] FANCY MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#e63946',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    backgroundColor: '#e63946',
    elevation: 2,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    Image
  },
  // --- 👇 [NEW] Secondary button style (for "No" and "Skip") ---
  modalButtonSecondary: {
    backgroundColor: '#fff',
    borderColor: '#a9a9a9',
    borderWidth: 1,
  },
  modalButtonSecondaryText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- 👇 [NEW] Text Input for Modal ---
  modalTextInput: {
    width: '100%',
    height: 120, // Taller input field
    backgroundColor: '#f8fafc',
    borderColor: '#c2b6b6',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    marginBottom: 20,
    textAlignVertical: 'top', // Starts text from the top
  }
});