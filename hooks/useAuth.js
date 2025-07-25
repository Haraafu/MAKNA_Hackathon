import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Fetch profile by id, username, or email
  const fetchProfile = async (identifier) => {
    try {
      let query = supabase.from('profiles').select('*');
      
      if (identifier?.id) {
        query = query.eq('id', identifier.id);
      } else if (identifier?.email) {
        query = query.eq('email', identifier.email);
      } else {
        return null;
      }
      
      const { data, error } = await query.single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching profile:', error);
        }
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchProfile({ id: session.user.id });
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchProfile({ id: session.user.id });
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Sign in with Supabase Auth
  const signIn = async (email, password) => {
    try {
      console.log('🔄 Starting sign in process...');
      
      // Clear any existing session first to avoid refresh token issues
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), // Normalize email
        password,
      });
      
      if (error) {
        console.error('SignIn error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          return { 
            data: null, 
            error: { 
              message: 'Email atau password salah. Pastikan Anda sudah mendaftar dan email telah diverifikasi.' 
            } 
          };
        } else if (error.message.includes('Email not confirmed')) {
          return { 
            data: null, 
            error: { 
              message: 'Silakan cek email Anda untuk konfirmasi akun terlebih dahulu.' 
            } 
          };
        }
        
        return { data: null, error };
      }
      
      console.log('✅ User signed in successfully:', data.user?.id);
      
      // Fetch profile after successful auth
      if (data.user) {
        const userProfile = await fetchProfile({ id: data.user.id });
        if (!userProfile) {
          console.warn('⚠️ User authenticated but no profile found');
          return { 
            data: null, 
            error: { 
              message: 'Account found but profile is missing. Please contact support.' 
            } 
          };
        }
        setProfile(userProfile);
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('SignIn catch error:', err);
      return { data: null, error: { message: 'Gagal masuk. Silakan coba lagi.' } };
    }
  };

  // Manual profile creation
  const createProfile = async (userId, email, firstname, lastname) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          firstname,
          lastname: lastname || '',
          password: '', // We don't store actual passwords here
          total_badges: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Also create badge stats entry
      await supabase
        .from('profile_badge_stats')
        .insert({
          profile_id: userId,
          total_badges: 0
        });

      return data;
    } catch (error) {
      console.error('Error creating profile manually:', error);
      throw error;
    }
  };

  // Sign up with Supabase Auth and create profile
  const signUp = async (email, password, firstname, lastname = null) => {
    try {
      console.log('🔄 Starting registration process...');
      
      // Clear any existing session first
      await supabase.auth.signOut();
      
      // Create user with metadata for trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            firstname,
            lastname,
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return { data: null, error: authError };
      }

      console.log('✅ User created in auth:', authData.user?.id);

      if (authData.user) {
        // Check if user needs email confirmation
        if (!authData.user.email_confirmed_at && !authData.session) {
          return { 
            data: null, 
            error: { 
              message: 'Please check your email for verification link before signing in.' 
            } 
          };
        }

        // Wait for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if profile was created by trigger
        let userProfile = await fetchProfile({ id: authData.user.id });
        
        if (!userProfile) {
          console.log('⚠️ Profile not created by trigger, creating manually...');
          try {
            userProfile = await createProfile(
              authData.user.id, 
              authData.user.email, 
              firstname, 
              lastname
            );
            console.log('✅ Profile created manually');
          } catch (profileError) {
            console.error('❌ Failed to create profile manually:', profileError);
            return { 
              data: null, 
              error: { 
                message: 'Account created but profile setup failed. Please contact support.' 
              } 
            };
          }
        } else {
          console.log('✅ Profile created by trigger');
        }

        setProfile(userProfile);
        return { data: authData.user, error: null };
      }

      return { data: null, error: { message: 'Failed to create user' } };
    } catch (err) {
      console.error('SignUp catch error:', err);
      return { data: null, error: { message: 'Registration failed. Please try again.' } };
    }
  };

  // registerUser tidak dipakai lagi
  const registerUser = async () => ({ data: null, error: { message: 'Not implemented' } });

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'User not authenticated' } };
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) return { error };
      
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      return { error: err };
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    registerUser,
    updateProfile,
    fetchProfile,
  };
}
