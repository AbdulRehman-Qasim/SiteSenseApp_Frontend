// import React from 'react';
// import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// const { width, height } = Dimensions.get('window');

// const AboutScreen = () => {
//   const navigation = useNavigation();

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={24} color="#EF9C66" />
//         </TouchableOpacity>

//         <View style={styles.logoContainer}>
//           <Image
//             source={require('../assets/favicon7.png')} // 🔹 Your logo (Checkmate logo)
//             style={styles.logo}
//             resizeMode="contain"
//           />
//         </View>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
//         {/* Background Image */}
//         <Image
//           source={require('../assets/about_bg.png')} // 🔹 Background image (the one behind worker)
//           style={styles.backgroundImage}
//           resizeMode="cover"
//         />

//         {/* Tagline */}
//         <Text style={styles.tagline}>Smart. Fast. Reliable Inspections</Text>

//         {/* Description */}
//         <Text style={styles.description}>
//           Transform the old paper workflow into a smart, automated experience. It brings inspections into
//           the digital age, replacing manual paperwork with an AI-powered mobile assistant that listens,
//           asks, and records — all in real time.
//         </Text>

//         {/* Section: Key Features */}
//         <Text style={styles.sectionHeading}>Key Features</Text>

//         {/* Card 1 */}
//         <View style={styles.card}>
//           <Image
//             source={require('../assets/checklist_icon.png')} // 🔹 Smart Checklist icon
//             style={styles.cardIcon}
//             resizeMode="contain"
//           />
//           <View style={styles.cardTextContainer}>
//             <Text style={styles.cardTitle}>Smart Checklist</Text>
//             <Text style={styles.cardDescription}>
//               Generate smart checklist for you, based on your goal
//             </Text>
//           </View>
//         </View>

//         {/* Card 2 */}
//         <View style={styles.card}>
//           <Image
//             source={require('../assets/mic_icon.png')} // 🔹 Voice Interaction icon
//             style={styles.cardIcon}
//             resizeMode="contain"
//           />
//           <View style={styles.cardTextContainer}>
//             <Text style={styles.cardTitle}>Voice Interaction</Text>
//             <Text style={styles.cardDescription}>
//               Answer inspection questions hands-free using your voice — faster, simpler, and safer on-site.
//             </Text>
//           </View>
//         </View>

//         {/* Card 3 */}
//         <View style={styles.card}>
//           <Image
//             source={require('../assets/report_icon.png')} // 🔹 Report Generation icon
//             style={styles.cardIcon}
//             resizeMode="contain"
//           />
//           <View style={styles.cardTextContainer}>
//             <Text style={styles.cardTitle}>Report Generation</Text>
//             <Text style={styles.cardDescription}>
//               Generates the downloadable report at the end of inspection.
//             </Text>
//           </View>
//         </View>

//         {/* Next Button */}
//         <TouchableOpacity style={styles.nextButton} onPress={() => navigation.navigate('Login')}>
//           <Text style={styles.nextButtonText}>Next</Text>
//         </TouchableOpacity>

//         {/* Footer */}
//         <Text style={styles.footerText}>
//           Developed by Conx. Version 1.0 | © 2025 Checkmate
//         </Text>
//       </ScrollView>
//     </View>
//   );
// };

// export default AboutScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     paddingTop: 50,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     justifyContent: 'flex-start',
//     borderBottomWidth: 0.7,
//         borderBottomColor: '#bed2d0',
//   },
//   logoContainer: {
//     flex: 1,
//     alignItems: 'center',
//     marginRight: 25,
//   },
//   logo: {
//     width: 140,
//     height: 40,
//   },
//   scrollContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 40,
//   },
//   backgroundImage: {
//     width: '100%',
//     height: height * 0.25,
//     borderRadius: 12,
//     marginTop: 15,
//     marginBottom: 20,
//   },
//   tagline: {
//     color: '#EF9C66',
//     fontSize: 18,
//     fontWeight: '700',
//     textAlign: 'left',
//     marginBottom: 10,
//   },
//   description: {
//     color: '#5E5E5E',
//     fontSize: 14,
//     lineHeight: 20,
//     textAlign: 'left',
//     marginBottom: 25,
//   },
//   sectionHeading: {
//     fontSize: 17,
//     fontWeight: '900',
//     color: '#000',
//     marginBottom: 10,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardIcon: {
//     width: 30,
//     height: 30,
//     tintColor: '#EF9C66',
//     marginRight: 14,
//   },
//   cardTextContainer: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#00809D',
//     marginBottom: 5,
//   },
//   cardDescription: {
//     fontSize: 13,
//     color: '#555',
//     lineHeight: 18,
//   },
//   nextButton: {
//     backgroundColor: '#00809D',
//     borderRadius: 10,
//     paddingVertical: 14,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   nextButtonText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   footerText: {
//     fontSize: 12,
//     color: '#777',
//     textAlign: 'center',
//     marginTop: 20,
//   },
// });


import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const AboutScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#EF9C66" />
                </TouchableOpacity>

                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/favicon7.png')} // 🔹 Your logo
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                {/* Hero Section */}
                <View style={styles.heroContainer}>
                    <Image
                        source={require('../assets/about_bg.png')} // 🔹 Hero background image
                        style={styles.backgroundImage}
                        resizeMode="cover"
                    />

                    {/* Overlay for dim effect */}
                    <View style={styles.overlay} />
                    {/* Tagline over image */}
                    <View style={styles.overlayTextContainer}>
                        <Text style={styles.tagline}>Smart. Fast. Reliable Inspections</Text>
                    </View>
                </View>

                {/* Description */}
                <Text style={styles.description}>
                    Transform the old paper workflow into a smart, automated experience. It brings inspections into
                    the digital age, replacing manual paperwork with an AI-powered mobile assistant that listens,
                    asks, and records — all in real time.
                </Text>

                {/* Section: Key Features */}
                <Text style={styles.sectionHeading}>Key Features</Text>

                {/* Card 1 */}
                <View style={styles.card}>
                    <Image
                        source={require('../assets/checklist_icon.png')}
                        style={styles.cardIcon}
                        resizeMode="contain"
                    />
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>Smart Checklist</Text>
                        <Text style={styles.cardDescription}>
                            Generate smart checklist for you, based on your goal
                        </Text>
                    </View>
                </View>

                {/* Card 2 */}
                <View style={styles.card}>
                    <Image
                        source={require('../assets/mic_icon.png')}
                        style={styles.cardIcon}
                        resizeMode="contain"
                    />
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>Voice Interaction</Text>
                        <Text style={styles.cardDescription}>
                            Answer inspection questions hands-free using your voice — faster, simpler, and safer on-site.
                        </Text>
                    </View>
                </View>

                {/* Card 3 */}
                <View style={styles.card}>
                    <Image
                        source={require('../assets/report_icon.png')}
                        style={styles.cardIcon}
                        resizeMode="contain"
                    />
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>Report Generation</Text>
                        <Text style={styles.cardDescription}>
                            Generates the downloadable report at the end of inspection.
                        </Text>
                    </View>
                </View>

                {/* Next Button */}
                <TouchableOpacity style={styles.nextButton} onPress={() => navigation.navigate('Menu')}>
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>

                {/* Footer */}
                <Text style={styles.footerText}>
                    Developed by Conx. Version 1.0 | © 2025 Checkmate
                </Text>
            </ScrollView>
        </View>
    );
};

export default AboutScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
        borderBottomWidth: 0.7,
        borderBottomColor: '#696c6cff',
    },
    logoContainer: {
        flex: 1,
        alignItems: 'center',
        marginRight: 25,
        marginBottom: 5,
    },
    logo: {
        width: 150,
        height: 50,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    // 🔹 HERO IMAGE + TAGLINE
    heroContainer: {
        position: 'relative',
        width: '100%',
        height: height * 0.28,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 15,
        marginBottom: 20,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        opacity: 0.3,
    },

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(173, 165, 165, 0.2)', // 👈 black overlay, 30% opacity
        // backgroundColor: 'rgba(255, 255, 255, 0.5)', // 👈 black overlay, 25% opacity
    },

    overlayTextContainer: {
        position: 'absolute',
        bottom: 10,
        left: 15,
        right: 15,
    },
    tagline: {
        color: '#f36f18ff',
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'left',
        letterSpacing: 1,
    },

    description: {
        color: '#5E5E5E',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'left',
        marginBottom: 25,
    },
    sectionHeading: {
        fontSize: 17,
        fontWeight: '900',
        color: '#000',
        marginBottom: 10,
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    cardIcon: {
        width: 30,
        height: 30,
        tintColor: '#EF9C66',
        marginRight: 14,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#00809D',
        marginBottom: 5,
    },
    cardDescription: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },
    nextButton: {
        backgroundColor: '#00809D',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    footerText: {
        fontSize: 12,
        color: '#777',
        textAlign: 'center',
        marginTop: 20,
    },
});
