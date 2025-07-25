import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UnauthenticatedMessage({ 
  title = "Login Diperlukan", 
  message = "Masuk untuk mengakses fitur ini dan menyimpan progress Anda.",
  onLoginPress 
}) {
  return (
    <View className="flex-1 justify-center items-center px-6 bg-batik-50">
      <View className="bg-white rounded-2xl p-8 items-center border border-batik-200 shadow-lg">
        <View className="bg-batik-100 w-16 h-16 rounded-full justify-center items-center mb-4">
          <Ionicons name="lock-closed" size={32} color="#6F4E37" />
        </View>
        
        <Text className="text-batik-800 text-xl font-bold text-center mb-2">
          {title}
        </Text>
        
        <Text className="text-batik-600 text-center mb-6 leading-6">
          {message}
        </Text>
        
        {onLoginPress && (
          <TouchableOpacity
            onPress={onLoginPress}
            className="bg-batik-700 px-8 py-3 rounded-xl"
          >
            <Text className="text-batik-100 font-semibold text-center">
              Masuk Sekarang
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
