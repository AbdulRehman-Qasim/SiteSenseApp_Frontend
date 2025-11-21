import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Animated,
    Modal, // 👈 Added
    SafeAreaView, // 👈 Added
    ScrollView, // 👈 Added
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";

const BASE_URL = "https://invalid-times-cable-proxy.trycloudflare.com";

const ProjectDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { projectName } = route.params || {};
    
    // --- 💡 MODIFIED: State now holds checklists, not items ---
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // --- 💡 NEW: Modal State ---
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedChecklist, setSelectedChecklist] = useState(null);

    // --- 💡 MODIFIED: fetchChecklistItems (now fetches checklists) ---
    const fetchChecklistItems = async () => {
        try {
            if (!projectName) return Alert.alert("Error", "No project name provided.");

            const token = await AsyncStorage.getItem("token");
            if (!token) return Alert.alert("Error", "User not logged in.");

            const response = await fetch(`${BASE_URL}/api/projects/${projectName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            console.log("✅ API Response:", data);

            // --- 💡 NEW LOGIC: Save the array of checklists ---
            if (data.checklists?.length) {
                setChecklists(data.checklists);
            } else {
                setChecklists([]);
            }
            // --- 💡 END NEW LOGIC ---

        } catch (error) {
            console.error("❌ Fetch error:", error);
            Alert.alert("Error", "Failed to fetch checklist items.");
        } finally {
            setLoading(false);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    };

    useEffect(() => {
        fetchChecklistItems();
    }, [projectName]);

    // --- 💡 NEW: Handler to open the modal ---
    const handleChecklistPress = (checklist) => {
        setSelectedChecklist(checklist);
        setIsModalVisible(true);
    };

    // --- 💡 NEW: Renders a card for each CHECKLIST ---
    const renderChecklistCard = ({ item }) => (
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <TouchableOpacity 
                style={styles.cardClickable}
                onPress={() => handleChecklistPress(item)}
            >
                <View style={styles.iconCircle}>
                    <Ionicons name="list-outline" size={22} color="#00809D" />
                </View>
                <View style={styles.cardTextContainer}>
                    <Text style={styles.checklistTitle}>{item.title || "Untitled Checklist"}</Text>
                    <Text style={styles.checklistMeta}>
                        {item.items?.length || 0} items • {item.status || "Ready to use"}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
        </Animated.View>
    );

    // --- 💡 NEW: Renders an item *inside* the modal ---
    const renderModalItem = ({ item, index }) => (
        <View style={styles.itemRow}>
            <Text style={styles.itemRowText}>
                <Text style={styles.itemRowNumber}>{index + 1}.</Text> {item}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.screen}>
            {/* Navbar (Unchanged) */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={26} color="#00809D" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>{projectName || "Checklist Details"}</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* Body (MODIFIED) */}
            {loading ? (
                <ActivityIndicator size="large" color="#00809D" style={{ marginTop: 100 }} />
            ) : checklists.length === 0 ? ( // 💡 Changed from 'items'
                <View style={styles.noDataContainer}>
                    <Ionicons name="document-text-outline" size={50} color="#94a3b8" />
                    <Text style={styles.noDataText}>No checklists found for this project.</Text>
                </View>
            ) : (
                <FlatList
                    data={checklists} // 💡 Changed from 'items'
                    keyExtractor={(item) => item.id}
                    renderItem={renderChecklistCard} // 💡 Changed from 'renderItem'
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* --- 💡 NEW: Fancy Modal for Checklist Items --- */}
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
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

// --- 💡 STYLES (Added new styles for modal and checklist card) ---
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#fff",
    },
    navbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        height: 90,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#cbd5e1",
        elevation: 3,
        paddingTop: 40,
    },
    navTitle: {
        fontSize: 19,
        fontWeight: "bold",
        color: "#00809D",
    },
    backButton: {
        padding: 4,
        borderRadius: 50,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    // --- Checklist Card Styles ---
    card: {
        backgroundColor: "#f1fdfd",
        padding: 16,
        marginVertical: 8,
        borderRadius: 14,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: "#00809D",
    },
    cardClickable: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#E0F2F1",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    cardTextContainer: {
        flex: 1,
    },
    checklistTitle: {
        fontSize: 15.5,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 3,
    },
    checklistMeta: {
        fontSize: 13,
        color: "#6B7280",
    },
    // --- No Data Styles ---
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
    // --- Modal Styles ---
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
        flex: 1, // Allows text to shrink
        marginRight: 10,
    },
    modalCloseButton: {
        padding: 5,
    },
    itemRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemRowText: {
        fontSize: 15,
        color: '#374151',
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
    }
});

export default ProjectDetailScreen;