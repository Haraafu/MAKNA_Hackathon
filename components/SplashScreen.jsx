import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BatikPattern from './BatikPattern';

export default function SplashScreen({ onFinish }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto finish after 2.5 seconds
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-batik-700 justify-center items-center relative">
      <BatikPattern className="opacity-10" />
      
      <Animated.View 
        className="items-center relative z-10"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* App Logo */}
        <View className="bg-batik-600 w-24 h-24 rounded-full justify-center items-center mb-6 border-4 border-batik-100">
          <Ionicons name="library" size={48} color="#F5EFE7" />
        </View>
        
        {/* App Name */}
        <Text className="text-batik-100 text-4xl font-bold mb-2">MAKNA</Text>
        <Text className="text-batik-200 text-lg text-center">Jelajahi Cerita Budaya Indonesia</Text>
        
        {/* Tagline */}
        <View className="mt-4">
          <Text className="text-batik-300 text-sm text-center">Pengalaman Wisata Budaya Interaktif</Text>
        </View>
        
        {/* Loading indicator */}
        <View className="mt-8 flex-row space-x-2">
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              className="w-2 h-2 bg-batik-200 rounded-full"
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              }}
            />
          ))}
        </View>
      </Animated.View>
      
      {/* Bottom Text */}
      <Animated.View 
        className="absolute bottom-10 items-center"
        style={{ opacity: fadeAnim }}
      >
        <Text className="text-batik-300 text-sm">Dibuat dengan ❤️ untuk Budaya Indonesia</Text>
      </Animated.View>
    </View>
  );
}
