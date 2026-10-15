import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { getMovieDetails } from '../api/omdb';
import { colors, spacing } from '../theme';

function DetailRow({ label, value }) {
  if (!value || value === 'N/A') return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

DetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

export default function MovieDetailsScreen({ navigation, route }) {
  const selectedMovie = route.params.movie;
  const [movie, setMovie] = useState(selectedMovie);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posterFailed, setPosterFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getMovieDetails(selectedMovie.imdbID)
      .then(details => { if (active) setMovie(details); })
      .catch(fetchError => { if (active) setError(fetchError.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [selectedMovie.imdbID]);

  const hasPoster = movie.Poster && movie.Poster !== 'N/A' && !posterFailed;

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад до результатів"
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={21} color={colors.ink} />
        </Pressable>
        <Text style={styles.topBarLabel}>КІНОДОВІДНИК</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.posterFrame}>
            {hasPoster ? (
              <Image source={{ uri: movie.Poster }} style={styles.poster} resizeMode="cover" onError={() => setPosterFailed(true)} />
            ) : (
              <View style={styles.posterFallback}>
                <Ionicons name="film-outline" size={38} color={colors.muted} />
                <Text style={styles.fallbackText}>Постер відсутній</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{movie.Title}</Text>
          <Text style={styles.subtitle}>{[movie.Year, movie.Rated !== 'N/A' ? movie.Rated : null, movie.Runtime !== 'N/A' ? movie.Runtime : null].filter(Boolean).join('  ·  ')}</Text>
          {movie.imdbRating && movie.imdbRating !== 'N/A' ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={styles.ratingText}>{movie.imdbRating}</Text>
              <Text style={styles.ratingCaption}>IMDb</Text>
            </View>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.loadingRow}><ActivityIndicator size="small" color={colors.accent} /><Text style={styles.loadingText}>Завантажуємо деталі…</Text></View>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {movie.Plot && movie.Plot !== 'N/A' ? (
          <View style={styles.plotBlock}>
            <Text style={styles.sectionLabel}>СЮЖЕТ</Text>
            <Text style={styles.plot}>{movie.Plot}</Text>
          </View>
        ) : null}

        <View style={styles.detailsBlock}>
          <Text style={styles.sectionLabel}>ПРО ФІЛЬМ</Text>
          <DetailRow label="Жанр" value={movie.Genre} />
          <DetailRow label="Режисер" value={movie.Director} />
          <DetailRow label="Сценарій" value={movie.Writer} />
          <DetailRow label="У ролях" value={movie.Actors} />
          <DetailRow label="Прем’єра" value={movie.Released} />
          <DetailRow label="Країна" value={movie.Country} />
          <DetailRow label="Мова" value={movie.Language} />
          <DetailRow label="Нагороди" value={movie.Awards} />
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL(`https://www.imdb.com/title/${movie.imdbID}/`)}
          style={({ pressed }) => [styles.imdbButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.imdbButtonText}>Відкрити на IMDb</Text>
          <Ionicons name="open-outline" size={17} color={colors.surface} />
        </Pressable>
        <Text style={styles.attribution}>Дані фільму надано OMDb</Text>
      </ScrollView>
    </View>
  );
}

MovieDetailsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      movie: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  topBar: { minHeight: 58, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  topBarLabel: { marginLeft: 12, color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  topBarSpacer: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  hero: { alignItems: 'center', paddingTop: spacing.lg, paddingBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.line },
  posterFrame: { width: 190, aspectRatio: 2 / 3, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.poster, marginBottom: spacing.lg },
  poster: { width: '100%', height: '100%' },
  posterFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  fallbackText: { color: colors.muted, fontSize: 12 },
  title: { color: colors.ink, textAlign: 'center', fontSize: 28, lineHeight: 33, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 8, letterSpacing: 0.5, textAlign: 'center' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.accentSoft },
  ratingText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  ratingCaption: { color: colors.muted, fontSize: 10, fontWeight: '700', marginLeft: 2 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  loadingText: { color: colors.muted, fontSize: 12 },
  errorText: { color: colors.error, fontSize: 12, paddingTop: 12 },
  plotBlock: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.line },
  sectionLabel: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.8, marginBottom: 11 },
  plot: { color: colors.ink, fontSize: 14, lineHeight: 22 },
  detailsBlock: { paddingTop: spacing.lg, paddingBottom: spacing.md },
  detailRow: { flexDirection: 'row', gap: 18, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  detailLabel: { width: 82, color: colors.muted, fontSize: 11, fontWeight: '700' },
  detailValue: { flex: 1, color: colors.ink, fontSize: 12, lineHeight: 18 },
  imdbButton: { minHeight: 48, borderRadius: 9, backgroundColor: colors.ink, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 7 },
  imdbButtonText: { color: colors.surface, fontWeight: '700', fontSize: 13 },
  buttonPressed: { opacity: 0.75 },
  attribution: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 13 },
});
