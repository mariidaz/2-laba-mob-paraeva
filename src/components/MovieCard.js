import React, { useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

export default function MovieCard({ movie, onPress }) {
  const [posterFailed, setPosterFailed] = useState(false);
  const posterOpacity = useRef(new Animated.Value(0)).current;
  const hasPoster = movie.Poster && movie.Poster !== 'N/A' && !posterFailed;

  const revealPoster = () => {
    Animated.timing(posterOpacity, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Відкрити ${movie.Title}, ${movie.Year}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.posterFrame}>
        {hasPoster ? (
          <Animated.Image
            source={{ uri: movie.Poster }}
            style={[styles.poster, { opacity: posterOpacity }]}
            resizeMode="cover"
            onLoadEnd={revealPoster}
            onError={() => setPosterFailed(true)}
          />
        ) : (
          <View style={styles.posterFallback}>
            <Ionicons name="film-outline" size={30} color={colors.muted} />
            <Text style={styles.fallbackText}>Постер відсутній</Text>
          </View>
        )}
        <View style={styles.indexMark}>
          <Ionicons name="arrow-up-right" size={15} color={colors.ink} />
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>{movie.Title}</Text>
      <Text style={styles.year}>{movie.Year}</Text>
    </Pressable>
  );
}

MovieCard.propTypes = {
  movie: PropTypes.shape({
    imdbID: PropTypes.string.isRequired,
    Title: PropTypes.string.isRequired,
    Year: PropTypes.string,
    Poster: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  card: { width: '48%', marginBottom: spacing.lg },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  posterFrame: {
    aspectRatio: 2 / 3,
    overflow: 'hidden',
    borderRadius: 9,
    backgroundColor: colors.poster,
    marginBottom: spacing.sm,
  },
  poster: { width: '100%', height: '100%' },
  posterFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
  fallbackText: { color: colors.muted, fontSize: 11, textAlign: 'center' },
  indexMark: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  title: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  year: { marginTop: 3, color: colors.muted, fontSize: 12, letterSpacing: 0.4 },
});

