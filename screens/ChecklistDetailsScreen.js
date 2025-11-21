import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const BASE_URL = "https://invalid-times-cable-proxy.trycloudflare.com";

const ChecklistDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { checklistId } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChecklistDetail = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${BASE_URL}/api/checklists/${checklistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching checklist detail:", error);
      Alert.alert("Error", "Failed to fetch checklist details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklistDetail();
  }, []);

  const handleDownload = async () => {
    if (!items || items.length === 0) {
      Alert.alert("Nothing to download", "No questions/answers available.");
      return;
    }

    let content = "Checklist Questions & Answers\n\n";
    items.forEach((item, idx) => {
      content += `${idx + 1}. ${item.question}\n`;
      if (item.answers && item.answers.length > 0) {
        item.answers.forEach((a) => {
          content += `Answer: ${a.answerText || a.answerStatus}\n`;
        });
      } else {
        content += "Answer: N/A\n";
      }
      content += "\n";
    });

    try {
      const fileUri = `${FileSystem.documentDirectory}Checklist_${checklistId}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, content);
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.error("Error creating file:", err);
      Alert.alert("Error", "Failed to generate file.");
    }
  };

  return (
    <View style={styles.screen}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#EF9C66" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Checklist Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#00809D" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 10 }}>
          <View style={styles.card}>
            {items.map((item, idx) => (
              <View key={item.id} style={{ marginBottom: 12 }}>
                <Text style={styles.question}>{idx + 1}. {item.question}</Text>
                {item.answers && item.answers.length > 0 ? (
                  item.answers.map((a, i) => (
                    <Text key={i} style={styles.answer}>Answer: {a.answerText || a.answerStatus}</Text>
                  ))
                ) : (
                  <Text style={styles.answer}>Answer: N/A</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Download Button */}
      <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
        <Text style={styles.downloadButtonText}>Download</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChecklistDetailScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 57 : 57, // adjusted for top margin like your other screens
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#b0a7a7ff',
  },
  backButton: { width: 24 },
  navTitle: { fontSize: 20, fontWeight: 'bold', color: '#00809D', textAlign: 'center', flex: 1 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 3, marginBottom: 100 },
  question: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  answer: { fontSize: 17, color: '#6B7280', marginLeft: 10, marginBottom: 2 , fontWeight: '800'},
  downloadButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#EF9C66',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  downloadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
