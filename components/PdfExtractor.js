// components/PdfExtractor.js
import React, { useRef, useEffect, useState } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

/*
  PdfExtractor receives:
    - base64: PDF file as base64 string (no data: prefix)
    - onExtracted: callback(text) called when extraction completes
    - onError: callback(errorMessage)
  It renders a hidden WebView that loads pdf.js from CDN and returns text via postMessage.
*/

export default function PdfExtractor({ base64, onExtracted, onError }) {
  const webRef = useRef(null);
  const [injectedAt, setInjectedAt] = useState(false);

  // Minimal HTML that loads pdf.js from CDN and listens for messages (base64)
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js"></script>
      </head>
      <body>
        <script>
          (function () {
            // helper: atob -> binary string
            function atobToUint8Array(base64) {
              const binary = atob(base64);
              const len = binary.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              return bytes;
            }

            // Listen for base64 via postMessage
            document.addEventListener('message', async function(event) {
              try {
                const base64 = event.data;
                const pdfData = atobToUint8Array(base64);
                const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                const pdf = await loadingTask.promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const content = await page.getTextContent();
                  const pageText = content.items.map(item => item.str).join(' ');
                  text += pageText + '\\n';
                }
                // send text back
                window.ReactNativeWebView.postMessage(JSON.stringify({ ok: true, text }));
              } catch (e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ ok: false, error: e.message || 'Extraction failed' }));
              }
            }, false);
          })();
        </script>
      </body>
    </html>
  `;

  // send base64 to webview once it's loaded
  useEffect(() => {
    if (!base64 || !webRef.current) return;
    // small delay to ensure webview has initialised
    const t = setTimeout(() => {
      try {
        webRef.current.postMessage(base64);
      } catch (e) {
        if (onError) onError("Failed to post PDF to extractor");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [base64]);

  return (
    <View style={{ width: 0, height: 0, opacity: 0 }}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        source={{ html }}
        onMessage={(event) => {
          try {
            const payload = JSON.parse(event.nativeEvent.data);
            if (payload.ok) {
              onExtracted && onExtracted(payload.text);
            } else {
              onError && onError(payload.error || "PDF extraction failed");
            }
          } catch (e) {
            onError && onError("Invalid response from PDF extractor");
          }
        }}
      />
    </View>
  );
}
