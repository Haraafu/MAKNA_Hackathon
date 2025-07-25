import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { TripService } from '../lib/tripService';

export default function TestQRData({ onTripStart, onClose }) {
  const { user } = useAuth();

  const testQRCodes = [
    {
      name: 'Candi Borobudur',
      qrData: 'BOROBUDUR_QR_2024',
      location: 'Magelang, Jawa Tengah'
    },
    {
      name: 'Candi Prambanan', 
      qrData: 'PRAMBANAN_QR_2024',
      location: 'Yogyakarta'
    }
  ];

  const testStartTrip = async (qrData, situsName) => {
    try {
      Alert.alert(
        'Test QR Code',
        `Menggunakan QR code test untuk ${situsName}. Apakah Anda ingin melanjutkan?`,
        [
          { text: 'Batal', style: 'cancel' },
          { 
            text: 'Ya', 
            onPress: async () => {
              const result = await TripService.startTrip(user.id, qrData);
              
              if (result.success) {
                const { trip_uid, situs_info, total_buildings } = result.data;
                
                Alert.alert(
                  'Perjalanan Test Dimulai!',
                  `Selamat datang di ${situs_info.nama_situs}!\n\nAnda akan mengunjungi ${total_buildings} bangunan bersejarah.`,
                  [
                    {
                      text: 'Mulai Jelajahi',
                      onPress: () => {
                        onTripStart({
                          tripId: trip_uid,
                          situsInfo: situs_info,
                          totalBuildings: total_buildings
                        });
                        onClose();
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Gagal', result.error);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat memulai test trip');
    }
  };

  return (
    <View className="flex-1 bg-batik-50">
      {/* Header */}
      <View className="bg-batik-700 px-4 py-12 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={onClose} className="bg-batik-600 p-2 rounded-full">
            <Ionicons name="close" size={24} color="#F5EFE7" />
          </TouchableOpacity>
          <Text className="text-batik-100 text-lg font-bold">Test QR Codes</Text>
          <View className="w-10" />
        </View>
      </View>

      <View className="flex-1 px-4 py-6">
        <View className="bg-blue-100 rounded-xl p-4 mb-6">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={24} color="#1E40AF" />
            <Text className="text-blue-800 font-bold ml-2">Mode Testing</Text>
          </View>
          <Text className="text-blue-700 text-sm mt-2">
            Gunakan QR code test di bawah untuk mencoba sistem perjalanan tanpa perlu scan QR fisik.
          </Text>
        </View>

        <Text className="text-batik-800 text-lg font-bold mb-4">QR Codes Tersedia</Text>
        
        {testQRCodes.map((qr, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => testStartTrip(qr.qrData, qr.name)}
            className="bg-white rounded-xl p-4 mb-3 border border-batik-200"
          >
            <View className="flex-row items-center">
              <View className="bg-batik-600 w-12 h-12 rounded-full justify-center items-center">
                <Ionicons name="qr-code" size={24} color="white" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-batik-800 font-bold text-lg">{qr.name}</Text>
                <Text className="text-batik-600 text-sm">{qr.location}</Text>
                <Text className="text-batik-500 text-xs">QR: {qr.qrData}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6F4E37" />
            </View>
          </TouchableOpacity>
        ))}

        <View className="mt-6 bg-yellow-100 rounded-xl p-4">
          <View className="flex-row items-center">
            <Ionicons name="warning" size={20} color="#D97706" />
            <Text className="text-yellow-800 font-bold ml-2">Catatan</Text>
          </View>
          <Text className="text-yellow-700 text-sm mt-2">
            Pastikan database telah dijalankan dengan script SQL yang telah disediakan untuk menggunakan fitur ini.
          </Text>
        </View>
      </View>
    </View>
  );
} 