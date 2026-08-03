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
