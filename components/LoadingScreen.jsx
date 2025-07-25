import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BatikPattern from './BatikPattern';

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <View className="flex-1 bg-batik-50 justify-center items-center relative">
      <BatikPattern />
      
      <View className="items-center relative z-10">
        {/* App Logo/Icon */}
        <View className="bg-batik-700 w-20 h-20 rounded-full justify-center items-center mb-6">
          <Ionicons name="diamond" size={40} color="#F5EFE7" />
        </View>
        
        {/* Loading Spinner */}
        <ActivityIndicator size="large" color="#6F4E37" />
        
        {/* Loading Text */}
        <Text className="text-batik-700 text-lg font-medium mt-4">{message}</Text>
        <Text className="text-batik-500 text-sm mt-2">Please wait...</Text>
      </View>
    </View>
  );
}
