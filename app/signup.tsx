import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // === Register for push notifications ===
      let pushToken = null;
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus === 'granted') {
          const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
          });
          pushToken = tokenData.data;
          console.log('✅ Push token:', pushToken);
        } else {
          console.warn('❌ Push notification permission not granted.');
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      } else {
        alert('Must use physical device for Push Notifications');
      }

      // === Save user data to Firestore ===
      await setDoc(doc(db, 'users', userCred.user.uid), {
        email: email,
        interests: [],
        expoPushToken: pushToken,
      });

      // ✅ Redirect to Profile Page
      router.replace('/profile');
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fefefe' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Academic Logo */}
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135755.png' }}
            style={styles.logo}
          />

          <Text style={styles.title}>Create Your Academic Profile</Text>
          <Text style={styles.subtitle}>
            Join our academic community and get event updates
          </Text>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color="#555" />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#9ca3af"
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <FontAwesome name="lock" size={20} color="#555" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              onChangeText={(text) => {
                setPassword(text);
                setErrorMsg('');
              }}
              value={password}
              secureTextEntry
            />
          </View>

          <View style={styles.inputWrapper}>
            <FontAwesome name="lock" size={20} color="#555" />
            <TextInput
              style={styles.input}
              placeholder="Re-enter Password"
              placeholderTextColor="#9ca3af"
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrorMsg('');
              }}
              value={confirmPassword}
              secureTextEntry
            />
          </View>

          {errorMsg !== '' && <Text style={styles.errorText}>{errorMsg}</Text>}

          {/* Modern Sign Up Button */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signin')}>
            <Text style={styles.signinText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1a237e',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    elevation: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    color: '#000', // ✅ ensures text is visible
  },
  signUpButton: {
    backgroundColor: '#1a237e',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  signinText: {
    color: '#1a73e8',
    textAlign: 'center',
    marginTop: 15,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
});
