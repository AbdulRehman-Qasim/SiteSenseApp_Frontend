import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('Feature'); // or 'Login' depending on the flow you choose
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/favicon4.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Fixed bottom button */}
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoImage: {
    width: 600,
    height: 400,
    alignSelf: 'center',
    marginRight: 20,
  },

  button: {
    position: 'absolute',
    bottom: 60, // ✅ stays consistent on every device
    backgroundColor: '#00809D',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },

  buttonText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 3,
  },
});
