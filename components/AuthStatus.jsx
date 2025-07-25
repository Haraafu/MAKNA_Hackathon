import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';

export default function AuthStatus() {
  const { user, signOut } = useAuthContext();

  const handleSignOut = async () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Gagal logout');
            }
          },
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <View className="flex-row items-center justify-between bg-batik-100 p-4 border-b border-batik-200">
      <View className="flex-1">
        <Text className="text-batik-800 font-semibold text-base">
          {user.user_metadata?.full_name || user.email}
        </Text>
        <Text className="text-batik-600 text-sm">
          @{user.user_metadata?.username || 'user'}
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-batik-700 px-4 py-2 rounded-lg flex-row items-center"
      >
        <Ionicons name="log-out-outline" size={16} color="#F5EFE7" />
        <Text className="text-batik-100 ml-2 font-medium">Keluar</Text>
      </TouchableOpacity>
    </View>
  );
}
