import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Fixed list of academic interests
const allInterests = [
  "Computer Science",
  "Engineering",
  "Artificial Intelligence",
  "Cybersecurity",
  "Data Science",
  "Mathematics",
  "Physics",
  "Biology",
  "Chemistry",
  "Medicine",
  "Education",
  "Psychology",
  "Sociology",
  "Law",
  "Economics",
  "Business",
  "Philosophy",
  "History",
  "Linguistics",
  "Political Science",
];

export default function Settings() {
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [phone, setPhone] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setFullName(data.fullName || "");
          setInstitution(data.institution || "");
          setPhone(data.phone || "");
          setInterests(data.interests || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data.");
      }
    };

    fetchUserData();
  }, []);

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest) // remove
        : [...prev, interest] // add
    );
  };

  // Save user data
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        fullName,
        institution,
        phone,
        interests, // ✅ update interests too
      });

      Alert.alert("Success", "Profile updated successfully.");
      router.back();
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert("Error", "Failed to save changes.");
    }
  };

  // Logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await auth.signOut();
              router.replace("/signin");
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert("Error", "Failed to log out.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          <Ionicons name="settings-outline" size={22} color="#1e3a8a" /> Edit
          Profile & Interests
        </Text>

        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Institution */}
        <Text style={styles.label}>Institution</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your institution"
          value={institution}
          onChangeText={setInstitution}
        />

        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        {/* Interests */}
        <Text style={styles.label}>Select Your Interests</Text>
        <View style={styles.interestsContainer}>
          {allInterests.map((interest, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.interestChip,
                interests.includes(interest) && styles.selectedChip,
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text
                style={[
                  styles.chipText,
                  interests.includes(interest) && styles.selectedChipText,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8fafc",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#1e3a8a",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#334155",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  interestChip: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: "#f1f5f9",
  },
  selectedChip: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipText: {
    color: "#334155",
    fontSize: 13,
  },
  selectedChipText: {
    color: "#fff",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#94a3b8",
  },
  cancelText: {
    color: "#475569",
    fontWeight: "500",
    textAlign: "center",
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 25,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    marginLeft: 6,
    fontSize: 15,
  },
});
