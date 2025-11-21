// import React from 'react';
// import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';

// const { width } = Dimensions.get('window');

// const FeatureScreen = () => {
//     const navigation = useNavigation();

//     return (
//         <View style={styles.container}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <Ionicons name="chevron-back" size={24} color="#EF9C66" />
//                 </TouchableOpacity>
//                 {/* <TouchableOpacity onPress={() => alert('Language Option')}>
//                     <Ionicons name="globe-outline" size={24} color="#00809D" />
//                 </TouchableOpacity> */}
//             </View>

//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 {/* Logo */}
//                 <Image
//                     source={require('../assets/favicon5.png')} // Replace with your logo path
//                     style={styles.logo}
//                     resizeMode="contain"
//                 />

//                 {/* Key Features */}
//                 {/* ✨ Key Features */}
//                 <Text style={styles.sectionHeading}>✨ Key Features</Text>

//                 <View style={styles.card}>
//                     <Text style={styles.cardDescription}>
//                         <Text style={{ fontWeight: "bold" }}>⚡ NEC Code Expert</Text> Get instant NEC code summaries and compliance guidance.{"\n\n"}
//                         <Text style={{ fontWeight: "bold" }}>🧠 Inspection Assistant</Text>  Upload images to verify NEC compliance and avoid re-inspection delays.{"\n\n"}
//                         <Text style={{ fontWeight: "bold" }}>🛠️ Troubleshooting Help</Text>  Describe issues or upload images for step-by-step regulatory guidance.
//                     </Text>
//                 </View>


//                 {/* 📋 How to Use */}
//                 <Text style={styles.sectionHeading}>📋 How to Use</Text>

//                 <View style={styles.card}>
//                     <Text style={styles.cardDescription}>
//                         <Text style={{ fontWeight: 'bold' }}>🗣️ Ask:</Text> Type your NEC question or upload an image.{"\n\n"}
//                         <Text style={{ fontWeight: 'bold' }}>💡 Get Answers:</Text> Receive quick, accurate compliance guidance.{"\n\n"}
//                         <Text style={{ fontWeight: 'bold' }}>🔧 Fix & Verify:</Text> Use expert recommendations to correct electrical work.
//                     </Text>
//                 </View>


//                 {/* 🎯 Benefits */}
//                 <Text style={styles.sectionHeading}>🎯 Benefits</Text>

//                 <View style={styles.card}>
//                     <Text style={styles.cardDescription}>✅ Ensure your work meets NEC standards effortlessly.{"\n"}</Text>
//                     <Text style={styles.cardDescription}>✅ Avoid inspection failures and costly rework.{"\n"}</Text>
//                     <Text style={styles.cardDescription}>✅ Save time with instant expert guidance.</Text>
//                 </View>


//             </ScrollView>

//             {/* Next Button */}
//             <TouchableOpacity style={styles.nextButton} onPress={() => navigation.navigate('Login')}>
//                 <Text style={styles.nextButtonText}>Next</Text>
//             </TouchableOpacity>
//         </View>
//     );
// };

// export default FeatureScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f8fafc',
//         paddingTop: 50,
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingHorizontal: 20,
//         marginBottom: 0,
//     },
//     scrollContent: {
//         paddingBottom: 30,
//         paddingHorizontal: 20,
//     },
//     logo: {
//         width: 420,
//         height: 80,
//         alignSelf: 'left',
//         marginVertical: 0,
//         marginTop: 30,
//         marginBottom: 40,
//     },
//     sectionHeading: {
//         fontSize: 20,
//         fontWeight: '900',
//         color: '#00809D',
//         marginTop: 0,
//         marginBottom: 10,
//     },
//     card: {
//         backgroundColor: '#fff',
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 12,
//         shadowColor: '#000',
//         shadowOpacity: 0.1,
//         shadowOffset: { width: 0, height: 2 },
//         shadowRadius: 4,
//         elevation: 3,
//     },

//     cardDescription: {
//         fontSize: 15,
//         color: '#333',
//         lineHeight: 22,
//     },
//     cardTitle: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#00809D',
//         marginBottom: 6,
//     },
//     nextButton: {
//         backgroundColor: '#00809D',
//         paddingVertical: 20,
//         marginHorizontal: 20,
//         borderRadius: 12,
//         alignItems: 'center',
//         marginBottom: 55,

//     },
//     nextButtonText: {
//         color: '#f8fafc',
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
// });


import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const FeatureScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Splash")}>
          <Ionicons name="chevron-back" size={24} color="#EF9C66" />
        </TouchableOpacity>
      </View>

      {/* Main Wrapper → Takes full height */}
      <View style={styles.bodyWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Your Digital Inspection Assistant</Text>

          <Text style={styles.description}>
            Ditch the paper. Conduct smart, voice-driven inspections with AI.
          </Text>

          {/* Cards */}
          <View style={styles.cardContainer}>
            {/* Row 1 */}
            <View style={styles.row}>
              <View style={styles.card}>
                <View style={styles.iconCircle}>
                  <Ionicons name="cloud-upload-outline" size={26} color="#00809D" />
                </View>
                <Text style={styles.cardTitle}>Upload Your Checklist</Text>
                <Text style={styles.cardText}>
                  Turn any existing checklist into a smart, interactive inspection.
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.iconCircle}>
                  <Ionicons name="sparkles-outline" size={26} color="#00809D" />
                </View>
                <Text style={styles.cardTitle}>AI-Generated Checklists</Text>
                <Text style={styles.cardText}>
                  Define your inspection goal and let AI prepare a tailored checklist.
                </Text>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.row}>
              <View style={styles.card}>
                <View style={styles.iconCircle}>
                  <Ionicons name="mic-outline" size={26} color="#00809D" />
                </View>
                <Text style={styles.cardTitle}>Voice-Driven Inspections</Text>
                <Text style={styles.cardText}>
                  AI asks checklist questions one by one, you answer hands-free.
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.iconCircle}>
                  <Ionicons name="camera-outline" size={26} color="#00809D" />
                </View>
                <Text style={styles.cardTitle}>Real-Time Notes & Photos</Text>
                <Text style={styles.cardText}>
                  Attach comments and capture images directly in your inspection flow.
                </Text>
              </View>
            </View>

            {/* Row 3 */}
            <View style={styles.row}>
              <View style={styles.card}>
                <View style={styles.iconCircle}>
                  <Ionicons name="document-text-outline" size={26} color="#00809D" />
                </View>
                <Text style={styles.cardTitle}>Seamless Reporting</Text>
                <Text style={styles.cardText}>
                  Export structured inspection reports instantly, ready to share.
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.iconCircle}>
                  <Ionicons name="cloud-done-outline" size={26} color="#00809D" />
                </View>
                <Text style={styles.cardTitle}>Always Accessible</Text>
                <Text style={styles.cardText}>
                  All your inspections are stored securely — no more lost papers.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.startButtonText}>Start New Inspection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

};

export default FeatureScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 60,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    marginTop: 10,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#00809D",
    textAlign: "center",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 25,
    width: "90%",
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    width: (width - 60) / 2,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    backgroundColor: "#E0F7FA",
    padding: 10,
    borderRadius: 50,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#00809D",
    textAlign: "center",
    marginBottom: 6,
  },
  cardText: {
    fontSize: 12.5,
    color: "#374151",
    textAlign: "center",
    lineHeight: 17,
  },
  startButton: {
    backgroundColor: "#00809D",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 80,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    marginBottom: 40,
    shadowColor: "#00809D",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  bodyWrapper: {
    flex: 1,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: "#f8fafc",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
});
