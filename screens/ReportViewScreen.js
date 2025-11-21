// screens/ReportViewScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as Print from 'expo-print';
import Markdown from 'react-native-markdown-display';

const BASE_URL = "https://invalid-times-cable-proxy.trycloudflare.com"; // ✅ Ensure correct IP

// --- 👇 FIXED IMAGE RENDERER ---
const renderRules = {
  image: (node, children, parent, styles) => {
    let imageUrl = node.attributes.src;
    if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
      imageUrl = BASE_URL + imageUrl;
    }

    // ✅ Always render full-width and properly centered
    return (
      <View key={node.key} style={{ marginVertical: 10, alignItems: 'center' }}>
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: '100%',
            height: undefined,
            aspectRatio: 16 / 9,
            borderRadius: 10,
            resizeMode: 'cover',
            backgroundColor: '#eee',
          }}
        />
      </View>
    );
  },
};

const ReportViewScreen = ({ navigation, route }) => {
  const { report } = route.params;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // --- Step 1: Clean markdown formatting ---
      let formatted = report.description
        .replace(/\*\*(Q.*?)\*\*\n(A.*)/g, '<strong>$1</strong><br/>$2')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>');

      // --- Step 2: Find all groups of consecutive images ---
      formatted = formatted.replace(
        /(!\[.*?\]\(\/(.*?)\)(?:<br\/>|\s|&nbsp;)*)+/g,
        (match) => {
          const imageRegex = /!\[.*?\]\(\/(.*?)\)/g;
          const paths = [];
          let imgMatch;
          while ((imgMatch = imageRegex.exec(match)) !== null) {
            paths.push(imgMatch[1]);
          }

          let htmlRows = "";

          // --- Step 3: Make pairs (two side by side) or singles ---
          for (let i = 0; i < paths.length; i += 2) {
            const path1 = paths[i];
            const path2 = paths[i + 1];

            if (path2) {
              // ✅ Two images side by side
              htmlRows += `
              <div class="image-row">
                <div class="image-box"><img src="${BASE_URL}/${path1}" /></div>
                <div class="image-box"><img src="${BASE_URL}/${path2}" /></div>
              </div>
            `;
            } else {
              // ✅ One image alone
              htmlRows += `
              <div class="image-single">
                <img src="${BASE_URL}/${path1}" />
              </div>
            `;
            }
          }

          return htmlRows;
        }
      );

      // --- Step 4: Final clean HTML for PDF ---
      const html = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              padding: 35px;
              font-size: 14px;
              line-height: 1.6;
              color: #333;
              background-color: #fafafa;
            }
            strong {
              font-size: 18px;
              color: #111;
              margin-top: 25px;
              margin-bottom: 8px;
              display: block;
            }

            /* --- Image sections --- */
            .image-row, .image-single {
              margin-top: 25px; /* Top margin before images */
              page-break-inside: avoid;
            }

            .image-row {
              display: flex;
              justify-content: center;
              gap: 5%; /* spacing between two images */
            }

            .image-box {
              width: 44%; /* smaller so both fit on same line */
              text-align: center;
            }

            .image-box img {
              width: 100%;
              height: 170px;
              object-fit: cover;
              border-radius: 10px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.15);
            }

            .image-single {
              text-align: center;
            }

            .image-single img {
              width: 55%;
              height: 190px;
              object-fit: cover;
              border-radius: 10px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            }
          </style>
        </head>
        <body>${formatted}</body>
      </html>
    `;

      await Print.printAsync({ html, orientation: Print.Orientation.portrait });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      Alert.alert("Error", "Could not generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "Reports" }] })}
          style={styles.navButton}
        >
          <Ionicons name="chevron-back" size={28} color="#EF9C66" />
        </TouchableOpacity>
        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle} numberOfLines={1}>
            {report.projectName || "Report"}
          </Text>
        </View>
        <View style={styles.navButton} />
      </View>

      {/* Scrollable Markdown Content */}
      <ScrollView style={styles.container}>
        <View style={styles.reportContent}>
          <Markdown style={markdownStyles} rules={renderRules}>
            {report.description}
          </Markdown>
        </View>
      </ScrollView>

      {/* Download Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadPdf}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="download-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.downloadButtonText}>Download as PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Markdown Display Styles ---
const markdownStyles = {
  strong: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
    marginBottom: 5,
  },
  body: {
    fontSize: 15,
    color: '#000',
  },
  text: {
    color: '#000',
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: '#eee',
    alignSelf: 'center',
  },
};

// --- Base Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  navbar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 45,
    backgroundColor: '#fff',
    borderBottomWidth: 0.7,
    borderBottomColor: '#bed2d0',
  },
  navButton: { width: 40, justifyContent: 'center' },
  navTitleContainer: { flex: 1, alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  container: { flex: 1 },
  reportContent: { padding: 20 },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  downloadButton: {
    backgroundColor: '#EF9C66',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReportViewScreen;
