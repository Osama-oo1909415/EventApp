// app/details.tsx

import { Link, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { useThemeColors } from '@/constants/Theme';

// Interface for Umbraco data
interface UmbracoEventData {
  title: string;
  date: string;
  description: string | null;
  imageUrl: string | null;
  categories: string[];
  latitude: string;
  longitude: string;
}

// Interface for scraped data
interface ScrapedEventData {
  title: string;
  date: string;
  description: string | null;
  imageUrl: string | null;
  link: string;
}

// A screen for scraped data from Visit Qatar
const ScrapedEventDetails = ({ event, colors }: { event: ScrapedEventData, colors: ReturnType<typeof useThemeColors> }) => {
  const textStyles = { color: colors.onBackground };
  const cardStyles = { backgroundColor: colors.surface, borderColor: colors.outlineVariant };

  return (
    <>
      {event.imageUrl && (
        <Image source={{ uri: event.imageUrl }} style={styles.headerImage} />
      )}
      <View style={styles.content}>
        <Text style={[styles.title, textStyles]}>{event.title}</Text>
        <View style={[styles.detailCard, cardStyles]}>
          <Text style={[styles.cardTitle, textStyles]}>Date</Text>
          <Text style={[styles.cardText, textStyles]}>{event.date}</Text>
        </View>
        
        {event.description && (
          <View style={[styles.detailCard, cardStyles]}>
            <Text style={[styles.cardTitle, textStyles]}>About this Event</Text>
            <Text style={[styles.cardText, textStyles]}>{event.description}</Text>
          </View>
        )}

        <Pressable
            style={({ pressed }) => [
                styles.linkButton,
                { backgroundColor: pressed ? colors.primaryContainer : colors.primary },
            ]}
            onPress={() => WebBrowser.openBrowserAsync(event.link)}
        >
            <Text style={[styles.linkButtonText, { color: colors.onPrimary }]}>
                View on Visit Qatar
            </Text>
        </Pressable>
      </View>
    </>
  );
};

// Your original screen for Umbraco data
const UmbracoEventDetails = ({ event, colors }: { event: UmbracoEventData, colors: ReturnType<typeof useThemeColors> }) => {
  const textStyles = { color: colors.onBackground };
  const cardStyles = { backgroundColor: colors.surface, borderColor: colors.outlineVariant };
  const categoryStyles = { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer };
  
  const eventDate = new Date(event.date);
  const formattedDate = !isNaN(eventDate.getTime())
    ? eventDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
      })
    : 'Date not available';

  return (
    <>
      {event.imageUrl && (
        <Image source={{ uri: event.imageUrl }} style={styles.headerImage} />
      )}
      <View style={styles.content}>
        <Text style={[styles.title, textStyles]}>{event.title}</Text>
        <View style={[styles.detailCard, cardStyles]}>
          <Text style={[styles.cardTitle, textStyles]}>Date & Time</Text>
          <Text style={[styles.cardText, textStyles]}>{formattedDate}</Text>
        </View>
        
        {event.description && (
          <View style={[styles.detailCard, cardStyles]}>
            <Text style={[styles.cardTitle, textStyles]}>About this Event</Text>
            <Text style={[styles.cardText, textStyles]}>{event.description}</Text>
          </View>
        )}

        {event.categories && event.categories.length > 0 && (
            <View style={[styles.detailCard, cardStyles]}>
                <Text style={[styles.cardTitle, textStyles]}>Categories</Text>
                <View style={styles.categoriesContainer}>
                    {event.categories.map((category, index) => (
                        <View key={index} style={[styles.categoryChip, categoryStyles]}>
                            <Text style={[styles.categoryText, {color: colors.onSecondaryContainer}]}>{category}</Text>
                        </View>
                    ))}
                </View>
            </View>
        )}
      </View>
    </>
  );
};


export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  const colors = useThemeColors();

  if (!params.event || typeof params.event !== 'string') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.onBackground }}>Could not load event data.</Text>
        <Link href="/" style={styles.link}>Go back</Link>
      </View>
    );
  }
  
  const event = JSON.parse(params.event);
  const isScraped = params.type === 'scraped';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: event.title, headerBackTitle: 'Back' }} />
      {isScraped 
        ? <ScrapedEventDetails event={event} colors={colors} /> 
        : <UmbracoEventDetails event={event} colors={colors} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  link: { marginTop: 15, paddingVertical: 15, color: '#D0BCFF' },
  headerImage: { width: '100%', height: 250 },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  detailCard: { padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  cardText: { fontSize: 16, lineHeight: 24 },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  categoryText: { fontSize: 14, fontWeight: '500' },
  linkButton: { marginTop: 10, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, alignItems: 'center' },
  linkButtonText: { fontSize: 16, fontWeight: 'bold' },
});