import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const [method, setMethod] = useState('email');
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.topIcons}>
        <TouchableOpacity
          onPress={() => navigation.replace('Login')}
          style={styles.navLeft}
        >
          <Ionicons name="chevron-back" size={24} color="#EF9C66" />
          
        </TouchableOpacity><Text style={styles.heading}>Reset Password</Text>
      </View>

      {/* Logo */}
      <Image
        source={require('../assets/icon1.png')} // Replace with your logo
        style={styles.logo}
      />

      {/* Heading */}
      <Text style={styles.heading1}>Reset Password</Text>

      {/* Selection Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            method === 'email' && styles.selectedToggle,
          ]}
          onPress={() => setMethod('email')}
        >
          <View style={styles.checkboxWithText}>
            {method === 'email' ? (
              <Ionicons name="checkmark-circle" size={28} color="#fff" style={styles.icon} />
            ) : (
              <Ionicons name="ellipse-outline" size={28} color="#ccc" style={styles.icon} />
            )}
            <Text
              style={[
                styles.toggleText,
                method === 'email' && styles.selectedText,
              ]}
            >
              Email
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            method === 'phone' && styles.selectedToggle,
          ]}
          onPress={() => setMethod('phone')}
        >
          <View style={styles.checkboxWithText}>
            {method === 'phone' ? (
              <Ionicons name="checkmark-circle" size={28} color="#fff" style={styles.icon} />
            ) : (
              <Ionicons name="ellipse-outline" size={28} color="#ccc" style={styles.icon} />
            )}
            <Text
              style={[
                styles.toggleText,
                method === 'phone' && styles.selectedText,
              ]}
            >
              Phone Number
            </Text>
          </View>
        </TouchableOpacity>
      </View>


      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={() => navigation.navigate('OtpInput', {
          selectedOption: method   // ✅ Pass method as selectedOption
        })}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>


    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // use marginLeft on heading if RN version <0.71
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00809D',
    marginLeft: 110,
    justifyContent:'center',
    alignItems: 'center',

  },
  logo: {
    width: 640,
    height: 290,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 0,
  },
  heading1: {
    fontSize: 29,
    fontWeight: '900',
    marginTop: -10,
    marginBottom: 20,
    textAlign: 'center',
    // alignSelf: 'flex-start',

  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 50,
  },

  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    marginHorizontal: 15,
    backgroundColor: '#f0f0f0',
  },

  selectedToggle: {
    backgroundColor: '#00809D',
    borderColor: '#007bff',
  },

  checkboxWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    marginRight: 8,
  },

  toggleText: {
    fontSize: 18,
    color: '#333',
  },

  selectedText: {
    color: '#f8fafc',
  },
  continueBtn: {
    backgroundColor: '#00809D',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
