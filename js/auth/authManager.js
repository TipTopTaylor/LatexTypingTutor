import { supabase } from './supabaseClient.js';

export class AuthManager {
  constructor() {
    this.currentUser = null;
    this.userProfile = null;
    this.onAuthChangeCallbacks = [];
  }

  async initialize() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      await this.loadUserProfile(session.user);
    }

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          await this.loadUserProfile(session.user);
        } else {
          this.currentUser = null;
          this.userProfile = null;
        }
        this.notifyAuthChange();
      })();
    });
  }

  async loadUserProfile(user) {
    this.currentUser = user;

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*, university_licenses(*)')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      this.userProfile = profile;
    } else if (!error || error.code === 'PGRST116') {
      this.userProfile = null;
    }
  }

  async signUp(email, password) {
    const emailDomain = email.split('@')[1];

    const { data: license } = await supabase
      .from('university_licenses')
      .select('*')
      .eq('email_domain', emailDomain)
      .eq('is_active', true)
      .maybeSingle();

    if (!license) {
      throw new Error('Your email domain is not authorized. Please contact your institution or use a university email address.');
    }

    if (license.used_seats >= license.total_seats) {
      throw new Error(`Seat limit reached for ${license.university_name}. Please contact your administrator.`);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        email: email,
        university_domain: emailDomain,
        license_id: license.id,
        has_premium_access: true,
      });
    }

    return data;
  }

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    this.currentUser = null;
    this.userProfile = null;
    this.notifyAuthChange();
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  hasPremiumAccess() {
    return this.userProfile?.has_premium_access === true;
  }

  isUniversityAdmin() {
    return this.userProfile?.is_university_admin === true;
  }

  onAuthChange(callback) {
    this.onAuthChangeCallbacks.push(callback);
  }

  notifyAuthChange() {
    this.onAuthChangeCallbacks.forEach(callback => callback(this.currentUser, this.userProfile));
  }

  async updateLastActive() {
    if (this.currentUser) {
      await supabase
        .from('user_profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', this.currentUser.id);
    }
  }
}

export const authManager = new AuthManager();
