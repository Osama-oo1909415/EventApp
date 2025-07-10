import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme // <<< FIX: Import useColorScheme
} from 'react-native';

// Import our new theme hook
import { useThemeColors } from '@/constants/Theme';

// --- Interfaces (No changes needed) ---
interface EventData {
  title: string;
  date: string;
  description: string | null;
  imageUrl: string | null;
  categories: string[];
}

interface EventItemProps {
  item: EventData;
  colors: ReturnType<typeof useThemeColors>;
}

// --- EventItem Component (Restyled as a Material 3 Card) ---
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
    <View style={[styles.itemContainer, cardStyle]}>
      <Text style={[styles.itemTitle, titleStyle]}>{item.title}</Text>
      <Text style={[styles.itemDate, dateStyle]}>{formattedDate}</Text>
    </View>
  );
};

// --- TopAppBar Component (New) ---
const TopAppBar = ({ colors }: { colors: ReturnType<typeof useThemeColors> }) => (
  <View style={[styles.appBarContainer, { backgroundColor: colors.surface }]}>
    <Image
      source={require('@/assets/images/wordless_logo.png')}
      style={styles.appBarLogo}
    />
    <Text style={[styles.appBarTitle, { color: colors.onSurface }]}>Events</Text>
  </View>
);

// --- Main Screen Component (Updated with new styles and logos) ---
export default function EventScreen() {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<EventData[]>([]);
  
  // Use our new theme hook to get colors
  const colors = useThemeColors();
  const colorScheme = useColorScheme(); // Hook for StatusBar

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

// --- Stylesheet (Updated for Material 3) ---
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
    fontWeight: '400', // Material 3 uses 'regular' weight for titles
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  itemContainer: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12, // Softer, larger radius for cards
    borderWidth: 1,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 1,
    shadowOffset: { height: 1, width: 0 },
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500', // Medium weight for card titles
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
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