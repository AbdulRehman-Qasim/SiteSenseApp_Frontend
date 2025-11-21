import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    Image, // 👈 [NEW] Import standard Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system'; // 👈 [NEW] For downloading
import * as Sharing from 'expo-sharing';     // 👈 [NEW] For sharing
import Markdown from 'react-native-markdown-display'; // 👈 [NEW] To render the report

const BASE_URL = "https://invalid-times-cable-proxy.trycloudflare.com"; // Ensure this is your correct backend IP

// 👈 [NEW] Custom rules to render images correctly
const renderRules = {
    image: (node, children, parent, styles) => {
        return (
            <Image
                key={node.key}
                style={styles.image} // Use the style from markdownStyles
                source={{ uri: node.attributes.src }}
            />
        );
    },
};

const ReportScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { sessionId } = route.params || {};

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    // Generate Report (Unchanged, but vital)
    const generateReport = async () => {
        if (!sessionId) {
            Alert.alert("Error", "Session ID not found!");
            navigation.goBack(); // Go back if no session ID
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Auth Error", "Please log in again.");
                navigation.navigate("Login"); // Or your login screen name
                return;
            }

            const res = await fetch(`${BASE_URL}/api/reports/generate/${sessionId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (res.ok) {
                console.log("Report API response:", data);
                // We get the whole report object
                setReport(data.report);
            } else {
                Alert.alert("Error", data.error || "Failed to generate report");
            }
        } catch (err) {
            console.error("Generate report error:", err);
            Alert.alert("Error", "Network error while generating report");
        } finally {
            setLoading(false);
        }
    };

    // --- 👇 [NEW] Updated Download PDF Function 👇 ---
    const handleDownloadPDF = async () => {
        if (!report?.id) return;
        if (downloading) return;

        setDownloading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const apiUrl = `${BASE_URL}/api/reports/download/${report.id}`;

            // 1. Define where to save the file
            // We use a unique name in the app's cache directory
            const fileUri = FileSystem.cacheDirectory + `report-${report.id}.pdf`;

            // 2. Download the file
            console.log("Downloading PDF from:", apiUrl);
            const downloadResult = await FileSystem.downloadAsync(apiUrl, fileUri, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // 3. Check if download was successful
            if (downloadResult.status !== 200) {
                // If the server sent an error, it's saved in the file. Read it.
                const errorText = await FileSystem.readAsStringAsync(fileUri);
                let errorJson = { error: "Failed to download file" };
                try {
                    errorJson = JSON.parse(errorText);
                } catch (e) { /* ignore parse error */ }
                throw new Error(errorJson.error);
            }

            console.log("File downloaded to:", downloadResult.uri);

            // 4. Check if sharing is available
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Error", "Sharing is not available on this device.");
                return;
            }

            // 5. Open the native share dialog
            await Sharing.shareAsync(fileUri, {
                dialogTitle: 'Save or Share Report PDF',
                mimeType: 'application/pdf',
                UTI: 'com.adobe.pdf',
            });

        } catch (err) {
            console.error("Download PDF error:", err);
            Alert.alert("Error", err.message || "Failed to save or share report.");
        } finally {
            setDownloading(false);
        }
    };
    // --- 👆 [END OF NEW FUNCTION] 👆 ---

    useEffect(() => {
        // We only call generateReport if a sessionId is provided
        if (sessionId) {
            generateReport();
        } else {
            Alert.alert("Error", "No session ID was provided.");
            navigation.goBack();
        }
    }, [sessionId]); // Ensure it runs if sessionId changes

    return (
        <View style={styles.container}>
            {/* Navbar (Unchanged) */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navLeft}>
                    <Ionicons name="chevron-back" size={28} color="#EF9C66" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Summary</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                    <Ionicons name="person-circle-sharp" size={36} color="#EF9C66" />
                </TouchableOpacity>
            </View>

            {/* Body */}
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#EF9C66" />
                    <Text style={styles.loaderText}>Generating report...</Text>
                </View>
            ) : report ? (
                <ScrollView style={styles.scroll}>
                    {/* --- 👇 [NEW] Report Content is now rendered with Markdown 👇 --- */}
                    <View style={styles.reportContentWrapper}>
                        <Markdown style={markdownStyles} rules={renderRules}>
                            {report.description}
                        </Markdown>
                    </View>
                    {/* --- 👆 [END OF NEW CONTENT] 👆 --- */}
                </ScrollView>
            ) : (
                <View style={styles.centered}>
                    <Text>Failed to generate report.</Text>
                </View>
            )}

            {/* Bottom Button (Unchanged, but now "Save Report" is fully functional) */}
            <View style={styles.buttonContainer}>
                {loading || !report?.id ? (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: "#aaa" }]} // Greyed out
                        disabled={true}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Generate Report</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: "#EF9C66" }]}
                        onPress={handleDownloadPDF}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Save Report</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// 👈 [NEW] Styles for the Markdown component
const markdownStyles = {
    // Make the bold text (headings) larger
    strong: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        marginBottom: 5,
    },
    // Style for the body text
    body: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
    },
    // Style for the images
    image: {
        width: '100%',
        height: undefined,
        aspectRatio: 16 / 9,
        borderRadius: 8,
        marginVertical: 10,
        backgroundColor: '#eee',
    },
    // Fix for Q&A text
    text: {
        fontSize: 15,
        color: '#444',
    }
};

// (Your existing styles, with one addition)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" }, // Changed to light grey
    navbar: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 45,
        backgroundColor: "#fff",
        borderBottomWidth: 0.7,
        borderBottomColor: "#bed2d0",
    },
    navLeft: { padding: 4 },
    navTitle: { fontSize: 20, fontWeight: "bold", color: "#EF9C66" }, // Changed color to match theme

    scroll: { flex: 1 }, // Removed padding, added to wrapper
    reportContentWrapper: { padding: 20 }, // 👈 [NEW] Added wrapper for padding

    // (These styles below were for the old, broken layout)
    // title: { fontSize: 22, fontWeight: "bold", color: "#00809D" },
    // project: { fontSize: 16, marginTop: 4, color: "#333" },
    // date: { fontSize: 14, marginTop: 2, color: "#555" },
    // section: { marginTop: 20 },
    // sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    // qaBlock: { marginBottom: 10, padding: 10, backgroundColor: "#f2f2f2", borderRadius: 8 },
    // question: { fontWeight: "bold", color: "#333" },
    // answer: { color: "#444", marginTop: 2 },
    // media: { color: "#555", marginTop: 2 },

    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
    loaderText: { marginTop: 10, color: "#555" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
    buttonContainer: {
        padding: 15,
        borderTopWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
    },
    button: {
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
});

export default ReportScreen;