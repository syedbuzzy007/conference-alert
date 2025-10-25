import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AllConference() {
  const [eventsByType, setEventsByType] = useState<Record<string, any[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const eventTypes = ['Conference', 'Seminar', 'Workshop', 'Competition', 'Colloquium'];

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const allEvents: Record<string, any[]> = {};
        for (const type of eventTypes) {
          const snapshot = await getDocs(collection(db, type));
          const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          allEvents[type] = events;
        }
        setEventsByType(allEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchAllEvents();
  }, []);

  const toggleCategory = (type: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory((prev) => (prev === type ? null : type));
  };

  const toggleEvent = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedEvent((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter events by search query
  const filterEvents = (events: any[]) => {
    return events.filter(
      (event) =>
        event.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.Location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.Organizer?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const hasAnyResults = eventTypes.some(
    (type) => filterEvents(eventsByType[type] || []).length > 0
  );

  // Auto-expand first matching category on search
  useEffect(() => {
    if (searchQuery) {
      for (const type of eventTypes) {
        if (filterEvents(eventsByType[type] || []).length > 0) {
          setExpandedCategory(type);
          return;
        }
      }
      setExpandedCategory(null);
    } else {
      setExpandedCategory(null);
    }
  }, [searchQuery, eventsByType]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          <FontAwesome5 name="chalkboard-teacher" size={20} color="#3b82f6" /> All Academic Events
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, location, or organizer..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>

        {!hasAnyResults ? (
          <Text style={styles.noEventGlobal}>
            <Ionicons name="information-circle-outline" size={18} color="#94a3b8" /> No events
            found.
          </Text>
        ) : (
          eventTypes.map((type) => {
            const filteredEvents = filterEvents(eventsByType[type] || []);

            if (searchQuery && filteredEvents.length === 0) return null;

            return (
              <View key={type} style={styles.section}>
                {/* Category Header */}
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(type)}
                >
                  <Text style={styles.sectionTitle}>🎓 {type}</Text>
                  <Ionicons
                    name={expandedCategory === type ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#1e3a8a"
                  />
                </TouchableOpacity>

                {expandedCategory === type && (
                  <View style={styles.categoryContent}>
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => (
                        <View key={event.id} style={styles.card}>
                          {/* Event Title */}
                          <TouchableOpacity onPress={() => toggleEvent(event.id)}>
                            <Text style={styles.cardTitle}>
                              <MaterialIcons name="event" size={16} /> {event.Title}
                            </Text>
                          </TouchableOpacity>

                          {/* Event Details */}
                          {expandedEvent[event.id] && (
                            <View style={styles.cardDetails}>
                              {event.Location && (
                                <Text style={styles.cardDetail}>📍 {event.Location}</Text>
                              )}
                              {event.Date && (
                                <Text style={styles.cardDetail}>📅 {event.Date}</Text>
                              )}
                              {event.Organizer && (
                                <Text style={styles.cardDetail}>👤 {event.Organizer}</Text>
                              )}
                              {event.Link && (
                                <TouchableOpacity onPress={() => Linking.openURL(event.Link)}>
                                  <Text style={styles.cardLink}>🔗 Visit Website</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noEventText}>
                        <Ionicons
                          name="information-circle-outline"
                          size={16}
                          color="#94a3b8"
                        />{' '}
                        No events found.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/home')}>
          <Ionicons name="arrow-back" size={18} color="white" />
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#f0f4f8',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    height: 45,
    fontSize: 14,
    color: '#000',
  },
  section: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  categoryContent: {
    marginTop: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 5,
    borderLeftColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardDetails: {
    marginTop: 10,
  },
  cardDetail: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  cardLink: {
    fontSize: 14,
    color: '#2563eb',
    marginTop: 8,
    fontWeight: 'bold',
  },
  noEventText: {
    fontStyle: 'italic',
    color: '#94a3b8',
    marginTop: 8,
    fontSize: 14,
    marginLeft: 4,
  },
  noEventGlobal: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});
