// app/(tabs)/index.tsx

import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme
} from 'react-native';

import { useThemeColors } from '@/constants/Theme';

interface EventData {
  title: string;
  date: string;
  description: string | null;
  imageUrl: string | null;
  categories: string[];
  latitude: string;
  longitude: string;
}

interface EventItemProps {
  item: EventData;
  colors: ReturnType<typeof useThemeColors>;
}

const EventItem = ({ item, colors }: EventItemProps) => {
  const eventDate = new Date(item.date);
  const formattedDate = !isNaN(eventDate.getTime())
    ? eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Date not available';

  const cardStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant,
  };
  const titleStyle = { color: colors.onSurface };
  const dateStyle = { color: colors.onSurfaceVariant };

  return (
    // --- FIX: Point the Link to the new '/details' route ---
    <Link href={{ pathname: '/details', params: { event: JSON.stringify(item) } }} asChild>
      <Pressable>
        <View style={[styles.itemContainer, cardStyle]}>
          <Text style={[styles.itemTitle, titleStyle]}>{item.title}</Text>
          <Text style={[styles.itemDate, dateStyle]}>{item.date}</Text>
        </View>
      </Pressable>
    </Link>
  );
};

// ... (The rest of the file is the same as before)
const TopAppBar = ({ colors }: { colors: ReturnType<typeof useThemeColors> }) => (
  <View style={[styles.appBarContainer, { backgroundColor: colors.surface }]}>
    <Image
      source={require('@/assets/images/wordless_logo.png')}
      style={styles.appBarLogo}
    />
    <Text style={[styles.appBarTitle, { color: colors.onSurface }]}>Events</Text>
  </View>
);

export default function EventScreen() {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<EventData[]>([]);
  
  const colors = useThemeColors();
  const colorScheme = useColorScheme();

  const API_URL = 'http://10.156.223.223:14481/umbraco/api/events/getall';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json();
        setData(json);
      } catch (e) {
        if (e instanceof Error) { setError(e); } 
        else { setError(new Error('An unknown error occurred')); }
        console.error("Failed to fetch events:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const screenStyles = {
    backgroundColor: colors.background,
  };
  const textStyles = {
    color: colors.onBackground,
  };
  const errorTextStyles = {
    color: colors.error,
  };

  if (isLoading) {
    return (
      <View style={[styles.center, screenStyles]}>
        <Image source={require('@/assets/images/eventlogofull.png')} style={styles.fullLogo} />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        <Text style={[styles.loadingText, textStyles]}>Loading Events...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, screenStyles]}>
        <Image source={require('@/assets/images/eventlogofull.png')} style={styles.fullLogo} />
        <Text style={[styles.errorText, errorTextStyles]}>Failed to Load Events</Text>
        <Text style={[styles.errorDetails, textStyles]}>Could not connect to the API.</Text>
        <Text style={[styles.errorDetails, textStyles]}>{error.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, screenStyles]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <TopAppBar colors={colors} />
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item }) => <EventItem item={item} colors={colors} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullLogo: {
    width: 250,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  appBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { height: 1, width: 0 },
  },
  appBarLogo: {
    width: 32,
    height: 32,
    marginRight: 16,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: '400',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  itemContainer: {
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 1,
    shadowOffset: { height: 1, width: 0 },
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '500', 
    marginBottom: 6,
  },
  itemDate: {
    fontSize: 15,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetails: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
});