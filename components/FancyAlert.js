import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FancyAlert = ({ visible, type = "error", title, message, onClose }) => {
  const isError = type === "error";
  
  // Set icon and colors based on type
  const iconName = isError 
    ? "alert-circle" 
    : (type === "success" ? "checkmark-circle" : "information-circle");
    
  const iconColor = isError 
    ? "#D32F2F" // Red for error
    : (type === "success" ? "#00809D" : "#007BFF"); // Theme color for success, Blue for info

  const buttonColor = isError ? "#D32F2F" : "#00809D"; // Red button for error, theme for others

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Ionicons name={iconName} size={40} color={iconColor} />
          <Text style={[styles.modalTitle, { color: iconColor }]}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: buttonColor }]}
            onPress={onClose}
          >
            <Text style={styles.confirmButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: "90%",
    borderRadius: 12,
    padding: 25,
    alignItems: "center",
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  confirmButton: {
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default FancyAlert;