import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function Profile() {
  const router = useRouter();
  const user = auth.currentUser;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [role, setRole] = useState('Student');
  const [institution, setInstitution] = useState('');
  const [experience, setExperience] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [academicLevel, setAcademicLevel] = useState('Undergraduate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [preferredEventType, setPreferredEventType] = useState<string[]>([]);
  const [preferredLocation, setPreferredLocation] = useState<string[]>([]);

  const interestOptions = [
    'Computer Science', 'Engineering', 'Education', 'Social Sciences', 'Business',
    'Law', 'Health & Medical', 'Science & Technology', 'Environment', 'Arts & Humanities',
    'Islamic Studies', 'AI & Data Science', 'Cybersecurity', 'Renewable Energy',
    'Leadership & Management', 'Public Health', 'Psychology', 'Finance and Economic',
    'Language and Literature', 'Robotics'
  ];

  const eventTypeOptions = ['Conference', 'Seminar', 'Workshop', 'Competition', 'Colloquium'];
  const locationOptions = ['Local', 'International', 'Online'];
  const roleOptions = ['Student', 'Lecturer', 'Other'];
  const academicLevelOptions = ['Undergraduate', 'Master’s', 'PhD', 'Postdoc'];

  const toggleSelection = (value: string, list: string[], setList: Function) => {
    setList(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handleSaveProfile = async () => {
    try {
      const userRef = doc(db, 'users', user?.uid || '');
      await updateDoc(userRef, {
        fullName,
        phone,
        role,
        institution,
        dateOfBirth: dob.toISOString().split('T')[0],
        interests: selectedInterests,
        experience: Number(experience),
        fieldOfStudy,
        academicLevel,
        preferredEventType,
        preferredLocation,
      });
      alert('✅ Profile saved!');
      router.push('/home');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }}>
        <Text style={styles.title}>🎓 Create Your Academic Profile</Text>

        {/* Personal Info */}
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Ionicons name="person-outline" size={20} color="#1a237e" />
            <Text style={styles.label}>Full Name</Text>
          </View>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Wick"
            placeholderTextColor="#888"
          />

          <View style={styles.fieldRow}>
            <Ionicons name="call-outline" size={20} color="#1a237e" />
            <Text style={styles.label}>Phone Number</Text>
          </View>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+60 123456789"
            placeholderTextColor="#888"
          />

          <View style={styles.fieldRow}>
            <MaterialIcons name="cake" size={20} color="#1a237e" />
            <Text style={styles.label}>Date of Birth</Text>
          </View>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: '#000' }}>{dob.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDob(selectedDate);
              }}
            />
          )}

          <View style={styles.fieldRow}>
            <MaterialIcons name="school" size={20} color="#1a237e" />
            <Text style={styles.label}>Institution</Text>
          </View>
          <TextInput
            style={styles.input}
            value={institution}
            onChangeText={setInstitution}
            placeholder="Your university"
            placeholderTextColor="#888"
          />

          <View style={styles.fieldRow}>
            <FontAwesome5 name="book-reader" size={20} color="#1a237e" />
            <Text style={styles.label}>Field of Study</Text>
          </View>
          <TextInput
            style={styles.input}
            value={fieldOfStudy}
            onChangeText={setFieldOfStudy}
            placeholder="e.g., Artificial Intelligence"
            placeholderTextColor="#888"
          />
        </View>

        {/* Role */}
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <MaterialIcons name="work-outline" size={20} color="#1a237e" />
            <Text style={styles.label}>Role</Text>
          </View>
          <View style={styles.bubbleContainer}>
            {roleOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.bubble, role === option ? styles.bubbleSelected : null]}
                onPress={() => setRole(option)}
              >
                <Text style={[styles.bubbleText, role === option ? styles.bubbleTextSelected : null]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Academic Level */}
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <MaterialIcons name="school" size={20} color="#1a237e" />
            <Text style={styles.label}>Academic Level</Text>
          </View>
          <View style={styles.bubbleContainer}>
            {academicLevelOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.bubble, academicLevel === option ? styles.bubbleSelected : null]}
                onPress={() => setAcademicLevel(option)}
              >
                <Text style={[styles.bubbleText, academicLevel === option ? styles.bubbleTextSelected : null]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Event Interests */}
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <MaterialIcons name="interests" size={20} color="#1a237e" />
            <Text style={styles.label}>Event Interests</Text>
          </View>
          <View style={styles.bubbleContainerWrap}>
            {interestOptions.map((interest, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.bubble, selectedInterests.includes(interest) ? styles.bubbleSelected : null]}
                onPress={() => toggleSelection(interest, selectedInterests, setSelectedInterests)}
              >
                <Text style={[styles.bubbleText, selectedInterests.includes(interest) ? styles.bubbleTextSelected : null]}>{interest}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Event Preferences */}
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <FontAwesome5 name="calendar-alt" size={20} color="#1a237e" />
            <Text style={styles.label}>Preferred Event Type</Text>
          </View>
          <View style={styles.bubbleContainer}>
            {eventTypeOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.bubble, preferredEventType.includes(option) ? styles.bubbleSelected : null]}
                onPress={() => toggleSelection(option, preferredEventType, setPreferredEventType)}
              >
                <Text style={[styles.bubbleText, preferredEventType.includes(option) ? styles.bubbleTextSelected : null]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.fieldRow}>
            <Ionicons name="location-outline" size={20} color="#1a237e" />
            <Text style={styles.label}>Preferred Location</Text>
          </View>
          <View style={styles.bubbleContainer}>
            {locationOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.bubble, preferredLocation.includes(option) ? styles.bubbleSelected : null]}
                onPress={() => toggleSelection(option, preferredLocation, setPreferredLocation)}
              >
                <Text style={[styles.bubbleText, preferredLocation.includes(option) ? styles.bubbleTextSelected : null]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={handleSaveProfile}>
        <Text style={styles.floatingButtonText}>💾 Save Profile</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f7f9fc', padding: 16, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1a237e', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: { fontWeight: '600', color: '#222', fontSize: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, backgroundColor: '#fafafa', marginBottom: 10 },
  bubbleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  bubbleContainerWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bubble: { borderWidth: 1, borderColor: '#888', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f0f0f0' },
  bubbleSelected: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  bubbleText: { color: '#333', fontSize: 14 },
  bubbleTextSelected: { color: '#fff', fontWeight: '600' },
  floatingButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#007AFF', paddingVertical: 15, borderRadius: 50, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  floatingButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
