import { Link } from 'expo-router';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme
} from 'react-native';

import { useThemeColors } from '@/constants/Theme';

interface ScrapedEventData {
  id?: string;
  title: string;
  date: string;
  description: string | null;
  imageUrl: string | null;
  link: string;
}

interface EventItemProps {
  item: ScrapedEventData;
  colors: ReturnType<typeof useThemeColors>;
}

const EventItem = ({ item, colors }: EventItemProps) => {
  const cardStyle = { backgroundColor: colors.surface, borderColor: colors.outlineVariant };
  const titleStyle = { color: colors.onSurface };
  const dateStyle = { color: colors.onSurfaceVariant };

  return (
    <Link href={{ pathname: '/details', params: { event: JSON.stringify(item), type: 'scraped' } }} asChild>
      <Pressable>
        <View style={[styles.itemContainer, cardStyle]}>
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              placeholder={require('@/assets/images/placeholder.png')}
              transition={500}
            />
          )}
          <Text style={[styles.itemTitle, titleStyle]}>{item.title}</Text>
          <Text style={[styles.itemDate, dateStyle]}>{item.date}</Text>
        </View>
      </Pressable>
    </Link>
  );
};

const TopAppBar = ({ colors }: { colors: ReturnType<typeof useThemeColors> }) => (
  <View style={[styles.appBarContainer, { backgroundColor: colors.surface }]}>
    <Image source={require('@/assets/images/wordless_logo.png')} style={styles.appBarLogo} />
    <Text style={[styles.appBarTitle, { color: colors.onSurface }]}>Qatar Calendar Events</Text>
  </View>
);

export default function QatarEventsScreen() {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ScrapedEventData[]>([]);
  
  const colors = useThemeColors();
  const colorScheme = useColorScheme();

  const API_URL = 'http://172.26.14.153:5001/api/events';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const json = await response.json();
        setData(json);
      } catch (e) {
        if (e instanceof Error) setError(e);
        else setError(new Error('An unknown error occurred'));
        console.error("Failed to fetch events:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const screenStyles = { backgroundColor: colors.background };
  const textStyles = { color: colors.onBackground };
  const errorTextStyles = { color: colors.error };

  if (isLoading) {
    return (
      <View style={[styles.center, screenStyles]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, textStyles]}>Loading Qatar Calendar...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, screenStyles]}>
        <Text style={[styles.errorText, errorTextStyles]}>Failed to Load Events</Text>
        <Text style={[styles.errorDetails, textStyles]}>Could not connect to the scraping server.</Text>
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
        keyExtractor={(item, index) => item.id ? item.id : `${item.title}-${item.date}-${index}`}
        renderItem={({ item }) => <EventItem item={item} colors={colors} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  appBarContainer: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16, elevation: 4, shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { height: 1, width: 0 } },
  appBarLogo: { width: 32, height: 32, marginRight: 16 },
  appBarTitle: { fontSize: 22, fontWeight: '400' },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  itemContainer: { padding: 16, marginVertical: 8, borderRadius: 12, borderWidth: 1, elevation: 1, shadowOpacity: 0.05, shadowRadius: 1, shadowOffset: { height: 1, width: 0 } },
  itemImage: { width: '100%', height: 150, borderRadius: 12, marginBottom: 12 },
  itemTitle: { fontSize: 18, fontWeight: '500', marginBottom: 6 },
  itemDate: { fontSize: 15 },
  loadingText: { marginTop: 10, fontSize: 16 },
  errorText: { fontSize: 22, fontWeight: '500', textAlign: 'center', marginBottom: 8 },
  errorDetails: { marginTop: 8, textAlign: 'center', fontSize: 14 },
});