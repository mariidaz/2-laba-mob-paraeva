import { OMDB_API_KEY } from '../config';

const BASE_URL = 'https://www.omdbapi.com/';

async function request(params) {
  const query = Object.entries({ apikey: OMDB_API_KEY, r: 'json', ...params })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  const response = await fetch(`${BASE_URL}?${query.toString()}`);

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Не вдалося з’єднатися з OMDb. Перевір інтернет і спробуй ще раз.');
  }
  if (data.Response !== 'True') {
    const message = data.Error === 'Invalid API key!'
      ? 'OMDb відхилила API-ключ. Перевір src/config.js.'
      : data.Error || 'OMDb не повернула дані для цього запиту.';
    throw new Error(message);
  }
  if (!response.ok) {
    throw new Error('OMDb повернула помилку HTTP. Спробуй пізніше.');
  }

  return data;
}

export async function searchMovies(title, page = 1) {
  return request({ s: title, type: 'movie', page: String(page) });
}

export async function getMovieDetails(imdbID) {
  return request({ i: imdbID, plot: 'full' });
}
