import { authManager } from './authManager.js';

const FREE_LEVELS = ['tutorial', 'level1', 'level2'];

export function canAccessLevel(levelId) {
  if (FREE_LEVELS.includes(levelId)) {
    return true;
  }

  return authManager.isAuthenticated() && authManager.hasPremiumAccess();
}

export function requiresAuthentication(levelId) {
  return !FREE_LEVELS.includes(levelId);
}

export function getAccessMessage(levelId) {
  if (FREE_LEVELS.includes(levelId)) {
    return null;
  }

  if (!authManager.isAuthenticated()) {
    return 'Sign in with your university email to access premium levels';
  }

  if (!authManager.hasPremiumAccess()) {
    return 'Premium access required. Contact your institution administrator.';
  }

  return null;
}
