export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchTMDB(path: string, apiKey: string) {
  const url = `${TMDB_BASE_URL}${path}?api_key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB request failed: ${res.status}`);
  return res.json();
}
