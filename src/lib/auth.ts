import { supabase } from './supabase';

/** Sign in with Google OAuth — redirects to Google, then back to site */
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
}

/** Send OTP code to phone number */
export async function signInWithPhone(phone: string) {
  return supabase.auth.signInWithOtp({ phone });
}

/** Verify the SMS OTP code */
export async function verifyPhoneOtp(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
}

/** Get current auth session */
export async function getAuthSession() {
  return supabase.auth.getSession();
}

/** Sign out of Supabase Auth */
export async function signOutAuth() {
  return supabase.auth.signOut();
}

/** Listen for auth state changes */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
