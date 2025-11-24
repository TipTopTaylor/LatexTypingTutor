import { getDailyLeaderboard, subscribeToLeaderboardUpdates, formatTime } from './leaderboardManager.js';
import { getCurrentUser } from '../auth/authManager.js';

let currentChallengeLevel = 'challenge1';
let leaderboardSubscription = null;

export function initLeaderboardUI() {
  const container = document.getElementById('leaderboard-container');
  if (!container) return;

  container.innerHTML = `
    <h3>Daily Leaderboard</h3>
    <select id="leaderboard-challenge-select" class="leaderboard-select">
      <option value="challenge1">Challenge 1: Basic Math</option>
      <option value="challenge2">Challenge 2: Greek Letters</option>
      <option value="challenge3">Challenge 3: Subscripts & Powers</option>
      <option value="challenge4">Challenge 4: Greek + Variables</option>
      <option value="challenge5">Challenge 5: Integrals</option>
      <option value="challenge6">Challenge 6: Definite Integrals</option>
      <option value="challenge7">Challenge 7: Summations</option>
      <option value="challenge8">Challenge 8: Complex Sums</option>
      <option value="challenge9">Challenge 9: Advanced Calculus</option>
      <option value="challenge10">Challenge 10: Masters</option>
    </select>
    <div id="leaderboard-list" class="leaderboard-list">
      <div class="leaderboard-loading">Loading...</div>
    </div>
    <p class="leaderboard-note">Resets daily at midnight UTC</p>
  `;

  const select = document.getElementById('leaderboard-challenge-select');
  select.addEventListener('change', (e) => {
    currentChallengeLevel = e.target.value;
    loadAndDisplayLeaderboard();
  });

  loadAndDisplayLeaderboard();
  setupRealtimeUpdates();
}

async function loadAndDisplayLeaderboard() {
  const listContainer = document.getElementById('leaderboard-list');
  if (!listContainer) return;

  listContainer.innerHTML = '<div class="leaderboard-loading">Loading...</div>';

  const entries = await getDailyLeaderboard(currentChallengeLevel, 10);
  displayLeaderboard(entries);
}

function displayLeaderboard(entries) {
  const listContainer = document.getElementById('leaderboard-list');
  if (!listContainer) return;

  if (entries.length === 0) {
    listContainer.innerHTML = '<div class="leaderboard-empty">No entries yet today. Be the first!</div>';
    return;
  }

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;

  let html = '<div class="leaderboard-entries">';
  entries.forEach((entry) => {
    const isCurrentUser = entry.user_id === currentUserId;
    const medal = entry.rank === 1n ? '🥇' : entry.rank === 2n ? '🥈' : entry.rank === 3n ? '🥉' : '';
    const userClass = isCurrentUser ? 'current-user' : '';

    html += `
      <div class="leaderboard-entry ${userClass}">
        <span class="leaderboard-rank">${medal || `#${entry.rank}`}</span>
        <span class="leaderboard-name">${escapeHtml(entry.display_name)}</span>
        <span class="leaderboard-time">${formatTime(entry.completion_time_seconds)}</span>
      </div>
    `;
  });
  html += '</div>';

  listContainer.innerHTML = html;
}

function setupRealtimeUpdates() {
  if (leaderboardSubscription) {
    leaderboardSubscription.unsubscribe();
  }

  leaderboardSubscription = subscribeToLeaderboardUpdates(currentChallengeLevel, () => {
    loadAndDisplayLeaderboard();
  });
}

export function switchLeaderboardChallenge(challengeLevel) {
  currentChallengeLevel = challengeLevel;
  const select = document.getElementById('leaderboard-challenge-select');
  if (select) {
    select.value = challengeLevel;
  }
  loadAndDisplayLeaderboard();
  setupRealtimeUpdates();
}

export function refreshLeaderboard() {
  loadAndDisplayLeaderboard();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
