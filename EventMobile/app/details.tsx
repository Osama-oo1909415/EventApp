// app/details.tsx

import { Link, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
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

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  const colors = useThemeColors();

  if (!params.event || typeof params.event !== 'string') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.onBackground }}>Could not load event data.</Text>
        <Link href="/" style={styles.link}>Go back to events</Link>
      </View>
    );
  }
  
  const event: EventData = JSON.parse(params.event);
  
  const screenStyles = { backgroundColor: colors.background };
  const textStyles = { color: colors.onBackground };
  const cardStyles = { backgroundColor: colors.surface, borderColor: colors.outlineVariant };
  const categoryStyles = { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer };
  
  const eventDate = new Date(event.date);
  const formattedDate = !isNaN(eventDate.getTime())
    ? eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    : 'Date not available';

  return (
    <ScrollView style={[styles.container, screenStyles]}>
      <Stack.Screen options={{ title: event.title, headerBackTitle: 'Events' }} />

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
    </ScrollView>
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
    },
    link: {
      marginTop: 15,
      paddingVertical: 15,
      color: '#D0BCFF',
    },
    headerImage: {
        width: '100%',
        height: 250,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    detailCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 16,
        lineHeight: 24,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    }
});