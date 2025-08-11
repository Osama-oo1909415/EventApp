import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';

// Define the structure of an event
interface Event {
  id: number;
  title: string;
  dateTime: string;
  location: string | null;
  description: string | null;
  imageUrl: string | null;
  categories: string[];
}

const EventsScreen = () => {
  const [events, setEvents] = useState<Event[]>([]); // Type events as Event[]
  const [error, setError] = useState<string | null>(null); // Store error messages
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Replace with your correct API URL
        const apiUrl = 'https://78.101.190.174:44337/umbraco/api/eventsapi/v1/getall';
        console.log('Fetching events from:', apiUrl);

        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Event[] = await response.json();
        console.log('Fetched data:', data);
        setEvents(data);
      } catch (err) {
        // Safely handle the error
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    };

    fetchEvents();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Show error if fetch fails
  if (error) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </View>
    );
  }

  // Render the events list
  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
            <Text>{item.dateTime}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default EventsScreen;