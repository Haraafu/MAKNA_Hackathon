import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { TripService } from '../../lib/tripService';
import BatikPattern from '../BatikPattern';

export default function TripProgressScreen({ tripData, onTripComplete, onClose }) {
  const [buildings, setBuildings] = useState([]);
  const [currentBuildingIndex, setCurrentBuildingIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [visitLoading, setVisitLoading] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState({ visited: 0, total: 0 });
  const { user } = useAuth();

  useEffect(() => {
    loadTripBuildings();
  }, []);

  const loadTripBuildings = async () => {
    try {
      const result = await TripService.getTripBuildings(
        tripData.tripId, 
        tripData.situsInfo.uid
      );
      
      if (result.success) {
        setBuildings(result.data);
        updateProgress(result.data);
        
        // Find current building (first unvisited)
        const currentIndex = result.data.findIndex(building => !building.is_visited);
        setCurrentBuildingIndex(currentIndex === -1 ? 0 : currentIndex);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data bangunan');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = (buildingsList) => {
    const visitedCount = buildingsList.filter(b => b.is_visited).length;
    setProgress({ visited: visitedCount, total: buildingsList.length });
  };

  const handleVisitBuilding = async (buildingId, buildingName, notes = null) => {
    setVisitLoading(true);
    
    try {
      const result = await TripService.visitBuilding(tripData.tripId, buildingId, notes);
      
      if (result.success) {
        const { visited_count, total_count, is_trip_completed, badge_earned } = result.data;
        
        // Update local state
        const updatedBuildings = buildings.map(building => 
          building.uid === buildingId 
            ? { ...building, is_visited: true, visited_at: new Date().toISOString(), notes }
            : building
        );
        setBuildings(updatedBuildings);
        updateProgress(updatedBuildings);

        if (is_trip_completed) {
          // Show completion modal with badge
          Alert.alert(
            '🎉 Perjalanan Selesai!',
            `Selamat! Anda telah menyelesaikan perjalanan di ${tripData.situsInfo.nama_situs}.\n\n🏆 Badge "${badge_earned.badge_title}" telah diterima!`,
            [
              {
                text: 'Lihat Badge',
                onPress: () => onTripComplete(badge_earned)
              }
            ]
          );
        } else {
          // Move to next building
          const nextUnvisitedIndex = updatedBuildings.findIndex(
            (building, index) => index > currentBuildingIndex && !building.is_visited
          );
          
          if (nextUnvisitedIndex !== -1) {
            setCurrentBuildingIndex(nextUnvisitedIndex);
          }
          
          Alert.alert(
            '✅ Kunjungan Tercatat',
            `${buildingName} telah dikunjungi!\n\nProgress: ${visited_count}/${total_count} bangunan`,
            [{ text: 'Lanjutkan' }]
          );
        }
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat mencatat kunjungan');
    } finally {
      setVisitLoading(false);
      setShowNotesModal(false);
      setNotes('');
    }
  };

  const openNotesModal = () => {
    setShowNotesModal(true);
  };

  const submitVisit = () => {
    const currentBuilding = buildings[currentBuildingIndex];
    if (currentBuilding) {
      handleVisitBuilding(currentBuilding.uid, currentBuilding.nama_bangunan, notes);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-batik-50">
        <Ionicons name="hourglass-outline" size={48} color="#6F4E37" />
        <Text className="text-batik-700 text-lg font-bold mt-4">Memuat Perjalanan...</Text>
      </View>
    );
  }

  const currentBuilding = buildings[currentBuildingIndex];
  const progressPercentage = (progress.visited / progress.total) * 100;

  return (
    <View className="flex-1 bg-batik-50">
      {/* Header */}
      <View className="bg-batik-700 px-4 py-6 rounded-b-3xl relative overflow-hidden">
        <BatikPattern />
        <View className="flex-row items-center justify-between mb-4 relative z-10">
          <TouchableOpacity onPress={onClose} className="bg-batik-600 p-2 rounded-full">
            <Ionicons name="arrow-back" size={24} color="#F5EFE7" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-batik-100 text-lg font-bold">{tripData.situsInfo.nama_situs}</Text>
            <Text className="text-batik-200 text-sm">{tripData.situsInfo.lokasi_daerah}</Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Progress Bar */}
        <View className="relative z-10">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-batik-200 text-sm">Progress Perjalanan</Text>
            <Text className="text-batik-100 font-bold">{progress.visited}/{progress.total}</Text>
          </View>
          <View className="bg-batik-600 h-3 rounded-full overflow-hidden">
            <View 
              className="bg-green-400 h-full rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Current Building Card */}
        {currentBuilding && !currentBuilding.is_visited && (
          <View className="bg-white rounded-xl p-4 mb-6 border-2 border-batik-300">
            <View className="flex-row items-center mb-3">
              <View className="bg-batik-600 w-8 h-8 rounded-full justify-center items-center">
                <Text className="text-white font-bold text-sm">{currentBuildingIndex + 1}</Text>
              </View>
              <Text className="text-batik-700 font-bold text-lg ml-3 flex-1">
                {currentBuilding.nama_bangunan}
              </Text>
              <View className="bg-blue-100 px-2 py-1 rounded">
                <Text className="text-blue-600 text-xs font-bold">SAAT INI</Text>
              </View>
            </View>
            
            <Text className="text-batik-600 mb-2">{currentBuilding.jenis_bangunan}</Text>
            <Text className="text-batik-700 mb-4">{currentBuilding.deskripsi}</Text>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => handleVisitBuilding(currentBuilding.uid, currentBuilding.nama_bangunan)}
                disabled={visitLoading}
                className="flex-1 bg-green-500 py-3 rounded-xl flex-row items-center justify-center"
              >
                {visitLoading ? (
                  <Ionicons name="hourglass-outline" size={20} color="white" />
                ) : (
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                )}
                <Text className="text-white font-bold ml-2">
                  {visitLoading ? 'Menyimpan...' : 'Kunjungi'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={openNotesModal}
                disabled={visitLoading}
                className="bg-batik-600 py-3 px-4 rounded-xl"
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Buildings List */}
        <View className="mb-6">
          <Text className="text-batik-800 text-lg font-bold mb-4">Daftar Bangunan</Text>
          {buildings.map((building, index) => (
            <TouchableOpacity
              key={building.uid}
              className={`bg-white rounded-xl p-4 mb-3 border ${
                building.is_visited 
                  ? 'border-green-200 bg-green-50' 
                  : index === currentBuildingIndex
                  ? 'border-batik-300'
                  : 'border-gray-200'
              }`}
              onPress={() => setCurrentBuildingIndex(index)}
            >
              <View className="flex-row items-center">
                <View className={`w-8 h-8 rounded-full justify-center items-center ${
                  building.is_visited 
                    ? 'bg-green-500' 
                    : index === currentBuildingIndex
                    ? 'bg-batik-600'
                    : 'bg-gray-300'
                }`}>
                  {building.is_visited ? (
                    <Ionicons name="checkmark" size={16} color="white" />
                  ) : (
                    <Text className="text-white font-bold text-sm">{index + 1}</Text>
                  )}
                </View>
                
                <View className="ml-3 flex-1">
                  <Text className={`font-bold ${
                    building.is_visited ? 'text-green-700' : 'text-batik-700'
                  }`}>
                    {building.nama_bangunan}
                  </Text>
                  <Text className={`text-sm ${
                    building.is_visited ? 'text-green-600' : 'text-batik-600'
                  }`}>
                    {building.jenis_bangunan}
                  </Text>
                </View>
                
                {building.is_visited && (
                  <View className="items-end">
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    <Text className="text-green-600 text-xs mt-1">
                      {new Date(building.visited_at).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-batik-700 text-lg font-bold">Tambah Catatan</Text>
              <TouchableOpacity onPress={() => setShowNotesModal(false)}>
                <Ionicons name="close" size={24} color="#6F4E37" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-batik-600 mb-3">
              Tambahkan catatan tentang kunjungan Anda ke {currentBuilding?.nama_bangunan}
            </Text>
            
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Tulis catatan Anda di sini..."
              multiline
              numberOfLines={4}
              className="border border-batik-200 rounded-xl p-3 text-batik-700 mb-4"
              style={{ textAlignVertical: 'top' }}
            />
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowNotesModal(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl"
              >
                <Text className="text-gray-700 font-bold text-center">Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={submitVisit}
                disabled={visitLoading}
                className="flex-1 bg-batik-600 py-3 rounded-xl"
              >
                <Text className="text-white font-bold text-center">
                  {visitLoading ? 'Menyimpan...' : 'Kunjungi'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 