import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const API_BASE = "https://invalid-times-cable-proxy.trycloudflare.com"; // ⚠️ Update with your actual base URL

export default function EditChecklist({ route, navigation }) {
  const { checklistId } = route.params;
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState(""); // 🆕 added for input

  // 🧠 Fetch checklist data
  const fetchChecklist = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/checklists/${checklistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        Alert.alert("⚠️ Error", "Failed to fetch checklist questions.");
        return;
      }

      const data = await res.json();
      const itemsAsObjects = (data.checklist.items || []).map((itemString) => ({
        question: itemString,
      }));

      setQuestions(itemsAsObjects);
      setOriginalQuestions(itemsAsObjects);
      setProjectName(data.checklist.projectName || "");
    } catch (err) {
      console.error("Fetch checklist error:", err);
      Alert.alert("⚠️ Error", "Something went wrong while fetching checklist.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, [checklistId]);

  // 🧠 Update question text locally
  const handleQuestionChange = (text, index) => {
    const updated = [...questions];
    updated[index].question = text;
    setQuestions(updated);
  };

  // 🧠 Update question onBlur
  const handleUpdateItemOnBlur = async (index) => {
    const originalQuestion = originalQuestions[index]?.question;
    const currentQuestion = questions[index]?.question;

    if (originalQuestion === currentQuestion) return;
    if (!currentQuestion.trim()) {
      Alert.alert("Hold on", "Question cannot be empty.");
      const reverted = [...questions];
      reverted[index].question = originalQuestion;
      setQuestions(reverted);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/checklists/${checklistId}/items/${index}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updatedItem: currentQuestion }),
      });

      if (!res.ok) {
        Alert.alert("❌ Error", "Failed to update question.");
        fetchChecklist();
      } else {
        setOriginalQuestions([...questions]);
      }
    } catch (err) {
      console.error("Update item error:", err);
      Alert.alert("⚠️ Error", "Something went wrong while updating.");
    }
  };

  // ➕ [UPDATED] Add new question
  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) {
      Alert.alert("⚠️ Info", "Please enter a question before adding.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/checklists/${checklistId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newItem: newQuestion.trim() }),
      });

      if (res.ok) {
        setNewQuestion(""); // Clear input field
        fetchChecklist(); // Refresh list
      } else {
        const errData = await res.json();
        Alert.alert("❌ Error", errData.error || "Failed to add new question.");
      }
    } catch (err) {
      console.error("Add item error:", err);
      Alert.alert("⚠️ Error", "Something went wrong while adding.");
    }
  };

  // ❌ Delete question
  const handleRemoveQuestion = (index) => {
    Alert.alert("Delete Question", "Are you sure you want to delete this question?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/checklists/${checklistId}/items/${index}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
              fetchChecklist();
            } else {
              const errData = await res.json();
              Alert.alert("❌ Error", errData.error || "Failed to delete question.");
            }
          } catch (err) {
            console.error("Delete item error:", err);
            Alert.alert("⚠️ Error", "Something went wrong while deleting.");
          }
        },
      },
    ]);
  };

  const handleDoneButton = () => setIsModalVisible(true);

  const handleSaveProjectAndStart = async () => {
    if (!projectName.trim()) {
      Alert.alert("Error", "Please enter a project name.");
      return;
    }

    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/checklists/${checklistId}/projectName`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectName: projectName.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save project name");
      }

      setIsModalVisible(false);
      const itemsAsStrings = questions.map((itemObj) => itemObj.question);
      navigation.replace("StartInspection", {
        checklistId,
        checklistItems: itemsAsStrings || [],
      });
    } catch (err) {
      console.error("Save project name error:", err);
      Alert.alert("⚠️ Error", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#00809D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#EF9C66" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Checklist</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {questions.map((item, index) => (
          <View key={index} style={styles.questionContainer}>
            <TextInput
              style={styles.input}
              value={item.question}
              onChangeText={(text) => handleQuestionChange(text, index)}
              onBlur={() => handleUpdateItemOnBlur(index)}
              placeholder={`Question ${index + 1}`}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => handleRemoveQuestion(index)} style={styles.iconButton}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        {/* 🆕 New input to type question before adding */}
        <View style={styles.addInputContainer}>
          <TextInput
            style={styles.addInput}
            placeholder="Type a new question"
            value={newQuestion}
            onChangeText={setNewQuestion}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.addInputButton} onPress={handleAddQuestion}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Done button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleDoneButton}>
          <Ionicons name="checkmark-done" size={22} color="#000" />
          <Text style={styles.saveBtnText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for project name */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Project Name</Text>
            <Text style={styles.modalSubtitle}>
              Please set or confirm the project name before starting the inspection.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter Project Name"
              value={projectName}
              onChangeText={setProjectName}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProjectAndStart}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save & Start</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 47,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#b0a7a7ff",
  },
  backButton: { width: 24 },
  navTitle: { fontSize: 20, fontWeight: "bold", color: "#00809D", flex: 1, textAlign: "center" },
  scrollView: { padding: 20 },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    elevation: 1,
  },
  input: {
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    color: "#333",
  },
  iconButton: {
    backgroundColor: "#EF9C66",
    marginLeft: 8,
    borderRadius: 8,
    padding: 6,
  },
  addInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 1,
  },
  addInput: {
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: "#333",
    backgroundColor: "#fff",
  },
  addInputButton: {
    backgroundColor: "#00809D",
    marginLeft: 8,
    borderRadius: 8,
    padding: 8,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF9C66",
    padding: 16,
    borderRadius: 10,
    marginTop: 25,
    marginBottom: 30,
  },
  saveBtnText: { color: "#000", fontWeight: "600", marginLeft: 8, fontSize: 16 },
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
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalSubtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtonRow: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  cancelButton: { backgroundColor: "#eee", marginRight: 10 },
  cancelButtonText: { color: "#333", fontWeight: "bold" },
  saveButton: { backgroundColor: "#00809D" },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
});
