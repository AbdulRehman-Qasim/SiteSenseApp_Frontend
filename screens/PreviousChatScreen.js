import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  // Alert, // 👈 We will only use this for the two-button confirm
  Modal,
  ScrollView,
  SafeAreaView,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Image } from 'expo-image';

const BASE_URL = "https://invalid-times-cable-proxy.trycloudflare.com";
const API_PATH = `${BASE_URL}/chats`;

const PreviousChatsScreen = () => {
  const navigation = useNavigation();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Modal States ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- Report Generation States ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  // --- 💡 DELETE MODAL STATE ---
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // This is for your inline spinner
  // --------------------------

  // --- fetchSessions ---
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        showAlert("Error", "You are not logged in."); // 👈 Fancy Alert
        navigation.navigate("Login");
        return;
      }
      const response = await fetch(`${API_PATH}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        if (handleTokenError(data)) return;
        throw new Error(data.error || "Failed to fetch sessions");
      }
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      showAlert("Error", error.message); // 👈 Fancy Alert
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSessions();
    });
    return unsubscribe;
  }, [navigation]);

  // --- Filtered sessions (Unchanged) ---
  const filteredSessions = useMemo(() => {
    if (!searchQuery) {
      return sessions;
    }
    return sessions.filter(session =>
      session.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.checklist?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sessions, searchQuery]);


  // --- handleOpenChat ---
  const handleOpenChat = async (sessionId) => {
    setModalVisible(true);
    setIsChatLoading(true);
    setSelectedSession(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_PATH}/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        if (handleTokenError(data)) return;
        throw new Error(data.error || "Failed to load chat history");
      }
      setSelectedSession(data.session);
    } catch (error) {
      console.error("Error fetching chat details:", error);
      showAlert("Error", error.message); // 👈 Fancy Alert
      setModalVisible(false);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- 💡 MODIFIED: Delete Handlers ---
  const openDeleteModal = (session) => {
    setSessionToDelete(session);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    const sessionId = sessionToDelete.id;
    setIsDeleteModalVisible(false);
    setDeletingId(sessionId); // Show inline spinner
    setSessionToDelete(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_PATH}/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSessions((prev) => prev.filter((item) => item.id !== sessionId));
        showAlert("Success", "Chat session deleted successfully.", "success"); // 👈 Fancy Alert
      } else {
        const data = await response.json();
        if (handleTokenError(data)) return;
        showAlert("Error", data.error || "Failed to delete chat. Try again."); // 👈 Fancy Alert
      }
    } catch (error) {
      showAlert("Error", "Something went wrong."); // 👈 Fancy Alert
    } finally {
      setDeletingId(null); // Hide inline spinner
    }
  };
  // --- -------------------------- ---

  // --- handleGenerateReport ---
  const handleGenerateReport = async () => {
    if (!selectedSession?.id) {
      showAlert("Error", "No session selected.", "info"); // 👈 Fancy Alert
      return;
    }
    const sessionId = selectedSession.id;
    setIsGenerating(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/reports/generate/${sessionId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        if (handleTokenError(data)) return;
        throw new Error(data.error || "Failed to generate report");
      }
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error generating report:", error);
      showAlert("Error", error.message); // 👈 Fancy Alert
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setModalVisible(false);
    navigation.navigate("Menu");
  };

  // --- 💡 MODIFIED: renderSessionItem ---
  const renderSessionItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => handleOpenChat(item.id)}
      >
        <Text style={styles.projectName}>
          {item.projectName || "Untitled Inspection"}
        </Text>
        {item.checklist?.title && (
          <Text style={styles.checklistTitle}>
            Checklist: {item.checklist.title}
          </Text>
        )}
        <Text style={styles.dateText}>
          {new Date(item.startedAt).toLocaleString()}
        </Text>
      </TouchableOpacity>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {deletingId === item.id ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          // 💡 Calls openDeleteModal now
          <TouchableOpacity onPress={() => openDeleteModal(item)}>
            <Ionicons name="trash" size={22} color="#e63946" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // --- renderMessageItem (Unchanged) ---
  const renderMessageItem = (message, index) => {
    // ... (same as your code)
    const hasImages = message.media && message.media.length > 0;
    return (
      <View key={index} style={styles.chatRow}>
        <Text style={styles.chatQ}>Q: {message.question}</Text>
        {message.answer && (
          <Text style={styles.chatA}>A: {message.answer}</Text>
        )}
        {hasImages && (
          <View style={styles.imageContainer}>
            {message.media.map((media, i) => (
              <Image
                key={i}
                source={{ uri: `${BASE_URL}${media.url}` }}
                style={styles.thumbnail}
                contentFit="cover"
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // --- 💡 NEW: Helper to get alert styles ---
  const getAlertStyles = () => {
    const type = alert.type;
    const isError = type === "error";
    const iconName = isError
      ? "alert-circle"
      : (type === "success" ? "checkmark-circle" : "information-circle");
    const iconColor = isError
      ? "#D32F2F"
      : (type === "success" ? "#00809D" : "#007BFF");
    const buttonColor = isError ? "#D32F2F" : "#00809D";
    return { iconName, iconColor, buttonColor };
  };
  const { iconName, iconColor, buttonColor } = getAlertStyles();
  // --- --------------------------------- ---

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* --- (Navbar is unchanged) --- */}
      <View style={styles.navbar}>
        {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#EF9C66" />
                </TouchableOpacity> */}
        <Text style={styles.navTitle}>Previous Inspections</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        {/* --- (Search Bar is unchanged) --- */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by project or checklist..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {/* --- (Main List is unchanged) --- */}
        {loading ? (
          <ActivityIndicator size="large" color="#00809D" style={{ marginTop: 50 }} />
        ) : filteredSessions.length === 0 ? (
          <Text style={styles.noDataText}>
            {searchQuery ? "No results found." : "No previous chats found."}
          </Text>
        ) : (
          <FlatList
            data={filteredSessions}
            keyExtractor={(item) => item.id}
            renderItem={renderSessionItem}
            contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
          />
        )}
      </View>

      {/* --- (Chat History Modal is unchanged) --- */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.navbar}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.backButton}>
              <Ionicons name="close" size={24} color="#EF9C66" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>
              {selectedSession?.projectName || "Inspection History"}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          {isChatLoading ? (
            <ActivityIndicator size="large" color="#00809D" style={{ marginTop: 50 }} />
          ) : (
            <View style={{ flex: 1 }}>
              <ScrollView style={styles.chatScroll}>
                {selectedSession?.messages.map(renderMessageItem)}
              </ScrollView>
              {selectedSession?.isCompleted && (
                <View style={styles.bottomButtonContainer}>
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGenerateReport}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.generateButtonText}>Generate Report</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* --- (Fancy Loader Modal is unchanged) --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isGenerating}
      >
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#EF9C66" />
          <Text style={styles.loaderText}>Generating your report...</Text>
          <Text style={styles.loaderSubtext}>This may take a moment.</Text>
        </View>
      </Modal>

      {/* --- (Fancy Success Modal is unchanged) --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showSuccessModal}
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <Ionicons name="checkmark-circle" size={60} color="#EF9C66" />
            <Text style={styles.successTitle}>Report Generated</Text>
            <Text style={styles.successMessage}>
              Your report is available in the Reports tab.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccessModalClose}
            >
              <Text style={styles.generateButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- (Bottom Tab Bar is unchanged) --- */}
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
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => navigation.navigate("PreviousChats")}
        >
          <Ionicons name="time" size={22} color="#FFFFFF" />
          <Text style={styles.navLabelActive}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Reports")}
        >
          <Ionicons name="document-text-outline" size={22} color="#6B7280" />
          <Text style={styles.navLabelInactive}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Menu")}
        >
          <Ionicons name="settings-outline" size={22} color="#6B7280" />
          <Text style={styles.navLabelInactive}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* --- 💡 NEW: Delete Confirmation Modal --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.alertModalOverlay}>
          <View style={styles.alertModalBox}>
            <Ionicons name="trash-outline" size={40} color="#D32F2F" />
            <Text style={[styles.alertModalTitle, { color: '#D32F2F' }]}>Delete Session?</Text>
            <Text style={styles.alertModalMessage}>
              Are you sure you want to delete this inspection session? This cannot be undone.
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#D32F2F' }]} // Destructive red
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalButtonTextSave}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- 💡 NEW: Built-in Fancy Alert --- */}
      <Modal
        visible={alert.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlert({ ...alert, visible: false })}
      >
        <View style={styles.alertModalOverlay}>
          <View style={styles.alertModalBox}>
            <Ionicons name={iconName} size={40} color={iconColor} />
            <Text style={[styles.alertModalTitle, { color: iconColor }]}>{alert.title}</Text>
            <Text style={styles.alertModalMessage}>{alert.message}</Text>
            <TouchableOpacity
              style={[styles.alertConfirmButton, { backgroundColor: buttonColor }]}
              onPress={() => setAlert({ ...alert, visible: false })}
            >
              <Text style={styles.alertConfirmButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// --- STYLES (Added styles for built-in alerts) ---
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 30 : 57,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#b0a7a7ff',
  },
  backButton: {
    width: 24,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00809D',
    textAlign: 'center',
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  checklistTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#888',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#6B7280',
  },
  modalScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatScroll: {
    flex: 1,
    padding: 10,
  },
  chatRow: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#eee',
  },
  chatQ: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00809D',
  },
  chatA: {
    fontSize: 15,
    color: '#333',
    marginTop: 4,
    fontStyle: 'italic',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  bottomButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  generateButton: {
    backgroundColor: '#EF9C66',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#EF9C66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
  loaderSubtext: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 5,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    elevation: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00809D',
    marginTop: 15,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
  },
  successButton: {
    backgroundColor: '#EF9C66',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: Platform.OS === 'android' ? 40 : 30,
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
    height: '100%',
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: '#00809D',
    margin: 6,
    height: 58,
    borderRadius: 12,
  },
  navLabelActive: {
    fontSize: 11,
    color: "#fff",
    marginTop: 2,
    fontWeight: '600',
  },
  navLabelInactive: {
    fontSize: 11,
    color: "#141416ff",
    marginTop: 2,
    fontWeight: '500',
  },

  // --- 💡 NEW: Alert & Delete Modal Styles ---
  alertModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  alertModalBox: {
    width: "90%",
    borderRadius: 12,
    padding: 25,
    alignItems: "center",
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  alertModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
  },
  alertModalMessage: {
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  alertConfirmButton: {
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  alertConfirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%', // Ensure buttons take full width
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
    flex: 1, // Make buttons share space
  },
  modalButtonCancel: {
    backgroundColor: '#E5E7EB',
  },
  modalButtonTextCancel: {
    color: '#1F2937',
    fontWeight: '600',
  },
  modalButtonTextSave: {
    color: 'white',
    fontWeight: '600',
  },
});

export default PreviousChatsScreen;