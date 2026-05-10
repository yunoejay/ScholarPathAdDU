import { getSupabaseStatus, isSupabaseReady } from './supabaseClient';

export const backendMode = isSupabaseReady ? 'supabase' : 'demo';

export const backendStatus = getSupabaseStatus();

export const getBackendStatusTone = () => (isSupabaseReady ? 'success' : 'warning');

export const isBackendReady = () => isSupabaseReady;