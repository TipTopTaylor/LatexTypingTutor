// Authentication UI Handler
import { signUp, signIn, signOut } from '../auth/authManager.js';
import { showScreen } from './screens.js';

export function setupAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const signOutBtn = document.getElementById('signOutBtn');
  const authScreen = document.getElementById('authScreen');
  const modeSelectionScreen = document.getElementById('modeSelectionScreen');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      showAuthScreen('login');
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      showAuthScreen('signup');
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try {
        await signOut();
        alert('Signed out successfully');
      } catch (error) {
        alert('Failed to sign out: ' + error.message);
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const showSignupLink = document.getElementById('showSignup');
  const showLoginLink = document.getElementById('showLogin');

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
}

function showAuthScreen(mode) {
  showScreen('authScreen');
  toggleAuthForms(mode);
}

function hideAuthScreen() {
  showScreen('modeSelectionScreen');
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    await signIn(email, password);
    alert('Welcome back!');
    hideAuthScreen();
  } catch (error) {
    alert('Failed to sign in: ' + error.message);
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
    alert('Passwords do not match');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    await signUp(email, password);
    alert('Account created successfully!');
    hideAuthScreen();
  } catch (error) {
    alert('Failed to create account: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign Up';
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
