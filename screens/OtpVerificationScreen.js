import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// import { getFunctions, httpsCallable } from "firebase/functions";

const OtpVerificationScreen = ({ navigation }) => {
  const route = useRoute();
  const method = route?.params?.method || 'Email';
  const value = route?.params?.value || '';
  const confirmationResult = route?.params?.confirmationResult || null;

  // Support 6-digit OTP (for both Email + Phone)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (text.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < otp.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      alert('Please enter the full OTP');
      return;
    }

    try {
      if (method === 'Phone') {
        await confirmationResult.confirm(enteredOtp);
        alert('Phone number verified successfully!');
        navigation.navigate('NewPasswordScreen');
      } else if (method === 'Email') {
        const functions = getFunctions();
        const verifyOtp = httpsCallable(functions, "verifyOtp");
        const result = await verifyOtp({ email: value, otp: enteredOtp });

        if (result.data.success) {
          alert('Email verified successfully!');
          navigation.navigate('NewPasswordScreen');
        } else {
          alert('Invalid or expired OTP. Please try again.');
        }
      }
    } catch (error) {
      alert(`Verification failed: ${error.message || error}`);
    }
  };

  const handleResend = async () => {
    try {
      if (method === 'Phone') {
        alert("Please go back and request OTP again for phone login.");
      } else {
        const functions = getFunctions();
        const sendOtp = httpsCallable(functions, "sendOtp");
        await sendOtp({ email: value });
        alert("A new OTP has been sent!");
      }
    } catch (error) {
      alert("Error resending OTP: " + (error.message || error));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Icons */}
      <View style={styles.topIcons}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#EF9C66" />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <Image
        source={require('../assets/favicon1.png')}
        style={styles.logo}
      />

      <Text style={styles.heading}>OTP Verification</Text>
      <Text style={styles.subHeading}>
        Enter the 6-digit code sent to your {method}:{' '}
        <Text style={styles.boldText}>{value}</Text>
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(text) => handleChange(text, index)}
            value={digit}
            autoFocus={index === 0}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
        <Text style={styles.verifyText}>Verify</Text>
      </TouchableOpacity>

      {/* Didn't get code section */}
      <View style={styles.resendContainer}>
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendText}>
            Didn't get the code? <Text style={styles.resendLink}>Resend Code</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OtpVerificationScreen;



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingTop: 60,
  },

  topIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 60,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 70,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 16,
  },
  subHeading: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 40,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 15,
    fontSize: 20,
    textAlign: 'center',
    width: 60,
    height: 60,
  },
  verifyBtn: {
    backgroundColor: '#00809D',
    paddingVertical: 20,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  verifyText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },

  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },

  resendText: {
    fontSize: 14,
    color: '#444',
  },

  resendLink: {
    fontSize: 14,
    color: '#00809D',
    fontWeight: 'bold',
  },


});
