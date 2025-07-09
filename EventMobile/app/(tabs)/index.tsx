import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';

// --- FIX 1: Define the shape of our Event data ---
// This interface tells TypeScript what an event object looks like.
interface EventData {
  id: number;
  eventTitle: string;
  eventDateTime: string; // The date comes as a string from the API
  // Add other properties from your API if you need them
}

// --- FIX 2: Define the props for our EventItem component ---
interface EventItemProps {
  title: string;
  date: string;
}

// The EventItem component now uses the typed props.
const EventItem = ({ title, date }: EventItemProps) => {
  // Format the date to be more readable
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemDate}>{formattedDate}</Text>
    </View>
  );
};

// This is the main screen of your app
export default function EventScreen() {
  // --- FIX 3: Add types to our state variables ---
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null); // Can be an Error object or null
  const [data, setData] = useState<EventData[]>([]); // An array of EventData objects

  // --- IMPORTANT ---
  // The port has been changed to 14481 to match the HTTP port from your server logs.
  const API_URL = 'http://192.168.100.8:14481/umbraco/api/events/getall';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        setData(json);
      } catch (e) {
        // --- FIX 4: Handle the error type correctly ---
        if (e instanceof Error) {
          setError(e);
        } else {
          setError(new Error('An unknown error occurred'));
        }
        console.error("Failed to fetch events:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Events...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load events.</Text>
        <Text style={styles.errorDetails}>{error.message}</Text>
        <Text style={styles.errorDetails}>Is your Umbraco site running?</Text>
        <Text style={styles.errorDetails}>Did you set the correct IP address and port?</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Umbraco Events</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()} // TypeScript now knows 'item' has an 'id'
        renderItem={({ item }) => (
          <EventItem title={item.eventTitle} date={item.eventDateTime} /> // And an 'eventTitle' and 'eventDateTime'
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

// --- Stylesheet (no changes needed here) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#f0f0f0',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  list: {
    paddingHorizontal: 10,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
  errorDetails: {
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
  }
});
