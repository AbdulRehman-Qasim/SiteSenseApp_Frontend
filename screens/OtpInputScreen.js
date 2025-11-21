// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     StyleSheet,
//     Alert,
//     Platform,
//     Image,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { Picker } from '@react-native-picker/picker';
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, sendPasswordResetEmail } from "firebase/auth";
// import { getFunctions, httpsCallable } from "firebase/functions";

// export default function OtpInput() {
//     const navigation = useNavigation();
//     const route = useRoute();
//     const { selectedOption } = route.params;

//     const [inputValue, setInputValue] = useState('');
//     const [selectedCountryCode, setSelectedCountryCode] = useState('+92');
//     const [selectedEmailDomain, setSelectedEmailDomain] = useState('@gmail.com');

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const phoneRegex = /^[0-9]{9,12}$/; // Adjust length if needed

// const handleContinue = async () => {
//   const auth = getAuth();

//   if (selectedOption === 'phone') {
//     if (!phoneRegex.test(inputValue)) {
//       Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
//       return;
//     }

//     const fullPhoneNumber = `${selectedCountryCode}${inputValue}`;

//     try {
//       if (!window.recaptchaVerifier) {
//         window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
//           size: 'invisible',
//           callback: (response) => {}
//         }, auth);
//       }

//       const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, window.recaptchaVerifier);

//       navigation.navigate('OTPVerification', {
//         method: 'Phone',
//         value: fullPhoneNumber,
//         confirmationResult
//       });

//     } catch (error) {
//       Alert.alert('Error', error.message);
//     }

//   } else {
//     const fullEmail = `${inputValue}${selectedEmailDomain}`;
//     if (!emailRegex.test(fullEmail)) {
//       Alert.alert('Invalid Email', 'Please enter a valid email address.');
//       return;
//     }

//     try {
//       const functions = getFunctions();
//       const sendOtp = httpsCallable(functions, "sendOtp");
//       await sendOtp({ email: fullEmail });

//       Alert.alert("OTP Sent", "Check your email for the OTP code.");
//       navigation.navigate('OTPVerification', {
//         method: 'Email',
//         value: fullEmail
//       });
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     }
//   }
// };


//     return (
//         <View style={styles.container}>

//             {/* Top Icons */}
//             <View style={styles.topIcons}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <Ionicons name="chevron-back" size={24} color="#EF9C66" />
//                 </TouchableOpacity>

//                 {/* <TouchableOpacity>
//                     <Ionicons name="globe-outline" size={24} color="#00809D" />
//                 </TouchableOpacity> */}
//             </View>

//             {/* Logo */}
//             <Image
//                 source={require('../assets/favicon1.png')} // Replace with your logo
//                 style={styles.logo}
//             />


//             {/* Title */}
//             <Text style={styles.title}>Enter your {selectedOption}</Text>

//             {/* Input Fields */}
//             {
//                 selectedOption === 'phone' ? (
//                     <View style={styles.phoneRow}>
//                         <Picker
//                             selectedValue={selectedCountryCode}
//                             style={styles.countryPicker}
//                             onValueChange={(itemValue) => setSelectedCountryCode(itemValue)}
//                         >
//                             <Picker.Item label="+213 (Algeria)" value="+213" />
//                             <Picker.Item label="+61 (Australia)" value="+61" />
//                             <Picker.Item label="+880 (Bangladesh)" value="+880" />
//                             <Picker.Item label="+55 (Brazil)" value="+55" />
//                             <Picker.Item label="+86 (China)" value="+86" />
//                             <Picker.Item label="+20 (Egypt)" value="+20" />
//                             <Picker.Item label="+33 (France)" value="+33" />
//                             <Picker.Item label="+49 (Germany)" value="+49" />
//                             <Picker.Item label="+91 (India)" value="+91" />
//                             <Picker.Item label="+62 (Indonesia)" value="+62" />
//                             <Picker.Item label="+39 (Italy)" value="+39" />
//                             <Picker.Item label="+81 (Japan)" value="+81" />
//                             <Picker.Item label="+60 (Malaysia)" value="+60" />
//                             <Picker.Item label="+234 (Nigeria)" value="+234" />
//                             <Picker.Item label="+92 (Pakistan)" value="+92" />
//                             <Picker.Item label="+63 (Philippines)" value="+63" />
//                             <Picker.Item label="+7 (Russia)" value="+7" />
//                             <Picker.Item label="+966 (Saudi Arabia)" value="+966" />
//                             <Picker.Item label="+94 (Sri Lanka)" value="+94" />
//                             <Picker.Item label="+27 (South Africa)" value="+27" />
//                             <Picker.Item label="+34 (Spain)" value="+34" />
//                             <Picker.Item label="+90 (Turkey)" value="+90" />
//                             <Picker.Item label="+971 (UAE)" value="+971" />
//                             <Picker.Item label="+44 (United Kingdom)" value="+44" />
//                             <Picker.Item label="+1 (United States/Canada)" value="+1" />

//                         </Picker>
//                         <TextInput
//                             style={styles.input}
//                             placeholder="Enter phone number"
//                             keyboardType="phone-pad"
//                             maxLength={12}
//                             value={inputValue}
//                             onChangeText={setInputValue}
//                         />
//                     </View>
//                 ) : (
//                     <View style={styles.emailRow}>
//                         <TextInput
//                             style={styles.emailInput}
//                             placeholder="Your email ID"
//                             keyboardType="email-address"
//                             autoCapitalize="none"
//                             value={inputValue}
//                             onChangeText={setInputValue}
//                         />
//                         <Picker
//                             selectedValue={selectedEmailDomain}
//                             style={styles.domainPicker}
//                             onValueChange={(itemValue) => setSelectedEmailDomain(itemValue)}
//                         >
//                             <Picker.Item label="@aol.com" value="@aol.com" />
//                             <Picker.Item label="@att.net" value="@att.net" />
//                             <Picker.Item label="@comcast.net" value="@comcast.net" />
//                             <Picker.Item label="@gmail.com" value="@gmail.com" />
//                             <Picker.Item label="@icloud.com" value="@icloud.com" />
//                             <Picker.Item label="@live.com" value="@live.com" />
//                             <Picker.Item label="@mail.com" value="@mail.com" />
//                             <Picker.Item label="@msn.com" value="@msn.com" />
//                             <Picker.Item label="@outlook.com" value="@outlook.com" />
//                             <Picker.Item label="@protonmail.com" value="@protonmail.com" />
//                             <Picker.Item label="@yahoo.com" value="@yahoo.com" />
//                             <Picker.Item label="@zoho.com" value="@zoho.com" />

//                         </Picker>
//                     </View>
//                 )
//             }

//             {/* Continue Button */}
//             <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
//                 <Text style={styles.continueText}>Continue</Text>
//             </TouchableOpacity>
//         </View >
//     );
// }



import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
// import { getAuth, signInWithPhoneNumber, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
// import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
// import { app } from "../config/firebase"; // ✅ import initialized firebase app

export default function OtpInput() {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedOption } = route.params;

    const [inputValue, setInputValue] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState('+92');

    // ✅ Recaptcha ref for phone login
    const recaptchaVerifier = useRef(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{9,12}$/; // Adjust length if needed

    const handleContinue = async () => {
        const auth = getAuth(app);

        if (selectedOption === 'phone') {
            if (!phoneRegex.test(inputValue)) {
                Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
                return;
            }

            const fullPhoneNumber = `${selectedCountryCode}${inputValue}`;

            try {
                const confirmationResult = await signInWithPhoneNumber(
                    auth,
                    fullPhoneNumber,
                    recaptchaVerifier.current // ✅ important
                );

                navigation.navigate('OTPVerification', {
                    method: 'Phone',
                    value: fullPhoneNumber,
                    confirmationResult
                });

            } catch (error) {
                console.error("Phone OTP Error:", error);
                Alert.alert('Error', error.message || "Failed to send OTP.");
            }

        } else { // email option
            const fullEmail = inputValue.trim();
            if (!emailRegex.test(fullEmail)) {
                Alert.alert('Invalid Email', 'Please enter a valid email address.');
                return;
            }

            try {
                // ✅ Check if email exists in Firebase Auth
                const methods = await fetchSignInMethodsForEmail(auth, fullEmail);
                if (methods.length === 0) {
                    Alert.alert("Not Found", "This email is not registered with us.");
                    return;
                }

                // ✅ Send password reset email
                await sendPasswordResetEmail(auth, fullEmail);

                Alert.alert(
                    "Reset Link Sent",
                    "Check your email to reset your password."
                );

                // Navigate back to login
                navigation.navigate("Login");

            } catch (error) {
                console.error("Email Reset Error:", error);
                Alert.alert("Error", error.message || "Failed to send reset link.");
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* ✅ Recaptcha for phone */}
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={app.options}
            />

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

            {/* Title */}
            <Text style={styles.title}>Enter your {selectedOption}</Text>

            {/* Input Fields */}
            {
                selectedOption === 'phone' ? (
                    <View style={styles.phoneRow}>
                        <Picker
                            selectedValue={selectedCountryCode}
                            style={styles.countryPicker}
                            onValueChange={(itemValue) => setSelectedCountryCode(itemValue)}
                        >
                            <Picker.Item label="+92 (Pakistan)" value="+92" />
                            <Picker.Item label="+91 (India)" value="+91" />
                            <Picker.Item label="+1 (United States/Canada)" value="+1" />
                        </Picker>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                            maxLength={12}
                            value={inputValue}
                            onChangeText={setInputValue}
                        />
                    </View>
                ) : (
                    <View style={styles.emailRow}>
                        <TextInput
                            style={styles.emailInput}
                            placeholder="Enter your full email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={inputValue}
                            onChangeText={setInputValue}
                        />
                    </View>
                )
            }

            {/* Continue Button */}
            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    countryPicker: {
        width: 110,
        height: 60,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        fontSize: 16,
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    emailInput: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    domainPicker: {
        width: 140,
        height: 50,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        backgroundColor: '#f3f3f3',
    },
    continueBtn: {
        backgroundColor: '#00809D',
        paddingVertical: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    continueText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

