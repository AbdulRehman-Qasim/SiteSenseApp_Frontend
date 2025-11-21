// screens/LoginScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase'; // ✅ Import Supabase client
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('email');
        const savedPassword = await AsyncStorage.getItem('password');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (e) {
        console.log('Failed to load credentials:', e);
      }
    };
    loadCredentials();
  }, []);

  // const handleLogin = async () => {
  //   if (!email || !password) {
  //     Alert.alert("Missing Fields", "Please fill in both email and password.");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     // ✅ Supabase sign in
  //     const { data, error } = await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });

  //     if (error) {
  //       Alert.alert("Login Failed", error.message);
  //       setLoading(false);
  //       return;
  //     }

  //     const user = data.user;
  //     const session = data.session;

  //     console.log("User signed in:", user.email);
  //     console.log("Access token:", session?.access_token);

  //     // ✅ Save access token in AsyncStorage
  //     if (session?.access_token) {
  //       await AsyncStorage.setItem("token", session.access_token);
  //     }

  //     // ✅ Save credentials if "Remember Me" is checked
  //     if (rememberMe) {
  //       await AsyncStorage.setItem("email", email);
  //       await AsyncStorage.setItem("password", password);
  //     } else {
  //       await AsyncStorage.removeItem("email");
  //       await AsyncStorage.removeItem("password");
  //     }

  //     // ✅ Navigate after successful login
  //     navigation.navigate("Main");
  //   } catch (err) {
  //     console.error(err);
  //     Alert.alert("Login Failed", err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      const session = data.session;

      console.log("User signed in:", user.email);
      console.log("Access token:", session?.access_token);

      // Save UID for fetching checklists later
      await AsyncStorage.setItem("uid", user.id);

      // Save access token
      if (session?.access_token) {
        await AsyncStorage.setItem("token", session.access_token);
      }

      // Save credentials if "Remember Me" is checked
      if (rememberMe) {
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("password", password);
      } else {
        await AsyncStorage.removeItem("email");
        await AsyncStorage.removeItem("password");
      }

      navigation.navigate("Home");
    } catch (err) {
      console.error(err);
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topIcons}>
        <TouchableOpacity
          onPress={() => navigation.replace('Feature')}
          style={styles.navLeft}
        >
          <Ionicons name="chevron-back" size={24} color="#EF9C66" />
        </TouchableOpacity>
        <Text style={styles.heading}></Text>
      </View>


      <Image source={require('../assets/favicon5.png')} style={styles.logo} />

      <Text style={styles.title}>Login to Your Account</Text>
      <Text style={styles.subtitle}>Welcome back, please enter your detail.</Text>

      <View style={styles.inputContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="mail-outline" size={20} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Enter Email Address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#888"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Ionicons name="key-outline" size={20} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Enter Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#00809D"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={rememberMe}
            onValueChange={setRememberMe}
            color={rememberMe ? '#00809D' : undefined}
          />
          <Text style={styles.rememberText}>Remember me</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forget password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.signupText}>
        Don’t have an account?{' '}
        <Text
          style={styles.signupLink}
          onPress={() => navigation.navigate('Register')}
        >
          Sign Up
        </Text>
      </Text>

      {/* Loading overlay */}
      {loading && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10, fontSize: 16 }}>
            Logging in your account...
          </Text>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 50, // Move entire screen up (adjust if needed)
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginBottom: 20,
    position: 'relative',

  },

  navLeft: {
    position: 'absolute',
    left: 0,
    top: 3,
    padding: 0, // 🔹 makes touch target bigger
    zIndex: 2,   // 🔹 ensures it stays above heading text
  },

  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00809D',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 3,
    textAlign: 'center',
    pointerEvents: 'none',
  },

  logo: {
    width: '80%',          // responsive width (adjust 60–80% if needed)
    height: 90,
    resizeMode: 'contain', // keeps the logo aspect ratio
    alignSelf: 'center',   // ✅ centers horizontally
    marginVertical: 20,
    top: 10,   // keeps spacing consistent vertically
  },

  title: {
    paddingTop: 20,
    fontSize: 24,
    fontWeight: '900', // More bold than 'bold'
    alignSelf: 'flex-start',
    marginBottom: 15,
  },

  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 25,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  rememberText: {
    marginLeft: 8,
    fontSize: 16,
  },
  forgotText: {
    color: 'red',
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: '#00809D',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: -10,
  },
  loginText: {
    color: '#f8fafc',
    fontSize: 18,
  },
  signupText: {
    textAlign: 'center',
    fontSize: 14,
  },
  signupLink: {
    color: '#00809D',
    fontWeight: 'bold',
  },
});
