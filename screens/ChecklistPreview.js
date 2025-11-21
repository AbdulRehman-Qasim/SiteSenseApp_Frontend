import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    Modal,
    TextInput,
    ActivityIndicator,
    FlatList, // 💡 Added FlatList
    SafeAreaView, // 💡 Added SafeAreaView
    Platform, // 💡 Added Platform
    StatusBar, // 💡 Added StatusBar
    KeyboardAvoidingView, // 💡 Added KeyboardAvoidingView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import { supabase } from "../config/supabase"; // 👈 REMOVED
import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 ADDED
import FancyAlert from '../components/FancyAlert'; // 👈 ADDED

const API_BASE = "https://invalid-times-cable-proxy.trycloudflare.com";

export default function ChecklistPreview({ navigation, route }) {
    const { checklistId } = route.params || {}; // 💡 Get ID, not object
    
    const [checklistData, setChecklistData] = useState(null); // Holds original checklist
    const [loading, setLoading] = useState(true);

    // --- 💡 NEW STATES for new flow ---
    const [editableItems, setEditableItems] = useState([]); // Holds items for editing
    const [showChecklistModal, setShowChecklistModal] = useState(false); // For editable list

    const [saveModalVisible, setSaveModalVisible] = useState(false); // For "Save As"
    const [newChecklistTitle, setNewChecklistTitle] = useState("");
    const [newProjectName, setNewProjectName] = useState("");
    const [statusToSave, setStatusToSave] = useState("Ready to use"); // For new status

    // --- 💡 NEW: States for Instruction Flow ---
    const [showInstructionChoice, setShowInstructionChoice] = useState(false);
    const [pendingInspectionId, setPendingInspectionId] = useState(null); // Holds ID between modals
    const [startingInspection, setStartingInspection] = useState(false); // Fancy loader

    // --- 💡 FANCY ALERT STATE ---
    const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "error" });
    const showAlert = (title, message, type = "error") => {
        setAlert({ visible: true, title, message, type });
    };

    const handleTokenError = (errorData) => {
        if (errorData.error === "Invalid or expired token") {
            showAlert("Session Expired", "Please log in again to continue.");
            navigation.navigate("Login");
            return true;
        }
        return false;
    };
    // --- -------------------- ---

    // 💡 MODIFIED: Fetch checklist by ID
    useEffect(() => {
        const fetchChecklist = async () => {
            if (!checklistId) {
                showAlert("Error", "No checklist ID was provided.");
                navigation.goBack();
                return;
            }
            
            setLoading(true);
            try {
                // 💡 FIX: Use AsyncStorage
                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    showAlert("Error", "User not logged in");
                    navigation.navigate("Login");
                    return;
                }

                const res = await fetch(`${API_BASE}/api/checklists/${checklistId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (res.ok) {
                    const checklistResponse = data.checklist;
                    let parsedItems = checklistResponse.items;
                    if (typeof parsedItems === "string") {
                        try { parsedItems = JSON.parse(parsedItems); } catch { parsedItems = []; }
                    }

                    setChecklistData({ ...checklistResponse, items: parsedItems });
                    setEditableItems(parsedItems); // 💡 Set items for editing
                } else {
                    if(handleTokenError(data)) return;
                    showAlert("Error", data.error || "Failed to fetch checklist.");
                }
            } catch (err) {
                console.error("Checklist fetch error:", err);
                showAlert("Error", err.message || "A network error occurred.");
            }
            setLoading(false);
        };

        fetchChecklist();
    }, [checklistId]);

    // --- 💡 NEW: Handlers for the editable checklist modal ---
    const handleItemEdit = (text, index) => {
        const newItems = [...editableItems];
        newItems[index] = text;
        setEditableItems(newItems);
    };

    const handleItemDelete = (index) => {
        const newItems = editableItems.filter((_, i) => i !== index);
        setEditableItems(newItems);
    };

    const handleItemAdd = () => {
        setEditableItems([...editableItems, ""]); // Add a new empty string to edit
    };

    // --- 💡 MODIFIED: Logic for "Save for Later" and "Start Inspection" ---

    // This opens the modal and sets what to do on save
    const openSaveModal = (status) => {
        setStatusToSave(status);
        // Pre-fill modal with existing names
        setNewChecklistTitle(checklistData?.title || "");
        setNewProjectName(checklistData?.project?.name || ""); // 💡 Use project.name
        setSaveModalVisible(true);
    };

    // This is called by the modal's "Save" button
    const handleSaveAsNew = async () => {
        if (!newChecklistTitle.trim() || !newProjectName.trim()) {
            showAlert("Error", "Please enter both a checklist title and a project name.");
            return;
        }

        setLoading(true); // Show main loader
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/checklists/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    title: newChecklistTitle.trim(),
                    projectName: newProjectName.trim(),
                    items: editableItems,
                    status: statusToSave,
                })
            });

            const data = await res.json();
            if (res.ok) {
                setSaveModalVisible(false); // Close Save As modal
                setLoading(false); // Stop main loader
                
                if (statusToSave === "Completed") {
                    // --- 💡 NEW FLOW 💡 ---
                    setPendingInspectionId(data.checklist.id); // Save the ID
                    setShowInstructionChoice(true); // 👈 Open "Special Instruction" modal
                    // --- ---------------- ---
                } else {
                    // "Save for Later" flow
                    showAlert("Success", "Checklist saved successfully!", "success");
                    navigation.goBack();
                }
            } else {
                if (handleTokenError(data)) return;
                showAlert("Error", data.error || "Failed to save checklist.");
                setLoading(false);
            }
        } catch (err) {
            showAlert("Error", err.message);
            setLoading(false);
        }
    };

    // --- 💡 NEW: Handler for "Special Instruction" modal ---
    const handleChoice = (choice) => {
        setShowInstructionChoice(false);
        if (choice === "yes") {
            setLoading(true); // Show main loader
            // Navigate to SpecialInstruction screen (you'll need to create this)
            setTimeout(() => { // Simulate load
                setLoading(false);
                navigation.navigate("SpecialInstruction", { checklistId: pendingInspectionId });
            }, 1000);
        } else {
            // "No" was chosen
            setStartingInspection(true); // Show "Starting Inspection..." loader
            setTimeout(() => {
                setStartingInspection(false);
                navigation.navigate("StartInspection", {
                    checklistId: pendingInspectionId,
                });
            }, 1800); // Delay to show the loader message
        }
    };


    if (loading && !checklistData) {
        return (
            <SafeAreaView style={styles.container}>
                 <View style={styles.navbar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navLeft}>
                        <Ionicons name="chevron-back" size={26} color="#EF9C66" />
                    </TouchableOpacity>
                    <Text style={styles.navTitle}>Loading...</Text>
                    <View style={{ width: 26 }} />
                </View>
                <ActivityIndicator size="large" color="#00809D" style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }
    
    const displayName = checklistData?.fileName || checklistData?.title || "Untitled Checklist";

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            {/* Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navLeft}>
                    <Ionicons name="chevron-back" size={26} color="#EF9C66" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Checklist Preview</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Checklist Section */}
                <Text style={styles.sectionHeading}>Checklist</Text>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{displayName}</Text>
                    <Text style={styles.projectName}>
                        Project: {checklistData?.project?.name || "N/A"}
                    </Text>
                    <TouchableOpacity onPress={() => setShowChecklistModal(true)}>
                        <Text style={styles.viewChecklist}>View & Edit Checklist</Text>
                    </TouchableOpacity>
                </View>

                {/* Buttons */}
                <TouchableOpacity style={styles.startBtn} onPress={() => openSaveModal("Completed")}>
                    <Text style={styles.startText}>Start Inspection</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={() => openSaveModal("Ready to use")}>
                    <Ionicons name="save-outline" size={20} color="#EF9C66" style={{ marginRight: 6 }} />
                    <Text style={styles.saveText}>Save for Later</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* --- REBUILT: Checklist Modal --- */}
            <Modal visible={showChecklistModal} animationType="slide" transparent={false}>
                <SafeAreaView style={styles.modalFullPage}>
                    <View style={styles.navbar}>
                        <Text style={[styles.navTitle, { marginLeft: 20 }]}>Edit Checklist Items</Text>
                        <TouchableOpacity onPress={() => setShowChecklistModal(false)} style={{ padding: 5, marginRight: 15 }}>
                            <Ionicons name="close" size={26} color="#EF9C66" />
                        </TouchableOpacity>
                    </View>
                    
                    <FlatList
                        data={editableItems}
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
                    <TouchableOpacity
                        onPress={() => setShowChecklistModal(false)}
                        style={styles.doneBtn}
                    >
                        <Text style={styles.startText}>Done</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>

            {/* --- "Save As" Modal --- */}
            <Modal
                visible={saveModalVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setSaveModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View style={styles.projectModal}>
                        <Text style={styles.modalTitle}>Save New Checklist</Text>
                        <TextInput
                            placeholder="Enter New Checklist Title"
                            value={newChecklistTitle}
                            onChangeText={setNewChecklistTitle}
                            style={styles.textInput}
                            placeholderTextColor="#6B7280"
                        />
                        <TextInput
                            placeholder="Enter New Project Name"
                            value={newProjectName}
                            onChangeText={setNewProjectName}
                            style={styles.textInput}
                            placeholderTextColor="#6B7280"
                        />
                        <View style={styles.choiceBtns}>
                            <TouchableOpacity
                                style={[styles.choiceBtn, { backgroundColor: "#E5E7EB" }]}
                                onPress={() => setSaveModalVisible(false)}
                                disabled={loading}
                            >
                                <Text style={[styles.choiceBtnText, { color: '#1F2937' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.choiceBtn, { backgroundColor: "#00809D" }]}
                                onPress={handleSaveAsNew}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.choiceBtnText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* --- 💡 NEW: Special Instruction Choice --- */}
            <Modal transparent={true} visible={showInstructionChoice} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.choiceBox}>
                        <Text style={styles.choiceText}>
                            Do you want to add any special instructions for this inspection?
                        </Text>
                        <View style={styles.choiceBtns}>
                            <TouchableOpacity
                                style={[styles.choiceBtn, { backgroundColor: "#E5E7EB" }]} // Changed color
                                onPress={() => handleChoice("no")}
                            >
                                <Text style={[styles.choiceBtnText, {color: '#1F2937'}]}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.choiceBtn, { backgroundColor: "#00809D" }]}
                                onPress={() => handleChoice("yes")}
                            >
                                <Text style={styles.choiceBtnText}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- 💡 NEW: Fancy Loader --- */}
            {startingInspection && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#EF9C66" />
                    <Text style={styles.loaderText}>Starting your inspection...</Text>
                </View>
            )}
            
            {/* --- Main Loader --- */}
            {loading && !startingInspection && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#EF9C66" />
                    <Text style={styles.loaderText}>Please wait...</Text>
                </View>
            )}

            {/* --- Fancy Alert --- */}
            <FancyAlert
                visible={alert.visible}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={() => setAlert({ ...alert, visible: false })}
            />
        </SafeAreaView>
    );
}

// --- STYLES (Re-using your existing styles) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    navbar: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 5 : 47, // Use your style
        backgroundColor: "#ffffffff",
        borderBottomWidth: 0.7,
        borderBottomColor: "#bed2d0",
    },
    navLeft: {
        padding: 2,
        marginTop: 8,
        marginBottom: -5,
    },
    navTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: "#00809D",
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    sectionHeading: {
        fontSize: 20,
        fontWeight: "900",
        color: "#00809D",
        textTransform: "uppercase",
        marginBottom: 10,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#acb1bbff",
    },
    cardTitle: { // This is for the file/checklist name
        fontSize: 18,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 8,
    },
    projectName: {
        fontSize: 15,
        color: "#374151",
        marginBottom: 15,
    },
    viewChecklist: {
        fontSize: 15,
        fontWeight: "600",
        color: "#EF9C66",
        textAlign: "right",
    },
    startBtn: {
        backgroundColor: "#00809D",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 60,
        marginBottom: 12,
    },
    startText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    saveBtn: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#EF9C66",
    },
    saveText: {
        color: "#EF9C66",
        fontWeight: "bold",
        fontSize: 16,
    },
    // --- Editable List Modal Styles ---
    modalFullPage: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 50,
    },
    editableItem: {
        backgroundColor: '#FFFFFF',
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
        marginBottom: 20,
    },
    addQuestionBtnText: {
        color: '#00809D',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
    doneBtn: {
        backgroundColor: "#EF9C66",
        padding: 16,
        margin: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    // --- "Save As" & "Instruction" Modal Styles ---
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    projectModal: { // Re-using this for the "Save As" modal
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
    textInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 15,
        backgroundColor: '#F9FAFB',
    },
    choiceBtns: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    choiceBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 5,
    },
    choiceBtnText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    // --- "Instruction" Modal Box ---
    choiceBox: {
        width: "90%",
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 12,
        elevation: 5,
        alignItems: 'center',
    },
    choiceText: {
        fontSize: 16,
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },
    // --- Loader ---
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999, // Make sure it's on top
    },
    loaderText: {
        color: '#FFFFFF',
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600',
    },
});