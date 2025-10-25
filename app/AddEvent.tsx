import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { db, auth } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddEventScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleAddEvent = async () => {
    if (!title || !eventType || !date || !location || !organizer || !link) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const collectionName = eventType;

      await addDoc(collection(db, collectionName), {
        Title: title,
        EventType: eventType,
        Date: date.toISOString().split('T')[0],
        Location: location,
        Organizer: organizer,
        Link: link,
        Description: description,
        AddedBy: {
          name: user.displayName || 'Anonymous',
          email: user.email,
        },
        Timestamp: new Date().toISOString(),
      });

      Alert.alert('✅ Success', `${eventType} added successfully!`);

      setTimeout(() => {
        router.replace('/allconference');
      }, 1500);
    } catch (error) {
      console.error('Add Event Error:', error);
      Alert.alert('Error', 'Failed to add event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* 🔙 Back to Home Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/home')}
        >
          <FontAwesome5 name="arrow-left" size={16} color="#2563eb" />
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>
          <FontAwesome5 name="calendar-plus" size={22} /> Add Academic Event
        </Text>

        <View style={styles.card}>
          {/* Title */}
          <Text style={styles.label}>📌 Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. International AI Conference 2025"
            placeholderTextColor="#9ca3af"
          />

          {/* Event Type */}
          <Text style={styles.label}>📚 Event Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={eventType}
              onValueChange={setEventType}
              style={styles.picker}
              dropdownIconColor="#1e3a8a"
            >
              <Picker.Item
                label="Select type..."
                value=""
                color="#9ca3af"
                style={{ fontStyle: 'italic' }}
              />
              <Picker.Item label="Conference" value="Conference" color="#000" />
              <Picker.Item label="Seminar" value="Seminar" color="#000" />
              <Picker.Item label="Workshop" value="Workshop" color="#000" />
              <Picker.Item label="Competition" value="Competition" color="#000" />
              <Picker.Item label="Colloquium" value="Colloquium" color="#000" />
            </Picker>
          </View>

          {/* Date */}
          <Text style={styles.label}>📅 Date *</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerText}>{date.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          {/* Location */}
          <Text style={styles.label}>📍 Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Kuala Lumpur Convention Centre"
            placeholderTextColor="#9ca3af"
          />

          {/* Organizer */}
          <Text style={styles.label}>👤 Organizer *</Text>
          <TextInput
            style={styles.input}
            value={organizer}
            onChangeText={setOrganizer}
            placeholder="e.g. Universiti Islam Selangor"
            placeholderTextColor="#9ca3af"
          />

          {/* Website */}
          <Text style={styles.label}>🔗 Website Link *</Text>
          <TextInput
            style={styles.input}
            value={link}
            onChangeText={setLink}
            placeholder="e.g. https://exampleconference.org"
            placeholderTextColor="#9ca3af"
          />

          {/* Description */}
          <Text style={styles.label}>📝 Description</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. This conference focuses on AI innovations in education..."
            placeholderTextColor="#9ca3af"
            multiline
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleAddEvent}
            style={styles.submitButton}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Add Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#0f172a',
    fontStyle: 'normal',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#000',
    backgroundColor: '#ffffff',
  },
  datePickerButton: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  datePickerText: {
    fontSize: 16,
    color: '#0f172a',
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
});
