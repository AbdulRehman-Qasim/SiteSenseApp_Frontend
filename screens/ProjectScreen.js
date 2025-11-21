import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  // Alert, // 👈 REMOVED
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const BASE_URL = "https://invalid-times-cable-proxy.trycloudflare.com";

const ProjectScreen = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // --- 💡 NEW: Delete Modal State ---
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // ---------------------------------

  // --- FANCY ALERT STATE ---
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

  // ✅ Fetch user projects
  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        showAlert("Error", "User not logged in. Please login again.");
        setLoading(false);
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/projects/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (handleTokenError(errorData)) return;
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.projects && Array.isArray(data.projects)) {
        setProjects(data.projects);
      } else {
        console.error("Unexpected API structure:", data);
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      showAlert("Error", "Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProjects();
    }, [])
  );

  // ✅ Filter projects by search
  const filteredProjects = projects.filter((p) =>
    p.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Navigate to project detail
  const handleChecklistPress = (project) => {
    if (!project.projectName) {
      showAlert("Error", "No project name found for this project.", "info");
      return;
    }
    navigation.navigate("ProjectDetail", {
      projectName: project.projectName,
    });
  };

  // --- Handlers for Edit ---
  const openEditModal = (project) => {
    setSelectedProject(project);
    setNewProjectName(project.projectName);
    setIsEditModalVisible(true);
  };

  const handleUpdateProject = async () => {
    if (!newProjectName.trim()) {
      showAlert("Error", "Project name cannot be empty.", "info");
      return;
    }

    setIsUpdating(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        showAlert("Error", "User not logged in.");
        return navigation.navigate("Login");
      }

      const response = await fetch(`${BASE_URL}/api/projects/${selectedProject.id}/name`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (handleTokenError(data)) return;
        throw new Error(data.error || "Failed to update project");
      }

      showAlert("Success", "Project name updated successfully.", "success");
      setIsEditModalVisible(false);
      fetchUserProjects();
    } catch (error) {
      showAlert("Error", error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- 💡 MODIFIED: Handlers for Delete ---
  const confirmDelete = (project) => {
    setProjectToDelete(project);      // 👈 Set the project to be deleted
    setIsDeleteModalVisible(true);  // 👈 Open the fancy modal
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeleteModalVisible(false); // 👈 Close modal
    setIsDeleting(true); // 👈 Show loader

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        showAlert("Error", "User not logged in.");
        return navigation.navigate("Login");
      }

      const response = await fetch(`${BASE_URL}/api/projects/${projectToDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        if (handleTokenError(data)) return;
        throw new Error(data.error || "Failed to delete project");
      }

      showAlert("Success", "Project deleted successfully.", "success");
      fetchUserProjects();
    } catch (error) {
      showAlert("Error", error.message);
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };
  // --- --------------------------------- ---

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.card} onPress={() => handleChecklistPress(item)}>
        <View style={styles.leftSection}>
          <Text style={styles.reportTitle}>{item.projectName || "Untitled Project"}</Text>
          <Text style={styles.checklistCount}>
            {item.inspectionCount || 0} {item.inspectionCount === 1 ? 'Checklist' : 'Checklists'}
          </Text>
          <Text style={styles.projectDate}>
            Last updated: {item.lastUpdatedText || "No date"}
          </Text>
        </View>
        <Entypo name="chevron-right" size={22} color="#00809D" />
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil-sharp" size={16} color="#00809D" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmDelete(item)} // 👈 No change here
        >
          <Ionicons name="trash-outline" size={16} color="#D32F2F" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- 💡 NEW: Helper to get alert styles (copied) ---
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

      {/* Navbar (Unchanged) */}
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>My Projects</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar (Unchanged) */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search projects..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Project List (Unchanged) */}
      <View style={styles.container}>
        {(loading || isDeleting) ? ( // 👈 Show loader if deleting
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00809D" />
            {isDeleting && <Text style={styles.loadingText}>Deleting project...</Text>}
          </View>
        ) : filteredProjects.length === 0 ? (
          <Text style={styles.noDataText}>No projects found.</Text>
        ) : (
          <FlatList
            data={filteredProjects}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* Bottom Navigation (Unchanged) */}
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
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => navigation.navigate("Projects")}
        >
          <Ionicons name="file-tray-full" size={22} color="#FFFFFF" />
          <Text style={styles.navLabelActive}>Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("PreviousChat")}
        >
          <Ionicons name="time-outline" size={22} color="#6B7280" />
          <Text style={styles.navLabelInactive}>History</Text>
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

      {/* --- Edit Project Modal (Unchanged) --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Project Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholder="Enter new project name"
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleUpdateProject}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonTextSave}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            <Text style={[styles.alertModalTitle, { color: '#D32F2F' }]}>Delete Project?</Text>
            <Text style={styles.alertModalMessage}>
              Are you sure you want to delete "{projectToDelete?.projectName}"?
              This will delete all its data. This action cannot be undone.
            </Text>

            {/* Two buttons: Cancel and Delete */}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#D32F2F' }]} // Destructive red
                onPress={handleDeleteProject}
              >
                <Text style={styles.modalButtonTextSave}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Built-in Fancy Alert (for Success/Error) --- */}
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

export default ProjectScreen;

// --- STYLES (Unchanged) ---
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 30 : 57,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#a3a4a5ff",
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00809D",
    textAlign: "center",
    flex: 1,
  },
  searchRow: {
    padding: 16,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: "#111827",
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    marginVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  checklistCount: {
    fontSize: 13,
    color: "#00809D",
    fontWeight: '500',
    marginTop: 4,
  },
  projectDate: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#E6F8F5',
  },
  editButtonText: {
    color: '#00809D',
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: '#FFF1F2',
  },
  deleteButtonText: {
    color: '#D32F2F',
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { // 👈 Added
    marginTop: 10,
    fontSize: 16,
    color: '#00809D'
  },
  noDataText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00809D',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  modalButtonCancel: {
    backgroundColor: '#E5E7EB',
  },
  modalButtonTextCancel: {
    color: '#1F2937',
    fontWeight: '600',
  },
  modalButtonSave: {
    backgroundColor: '#00809D',
  },
  modalButtonTextSave: {
    color: 'white',
    fontWeight: '600',
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

  // --- Built-in Fancy Alert Styles (Unchanged) ---
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
});