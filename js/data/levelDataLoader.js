// Level Data Loader - Fetches from API
import { supabase } from '../auth/supabaseClient.js';

const levelCache = {};

export async function getLevelContent(level, sublevel) {
  const cacheKey = `${level}-${sublevel}`;

  if (levelCache[cacheKey]) {
    return levelCache[cacheKey];
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const apiUrl = `https://pjqdjngolegmujhaezvo.supabase.co/functions/v1/get-level-content?level=${level}&sublevel=${sublevel}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch level content');
    }

    const result = await response.json();
    levelCache[cacheKey] = result.content;
    return result.content;
  } catch (error) {
    console.error('Error loading level content:', error);
    return [];
  }
}
