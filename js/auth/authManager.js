// Authentication Manager
import { supabase } from './supabaseClient.js';

let currentUser = null;

export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    updateAuthUI(true);
  }

  supabase.auth.onAuthStateChange((event, session) => {
    (async () => {
      if (session) {
        currentUser = session.user;
        updateAuthUI(true);
      } else {
        currentUser = null;
        updateAuthUI(false);
      }
    })();
  });
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function getCurrentUser() {
  return currentUser;
}

function updateAuthUI(isLoggedIn) {
  const authButtons = document.getElementById('authButtons');
  const userInfo = document.getElementById('userInfo');

  if (isLoggedIn) {
    authButtons.style.display = 'none';
    userInfo.style.display = 'flex';
    document.getElementById('userEmail').textContent = currentUser.email;
  } else {
    authButtons.style.display = 'flex';
    userInfo.style.display = 'none';
  }
}
