import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

export default function ReportViewerScreen({ route }) {
  const { pdfUrl } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: pdfUrl }}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        allowsInlineMediaPlayback
        startInLoadingState
      />
    </View>
  );
}
