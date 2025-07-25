import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform, TextInput } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { TripService } from '../../lib/tripService';

export default function QRScannerScreen({ onSitusFound, onClose }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualQRInput, setManualQRInput] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      };
      getCameraPermissions();
    }

    // Debug: Load all situs data when component mounts
    const loadAllSitusData = async () => {
      console.log('🔍 Loading all situs data for debugging...');
      try {
        const result = await TripService.getAllSitusData();
        if (result.success) {
          console.log('📊 Situs data loaded successfully');
        } else {
          console.log('❌ Failed to load situs data:', result.error);
        }
      } catch (error) {
        console.log('❌ Error loading situs data:', error);
      }
    };

    loadAllSitusData();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;
    
    console.log('🔍 QR Code scanned:', data);
    setScanned(true);
    setLoading(true);

    try {
      // Find situs by QR code
      console.log('🔎 Searching for situs with QR code:', data);
      const result = await TripService.findSitusByQRCode(data);
      
      if (!result.success) {
        console.log('❌ QR Code not found:', result.error);
        Alert.alert(
          '❌ QR Code Tidak Valid',
          result.error || 'QR code yang Anda scan tidak ditemukan dalam sistem MAKNA Heritage.\n\n💡 Pastikan Anda scan QR code yang valid dari situs bersejarah yang terdaftar.',
          [{ text: 'Coba Lagi', onPress: () => setScanned(false) }]
        );
        setLoading(false);
        return;
      }

      const situsInfo = result.data;
      console.log('✅ Situs found:', situsInfo.nama_situs);

      // Show confirmation before showing situs details
      Alert.alert(
        '🏛️ Situs Bersejarah Ditemukan!',
        `${situsInfo.nama_situs}\n📍 ${situsInfo.lokasi_daerah}\n⏱️ Estimasi durasi: ${situsInfo.estimated_duration_minutes} menit\n🏛️ ${situsInfo.bangunan_count?.[0]?.count || 0} bangunan untuk dijelajahi\n\n✨ Mulai petualangan sejarah Anda sekarang!`,
        [
          {
            text: 'Batal',
            style: 'cancel',
            onPress: () => {
              setScanned(false);
              setLoading(false);
            }
          },
          {
            text: '🚀 Mulai Jelajahi',
            onPress: () => {
              setLoading(false);
              onSitusFound(situsInfo);
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat memproses QR code');
      setScanned(false);
      setLoading(false);
    }
  };

  const handleManualQRSubmit = () => {
    if (!manualQRInput.trim()) {
      Alert.alert('Error', 'Masukkan kode QR terlebih dahulu');
      return;
    }
    handleBarCodeScanned({ type: 'qr', data: manualQRInput.trim() });
  };

  // Web version - Manual QR input
  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-batik-50">
        {/* Header */}
        <View className="bg-batik-700 px-4 py-12 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={onClose} className="bg-batik-600 p-2 rounded-full">
              <Ionicons name="close" size={24} color="#F5EFE7" />
            </TouchableOpacity>
            <Text className="text-batik-100 text-lg font-bold">QR Scanner - Situs Details</Text>
            <View className="w-10" />
          </View>
        </View>

        <View className="flex-1 px-4 py-6">
          <View className="bg-blue-100 rounded-xl p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={24} color="#1E40AF" />
              <Text className="text-blue-800 font-bold ml-2">Web Version</Text>
            </View>
            <Text className="text-blue-700 text-sm mt-2">
              Camera scanning tidak tersedia di web. Masukkan kode QR secara manual untuk melihat detail situs bersejarah.
            </Text>
          </View>

          <Text className="text-batik-800 text-lg font-bold mb-4">Manual QR Input</Text>
          
          <View className="bg-white rounded-xl p-4 mb-4 border border-batik-200">
            <Text className="text-batik-700 text-sm mb-2">Masukkan Kode QR:</Text>
            <TextInput
              className="border border-batik-200 rounded-lg px-3 py-2 mb-4"
              placeholder="Contoh: BOROBUDUR_QR_2024"
              value={manualQRInput}
              onChangeText={setManualQRInput}
              autoCapitalize="characters"
            />
            
            <TouchableOpacity
              onPress={handleManualQRSubmit}
              disabled={loading}
              className="bg-batik-600 py-3 rounded-lg"
            >
              <Text className="text-white font-bold text-center">
                {loading ? 'Memproses...' : 'Lihat Detail Situs'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-yellow-100 rounded-xl p-4 mb-4">
            <Text className="text-yellow-800 font-bold mb-2">🎯 QR Codes Tersedia untuk Testing:</Text>
            <View className="space-y-1">
              <View className="flex-row items-center">
                <Text className="text-yellow-700 text-sm mr-2">🏛️</Text>
                <Text className="text-yellow-700 text-sm font-medium">BOROBUDUR_QR_2024</Text>
                <Text className="text-yellow-600 text-xs ml-2">(QR Code Data)</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-yellow-700 text-sm mr-2">🏛️</Text>
                <Text className="text-yellow-700 text-sm font-medium">PRAMBANAN_QR_2024</Text>
                <Text className="text-yellow-600 text-xs ml-2">(QR Code Data)</Text>
              </View>
            </View>
            <View className="mt-2 p-2 bg-yellow-50 rounded">
              <Text className="text-yellow-700 text-xs">
                UID Borobudur: bc28eb34-ddae-4504-932d-7d45efda169e
              </Text>
              <Text className="text-yellow-700 text-xs">
                UID Prambanan: b862f681-baa9-4406-a303-8fad75ef480a
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setManualQRInput('BOROBUDUR_QR_2024');
              setTimeout(() => handleManualQRSubmit(), 100);
            }}
            className="bg-amber-500 py-3 rounded-lg mb-3 flex-row items-center justify-center"
          >
            <Text className="text-white text-sm mr-2">🏛️</Text>
            <Text className="text-white font-bold text-center">Test: Candi Borobudur (QR Code)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setManualQRInput('PRAMBANAN_QR_2024');
              setTimeout(() => handleManualQRSubmit(), 100);
            }}
            className="bg-purple-500 py-3 rounded-lg mb-3 flex-row items-center justify-center"
          >
            <Text className="text-white text-sm mr-2">🏛️</Text>
            <Text className="text-white font-bold text-center">Test: Candi Prambanan (QR Code)</Text>
          </TouchableOpacity>

          <Text className="text-batik-800 text-sm font-bold mb-2 mt-4">🔍 Test dengan UID Langsung:</Text>

          <TouchableOpacity
            onPress={() => {
              setManualQRInput('bc28eb34-ddae-4504-932d-7d45efda169e');
              setTimeout(() => handleManualQRSubmit(), 100);
            }}
            className="bg-green-600 py-3 rounded-lg mb-3 flex-row items-center justify-center"
          >
            <Text className="text-white text-sm mr-2">🆔</Text>
            <Text className="text-white font-bold text-center">Test: Borobudur (UID)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setManualQRInput('b862f681-baa9-4406-a303-8fad75ef480a');
              setTimeout(() => handleManualQRSubmit(), 100);
            }}
            className="bg-green-600 py-3 rounded-lg flex-row items-center justify-center"
          >
            <Text className="text-white text-sm mr-2">🆔</Text>
            <Text className="text-white font-bold text-center">Test: Prambanan (UID)</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View className="absolute inset-0 bg-black/50 justify-center items-center">
            <View className="bg-white rounded-xl p-6 items-center">
              <Ionicons name="hourglass-outline" size={32} color="#6F4E37" />
              <Text className="text-batik-700 font-bold mt-2">Memproses...</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Mobile version with camera
  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center bg-batik-50">
        <Text className="text-batik-700">Meminta izin kamera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center bg-batik-50 px-6">
        <Ionicons name="camera-outline" size={64} color="#6F4E37" />
        <Text className="text-batik-700 text-lg font-bold mt-4 text-center">
          Izin Kamera Diperlukan
        </Text>
        <Text className="text-batik-600 text-center mt-2">
          Aplikasi memerlukan akses kamera untuk memindai QR code situs bersejarah.
        </Text>
        <TouchableOpacity
          className="bg-batik-600 px-6 py-3 rounded-xl mt-6"
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text className="text-white font-bold">Berikan Izin</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 px-4 py-12">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={onClose} className="bg-white/20 p-2 rounded-full">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Scan QR Code Situs</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417'],
        }}
      >
        {/* Scanning Overlay */}
        <View className="flex-1 justify-center items-center">
          {/* Scanning Frame */}
          <View className="w-64 h-64 relative">
            {/* Corner borders */}
            <View className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white" />
            <View className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white" />
            
            {/* Scanning line animation could go here */}
            <View className="absolute inset-4 border border-white/30 rounded-lg" />
          </View>
        </View>
      </CameraView>

      {/* Instructions */}
      <View className="absolute bottom-0 left-0 right-0 bg-black/70 px-6 py-8">
        <View className="items-center">
          <Ionicons name="qr-code-outline" size={32} color="white" />
          <Text className="text-white font-bold text-lg mt-2">
            Arahkan kamera ke QR Code
          </Text>
          <Text className="text-white/80 text-center mt-1">
            Posisikan QR code di dalam frame untuk melihat detail situs bersejarah
          </Text>
        </View>
      </View>

      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-xl p-6 items-center">
            <Ionicons name="hourglass-outline" size={32} color="#6F4E37" />
            <Text className="text-batik-700 font-bold mt-2">Memproses...</Text>
          </View>
        </View>
      )}
    </View>
  );
} 