import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    Platform,
    StatusBar,
    ActivityIndicator,
    Alert,
    Modal, // 👈 Already here
    FlatList, // 👈 Already here
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const API_BASE = "https://invalid-times-cable-proxy.trycloudflare.com";

const HomeScreen = ({ navigation }) => {
    const [activeProject, setActiveProject] = useState(null);
    const [recentProjects, setRecentProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    // --- Modal States ---
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [projectChecklists, setProjectChecklists] = useState([]);
    const [selectedProjectName, setSelectedProjectName] = useState("");

    // --- 💡 NEW: Second Modal State ---
    const [isItemsModalVisible, setIsItemsModalVisible] = useState(false);
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    // ---------------------------------


    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };
    // ✅ Fetch logged-in user profile
const fetchUserProfile = async () => {
    try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
            navigation.navigate("Login");
            return;
        }

        const res = await fetch(`${API_BASE}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        console.log("User profile response:", data);

        setUser(data.profile || null);

    } catch (err) {
        console.error("❌ Error fetching user profile:", err);
    } finally {
        setLoadingUser(false);
    }
};


    // ✅ Fetch dashboard data (Unchanged)
    const fetchDashboardData = async () => {
        try {
            setProjectsLoading(true);
            const token = await AsyncStorage.getItem("token");
            const uid = await AsyncStorage.getItem("uid");
            if (!token || !uid) {
                navigation.navigate("Login");
                return;
            }
            const res = await fetch(`${API_BASE}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch projects");

            const allProjects = data.projects || [];
            allProjects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            const active =
                allProjects.find(
                    (p) => p.status === "active" || p.status === "in-progress"
                ) || allProjects[0] || null;
            const recent = allProjects
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .filter((p) => p.id !== active?.id)
                .slice(0, 2);
            setActiveProject(active);
            setRecentProjects(recent);
        } catch (err) {
            console.error("❌ Error fetching dashboard data:", err);
        } finally {
            setProjectsLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            fetchUserProfile();
            fetchDashboardData();
        });
        return unsubscribe;
    }, [navigation]);

    // --- Function to open modal 1 (Unchanged) ---
    const handleRecentProjectPress = async (projectName) => {
        if (!projectName) {
            Alert.alert("Error", "Project name is missing.");
            return;
        }
        setIsModalVisible(true);
        setModalLoading(true);
        setSelectedProjectName(projectName);
        setProjectChecklists([]);

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Error", "You are not logged in.");
                navigation.navigate("Login");
                setModalLoading(false);
                setIsModalVisible(false);
                return;
            }
            const res = await fetch(`${API_BASE}/api/projects/${projectName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch checklists");
            }
            setProjectChecklists(data.checklists || []);
        } catch (err) {
            console.error("❌ Error fetching project checklists:", err);
            Alert.alert("Error", err.message || "Could not load checklists.");
        } finally {
            setModalLoading(false);
        }
    };

    // --- 💡 NEW: Function to open modal 2 ---
    const handleChecklistPress = (checklist) => {
        setSelectedChecklist(checklist);
        setIsItemsModalVisible(true);
    };

    // --- 💡 NEW: Handler for the modal's "Start Inspection" button ---
    const handleStartInspection = () => {
        if (!selectedChecklist) return;
        const checklistIdToStart = selectedChecklist.id;

        // Close both modals
        setIsItemsModalVisible(false);
        setIsModalVisible(false);

        // Navigate to StartInspection
        setTimeout(() => { // Delay to let modals close
            navigation.navigate("StartInspection", {
                checklistId: checklistIdToStart,
            });
        }, 250);
    };

    // --- 💡 MODIFIED: Render item for modal 1 ---
    const renderChecklistItem = ({ item }) => (
        <TouchableOpacity
            style={styles.checklistCard}
            onPress={() => handleChecklistPress(item)} // 👈 MODIFIED
        >
            <Text style={styles.checklistTitle}>{item.title || "Untitled Checklist"}</Text>
            <Text style={styles.checklistMeta}>
                {item.items?.length || 0} items • {item.status || "Ready to use"}
            </Text>
        </TouchableOpacity>
    );

    // --- 💡 NEW: Render item for modal 2 ---
    const renderItemModalItem = ({ item, index }) => (
        <View style={styles.itemRow}>
            <Text style={styles.itemRowText}>
                <Text style={styles.itemRowNumber}>{index + 1}.</Text> {item}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* ... (All your screen content is unchanged) ... */}

                {/* 🔹 Top Header (Unchanged) */}
                <View style={styles.topHeader}>
                    <View style={styles.topHeaderInner}>
                        <View style={styles.profileRow}>
                            <View style={styles.avatarWrap}>
                                <Image
                                    source={{
                                        uri:
                                            user?.profileImage ||
                                            "https://placehold.co/60x60/FFFFFF/333333?text=U",
                                    }}
                                    style={styles.avatarImage}
                                />
                            </View>
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={styles.greeting}>
                                    {loadingUser
                                        ? "Loading..."
                                        // 💡 FIX: Use getGreeting() and check multiple name fields
                                        : `${getGreeting()}, ${user?.fullName || user?.name || user?.fullname || "User"}`}
                                </Text>
                                <Text style={styles.subText}>
                                    {user?.region || "Project Location"}
                                </Text>
                            </View>

                            <View style={styles.dayContainer}>
                                <Text style={styles.dayText}>
                                    {new Date().toLocaleDateString("en-US", {
                                        weekday: "long",
                                    })}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Segment Buttons (Unchanged) */}
                <View style={styles.segmentContainer}>
                    <TouchableOpacity
                        style={styles.segmentButton}
                        onPress={() => navigation.navigate("Main")}
                    >
                        <Image
                            source={require("../assets/newInspection.png")}
                            style={styles.segmentIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.segmentLabel}>New Inspection</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.segmentButton}
                        onPress={() => navigation.navigate("UploadChecklist")}
                    >
                        <Image
                            source={require("../assets/uploadChecklist.png")}
                            style={styles.segmentIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.segmentLabel}>Upload Checklist</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.segmentButton}
                        onPress={() => navigation.navigate("PreviousChat")}
                    >
                        <Image
                            source={require("../assets/previousInspection.png")}
                            style={styles.segmentIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.segmentLabel}>Previous Inspections</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content (Unchanged) */}
                <View style={styles.contentWrapper}>
                    {/* AI Card (Unchanged) */}
                    <View style={styles.aiCard}>
                        <View style={styles.aiTextContainer}>
                            <Text style={styles.aiTitle}>
                                Cut your inspection prep time in half
                            </Text>
                            <Text style={styles.aiSubtitle}>
                                Use this AI Checklist to create inspection templates from
                                previous reports.
                            </Text>
                            <TouchableOpacity
                                style={styles.aiButton}
                                onPress={() => navigation.navigate("AiChecklist")}
                            >
                                <Text style={styles.aiButtonText}>Generate with AI</Text>
                                <Ionicons name="sparkles" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={require("../assets/robo.png")}
                            style={styles.aiGif}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Continue Working (Unchanged) */}
                    {(projectsLoading || activeProject) && (
                        <Text style={styles.sectionTitle}>Continue Working</Text>
                    )}
                    {projectsLoading ? (
                        <ActivityIndicator
                            size="small"
                            color="#00809D"
                            style={styles.projectCard}
                        />
                    ) : activeProject ? (
                        <TouchableOpacity
                            style={styles.projectCard}
                            onPress={() =>
                                navigation.navigate("StartInspection", {
                                    checklistId: activeProject.activeChecklistId,
                                })
                            }
                        >
                            <Text style={styles.projectTitle}>
                                {activeProject.projectName}
                            </Text>
                            <Text style={styles.projectSubtitle}>
                                {activeProject.subtitle || "Last active inspection"}
                            </Text>
                            <View style={styles.progressBarBackground}>
                                <View style={styles.progressBarFill} />
                            </View>
                            <View style={styles.progressRow}>
                                <Text style={styles.progressText}>Active • 2 hours ago</Text>
                                <Text style={styles.progressValue}>6/10</Text>
                            </View>
                        </TouchableOpacity>
                    ) : null}

                    {/* Recent Projects (Unchanged... except for onPress) */}
                    <View style={styles.recentHeader}>
                        <Text style={styles.sectionTitle}>Recent Projects</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Projects")}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {projectsLoading && !activeProject ? (
                        <ActivityIndicator
                            size="small"
                            color="#00809D"
                            style={{ marginTop: 20 }}
                        />
                    ) : recentProjects.length > 0 ? (
                        recentProjects.map((project) => (
                            <TouchableOpacity
                                key={project.id}
                                style={styles.recentCard}
                                onPress={() => handleRecentProjectPress(project.projectName)} // 👈 This is already correct
                            >
                                {/* ... all the inner views for recentCard are correct ... */}
                                <View style={styles.recentInfo}>
                                    <View style={styles.recentIconBox}>
                                        <Image
                                            source={require("../assets/Container.png")}
                                            style={styles.recentIconImage}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.recentTitle}>
                                            {project.projectName}
                                        </Text>
                                        <Text style={styles.recentSubtitle}>
                                            {project.inspectionCount || 0} inspections
                                            <Text style={styles.recentDate}>
                                                {" "}
                                                • {project.lastUpdatedText || "recently"}
                                            </Text>
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadgeBase,
                                        project.status === "active"
                                            ? styles.statusBadgeActive
                                            : styles.statusBadgeHold,
                                    ]}
                                >
                                    <Text
                                        style={
                                            project.status === "active"
                                                ? styles.statusTextActive
                                                : styles.statusTextHold
                                        }
                                    >
                                        {project.status || "on-hold"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No other recent projects found.</Text>
                    )}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Bottom Navigation (Unchanged) */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={[styles.navItem, styles.navItemActive]}
                    onPress={() => navigation.navigate("Home")}
                >
                    <Ionicons name="home" size={22} color="#FFFFFF" />
                    <Text style={styles.navLabelActive}>Home</Text>
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

            {/* --- Project Checklists Modal (Modal 1) --- */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedProjectName}</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {modalLoading ? (
                            <ActivityIndicator size="large" color="#00809D" style={{ marginVertical: 40 }} />
                        ) : (
                            <FlatList
                                data={projectChecklists}
                                renderItem={renderChecklistItem}
                                keyExtractor={(item) => item.id.toString()}
                                ListEmptyComponent={
                                    <Text style={styles.emptyModalText}>No checklists found for this project.</Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* --- 💡 NEW: Checklist Items Modal (Modal 2) --- */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={isItemsModalVisible}
                onRequestClose={() => setIsItemsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle} numberOfLines={1}>
                                {selectedChecklist?.title || "Checklist Items"}
                            </Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setIsItemsModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={selectedChecklist?.items || []}
                            renderItem={renderItemModalItem}
                            keyExtractor={(item, index) => `${item}-${index}`}
                            ListEmptyComponent={
                                <Text style={styles.emptyModalText}>No items in this checklist.</Text>
                            }
                        />

                        {/* Conditional "Start Inspection" Button */}
                        {(selectedChecklist?.status === 'Ready to use' || !selectedChecklist?.status) && (
                            <TouchableOpacity
                                style={styles.modalStartButton}
                                onPress={handleStartInspection}
                            >
                                <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.modalStartButtonText}>Start Inspection</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
            {/* --- End of New Modal --- */}

        </SafeAreaView >
    );
};

export default HomeScreen;

// --- 💡 STYLES (Added new styles for Modal 2) ---
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    topHeader: {
        backgroundColor: "#EF9C66",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    topHeaderInner: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "android" ? 40 : 12,
        paddingBottom: 70,
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarWrap: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "rgba(255,255,255,0.3)",
        alignItems: "center",
        justifyContent: "center",
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    greeting: {
        color: "#00809D",
        fontSize: 18,
        fontWeight: "bold",
    },
    subText: {
        color: "#ffffffff",
        fontSize: 13,
        marginTop: 3,
    },
    dayContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    dayText: {
        color: "#00809D",
        fontWeight: "600",
        fontSize: 13,
    },
    segmentContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: '#ffffffff',
        borderRadius: 20,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        marginHorizontal: 20,
        marginTop: -50,
        marginBottom: 10,
    },
    segmentButton: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 8,
        backgroundColor: '#FEE5D4',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ded9d6ff',
        marginHorizontal: 4,
    },
    segmentIcon: {
        width: 60,
        height: 60,
        marginBottom: 8,
    },
    segmentLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#374151",
        textAlign: 'center',
    },
    container: {
        paddingBottom: 40,
        backgroundColor: 'transparent',
    },
    contentWrapper: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    aiCard: {
        flexDirection: "row",
        backgroundColor: "#E6F8F5",
        borderRadius: 18,
        padding: 16,
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#BFEAE2',
    },
    aiTextContainer: {
        flex: 1,
        paddingRight: 8,
    },
    aiTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#00809D",
    },
    aiSubtitle: {
        fontSize: 14,
        color: "#1a1d1dff",
        marginTop: 6,
        marginBottom: 12,
        lineHeight: 16,
    },
    aiButton: {
        flexDirection: "row",
        backgroundColor: "#00809D",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: "center",
        alignSelf: "flex-start",
    },
    aiButtonText: {
        color: "#fff",
        marginRight: 8,
        fontWeight: "600",
        fontSize: 13,
    },
    aiGif: {
        width: 90,
        height: 90,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 12,
    },
    projectCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 4,
        marginBottom: 24,
    },
    projectTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    projectSubtitle: {
        fontSize: 13,
        color: "#303133ff",
        marginBottom: 12,
        marginTop: 2,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: "#F3F4F6",
        borderRadius: 5,
        overflow: "hidden",
    },
    progressBarFill: {
        width: "60%",
        height: "100%",
        backgroundColor: "#00C2A7",
    },
    progressRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#10B981",
        marginRight: 6,
    },
    progressText: {
        flex: 1,
        color: "#6B7280",
        fontSize: 12,
        fontWeight: '500',
    },
    progressValue: {
        color: "#1F2937",
        fontWeight: "700",
        fontSize: 13,
    },
    recentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        marginTop: 6,
    },
    viewAllText: {
        color: "#00809D",
        fontWeight: "600",
        fontSize: 14,
    },
    recentCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 3,
        marginBottom: 12,
    },
    recentInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    recentIconBox: {
        backgroundColor: "#FFF3E5",
        borderRadius: 12, // 💡 Changed from 16
        padding: 10,
        marginRight: 12,
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        // marginTop: 4, // 💡 Removed
    },
    recentIconImage: {
        width: 24, // 💡 Changed from 60
        height: 24, // 💡 Changed from 60
        resizeMode: 'contain',
        // marginTop: 15, // 💡 Removed
    },
    recentTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1F2937",
    },
    recentSubtitle: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 2,
    },
    recentDate: {
        fontSize: 12,
        color: "#6B7280",
    },
    statusBadgeBase: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginLeft: 8,
    },
    statusBadgeActive: {
        backgroundColor: "#10B981",
    },
    statusBadgeHold: {
        backgroundColor: "#F59E0B",
    },
    statusTextActive: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "600",
        textTransform: "capitalize",
    },
    statusTextHold: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "600",
        textTransform: "capitalize", // 💡 Removed Method: "POST"
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
    emptyText: {
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 20,
    },

    // --- 💡 New Modal Styles ---
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
    },
    modalCloseButton: {
        padding: 5,
    },
    checklistCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    checklistTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    checklistMeta: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
    },
    emptyModalText: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 15,
        marginVertical: 30,
    },
    // --- 💡 Styles for Modal 2 ---
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
});