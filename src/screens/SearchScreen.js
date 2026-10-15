import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import MovieCard from '../components/MovieCard';
import { searchMovies } from '../api/omdb';
import { colors, spacing } from '../theme';

const quickSearches = ['Dune', 'Interstellar', 'Arrival'];

export default function SearchScreen({ navigation }) {
  const [term, setTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [nextPage, setNextPage] = useState(2);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [moreError, setMoreError] = useState('');
  const requestId = useRef(0);

  const runSearch = useCallback(async (value = term) => {
    const query = value.trim();
    if (!query) {
      setError('Введи назву фільму для пошуку.');
      return;
    }

    Keyboard.dismiss();
    setTerm(query);
    setHasSearched(true);
    setLoading(true);
    setLoadingMore(false);
    setError('');
    setMoreError('');
    setMovies([]);
    setTotalResults(0);
    setNextPage(2);
    const currentRequest = ++requestId.current;

    try {
      const data = await searchMovies(query, 1);
      if (currentRequest !== requestId.current) return;
      setMovies(data.Search || []);
      setTotalResults(Number(data.totalResults || 0));
    } catch (searchError) {
      if (currentRequest !== requestId.current) return;
      if (searchError.message !== 'Movie not found!') setError(searchError.message);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [term]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || movies.length >= totalResults || nextPage > 100) return;
    setLoadingMore(true);
    setMoreError('');
    const currentRequest = requestId.current;

    try {
      const data = await searchMovies(term, nextPage);
      if (currentRequest !== requestId.current) return;
      const pageMovies = data.Search || [];
      setMovies(current => {
        const knownIds = new Set(current.map(movie => movie.imdbID));
        return [...current, ...pageMovies.filter(movie => !knownIds.has(movie.imdbID))];
      });
      setNextPage(page => page + 1);
    } catch (pageError) {
      if (currentRequest === requestId.current) setMoreError(pageError.message);
    } finally {
      if (currentRequest === requestId.current) setLoadingMore(false);
    }
  }, [loadingMore, loading, movies.length, totalResults, nextPage, term]);

  const openMovie = movie => navigation.navigate('Details', { movie });
  const hasMore = movies.length < totalResults && nextPage <= 100;

  const listHeader = (
    <View>
      <View style={styles.topline}>
        <View style={styles.brandMark}><Ionicons name="film" size={17} color={colors.surface} /></View>
        <Text style={styles.brand}>FRAME</Text>
        <Text style={styles.edition}>КІНОКАТАЛОГ</Text>
      </View>
      <Text style={styles.kicker}>ЗНАЙДИ СВІЙ НАСТУПНИЙ ФІЛЬМ</Text>
      <Text style={styles.heading}>Кіно, яке{ '\n' }захочеться{ '\n' }передивитись.</Text>
      <Text style={styles.intro}>Пошукай у великій колекції фільмів і відкрий деталі кожної історії.</Text>

      <View style={[styles.searchBox, error && styles.searchBoxError]}>
        <Ionicons name="search-outline" size={20} color={colors.muted} />
        <TextInput
          value={term}
          onChangeText={value => { setTerm(value); setError(''); }}
          onSubmitEditing={() => runSearch()}
          placeholder="Назва фільму"
          placeholderTextColor="#969087"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Назва фільму"
          style={styles.input}
        />
        {term.length > 0 && (
          <Pressable accessibilityRole="button" accessibilityLabel="Очистити пошук" onPress={() => { setTerm(''); setError(''); }} hitSlop={8}>
            <Ionicons name="close-circle" size={19} color={colors.muted} />
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Шукати фільми"
          onPress={() => runSearch()}
          style={({ pressed }) => [styles.searchButton, pressed && styles.buttonPressed]}
        >
          <Ionicons name="arrow-forward" size={19} color={colors.white} />
        </Pressable>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!hasSearched ? (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionLabel}>ШВИДКИЙ ПОШУК</Text>
          <View style={styles.chipRow}>
            {quickSearches.map(title => (
              <Pressable key={title} style={styles.chip} onPress={() => runSearch(title)}>
                <Text style={styles.chipText}>{title}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.resultsTitle}>Результати</Text>
            <Text style={styles.resultsQuery}>«{term}»</Text>
          </View>
          {!loading && movies.length > 0 ? (
            <Text style={styles.resultCount}>{movies.length} / {totalResults}</Text>
          ) : null}
        </View>
      )}
    </View>
  );

  const emptyState = () => {
    if (loading) {
      return <View style={styles.stateBox}><ActivityIndicator color={colors.accent} size="large" /><Text style={styles.stateText}>Шукаємо фільми…</Text></View>;
    }
    if (error) {
      return <View style={styles.stateBox}><Ionicons name="cloud-offline-outline" size={28} color={colors.accent} /><Text style={styles.stateTitle}>Не вдалося завантажити</Text><Text style={styles.stateText}>{error}</Text><Pressable style={styles.retryButton} onPress={() => runSearch()}><Text style={styles.retryText}>Спробувати ще раз</Text></Pressable></View>;
    }
    if (hasSearched) {
      return <View style={styles.stateBox}><Ionicons name="search-outline" size={29} color={colors.muted} /><Text style={styles.stateTitle}>Нічого не знайдено</Text><Text style={styles.stateText}>Спробуй іншу назву або перевір написання.</Text></View>;
    }
    return <View style={styles.welcomeNote}><Ionicons name="sparkles-outline" size={18} color={colors.accent} /><Text style={styles.welcomeText}>Твоя наступна кінознахідка починається з пошуку.</Text></View>;
  };

  const listFooter = () => {
    if (loadingMore) return <ActivityIndicator style={styles.moreSpinner} color={colors.accent} />;
    if (moreError) return <Pressable onPress={loadMore} style={styles.moreButton}><Text style={styles.retryText}>Не вдалося завантажити. Повторити</Text></Pressable>;
    if (!hasMore) return <View style={styles.endMark}><View /><Text>КІНЕЦЬ СПИСКУ</Text><View /></View>;
    return (
      <Pressable accessibilityRole="button" onPress={loadMore} style={({ pressed }) => [styles.moreButton, pressed && styles.buttonPressed]}>
        <Text style={styles.moreButtonText}>Показати ще фільми</Text>
        <Ionicons name="chevron-down" size={18} color={colors.ink} />
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={movies}
        renderItem={({ item }) => <MovieCard movie={item} onPress={() => openMovie(item)} />}
        keyExtractor={item => item.imdbID}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyState}
        ListFooterComponent={movies.length > 0 ? listFooter : null}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAvoidingView>
  );
}

SearchScreen.propTypes = { navigation: PropTypes.object.isRequired };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  topline: { height: 38, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xxl },
  brandMark: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  brand: { color: colors.ink, fontSize: 16, fontWeight: '900', letterSpacing: 2.4 },
  edition: { marginLeft: 'auto', color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.8, marginBottom: 12 },
  heading: { color: colors.ink, fontSize: 36, lineHeight: 39, fontWeight: '800', letterSpacing: -1.4 },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21, maxWidth: 300, marginTop: 14, marginBottom: 22 },
  searchBox: { minHeight: 58, paddingLeft: 15, paddingRight: 7, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 11 },
  searchBoxError: { borderColor: colors.error },
  input: { flex: 1, color: colors.ink, paddingVertical: 12, fontSize: 15 },
  searchButton: { width: 43, height: 43, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink },
  buttonPressed: { opacity: 0.7 },
  errorText: { color: colors.error, fontSize: 12, marginTop: 7, marginLeft: 3 },
  suggestions: { marginTop: 24, marginBottom: 24 },
  suggestionLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderColor: colors.line, borderWidth: 1, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: colors.surface },
  chipText: { color: colors.ink, fontSize: 12, fontWeight: '600' },
  resultsHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 26, marginBottom: 16 },
  resultsTitle: { color: colors.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  resultsQuery: { color: colors.muted, fontSize: 12, marginTop: 3 },
  resultCount: { color: colors.muted, fontSize: 11, paddingBottom: 3 },
  gridRow: { justifyContent: 'space-between' },
  stateBox: { minHeight: 165, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 10 },
  stateTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginTop: 3 },
  stateText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retryButton: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, backgroundColor: colors.accentSoft },
  retryText: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  welcomeNote: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.line },
  welcomeText: { color: colors.muted, fontSize: 12, flex: 1 },
  moreSpinner: { marginVertical: 20 },
  moreButton: { minHeight: 48, marginTop: 2, marginBottom: 10, borderColor: colors.line, borderWidth: 1, borderRadius: 10, backgroundColor: colors.surface, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  moreButtonText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  endMark: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 8, marginBottom: 6 },
});
