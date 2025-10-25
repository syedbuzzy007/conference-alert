// app/signin.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // toggle visibility
  const router = useRouter();

  useEffect(() => {
    const checkRememberedUser = async () => {
      const remembered = await AsyncStorage.getItem('rememberMe');
      if (remembered === 'true') {
        const unsub = onAuthStateChanged(auth, (user) => {
          if (user) {
            router.replace('/home');
          }
        });
        return () => unsub();
      }
    };
    checkRememberedUser();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Login Error', 'Please enter both email and password.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      if (rememberMe) {
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('rememberMe');
      }
      router.replace('/home');
    } catch (err) {
      const error = err as any;
      let message = 'Something went wrong. Please try again.';

      if (error?.code === 'auth/invalid-email') {
        message = 'Invalid email format. Please check your email.';
      } else if (error?.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error?.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
      } else if (error?.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else if (error?.message) {
        message = error.message.replace('Firebase: ', '');
      }

      Alert.alert('Login Error', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerRow}>
        <Ionicons name="school-outline" size={32} color="#1e40af" />
        <Text style={styles.header}>CONLERT</Text>
      </View>

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to get academic conference alerts</Text>

      {/* Email */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />
      </View>

      {/* Password with show/hide */}
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((s) => !s)}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          style={styles.eyeButton}
        >
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => router.push('/forgotpassword')}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Remember Me */}
      <View style={styles.checkboxContainer}>
        <Checkbox value={rememberMe} onValueChange={setRememberMe} />
        <Text style={styles.checkboxLabel}>Remember Me</Text>
      </View>

      {/* Login Button */}
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </Pressable>

      {/* Sign Up Redirect */}
      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={styles.signupText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    padding: 24,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
    marginLeft: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    paddingHorizontal: 6,
  },
  forgotText: {
    color: '#1e40af',
    textAlign: 'right',
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 10,
    color: '#1e40af',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
