import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce', // Use PKCE flow for mobile
  },
});

// Helper function to get public URL for images
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  try {
    // Handle case where full URL is provided
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Clean the image path to ensure proper format
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    const { data: { publicUrl } } = supabase
      .storage
      .from('buckets')
      .getPublicUrl(`/${cleanPath}`); // Add leading slash
      
    return publicUrl;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return null;
  }
};
