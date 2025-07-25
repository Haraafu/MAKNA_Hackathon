import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import TabNavigation from '../components/TabNavigation';
import SplashScreen from '../components/SplashScreen';
import LoadingScreen from '../components/LoadingScreen';
import AuthScreen from '../components/screens/AuthScreen';
import { useAuthContext } from '../contexts/AuthContext';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, loading } = useAuthContext();

  useEffect(() => {
    // Hide splash screen after a delay
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <>
        <StatusBar style="light" backgroundColor="#6F4E37" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#FAF7F0" />
        <LoadingScreen message="Setting up your experience..." />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar style="light" backgroundColor="#6F4E37" />
        <AuthScreen />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FAF7F0" />
      <TabNavigation />
    </>
  );
}