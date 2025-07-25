import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';

export default function EditProfileModal({ visible, onClose, onSuccess }) {
  const { user, profile, updateProfile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [username, setUsername] = useState(profile?.username || user?.user_metadata?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || user?.user_metadata?.phone_number || '');
  const [website, setWebsite] = useState(profile?.website || '');

  const handleSave = async () => {
    if (!fullName.trim() || !username.trim()) {
      Alert.alert('Error', 'Nama lengkap dan username harus diisi');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username minimal 3 karakter');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateProfile({
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        phone_number: phoneNumber.trim(),
        website: website.trim(),
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Berhasil', 'Profile berhasil diperbarui');
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan profile');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName(profile?.full_name || user?.user_metadata?.full_name || '');
    setUsername(profile?.username || user?.user_metadata?.username || '');
    setPhoneNumber(profile?.phone_number || user?.user_metadata?.phone_number || '');
    setWebsite(profile?.website || '');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-batik-50">
        {/* Header */}
        <View className="bg-batik-700 px-4 py-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#F5EFE7" />
          </TouchableOpacity>
          
          <Text className="text-batik-100 text-lg font-bold">Edit Profile</Text>
          
          <TouchableOpacity onPress={resetForm}>
            <Text className="text-batik-200 font-medium">Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          <View className="bg-white rounded-2xl p-6 border border-batik-200">
            {/* Avatar Placeholder */}
            <View className="items-center mb-6">
              <View className="bg-batik-500 w-20 h-20 rounded-full justify-center items-center mb-2">
                <Ionicons name="person" size={40} color="white" />
              </View>
              <TouchableOpacity className="bg-batik-100 px-3 py-1 rounded-full">
                <Text className="text-batik-700 text-sm">Ubah Foto</Text>
              </TouchableOpacity>
            </View>

            {/* Full Name */}
            <View className="mb-4">
              <Text className="text-batik-700 text-sm font-medium mb-2">Nama Lengkap *</Text>
              <View className="bg-batik-50 rounded-xl px-4 py-3 border border-batik-200">
                <TextInput
                  className="text-batik-800"
                  placeholder="Masukkan nama lengkap"
                  placeholderTextColor="#A0522D"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Username */}
            <View className="mb-4">
              <Text className="text-batik-700 text-sm font-medium mb-2">Username *</Text>
              <View className="bg-batik-50 rounded-xl px-4 py-3 border border-batik-200">
                <TextInput
                  className="text-batik-800"
                  placeholder="Minimal 3 karakter"
                  placeholderTextColor="#A0522D"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View className="mb-4">
              <Text className="text-batik-700 text-sm font-medium mb-2">Nomor Telepon</Text>
              <View className="bg-batik-50 rounded-xl px-4 py-3 border border-batik-200">
                <TextInput
                  className="text-batik-800"
                  placeholder="08xxxxxxxxxx"
                  placeholderTextColor="#A0522D"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Website */}
            <View className="mb-4">
              <Text className="text-batik-700 text-sm font-medium mb-2">Website</Text>
              <View className="bg-batik-50 rounded-xl px-4 py-3 border border-batik-200">
                <TextInput
                  className="text-batik-800"
                  placeholder="https://website-anda.com"
                  placeholderTextColor="#A0522D"
                  value={website}
                  onChangeText={setWebsite}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>
            </View>

            {/* Email (Read Only) */}
            <View className="mb-6">
              <Text className="text-batik-700 text-sm font-medium mb-2">Email</Text>
              <View className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-300">
                <Text className="text-gray-600">{user?.email}</Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1">Email tidak dapat diubah</Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className={`bg-batik-700 rounded-xl py-4 ${loading ? 'opacity-50' : ''}`}
            >
              <Text className="text-batik-100 text-center font-bold text-lg">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
