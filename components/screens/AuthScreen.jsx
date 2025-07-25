import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../contexts/AuthContext';
import LogoIcon from '../LogoIcon';

export default function AuthScreen() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome, signin, register-email, register-info
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const { signIn, signUp } = useAuthContext();

  // Logo SVG Component (simplified version of your icon)


  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Mohon isi semua field');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email.trim().toLowerCase(), password);
      if (result.error) {
        if (result.error.message.includes('Invalid login credentials')) {
          Alert.alert('Login Gagal', 'Email atau password salah. Pastikan Anda sudah terdaftar.');
        } else if (result.error.message.includes('Email not confirmed')) {
          Alert.alert('Email Belum Dikonfirmasi', 'Silakan cek email Anda untuk konfirmasi akun.');
        } else {
          Alert.alert('Error', result.error.message);
        }
      }
      // Success case handled by auth state change
    } catch (err) {
      console.error('SignIn UI error:', err);
      Alert.alert('Error', 'Terjadi kesalahan tidak terduga');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!email || !password || !confirmPassword || !firstName) {
      Alert.alert('Error', 'Mohon isi semua field yang wajib (Last name opsional)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(
        email.trim().toLowerCase(), 
        password, 
        firstName.trim(), 
        lastName.trim() || null
      );
      if (result.error) {
        if (result.error.message.includes('already registered')) {
          Alert.alert('Error', 'Email sudah terdaftar. Silakan gunakan email lain atau login.');
        } else if (result.error.message.includes('User already registered')) {
          Alert.alert('Error', 'Email sudah terdaftar. Silakan gunakan email lain atau login.');
        } else {
          Alert.alert('Error', result.error.message);
        }
      } else {
        Alert.alert(
          'Registrasi Berhasil!', 
          'Akun Anda telah dibuat. Silakan login dengan email dan password yang baru dibuat.',
          [
            {
              text: 'Login Sekarang',
              onPress: () => {
                setCurrentScreen('signin');
                // Keep email, clear others
                setPassword('');
                setConfirmPassword('');
                setFirstName('');
                setLastName('');
              }
            }
          ]
        );
      }
    } catch (err) {
      console.error('Register UI error:', err);
      Alert.alert('Error', 'Terjadi kesalahan tidak terduga');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setCurrentScreen('register-info');
  };

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <View className="mb-8 items-center">
            <Text 
              className="text-2xl text-gray-800 mb-6"
              style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: 24,
                color: '#374151'
              }}
            >
              Welcome to
            </Text>
            
            <View className="mb-8">
              <LogoIcon width={125} height={126} />
            </View>
            
            <Text 
              className="text-3xl mb-2"
              style={{
                fontFamily: 'Poppins_700Bold',
                fontSize: 32,
                color: '#461C07',
                letterSpacing: 2
              }}
            >
              MAKNA
            </Text>
          </View>

          <View className="w-full max-w-sm space-y-4">
            <TouchableOpacity
              onPress={() => setCurrentScreen('register-email')}
              className="rounded-lg py-4 px-6 shadow-sm mb-6"
              style={{ backgroundColor: '#461C07' }}
              activeOpacity={0.8}
            >
              <Text 
                className="text-center text-white text-lg"
                style={{
                  fontFamily: 'Poppins_500Medium',
                  fontSize: 18
                }}
              >
                Register
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentScreen('signin')}
              className="border rounded-lg py-4 px-6"
              style={{ borderColor: '#D1D5DB' }}
              activeOpacity={0.8}
            >
              <Text 
                className="text-center text-lg"
                style={{
                  fontFamily: 'Poppins_500Medium',
                  fontSize: 18,
                  color: '#374151'
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Sign In Screen
  if (currentScreen === 'signin') {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-12">
            <TouchableOpacity
              onPress={() => setCurrentScreen('welcome')}
              className="mb-6"
            >
              <Ionicons name="chevron-back" size={24} color="#374151" />
            </TouchableOpacity>

            <View className="mb-8">
              <Text 
                className="text-2xl mb-2"
                style={{
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: 24,
                  color: '#374151'
                }}
              >
                It's great to have you back!
              </Text>
              <Text 
                className="text-base"
                style={{
                  fontFamily: 'Poppins_400Regular',
                  fontSize: 16,
                  color: '#6B7280'
                }}
              >
                Sign in and continue your journey
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text 
                  className="text-sm mb-2"
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 14,
                    color: '#6B7280'
                  }}
                >
                  Email
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 16,
                    borderColor: '#D1D5DB'
                  }}
                  placeholder=""
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View>
                <Text 
                  className="text-sm mb-2"
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 14,
                    color: '#6B7280'
                  }}
                >
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 pr-12"
                    style={{
                      fontFamily: 'Poppins_400Regular',
                      fontSize: 16,
                      borderColor: '#D1D5DB'
                    }}
                    placeholder=""
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3"
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSignIn}
                disabled={loading}
                className="rounded-lg py-4 mt-6"
                style={{ backgroundColor: '#461C07' }}
                activeOpacity={0.8}
              >
                <Text 
                  className="text-center text-white text-lg"
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 18
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-between items-center mt-4">
                <TouchableOpacity onPress={() => setCurrentScreen('register-email')}>
                  <Text 
                    style={{
                      fontFamily: 'Poppins_400Regular',
                      fontSize: 14,
                      color: '#6B7280'
                    }}
                  >
                    New user? <Text style={{ color: '#461C07' }}>Register</Text>
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity>
                  <Text 
                    style={{
                      fontFamily: 'Poppins_400Regular',
                      fontSize: 14,
                      color: '#461C07'
                    }}
                  >
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text 
                  className="mx-4"
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 14,
                    color: '#6B7280'
                  }}
                >
                  or
                </Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              <TouchableOpacity
                className="border border-gray-300 rounded-lg py-3 flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text 
                  className="ml-3"
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 16,
                    color: '#374151'
                  }}
                >
                  Sign in with google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-lg py-3 flex-row items-center justify-center"
                style={{ backgroundColor: '#000000' }}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text 
                  className="ml-3 text-white"
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 16
                  }}
                >
                  Sign in with apple
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Register Email Screen
  if (currentScreen === 'register-email') {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-12">
            <TouchableOpacity
              onPress={() => setCurrentScreen('welcome')}
              className="mb-6"
            >
              <Ionicons name="chevron-back" size={24} color="#374151" />
            </TouchableOpacity>

            <View className="mb-8 items-center">
              <Text 
                className="text-2xl mb-4 text-center"
                style={{
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: 24,
                  color: '#374151'
                }}
              >
                Please provide your email address
              </Text>
              <Text 
                className="text-base text-center"
                style={{
                  fontFamily: 'Poppins_400Regular',
                  fontSize: 16,
                  color: '#6B7280'
                }}
              >
                We need this information to verify your identity
              </Text>
            </View>

            <View className="space-y-6">
              <View>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 16,
                    borderColor: '#D1D5DB'
                  }}
                  placeholder="Please enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                onPress={handleEmailSubmit}
                className="rounded-lg py-4"
                style={{ backgroundColor: '#461C07' }}
                activeOpacity={0.8}
              >
                <Text 
                  className="text-center text-white text-lg"
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 18
                  }}
                >
                  Submit
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text 
                  className="mx-4"
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 14,
                    color: '#6B7280'
                  }}
                >
                  or
                </Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              <TouchableOpacity
                className="border border-gray-300 rounded-lg py-3 flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text 
                  className="ml-3"
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 16,
                    color: '#374151'
                  }}
                >
                  Register with google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-lg py-3 flex-row items-center justify-center"
                style={{ backgroundColor: '#000000' }}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text 
                  className="ml-3 text-white"
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 16
                  }}
                >
                  Register with apple
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Register Info Screen
  if (currentScreen === 'register-info') {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-12">
            <TouchableOpacity
              onPress={() => setCurrentScreen('register-email')}
              className="mb-6"
            >
              <Ionicons name="chevron-back" size={24} color="#374151" />
            </TouchableOpacity>

            <View className="mb-8">
              <Text 
                className="text-2xl mb-2"
                style={{
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: 24,
                  color: '#374151'
                }}
              >
                It's a pleasure to meet you!
              </Text>
              <Text 
                className="text-base"
                style={{
                  fontFamily: 'Poppins_400Regular',
                  fontSize: 16,
                  color: '#6B7280'
                }}
              >
                Sign up and get started
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 16,
                    borderColor: '#D1D5DB'
                  }}
                  placeholder="Please enter your first name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 16,
                    borderColor: '#D1D5DB'
                  }}
                  placeholder="Please enter your last name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 pr-12"
                    style={{
                      fontFamily: 'Poppins_400Regular',
                      fontSize: 16,
                      borderColor: '#D1D5DB'
                    }}
                    placeholder="Please enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3"
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <View className="relative">
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 pr-12"
                    style={{
                      fontFamily: 'Poppins_400Regular',
                      fontSize: 16,
                      borderColor: '#D1D5DB'
                    }}
                    placeholder="Confirmation password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3"
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleRegisterSubmit}
                disabled={loading}
                className="rounded-lg py-4 mt-6"
                style={{ backgroundColor: '#461C07' }}
                activeOpacity={0.8}
              >
                <Text 
                  className="text-center text-white text-lg"
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 18
                  }}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center justify-center mt-4">
                <Ionicons name="checkmark-circle" size={16} color="#461C07" />
                <Text 
                  className="ml-2 text-sm"
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 12,
                    color: '#6B7280'
                  }}
                >
                  By clicking "Agree," you accept the{' '}
                  <Text style={{ color: '#3B82F6' }}>terms</Text> and{' '}
                  <Text style={{ color: '#3B82F6' }}>conditions</Text>.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return null;
}
