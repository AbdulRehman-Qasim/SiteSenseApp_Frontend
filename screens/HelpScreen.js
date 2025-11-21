import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

const HelpScreen = ({ navigation }) => {
  const [faqOpen, setFaqOpen] = useState(null);

  const toggleFAQ = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <View style={styles.container}>
      {/* 🔹 Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate("Menu")} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#EF9C66" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 🔹 Getting Started */}
        <Text style={styles.sectionTitle}>Getting Started</Text>

      {/* Card 1 */}
                      <View style={styles.card}>
                          <Image
                              source={require('../assets/Step.png')}
                              style={styles.cardIcon}
                              resizeMode="contain"
                          />
                          <View style={styles.cardTextContainer}>
                              <Text style={styles.cardTitle}>Download App</Text>
                              <Text style={styles.cardDescription}>
                                  Download the app from Google Play or App Store.
                              </Text>
                          </View>
                      </View>
      
                      {/* Card 2 */}
                      <View style={styles.card}>
                          <Image
                              source={require('../assets/step1.png')}
                              style={styles.cardIcon}
                              resizeMode="contain"
                          />
                          <View style={styles.cardTextContainer}>
                              <Text style={styles.cardTitle}>Create account</Text>
                              <Text style={styles.cardDescription}>
                                  Create a new account or login to your existing account.
                              </Text>
                          </View>
                      </View>
      
                      {/* Card 3 */}
                      <View style={styles.card}>
                          <Image
                              source={require('../assets/step1.png')}
                              style={styles.cardIcon}
                              resizeMode="contain"
                          />
                          <View style={styles.cardTextContainer}>
                              <Text style={styles.cardTitle}>Perform Inspection</Text>
                              <Text style={styles.cardDescription}>
                                  Upload checklist or generate checklist and start answering inspection questions. 
                              </Text>
                          </View>
                      </View>

        {/* 🔹 How to conduct inspection */}
        <Text style={styles.sectionTitle}>How to conduct inspection</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridCard}>
            <Image source={require("../assets/upload_icon.png")} style={styles.iconImage} />
            <Text style={styles.iconText}>Upload Checklist</Text>
          </View>
          <View style={styles.gridCard}>
            <Image source={require("../assets/face_icon.png")} style={styles.iconImage} />
            <Text style={styles.iconText}>Bot ask Question</Text>
          </View>
          <View style={styles.gridCard}>
            <Image source={require("../assets/mic_icon.png")} style={styles.iconImage} />
            <Text style={styles.iconText}>Voice Answers</Text>
          </View>
          <View style={styles.gridCard}>
            <Image source={require("../assets/report_icon.png")} style={styles.iconImage} />
            <Text style={styles.iconText}>Generate Report</Text>
          </View>
        </View>

        {/* 🔹 FAQs */}
        <Text style={styles.sectionTitle}>FAQs</Text>

        {[
          {
            question: "Can I edit reports after saving?",
            answer: "Yes, you can reopen saved reports and make edits before finalizing them.",
          },
          {
            question: "Can I share the report within App?",
            answer: "Yes, you can share the generated PDF directly through email or chat.",
          },
        ].map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <TouchableOpacity onPress={() => toggleFAQ(index)} style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={faqOpen === index ? "chevron-up" : "chevron-down"}
                size={20}
                color="#00809D"
              />
            </TouchableOpacity>
            {faqOpen === index && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
          </View>
        ))}

        {/* 🔹 Contact Support */}
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <View style={styles.contactRow}>
          <MaterialIcons name="email" size={22} color="#00809D" />
          <Text style={styles.contactText}>supportcheckmate@gmail.com</Text>
        </View>

        {/* 🔹 Footer */}
        <Text style={styles.footerText}>© 2025 Checkmate. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 57,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#b0a7a7ff",
  },
  backButton: {
    width: 24,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00809D",
    textAlign: "center",
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    marginTop: 10,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconImage: {
    width: 50,
    height: 50,
    marginBottom: 8,
    resizeMode: "contain",
  },
  iconText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "700",
  },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  faqAnswer: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 25,
  },
  contactText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    marginBottom: 30,
  },

      card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    cardIcon: {
        width: 30,
        height: 30,
        tintColor: '#EF9C66',
        marginRight: 14,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#333',
        marginBottom: 5,
    },
    cardDescription: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },
});
