import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TripService } from '../../lib/tripService';
import { getImageUrl } from '../../lib/supabase';
import SitusDetailScreen from './SitusDetailScreen';

export default function ExploreScreen({ onTripStart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [situsData, setSitusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSitus, setSelectedSitus] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadSitusData();
  }, []);

  const loadSitusData = async () => {
    try {
      const result = await TripService.getAvailableSitus();
      if (result.success) {
        setSitusData(result.data);
      }
    } catch (error) {
      console.error('Error loading situs data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSitusData();
  };

  const filteredSitus = situsData.filter(situs =>
    situs.nama_situs.toLowerCase().includes(searchQuery.toLowerCase()) ||
    situs.lokasi_daerah.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSeeDetails = (situs) => {
    setSelectedSitus(situs);
    setShowDetailModal(true);
  };

  const handleStartTrip = (situs) => {
    setShowDetailModal(false);
    // Call the trip start function passed from parent
    if (onTripStart) {
      onTripStart({
        situsInfo: situs,
        totalBuildings: situs.bangunan_count?.[0]?.count || 0
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text style={{
          fontFamily: 'Poppins_400Regular',
          fontSize: 16,
          color: '#6B7280'
        }}>
          Loading destinations...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-6">
        <Text 
          className="text-3xl mb-2"
          style={{
            fontFamily: 'Poppins_600SemiBold',
            fontSize: 28,
            color: '#1F2937'
          }}
        >
          Search
        </Text>
        <Text 
          className="text-base mb-6"
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: 16,
            color: '#6B7280'
          }}
        >
          Discover the best place from Nusantara!
        </Text>
        
        {/* Search Input */}
        <View className="bg-gray-100 flex-row items-center px-4 py-3 rounded-xl">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="ml-3 flex-1"
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: 16,
              color: '#1F2937'
            }}
          />
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Grid Layout */}
        <View className="flex-row flex-wrap justify-between">
          {filteredSitus.map((situs, index) => (
            <View key={situs.uid} className="w-[48%] mb-6">
              {/* Card Image */}
              {situs.image_situs ? (
                <Image 
                  source={{ 
                    uri: getImageUrl(situs.image_situs),
                    headers: {
                      Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    },
                    cache: 'force-cache'
                  }}
                  className="w-full h-32 rounded-t-xl"
                  style={{ resizeMode: 'cover' }}
                  onError={(e) => {
                    console.error('Image load error:', e.nativeEvent.error);
                  }}
                />
              ) : (
                <View 
                  className="w-full h-32 bg-gray-200 rounded-t-xl justify-center items-center"
                  style={{ backgroundColor: '#F3F4F6' }}
                >
                  <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                </View>
              )}
              
              {/* Card Content */}
              <View className="bg-white border border-gray-200 rounded-b-xl p-3">
                <Text 
                  className="text-sm font-medium mb-1"
                  numberOfLines={2}
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 14,
                    color: '#1F2937'
                  }}
                >
                  {situs.nama_situs}
                </Text>
                <Text 
                  className="text-xs mb-3"
                  numberOfLines={1}
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 12,
                    color: '#6B7280'
                  }}
                >
                  {situs.lokasi_daerah}
                </Text>
                
                <TouchableOpacity
                  onPress={() => handleSeeDetails(situs)}
                  className="rounded-lg py-2 px-3"
                  style={{ backgroundColor: '#461C07' }}
                  activeOpacity={0.8}
                >
                  <Text 
                    className="text-center text-white text-xs"
                    style={{
                      fontFamily: 'Poppins_500Medium',
                      fontSize: 12
                    }}
                  >
                    See Details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Empty State */}
        {filteredSitus.length === 0 && (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="search-outline" size={64} color="#D1D5DB" />
            <Text 
              className="mt-4 text-center"
              style={{
                fontFamily: 'Poppins_500Medium',
                fontSize: 18,
                color: '#6B7280'
              }}
            >
              No destinations found
            </Text>
            <Text 
              className="mt-2 text-center"
              style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: 14,
                color: '#9CA3AF'
              }}
            >
              Try searching with different keywords
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>

      {/* Situs Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        {selectedSitus && (
          <SitusDetailScreen 
            situs={selectedSitus}
            onClose={() => setShowDetailModal(false)}
            onStartTrip={() => handleStartTrip(selectedSitus)}
          />
        )}
      </Modal>
    </View>
  );
}
