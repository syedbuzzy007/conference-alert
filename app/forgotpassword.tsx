// app/forgotpassword.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "Email Sent",
        "We’ve sent you a password reset link. Please check your inbox."
      );
      router.push("/signin");
    } catch (error: any) {
      let message = "Failed to send reset email.";
      if (error.code === "auth/invalid-email") {
        message = "Invalid email format.";
      } else if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      }
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name="lock-closed-outline" size={40} color="#1e40af" />
        <Text style={styles.header}>Forgot Password</Text>
      </View>

      <Text style={styles.subtitle}>
        Enter your registered email below and we’ll send you a link to reset
        your password.
      </Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="done"
        />
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: "#93c5fd" }]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Text>
      </TouchableOpacity>

      {/* Back to Sign In */}
      <TouchableOpacity onPress={() => router.push("/signin")}>
        <Text style={styles.backText}>
          <Ionicons name="arrow-back" size={14} /> Back to Sign In
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    padding: 24,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e40af",
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    marginBottom: 25,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#1e40af",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backText: {
    marginTop: 10,
    color: "#1e40af",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});
