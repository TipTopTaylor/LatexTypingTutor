import { authManager } from '../auth/authManager.js';
import { goToModeSelection } from './screens.js';
import { showFeedback } from './feedback.js';

export function initializeAuthUI() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const showSignupLink = document.getElementById('showSignup');
  const showLoginLink = document.getElementById('showLogin');
  const signOutBtn = document.getElementById('signOutBtn');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  if (showSignupLink) {
    showSignupLink.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAuthForms('signup');
    });
  }

  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAuthForms('login');
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', handleSignOut);
  }

  authManager.onAuthChange(updateAuthUI);
  updateAuthUI();
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    await authManager.signIn(email, password);
    showFeedback('Welcome back!', 'success');
    goToModeSelection();
  } catch (error) {
    showFeedback(error.message || 'Failed to sign in', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
}

async function handleSignup(e) {
  e.preventDefault();

  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (password !== confirmPassword) {
    showFeedback('Passwords do not match', 'error');
    return;
  }

  if (password.length < 6) {
    showFeedback('Password must be at least 6 characters', 'error');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    await authManager.signUp(email, password);
    showFeedback('Account created successfully!', 'success');
    goToModeSelection();
  } catch (error) {
    showFeedback(error.message || 'Failed to create account', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign Up';
  }
}

async function handleSignOut() {
  try {
    await authManager.signOut();
    showFeedback('Signed out successfully', 'success');
    goToModeSelection();
  } catch (error) {
    showFeedback('Failed to sign out', 'error');
  }
}

function toggleAuthForms(form) {
  const loginContainer = document.getElementById('loginContainer');
  const signupContainer = document.getElementById('signupContainer');

  if (form === 'signup') {
    loginContainer.style.display = 'none';
    signupContainer.style.display = 'block';
  } else {
    loginContainer.style.display = 'block';
    signupContainer.style.display = 'none';
  }
}

function updateAuthUI() {
  const userInfoDiv = document.getElementById('userInfo');
  const signOutBtn = document.getElementById('signOutBtn');

  if (authManager.isAuthenticated() && userInfoDiv) {
    const email = authManager.currentUser.email;
    const isPremium = authManager.hasPremiumAccess();

    userInfoDiv.innerHTML = `
      <div class="user-email">${email}</div>
      <div class="user-status">${isPremium ? 'Premium Access' : 'Free Access'}</div>
    `;
    userInfoDiv.style.display = 'block';

    if (signOutBtn) {
      signOutBtn.style.display = 'block';
    }
  } else {
    if (userInfoDiv) {
      userInfoDiv.style.display = 'none';
    }
    if (signOutBtn) {
      signOutBtn.style.display = 'none';
    }
  }
}
