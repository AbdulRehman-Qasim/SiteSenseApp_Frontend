// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// const API_BASE = "https://invalid-times-cable-proxy.trycloudflare.com";
// const BASE_URL = `${API_BASE}/api/reports`;

// const Reports = ({ navigation }) => {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 🔹 Fetch Reports for Current User (Unchanged)
//   const fetchReports = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("token");
//       const res = await fetch(`${BASE_URL}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (res.ok) {
//         // IMPORTANT: This assumes 'data.reports' is an array of
//         // FULL report objects, including the 'description'.
//         // This is required for ReportViewScreen to work.
//         setReports(data.reports || []);
//       } else {
//         console.error("Failed:", data.error);
//         Alert.alert("Error", data.error || "Failed to fetch reports");
//       }
//     } catch (err) {
//       console.error("Error fetching reports:", err);
//       Alert.alert("Error", "Could not connect to server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Fetch reports when the screen comes into focus (Unchanged)
//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchReports();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   // --- (Loading spinner is unchanged) ---
//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#00809D" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* --- (Navbar is unchanged) --- */}
//       <View style={styles.navbar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="chevron-back" size={24} color="#EF9C66" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>Reports</Text>
//         <View style={{ width: 24 }} />
//       </View>

//       <FlatList
//         data={reports}
//         keyExtractor={(item) => item.id.toString()}
//         contentContainerStyle={styles.listContainer}
//         renderItem={({ item }) => (
//           // --- 👇 [THIS IS THE MAIN CHANGE] 👇 ---
//           // This now navigates to ReportViewScreen and passes
//           // the 'item' (which is the report object) as a param.
//           <TouchableOpacity
//             style={styles.card}
//             onPress={() => navigation.navigate('ReportView', { report: item })}
//           >
//             <MaterialIcons name="picture-as-pdf" size={28} color="#EF9C66" />
//             <View style={{ flex: 1, marginLeft: 10 }}>
//               <Text style={styles.cardTitle}>{item.title}</Text>
//               <Text style={styles.cardSubtitle}>
//                 {new Date(item.createdAt).toLocaleString()}
//               </Text>
//             </View>
//             <Ionicons name="chevron-forward" size={22} color="#aaa" />
//           </TouchableOpacity>
//         )}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No reports found.</Text>
//         }
//       />

//       {/* All Modal and Loader JSX has been removed from here, 
//         as ReportViewScreen now handles all detail display 
//         and downloading.
//       */}

//     </View>
//   );
// }

// export default Reports;

// // 🔹 Styles
// // All modal-related styles have been removed
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8fafc",
//   },
//   navbar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingTop: 57,
//     paddingBottom: 15,
//     backgroundColor: "#fff",
//     borderBottomWidth: 1,
//     borderBottomColor: "#b0a7a7ff",
//   },
//   backButton: {
//     width: 24,
//   },
//   navTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#00809D",
//     textAlign: "center",
//     flex: 1,
//     marginHorizontal: 10,
//   },
//   listContainer: {
//     padding: 15,
//   },
//   card: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 15,
//     marginBottom: 10,
//     borderRadius: 12,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   cardSubtitle: {
//     fontSize: 13,
//     color: "#666",
//   },
//   emptyText: {
//     textAlign: "center",
//     marginTop: 30,
//     color: "#999",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  SafeAreaView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const API_BASE = "https://invalid-times-cable-proxy.trycloudflare.com";
const BASE_URL = `${API_BASE}/api/reports`;

const Reports = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Reports");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports || []);
      } else {
        Alert.alert("Error", data.error || "Failed to fetch reports");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchReports);
    return unsubscribe;
  }, [navigation]);

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <View style={styles.issueRow}>
            <MaterialIcons name="warning" size={16} color="#E74C3C" />
            <Text style={styles.issuesText}>
              {item.issuesCount
                ? `${item.issuesCount} issues found`
                : "No issues"}
            </Text>
          </View>
        </View>

        <View style={styles.riskSection}>
          <Text style={styles.riskLabel}>Risk:</Text>
          <View
            style={[
              styles.riskDot,
              {
                backgroundColor:
                  item.risk === "high"
                    ? "#E74C3C"
                    : item.risk === "medium"
                      ? "#F39C12"
                      : "#2ECC71",
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.cardButtons}>
        <TouchableOpacity
          style={[styles.cardButton, styles.downloadButton]}
          onPress={() => navigation.navigate("ReportView", { report: item })}
        >
          <Ionicons name="download-outline" size={18} color="#0E6B67" />
          <Text style={styles.cardButtonText}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardButton}>
          <Ionicons name="share-outline" size={18} color="#0E6B67" />
          <Text style={styles.cardButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 Navbar */}
      <View style={styles.navbar}>
        {/* <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#EF9C66" />
        </TouchableOpacity> */}
        <Text style={styles.navTitle}>Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 🔹 Filter Button */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={16} color="#6B7280" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search reports..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* 🔹 Tabs */}
      <View style={styles.tabs}>
        {["All Reports", "Recent", "Flagged", "By Project"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 Body (Reports List or Loader) */}
      <View style={styles.bodyContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#00809D" style={{ marginTop: 40 }} />
        ) : filteredReports.length > 0 ? (
          <FlatList
            data={filteredReports}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            renderItem={renderCard}
          />
        ) : (
          <Text style={styles.emptyText}>No reports found.</Text>
        )}
      </View>

      {/* 🔹 Bottom Navigation (same as HomeScreen) */}
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
          style={styles.navItem}
          onPress={() => navigation.navigate("PreviousChat")}
        >
          <Ionicons name="time-outline" size={22} color="#6B7280" />
          <Text style={styles.navLabelInactive}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => navigation.navigate("Reports")}
        >
          <Ionicons name="document-text-outline" size={22} color="#FFFFFF" />
          <Text style={styles.navLabelActive}>Reports</Text>
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

export default Reports;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 57,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#8b8c8eff",
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
  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  filterButton: { flexDirection: "row", alignItems: "center" },
  filterText: { color: "#6B7280", fontSize: 14, marginLeft: 5 },
  searchRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, color: "#111827", fontSize: 15 },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabButton: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: "#0E6B67" },
  tabText: { color: "#6B7280", fontSize: 14, fontWeight: "500" },
  tabTextActive: { color: "#0E6B67", fontWeight: "600" },
  bodyContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  cardDate: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  issueRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  issuesText: {
    fontSize: 13,
    color: "#E74C3C",
    marginLeft: 5,
    fontWeight: "500",
  },
  riskSection: { alignItems: "flex-end" },
  riskLabel: { fontSize: 13, color: "#6B7280" },
  riskDot: { width: 12, height: 12, borderRadius: 6, marginTop: 6 },
  cardButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cardButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  downloadButton: {
    borderRightWidth: 1,
    borderRightColor: "#F3F4F6",
  },
  cardButtonText: {
    color: "#0E6B67",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 50,
    fontSize: 15,
  },

  // 🔹 Bottom Navigation (same as HomeScreen)
  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: Platform.OS === "android" ? 40 : 30,
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
    height: "100%",
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: "#00809D",
    margin: 6,
    height: 58,
    borderRadius: 12,
  },
  navLabelActive: {
    fontSize: 11,
    color: "#fff",
    marginTop: 2,
    fontWeight: "600",
  },
  navLabelInactive: {
    fontSize: 11,
    color: "#141416ff",
    marginTop: 2,
    fontWeight: "500",
  },
});

