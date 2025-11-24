import { supabase } from '../auth/supabaseClient.js';
import { getCurrentUser } from '../auth/authManager.js';

let leaderboardCache = {};
let cacheTimestamps = {};
const CACHE_DURATION = 60000;

export async function submitChallengeScore(challengeLevel, timeInSeconds) {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, show_on_leaderboard')
      .eq('id', user.id)
      .maybeSingle();

    if (profile && profile.show_on_leaderboard === false) {
      return { success: true, skipped: true };
    }

    const displayName = profile?.display_name || `User${user.id.slice(0, 6)}`;

    const { error } = await supabase
      .from('challenge_leaderboard')
      .insert({
        user_id: user.id,
        challenge_level: challengeLevel,
        completion_time_seconds: timeInSeconds,
        display_name: displayName,
        completed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error submitting score:', error);
      return { success: false, error: error.message };
    }

    clearLeaderboardCache(challengeLevel);
    return { success: true };
  } catch (err) {
    console.error('Exception submitting score:', err);
    return { success: false, error: err.message };
  }
}

export async function getDailyLeaderboard(challengeLevel, limit = 10) {
  const cacheKey = `${challengeLevel}_${limit}`;
  const now = Date.now();

  if (leaderboardCache[cacheKey] && cacheTimestamps[cacheKey]) {
    if (now - cacheTimestamps[cacheKey] < CACHE_DURATION) {
      return leaderboardCache[cacheKey];
    }
  }

  try {
    console.log('Fetching leaderboard for:', challengeLevel);
    const { data, error } = await supabase.rpc('get_daily_leaderboard', {
      challenge_level_param: challengeLevel,
      limit_param: limit
    });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    console.log('Leaderboard data received:', data);
    leaderboardCache[cacheKey] = data || [];
    cacheTimestamps[cacheKey] = now;
    return data || [];
  } catch (err) {
    console.error('Exception fetching leaderboard:', err);
    return [];
  }
}

export function clearLeaderboardCache(challengeLevel = null) {
  if (challengeLevel) {
    Object.keys(leaderboardCache).forEach(key => {
      if (key.startsWith(challengeLevel)) {
        delete leaderboardCache[key];
        delete cacheTimestamps[key];
      }
    });
  } else {
    leaderboardCache = {};
    cacheTimestamps = {};
  }
}

export function subscribeToLeaderboardUpdates(challengeLevel, callback) {
  const subscription = supabase
    .channel(`leaderboard_${challengeLevel}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'challenge_leaderboard',
        filter: `challenge_level=eq.${challengeLevel}`
      },
      (payload) => {
        clearLeaderboardCache(challengeLevel);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

export async function updateDisplayName(newDisplayName) {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ display_name: newDisplayName })
      .eq('id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function toggleLeaderboardVisibility(showOnLeaderboard) {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ show_on_leaderboard: showOnLeaderboard })
      .eq('id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
