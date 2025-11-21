import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../config/supabase'; // ✅ Supabase config import

const RegisterScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  // ✅ Pick Image (Local Only)
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // ✅ Register User with Supabase Auth only (No Custom Table Insert)
  const handleRegister = async () => {
    if (!email || !password || !fullName || !acceptPolicy) {
      Alert.alert("Error", "Please fill all fields and accept the policy.");
      return;
    }

    try {
      // 1️⃣ Auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { fullName, phone, region }, // metadata
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User not created. Please try again.");

      const userId = authData.user.id;

      // 2️⃣ Upload profile image to Supabase Storage (if any)
      let profileImageUrl = null;
      if (profileImage && profileImage.startsWith('file://')) {
        const fileExt = profileImage.split('.').pop();
        const fileName = `${userId}.${fileExt}`;
        const filePath = `profileImages/${fileName}`;

        const img = await fetch(profileImage);
        const bytes = await img.blob();

        const { error: uploadError } = await supabase.storage
          .from('avatars') // tumhara bucket
          .upload(filePath, bytes, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        profileImageUrl = publicUrlData.publicUrl;
      }

      // 3️⃣ Insert into public.User table
      const { error: userTableError } = await supabase
        .from('User')
        .insert([
          {
            uid: userId,           // auth user id
            fullName,
            email,
            phone,
            region,
            role: 'Inspector',          // default role
            // profileImageUrl,
            subscriptionPlan: 'free',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

      if (userTableError) throw userTableError;

      // ✅ Success alert
      Alert.alert(
        "Success",
        "Your account has been created successfully!",
        [{ text: "OK", onPress: () => navigation.replace("Login") }],
        { cancelable: false }
      );

    } catch (error) {
      console.error("Registration Error:", error);
      Alert.alert("Registration Error", error.message);
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.topIcons}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.navLeft}
        >
          <Ionicons name="chevron-back" size={24} color="#EF9C66" />
        </TouchableOpacity>
        <Text style={styles.heading}></Text>
      </View>

      {/* Logo */}
      <Image source={require('../assets/favicon5.png')} style={styles.logo} />

      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Welcome back, please enter your details.</Text>

      {/* Profile Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons name="photo-camera" size={30} color="#888" />
          </View>
        )}
      </TouchableOpacity>

      {/* Full Name */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="gray" style={styles.inputIcon} />
        <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="gray" style={styles.inputIcon} />
        <TextInput
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      {/* Phone */}
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="gray" style={styles.inputIcon} />
        <TextInput
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>

      {/* Region */}
      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} color="gray" style={styles.inputIcon} />
        <TextInput
          placeholder="Region"
          value={region}
          onChangeText={setRegion}
          style={styles.input}
        />
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <Ionicons name="key-outline" size={20} color="gray" style={styles.inputIcon} />
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#00809D"
          />
        </TouchableOpacity>
      </View>

      {/* Accept Policy */}
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={acceptPolicy}
          onValueChange={setAcceptPolicy}
          color={acceptPolicy ? '#00809D' : undefined}
          style={styles.checkbox}
        />
        <Text style={styles.policyText}>I accept the company policy</Text>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signupBtn} onPress={handleRegister}>
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Already have an account */}
      <Text style={styles.loginRedirect}>
        Already have an account?{' '}
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          Login
        </Text>
      </Text>
    </View>
  );
};

export default RegisterScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 50, // Move entire screen up (adjust if needed)
  },
  logo: {
    width: '80%',          // responsive width (adjust 60–80% if needed)
    height: 90,
    resizeMode: 'contain', // keeps the logo aspect ratio
    alignSelf: 'center',   // ✅ centers horizontally
    marginVertical: 20,    // keeps spacing consistent vertically
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

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 25,
  },

  // Input field container with icon on left
  inputContainer: {
    flexDirection: 'row', // icon on left
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    paddingHorizontal: 15,
    paddingVertical: 7,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
  },

  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,

  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,

  },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 10,

  },
  checkboxIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#00809D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  policyText: {
    marginLeft: 8,
    fontSize: 14,
  },

  signupBtn: {
    backgroundColor: '#00809D',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 0,
  },
  signupText: {
    color: '#fff',
    fontSize: 18,
  },
  loginRedirect: {
    textAlign: 'center',
    fontSize: 14,
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 20,


  },
  loginLink: {
    color: '#00809D',
    fontWeight: 'bold',
  },

  imagePicker: {
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: -15,

  },

  placeholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});
