import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { registerForPushNotificationsAsync } from '../utils/notificationUtils';
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [matchedEvents, setMatchedEvents] = useState<any>({
    Conference: [],
    Seminar: [],
    Workshop: [],
    Competition: [],
    Colloquium: [],
  });
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [fullName, setFullName] = useState<string>('User');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Register for push notifications
  useEffect(() => {
    const initNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        const user = auth.currentUser;
        if (user) {
          await setDoc(doc(db, 'users', user.uid), { pushToken: token }, { merge: true });
        }
      }
    };
    initNotifications();
  }, []);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserAndEvents(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserAndEvents = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const interests = userData?.interests || [];
      setUserInterests(interests);
      setFullName(userData?.fullName || 'User');

      const categories = ["Conference", "Seminar", "Workshop", "Competition", "Colloquium"];
      const eventsByType: any = {
        Conference: [],
        Seminar: [],
        Workshop: [],
        Competition: [],
        Colloquium: [],
      };

      for (let cat of categories) {
        const snap = await getDocs(collection(db, cat));
        snap.forEach(docSnap => {
          const data = docSnap.data();
          const title = (data.Title || "").toLowerCase();

          // match interest words with event title
          for (let interest of interests) {
            const words = interest.toLowerCase().split(/\s+/);
            if (words.some(w => title.includes(w))) {
              eventsByType[cat].push(data);
              break;
            }
          }
        });
      }

      setMatchedEvents(eventsByType);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Something went wrong while fetching your data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const goToAllEvents = () => {
    router.push('/allconference');
  };

  const goToAddEvent = () => {
    router.push('/AddEvent');
  };

  const goToSettings = () => {
    router.push('/settings');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18, color: "#64748b" }}>Loading your events...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>
            👋 Hi, <Text style={{ fontWeight: 'bold' }}>{fullName}</Text>
          </Text>
          <TouchableOpacity onPress={goToSettings} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#1e3a8a" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>
          <FontAwesome5 name="university" size={22} color="#1e3a8a" />{' '}
          Welcome to <Text style={{ fontWeight: 'bold' }}>CONLERT</Text>
        </Text>

        {/* Interests */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>🎓 Your Selected Interests</Text>
          {userInterests.length > 0 ? (
            <View style={styles.chipContainer}>
              {userInterests.map((item, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.subText}>You haven't selected any interests yet.</Text>
          )}
        </View>

        {/* Buttons */}
        <TouchableOpacity onPress={goToAllEvents} style={styles.viewAllButton}>
          <Ionicons name="library-outline" size={20} color="white" />
          <Text style={styles.viewAllText}>View All Academic Events</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToAddEvent} style={styles.addEventButton}>
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text style={styles.addEventText}>Add Academic Event</Text>
        </TouchableOpacity>

        {/* Events by category */}
        {Object.keys(matchedEvents).map((cat, idx) => {
          const expanded = expandedCategories.includes(cat);
          return (
            <View key={idx} style={styles.cardSection}>
              <TouchableOpacity
                onPress={() => toggleCategory(cat)}
                style={styles.categoryHeader}
              >
                <Text style={styles.sectionTitle}>
                  📌 {cat} ({matchedEvents[cat].length})
                </Text>
                <Ionicons
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#1e3a8a"
                />
              </TouchableOpacity>

              {expanded && (
                matchedEvents[cat].length > 0 ? (
                  matchedEvents[cat].map((event: any, index: number) => (
                    <View key={index} style={styles.confCard}>
                      <Text style={styles.confTitle}>
                        <MaterialIcons name="event" size={16} color="#1e40af" /> {event.Title}
                      </Text>
                      <Text style={styles.confDetail}>📅 {event.Date}</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(event.Link)}>
                        <Text style={styles.link}>🔗 Visit Website</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.subText}>No matching events found.</Text>
                )
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  greeting: {
    fontSize: 18,
    color: '#0f172a',
  },
  settingsButton: {
    padding: 6,
  },
  title: {
    fontSize: 24,
    color: '#1e3a8a',
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  subText: {
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 8,
  },
  cardSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#fee2e2',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  chipText: {
    color: '#991b1b',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confCard: {
    backgroundColor: '#e0f2fe',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  confTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1e3a8a',
  },
  confDetail: {
    marginTop: 5,
    fontSize: 14,
    color: '#0f172a',
  },
  link: {
    color: '#1d4ed8',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  viewAllText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  addEventText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
