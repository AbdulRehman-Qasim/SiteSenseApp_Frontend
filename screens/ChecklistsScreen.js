import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    SafeAreaView,
    TextInput,
    Image,
    Platform,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import FancyAlert from '../components/FancyAlert';

const BASE_URL = "https://invalid-times-cable-proxy.trycloudflare.com";

const ChecklistsScreen = () => {
    const navigation = useNavigation();

    const [allChecklists, setAllChecklists] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedChecklist, setSelectedChecklist] = useState(null);

    // Alert State
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

    // --- 1. Fetch ALL Checklists (Unchanged) ---
    const fetchChecklists = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                showAlert("Error", "User not logged in");
                navigation.navigate("Login");
                return;
            }

            const res = await fetch(`${BASE_URL}/api/checklists/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!res.ok) {
                if (handleTokenError(data)) return;
                throw new Error(data.error || "Failed to fetch checklists");
            }
            setAllChecklists(data.checklists || []);
        } catch (e) {
            console.error("Fetch checklists error:", e);
            showAlert("Error", e.message || "Could not fetch checklists.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchChecklists();
        }, [])
    );

    // --- 2. Search Logic (Unchanged) ---
    const filteredChecklists = useMemo(() => {
        if (!searchQuery) {
            return allChecklists;
        }
        return allChecklists.filter(checklist =>
            checklist.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            checklist.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allChecklists, searchQuery]);

    // --- 3. Click Handlers (Unchanged) ---
    const handleChecklistPress = (checklist) => {
        setSelectedChecklist(checklist);
        setIsModalVisible(true);
    };

    // --- 💡 NEW: Handler for the modal's "Start Inspection" button ---
    const handleStartInspection = () => {
        if (!selectedChecklist) return;
        
        const checklistIdToStart = selectedChecklist.id;
        
        // Close modal first
        setIsModalVisible(false);
        
        // Navigate to StartInspection after a short delay for the modal to close
        setTimeout(() => {
            navigation.navigate("StartInspection", {
                checklistId: checklistIdToStart,
            });
        }, 250); // 250ms for modal fade animation
    };

    // --- 4. Render Components ---

    // Card for the main list (Unchanged)
    const renderChecklistCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleChecklistPress(item)}
        >
            <View style={styles.iconCircle}>
                <Ionicons name="list-outline" size={22} color="#00809D" />
            </View>
            <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.title || "Untitled Checklist"}</Text>
                <Text style={styles.cardSubtitle}>
                    Project: {item.project?.name || "N/A"}
                </Text>
                <Text style={styles.cardMeta}>
                    {item.items?.length || 0} items • {item.status || "Ready to use"}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
    );

    // Item row for the modal (Unchanged)
    const renderModalItem = ({ item, index }) => (
        <View style={styles.itemRow}>
            <Text style={styles.itemRowText}>
                <Text style={styles.itemRowNumber}>{index + 1}.</Text> {item}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            {/* Navbar (Unchanged) */}
            <View style={styles.navbar}>
                <Text style={styles.navTitle}>My Checklists</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar (Unchanged) */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search checklists or projects..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Body (Unchanged) */}
            {loading ? (
                <ActivityIndicator size="large" color="#00809D" style={{ marginTop: 100 }} />
            ) : (
                <FlatList
                    data={filteredChecklists}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderChecklistCard}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.noDataContainer}>
                            <Ionicons name="document-text-outline" size={50} color="#94a3b8" />
                            <Text style={styles.noDataText}>
                                {searchQuery ? "No results found." : "No checklists found."}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* --- 💡 MODIFIED: Fancy Modal for Checklist Items --- */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle} numberOfLines={1}>
                                {selectedChecklist?.title || "Checklist Items"}
                            </Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={selectedChecklist?.items || []}
                            renderItem={renderModalItem}
                            keyExtractor={(item, index) => `${item}-${index}`}
                            ListEmptyComponent={
                                <Text style={styles.emptyModalText}>No items in this checklist.</Text>
                            }
                        />

                        {/* --- 💡 NEW: Conditional Start Button --- */}
                        {(selectedChecklist?.status === 'Ready to use' || !selectedChecklist?.status) && (
                            <TouchableOpacity 
                                style={styles.modalStartButton} 
                                onPress={handleStartInspection}
                            >
                                <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.modalStartButtonText}>Start Inspection</Text>
                            </TouchableOpacity>
                        )}
                        {/* --- 💡 END OF NEW PART 💡 --- */}
                    </View>
                </View>
            </Modal>
            {/* --- End of Modal --- */}

            {/* --- Fancy Alert (Unchanged) --- */}
            <FancyAlert
                visible={alert.visible}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={() => setAlert({ ...alert, visible: false })}
            />

            {/* --- Bottom Tab Bar (Unchanged) --- */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate("Home")}
                >
                    <Ionicons name="home-outline" size={22} color="#6B7280" />
                    <Text style={styles.navLabelInactive}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navItem, styles.navItemActive]}
                    onPress={() => navigation.navigate("Checklists")}
                >
                    <Ionicons name="list" size={22} color="#FFFFFF" />
                    <Text style={styles.navLabelActive}>Checklists</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate("Projects")}
                >
                    <Ionicons name="file-tray-full-outline" size={22} color="#6B7280" />
                    <Text style={styles.navLabelInactive}>Projects</Text>
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
            
        </SafeAreaView>
    );
};

// --- STYLES (Added styles for new modal button) ---
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    navbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 30 : 57, // Adjusted padding
        paddingBottom: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#a3a4a5ff", // Your border color
    },
    backButton: { width: 24 },
    navTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#00809D",
        textAlign: "center",
        flex: 1,
        marginHorizontal: 10,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 4,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 16,
        marginVertical: 8,
        borderRadius: 14,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E6F8F5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15.5,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 3,
    },
    cardSubtitle: {
        fontSize: 13,
        color: "#6B7280",
    },
    cardMeta: {
        fontSize: 13,
        color: "#00809D",
        fontWeight: '500',
        marginTop: 4,
    },
    noDataContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 120,
    },
    noDataText: {
        marginTop: 8,
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
    },
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
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#00809D',
        flex: 1,
        marginRight: 10,
    },
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

    // --- 💡 NEW MODAL BUTTON STYLES 💡 ---
    modalStartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00809D', // Main theme color
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 20, // Space above the button
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
    // --- End New Styles ---

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
    }
});

export default ChecklistsScreen;