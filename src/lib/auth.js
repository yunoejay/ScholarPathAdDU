import { hasSupabaseConfig, supabase } from './supabaseClient';

const getAuthErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.error_description) return error.error_description;
  if (error.msg) return error.msg;

  try {
    const serialized = JSON.stringify(error);
    return serialized && serialized !== '{}' ? serialized : fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export const signInWithEmailPassword = async ({ email, password }) => {
  if (!hasSupabaseConfig || !supabase) {
    return {
      success: false,
      fallback: true,
      message: 'Supabase is not configured. Falling back to demo mode.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, fallback: false, message: getAuthErrorMessage(error, 'Unable to sign in.') };
    }

    return { success: true, fallback: false, user: data.user, session: data.session };
  } catch (error) {
    return { success: false, fallback: false, message: getAuthErrorMessage(error, 'Unable to sign in.') };
  }
};

export const signUpWithEmailPassword = async ({ email, password, fullName, role, studentId }) => {
  if (!hasSupabaseConfig || !supabase) {
    return {
      success: false,
      fallback: true,
      message: 'Supabase is not configured. Please add your Supabase credentials to the environment first.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
          student_id: studentId?.trim() || null,
        },
      },
    });

    if (error) {
      return { success: false, fallback: false, message: getAuthErrorMessage(error, 'Unable to create your account.') };
    }

    return {
      success: true,
      fallback: false,
      user: data.user,
      session: data.session,
      message: data.session ? 'Account created successfully.' : 'Account created. Please confirm your email before signing in.',
    };
  } catch (error) {
    return { success: false, fallback: false, message: getAuthErrorMessage(error, 'Unable to create your account.') };
  }
};

export const resetPasswordForEmail = async ({ email }) => {
  if (!hasSupabaseConfig || !supabase) {
    return {
      success: false,
      fallback: true,
      message: 'Supabase is not configured. Please add your Supabase credentials to the environment first.',
    };
  }

  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
  let error;
  try {
    ({ error } = await supabase.auth.resetPasswordForEmail(email.trim(), redirectTo ? { redirectTo } : undefined));
  } catch (caughtError) {
    return { success: false, fallback: false, message: getAuthErrorMessage(caughtError, 'Unable to send a reset link.') };
  }

  if (error) {
    return {
      success: false,
      fallback: false,
      message: getAuthErrorMessage(error, 'Unable to send a reset link.'),
    };
  }

  return {
    success: true,
    fallback: false,
    message: 'Password reset link sent. Check your email for further instructions.',
  };
};

export const signOutFromSupabase = async () => {
  if (!hasSupabaseConfig || !supabase) {
    return {
      success: true,
      fallback: true,
    };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      fallback: false,
      message: error.message,
    };
  }

  return {
    success: true,
    fallback: false,
  };
};

export const getSupabaseSession = async () => {
  if (!hasSupabaseConfig || !supabase) {
    return {
      session: null,
      fallback: true,
    };
  }

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    return {
      session: null,
      fallback: false,
      message: error.message,
    };
  }

  return {
    session,
    fallback: false,
  };
};

export const getUserProfile = async (userId) => {
  if (!hasSupabaseConfig || !supabase || !userId) return { profile: null, fallback: true };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role, email, department, degree_program, student_number, qpi, household_income, has_active_government_grant')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return { profile: null, fallback: false, message: getAuthErrorMessage(error, 'Unable to load your profile.') };
    return { profile: data, fallback: false };
  } catch (error) {
    return { profile: null, fallback: false, message: getAuthErrorMessage(error, 'Unable to load your profile.') };
  }
};

const getCurrentAcademicYear = (date = new Date()) => {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 5 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

export const updateUserProfile = async (userId, { degreeProgram, department, studentNumber, qpi, householdIncome, hasActiveGovernmentGrant }) => {
  if (!hasSupabaseConfig || !supabase || !userId) return { success: true, fallback: true };

  try {
    const { error: historyError } = await supabase
      .from('annual_qpi_records')
      .upsert({ user_id: userId, academic_year: getCurrentAcademicYear(), qpi }, { onConflict: 'user_id,academic_year' });
    if (historyError) return { success: false, fallback: false, message: getAuthErrorMessage(historyError, 'Unable to save your annual QPI record.') };

    const { data, error } = await supabase
      .from('profiles')
      .update({ degree_program: degreeProgram, department, student_number: studentNumber, qpi, household_income: householdIncome, has_active_government_grant: Boolean(hasActiveGovernmentGrant), updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select('full_name, role, email, department, degree_program, student_number, qpi, household_income, has_active_government_grant')
      .single();
    if (error) return { success: false, fallback: false, message: getAuthErrorMessage(error, 'Unable to save your academic profile.') };
    return { success: true, fallback: false, profile: data };
  } catch (error) {
    return { success: false, fallback: false, message: getAuthErrorMessage(error, 'Unable to save your academic profile.') };
  }
};

export const signInWithGoogle = async () => {
  if (!hasSupabaseConfig || !supabase) {
    return {
      success: false,
      fallback: true,
      message: 'Supabase is not configured. Falling back to demo mode.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          hd: 'addu.edu.ph',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      return { success: false, fallback: false, message: getAuthErrorMessage(error, 'Unable to sign in with Google.') };
    }

    return { success: true, fallback: false, user: data.user, session: data.session, url: data.url };
  } catch (error) {
    return { success: false, fallback: false, message: getAuthErrorMessage(error, 'Unable to sign in with Google.') };
  }
};
