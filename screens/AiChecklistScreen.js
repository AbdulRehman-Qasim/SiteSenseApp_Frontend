import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    ActivityIndicator,
    Modal,
    FlatList,
    SafeAreaView,
    Platform,
    BackHandler,
    KeyboardAvoidingView,
    StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import FancyAlert from '../components/FancyAlert'; // 👈 Import FancyAlert

// Your API_BASE
const API_BASE = "https://invalid-times-cable-proxy.trycloudflare.com";

const AiChecklistScreen = () => {
    const navigation = useNavigation();

    const [message, setMessage] = useState("");
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- 💡 MODIFIED STATES ---
    const [checklistGenerated, setChecklistGenerated] = useState(false);
    const [generatedItems, setGeneratedItems] = useState([]);
    const [statusToSave, setStatusToSave] = useState("Ready to use");

    // Modal for saving
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [newChecklistTitle, setNewChecklistTitle] = useState("");
    const [newProjectName, setNewProjectName] = useState("");

    // Recent list states
    const [recentChecklists, setRecentChecklists] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(true);

    // --- 💡 NEW: State for View Modal ---
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    // ---------------------------------

    // --- 💡 FANCY ALERT STATE ---
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "error" });
    const showAlert = (title, message, type = "error") => {
        setAlert({ visible: true, title, message, type });
    };

    // --- 💡 Helper function to handle token errors ---
    const handleTokenError = (errorData) => {
        if (errorData.error === "Invalid or expired token") {
            showAlert("Session Expired", "Please log in again to continue.");
            navigation.navigate("Login");
            return true;
        }
        return false;
    };

    // --- 1. Fetch Recent Checklists (Unchanged) ---
    const fetchRecent = async () => {
        setLoadingRecent(true);
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                showAlert("Error", "You are not logged in.");
                navigation.navigate("Login");
                return;
            }
            const res = await fetch(`${API_BASE}/api/checklists/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!res.ok) {
                if (handleTokenError(data)) return;
                throw new Error(data.error || "Failed to fetch");
            }
            // 💡 Show only the 2 most recent in this section
            setRecentChecklists(data.checklists?.slice(0, 2) || []);
        } catch (e) {
            console.error("Recent fetch error:", e);
        } finally {
            setLoadingRecent(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRecent();
        }, [])
    );

    // --- 2. Audio Logic (Unchanged) ---
    const startRecording = async () => {
        try {
            setIsRecording(true);
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== "granted") {
                showAlert("Permission Error", "Permission to access microphone is required!");
                setIsRecording(false);
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
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        if (!recording) return;
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        await sendAudioToSTT(uri);
    };

    const handleVoicePress = () => {
        isRecording ? stopRecording() : startRecording();
    };

    // --- 3. STT Logic (Unchanged) ---
    const sendAudioToSTT = async (uri) => {
        setLoading(true);
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
                let transcribedText = data.text.replace(/\(.*?\)/g, '').trim();
                if (transcribedText) setMessage(transcribedText);
            }
        } catch (error) {
            showAlert("Error", "Failed to transcribe audio.");
        } finally {
            setLoading(false);
        }
    };

    // --- 4. Generation Logic (Unchanged) ---
    const handleGenerationSuccess = (data) => {
        if (data.items && Array.isArray(data.items)) {
            setGeneratedItems(data.items);
            setChecklistGenerated(true);
            setMessage('');
        } else {
            showAlert("Error", data.error || "Failed to get items from AI.");
        }
    };

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
                copyToCacheDirectory: true,
            });
            if (result.canceled) return;
            const file = result.assets[0];
            const formData = new FormData();
            formData.append("file", { uri: file.uri, name: file.name, type: file.mimeType || "application/octet-stream" });

            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${API_BASE}/api/checklists/generate`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                if (handleTokenError(data)) return;
                throw new Error(data.error || "Upload failed.");
            }
            handleGenerationSuccess(data);
        } catch (error) {
            showAlert("Upload Error", error.message);
        }
        setLoading(false);
    };

    const handleSend = async () => {
        if (!message.trim()) return;
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/checklists/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ goal: message.trim() })
            });
            const data = await res.json();
            if (!res.ok) {
                if (handleTokenError(data)) return;
                throw new Error(data.error || "Failed to generate checklist.");
            }
            handleGenerationSuccess(data);
        } catch (err) {
            showAlert("Generation Error", err.message);
        }
        setLoading(false);
    };

    // --- 5. Save Modal Logic (Unchanged) ---
    const openSaveModal = (status) => {
        setStatusToSave(status);
        setNewChecklistTitle("");
        setNewProjectName("");
        setSaveModalVisible(true);
    };

    const handleSaveGeneratedChecklist = async () => {
        if (!newChecklistTitle.trim() || !newProjectName.trim()) {
            showAlert("Error", "Please enter both a checklist title and a project name.");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/checklists/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    title: newChecklistTitle.trim(),
                    projectName: newProjectName.trim(),
                    items: generatedItems,
                    status: statusToSave,
                })
            });

            const data = await res.json();
            if (res.ok) {
                setSaveModalVisible(false);
                setChecklistGenerated(false);
                setGeneratedItems([]);
                fetchRecent();

                if (statusToSave === "Completed") {
                    navigation.navigate("StartInspection", {
                        checklistId: data.checklist.id,
                    });
                } else {
                    showAlert("Success", "Checklist saved successfully!", "success");
                }
            } else {
                if (handleTokenError(data)) return;
                showAlert("Error", data.error || "Failed to save checklist.");
            }
        } catch (err) {
            showAlert("Error", err.message);
        }
        setLoading(false);
    };

    // --- 6. UI Helpers (--- 💡 MODIFIED 💡 ---) ---
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (checklistGenerated) {
                    setChecklistGenerated(false);
                    setGeneratedItems([]);
                    return true;
                }
                navigation.goBack();
                return true;
            };
            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            );
            return () => subscription.remove();
        }, [navigation, checklistGenerated])
    );

    const handleItemEdit = (text, index) => {
        const newItems = [...generatedItems];
        newItems[index] = text;
        setGeneratedItems(newItems);
    };

    const handleItemDelete = (index) => {
        const newItems = generatedItems.filter((_, i) => i !== index);
        setGeneratedItems(newItems);
    };

    const handleItemAdd = () => {
        setGeneratedItems([...generatedItems, ""]);
    };

    // --- 💡 NEW: Handlers for View Modal ---
    const handleViewChecklist = (checklist) => {
        setSelectedChecklist(checklist);
        setIsViewModalVisible(true);
    };

    const handleStartInspectionFromView = () => {
        if (!selectedChecklist) return;
        const checklistIdToStart = selectedChecklist.id;

        setIsViewModalVisible(false); // Close modal

        // Navigate to StartInspection
        setTimeout(() => { // Delay to let modal close
            navigation.navigate("StartInspection", {
                checklistId: checklistIdToStart,
            });
        }, 250);
    };
    // --- ------------------------------- ---

    // --- 7. Render Functions ---

    // Renders the main form
    const renderForm = () => (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <Text style={styles.headerText}>Let our bot help you</Text>
            {/* ... (Text Input, Buttons, etc. - Unchanged) ... */}
            <View style={styles.textInputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Upload your project specs or describe the task"
                    placeholderTextColor="#6B7280"
                    multiline
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.attachmentIcon} onPress={handleFileUpload}>
                    <Ionicons name="attach" size={24} color="#6B7280" />
                </TouchableOpacity>
            </View>
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.generateBtn}
                    onPress={handleSend}
                    disabled={loading || isRecording}
                >
                    {loading && !isRecording ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.generateBtnText}>Generate Checklist</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.voiceBtn, isRecording && styles.voiceBtnActive]}
                    onPress={handleVoicePress}
                    disabled={loading}
                >
                    <MaterialIcons name={isRecording ? "stop" : "mic"} size={20} color={isRecording ? "#FFFFFF" : "#00809D"} />
                    <Text style={[styles.voiceBtnText, isRecording && styles.voiceBtnTextActive]}>
                        {isRecording ? "Listening..." : "Voice"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Recently Generated</Text>
            {loadingRecent ? (
                <ActivityIndicator size="small" color="#00809D" style={{ marginTop: 20 }} />
            ) : recentChecklists.length === 0 ? (
                <Text style={styles.emptyText}>No recent checklists found.</Text>
            ) : (
                <FlatList
                    data={recentChecklists}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardLeft}>
                                <Text style={styles.cardTitle}>{item.title || "Untitled"}</Text>
                                <Text style={styles.cardMeta}>
                                    {item.items?.length || 0} items
                                    <Text> • Generated {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                                </Text>
                                <Text style={[
                                    styles.cardStatus,
                                    item.status === 'Completed' ? styles.statusCompleted : styles.statusReady
                                ]}>
                                    {item.status || "Ready to use"}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.viewBtn}
                                // --- 💡 MODIFIED: OnPress now opens modal ---
                                onPress={() => handleViewChecklist(item)}
                            >
                                <Text style={styles.viewBtnText}>View</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
            <View style={{ height: 50 }} />
        </ScrollView>
    );

    // Renders the editable checklist (Unchanged)
    const renderGeneratedChecklist = () => (
        <View style={{ flex: 1 }}>
            <Text style={styles.headerText}>AI Generated Checklist</Text>
            <FlatList
                data={generatedItems}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.editableItem}>
                        <TextInput
                            style={styles.editableInput}
                            value={item}
                            onChangeText={(text) => handleItemEdit(text, index)}
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.deleteItemBtn}
                            onPress={() => handleItemDelete(index)}
                        >
                            <Ionicons name="close-circle" size={24} color="#D32F2F" />
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={styles.scrollContainer}
                ListFooterComponent={
                    <TouchableOpacity style={styles.addQuestionBtn} onPress={handleItemAdd}>
                        <Ionicons name="add-circle-outline" size={22} color="#00809D" />
                        <Text style={styles.addQuestionBtnText}>Add Question</Text>
                    </TouchableOpacity>
                }
            />
            <View style={styles.bottomActionContainer}>
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => openSaveModal("Ready to use")}
                >
                    <Text style={styles.saveBtnText}>Save for Later</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => openSaveModal("Completed")}
                >
                    <Text style={styles.startBtnText}>Start Inspection</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.navbar}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home")}
                    style={styles.navLeft}
                >
                    <Ionicons name="chevron-back" size={26} color="#EF9C66" />
                </TouchableOpacity>
                <Image source={require("../assets/favicon7.png")} style={styles.logoImage} />
                <View style={{ width: 26 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {checklistGenerated ? renderGeneratedChecklist() : renderForm()}
            </KeyboardAvoidingView>

            {/* --- Save Modal (Unchanged) --- */}
            <Modal
                visible={saveModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setSaveModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Save New Checklist</Text>
                        <TextInput
                            placeholder="Enter Checklist Title"
                            value={newChecklistTitle}
                            onChangeText={setNewChecklistTitle}
                            style={styles.modalInput}
                            placeholderTextColor="#6B7280"
                        />
                        <TextInput
                            placeholder="Enter Project Name"
                            value={newProjectName}
                            onChangeText={setNewProjectName}
                            style={styles.modalInput}
                            placeholderTextColor="#6B7280"
                        />
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setSaveModalVisible(false)}
                                disabled={loading}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSave]}
                                onPress={handleSaveGeneratedChecklist}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.modalButtonTextSave}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* --- 💡 NEW: "View Checklist" Modal --- */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={isViewModalVisible}
                onRequestClose={() => setIsViewModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle} numberOfLines={1}>
                                {selectedChecklist?.title || "Checklist Items"}
                            </Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setIsViewModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={selectedChecklist?.items || []}
                            renderItem={({ item, index }) => (
                                <View style={styles.itemRow}>
                                    <Text style={styles.itemRowText}>
                                        <Text style={styles.itemRowNumber}>{index + 1}.</Text> {item}
                                    </Text>
                                </View>
                            )}
                            keyExtractor={(item, index) => `${item}-${index}`}
                            ListEmptyComponent={
                                <Text style={styles.emptyModalText}>No items in this checklist.</Text>
                            }
                        />

                        {/* Conditional "Start Inspection" Button */}
                        {(selectedChecklist?.status === 'Ready to use' || !selectedChecklist?.status) && (
                            <TouchableOpacity
                                style={styles.modalStartButton}
                                onPress={handleStartInspectionFromView}
                            >
                                <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.modalStartButtonText}>Start Inspection</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
            {/* --- End of New Modal --- */}

            {/* --- Fancy Alert (Unchanged) --- */}
            <FancyAlert
                visible={alert.visible}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={() => setAlert({ ...alert, visible: false })}
            />
        </SafeAreaView>
    );
};

export default AiChecklistScreen;

// --- 💡 STYLES (with new additions) 💡 ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
    navbar: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 5 : 35,
        backgroundColor: "#fff",
        borderBottomWidth: 0.7,
        borderBottomColor: "#bed2d0",
    },
    navLeft: { padding: 2, marginTop: 8, marginBottom: -5 },
    logoImage: { width: 140, height: 40, alignSelf: "center", marginTop: 13, marginBottom: -5 },
    scrollContainer: { padding: 20, paddingBottom: 50 },
    headerText: {
        fontSize: 20,
        color: "#00809D",
        fontWeight: "900",
        textAlign: "center",
        marginTop: 15,
        marginBottom: 0,
    },
    textInputContainer: { position: "relative", marginBottom: 15, marginTop: 20 },
    textInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        padding: 12,
        paddingLeft: 15,
        paddingRight: 45,
        fontSize: 15,
        textAlignVertical: "top",
        minHeight: 120,
        backgroundColor: "#F9FAFB",
        color: "#111827"
    },
    attachmentIcon: { position: "absolute", bottom: 12, right: 12, padding: 5 },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    generateBtn: {
        backgroundColor: "#00809D",
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
        flex: 1.5,
        marginRight: 10,
        height: 50,
        justifyContent: 'center',
    },
    generateBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
    voiceBtn: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#00809D",
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: 'center',
        flex: 1,
        height: 50,
    },
    voiceBtnActive: { backgroundColor: "#D32F2F", borderColor: "#D32F2F" },
    voiceBtnText: { color: "#00809D", fontWeight: "600", fontSize: 15, marginLeft: 8 },
    voiceBtnTextActive: { color: "#FFFFFF" },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 15,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLeft: { flex: 1, marginRight: 10 },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    cardMeta: { color: "#6B7280", fontSize: 13, marginBottom: 6 },
    cardStatus: { fontSize: 14, fontWeight: '600' },
    statusReady: { color: "#00809D" }, // Changed to theme color
    statusCompleted: { color: "#EF9C66" },
    viewBtn: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 18,
    },
    viewBtnText: { color: "#374151", fontWeight: "500", fontSize: 14 },
    emptyText: { color: "#6B7280", textAlign: "center", marginTop: 20, fontSize: 15 },

    editableItem: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 10,
        marginHorizontal: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    editableInput: {
        fontSize: 15,
        color: '#111827',
        minHeight: 20,
        flex: 1,
    },
    deleteItemBtn: {
        padding: 5,
        marginLeft: 10,
    },
    addQuestionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#00809D',
        backgroundColor: '#E6F8F5',
        marginHorizontal: 20,
        marginTop: 10,
    },
    addQuestionBtnText: {
        color: '#00809D',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
    bottomActionContainer: {
        flexDirection: 'row',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    saveBtn: {
        backgroundColor: "#E5E7EB",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        flex: 1,
        marginRight: 10,
    },
    saveBtnText: {
        color: "#1F2937",
        fontWeight: "600",
        fontSize: 16,
    },
    startBtn: {
        backgroundColor: "#00809D",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        flex: 1,
    },
    startBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: '#1F2937',
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 15,
        backgroundColor: '#F9FAFB',
    },
    modalButtonRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 10,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 10,
    },
    modalButtonCancel: {
        backgroundColor: "#E5E7EB",
    },
    modalButtonTextCancel: {
        color: "#1F2937",
        fontWeight: "600",
    },
    modalButtonSave: {
        backgroundColor: "#00809D",
    },
    modalButtonTextSave: {
        color: "white",
        fontWeight: "600",
    },

    // --- 💡 NEW "View" Modal Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalBox: {
        width: '100%',
        maxHeight: '70%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 12,
        marginBottom: 15,
    },
    // modalTitle is already defined
    modalCloseButton: {
        padding: 5,
    },
    itemRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemRowText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 20,
    },
    itemRowNumber: {
        fontWeight: '600',
        color: '#1F2937',
    },
    emptyModalText: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 15,
        marginVertical: 30,
    },
    modalStartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00809D', // Main theme color
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    modalStartButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});