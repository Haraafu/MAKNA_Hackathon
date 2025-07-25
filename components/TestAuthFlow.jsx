import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function TestAuthFlow() {
  const [testResults, setTestResults] = useState([]);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('test123456');
  const { user, profile, signIn, signUp, signOut } = useAuthContext();

  const addTestResult = (test, result, details = '') => {
    const newResult = {
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [newResult, ...prev]);
  };

  const testDatabaseTrigger = async () => {
    try {
      addTestResult('Database Trigger Check', 'Testing...', '');
      
      // Check if trigger exists
      const { data, error } = await supabase
        .from('information_schema.triggers')
        .select('*')
        .eq('trigger_name', 'on_auth_user_created');

      if (error) {
        addTestResult('Database Trigger Check', 'ERROR', error.message);
        return;
      }

      if (data && data.length > 0) {
        addTestResult('Database Trigger Check', 'SUCCESS', 'Trigger exists and is active');
      } else {
        addTestResult('Database Trigger Check', 'FAILED', 'Trigger not found - this explains why profiles are not created');
      }
    } catch (err) {
      addTestResult('Database Trigger Check', 'ERROR', err.message);
    }
  };

  const testProfileCreation = async () => {
    if (!user?.id) {
      addTestResult('Profile Creation Test', 'FAILED', 'No user logged in');
      return;
    }

    try {
      addTestResult('Profile Creation Test', 'Testing...', '');
      
      // Check if profile exists
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it manually
        addTestResult('Profile Creation Test', 'INFO', 'Profile missing, creating manually...');
        
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            firstname: user.user_metadata?.firstname || 'Test',
            lastname: user.user_metadata?.lastname || 'User',
            password: '',
            total_badges: 0
          });

        if (createError) {
          addTestResult('Profile Creation Test', 'FAILED', createError.message);
        } else {
          addTestResult('Profile Creation Test', 'SUCCESS', 'Profile created manually');
          
          // Also create badge stats
          const { error: statsError } = await supabase
            .from('profile_badge_stats')
            .insert({
              profile_id: user.id,
              total_badges: 0
            });

          if (statsError) {
            addTestResult('Badge Stats Creation', 'FAILED', statsError.message);
          } else {
            addTestResult('Badge Stats Creation', 'SUCCESS', 'Badge stats created');
          }
        }
      } else if (error) {
        addTestResult('Profile Creation Test', 'FAILED', error.message);
      } else {
        addTestResult('Profile Creation Test', 'SUCCESS', `Profile exists: ${existingProfile.firstname} ${existingProfile.lastname}`);
      }
    } catch (err) {
      addTestResult('Profile Creation Test', 'ERROR', err.message);
    }
  };

  const testCompleteRegistration = async () => {
    try {
      addTestResult('Complete Registration Test', 'Starting...', '');
      
      // First sign out
      await supabase.auth.signOut();
      addTestResult('Complete Registration Test', 'INFO', 'Signed out existing session');
      
      // Try to register with test credentials
      const result = await signUp(testEmail, testPassword, 'Test', 'User');
      
      if (result.error) {
        addTestResult('Complete Registration Test', 'FAILED', result.error.message);
      } else {
        addTestResult('Complete Registration Test', 'SUCCESS', 'Registration completed successfully');
        
        // Wait a moment and check if profile was created
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', testEmail)
            .single();
            
          if (profileData) {
            addTestResult('Profile Verification', 'SUCCESS', `Profile created: ${profileData.firstname} ${profileData.lastname}`);
          } else {
            addTestResult('Profile Verification', 'FAILED', 'Profile was not created after registration');
          }
        }, 2000);
      }
    } catch (err) {
      addTestResult('Complete Registration Test', 'ERROR', err.message);
    }
  };

  const testSignInFlow = async () => {
    try {
      addTestResult('Sign In Test', 'Starting...', '');
      
      const result = await signIn(testEmail, testPassword);
      
      if (result.error) {
        addTestResult('Sign In Test', 'FAILED', result.error.message);
      } else {
        addTestResult('Sign In Test', 'SUCCESS', 'Sign in successful');
      }
    } catch (err) {
      addTestResult('Sign In Test', 'ERROR', err.message);
    }
  };

  const clearTestUser = async () => {
    try {
      addTestResult('Clear Test User', 'Starting...', '');
      
      // Delete from profiles table first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('email', testEmail);

      if (profileError) {
        addTestResult('Clear Test User', 'PARTIAL', `Profile deletion error: ${profileError.message}`);
      }

      // Delete from auth would require admin privileges
      addTestResult('Clear Test User', 'INFO', 'Profile deleted. Auth user deletion requires admin access.');
      
    } catch (err) {
      addTestResult('Clear Test User', 'ERROR', err.message);
    }
  };

  const runFullTest = async () => {
    setTestResults([]);
    addTestResult('Full Test Suite', 'STARTED', 'Running comprehensive authentication tests...');
    
    await testDatabaseTrigger();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testCompleteRegistration();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await testSignInFlow();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (user?.id) {
      await testProfileCreation();
    }
    
    addTestResult('Full Test Suite', 'COMPLETED', 'All tests finished');
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-4">🧪 Authentication System Diagnostics</Text>
      
      {/* Current Status */}
      <View className="mb-4 p-3 bg-gray-100 rounded">
        <Text className="font-semibold">Current Status:</Text>
        <Text>User: {user?.id ? 'Logged in' : 'Not logged in'}</Text>
        <Text>Email: {user?.email || 'N/A'}</Text>
        <Text>Profile: {profile ? 'Loaded' : 'Not loaded'}</Text>
        {profile && (
          <Text>Name: {profile.firstname} {profile.lastname}</Text>
        )}
      </View>

      {/* Test Configuration */}
      <View className="mb-4 p-3 bg-blue-50 rounded">
        <Text className="font-semibold mb-2">Test Configuration:</Text>
        <TextInput
          className="border border-gray-300 rounded px-3 py-2 mb-2"
          placeholder="Test email"
          value={testEmail}
          onChangeText={setTestEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="Test password"
          value={testPassword}
          onChangeText={setTestPassword}
          secureTextEntry
        />
      </View>

      {/* Action Buttons */}
      <View className="mb-4">
        <TouchableOpacity 
          className="bg-blue-500 p-3 rounded mb-2"
          onPress={runFullTest}
        >
          <Text className="text-white text-center font-semibold">🚀 Run Full Test Suite</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-green-500 p-3 rounded mb-2"
          onPress={testDatabaseTrigger}
        >
          <Text className="text-white text-center">🔧 Test Database Trigger</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-orange-500 p-3 rounded mb-2"
          onPress={testCompleteRegistration}
        >
          <Text className="text-white text-center">📝 Test Registration</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-purple-500 p-3 rounded mb-2"
          onPress={testSignInFlow}
        >
          <Text className="text-white text-center">🔑 Test Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-yellow-500 p-3 rounded mb-2"
          onPress={testProfileCreation}
        >
          <Text className="text-white text-center">👤 Test Profile Creation</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-red-500 p-3 rounded mb-2"
          onPress={clearTestUser}
        >
          <Text className="text-white text-center">🗑️ Clear Test User</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-gray-500 p-3 rounded"
          onPress={signOut}
        >
          <Text className="text-white text-center">🚪 Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      <View>
        <Text className="font-bold text-lg mb-2">📋 Test Results:</Text>
        {testResults.map((result, index) => (
          <View 
            key={index} 
            className={`p-3 mb-2 rounded ${
              result.result === 'SUCCESS' ? 'bg-green-100' :
              result.result === 'FAILED' ? 'bg-red-100' :
              result.result === 'ERROR' ? 'bg-red-200' :
              result.result === 'INFO' ? 'bg-blue-100' :
              'bg-gray-100'
            }`}
          >
            <Text className="font-semibold">
              {result.timestamp} - {result.test}: {result.result}
            </Text>
            {result.details ? (
              <Text className="text-sm mt-1">{result.details}</Text>
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
} 