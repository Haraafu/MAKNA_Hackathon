import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../../lib/supabase';
import OverviewScreen from './OverviewScreen';
import TriviaScreen from './TriviaScreen';

export default function SitusDetailScreen({ situs, onClose, onStartTrip }) {
  const [showOverview, setShowOverview] = useState(false);
  const [showTrivia, setShowTrivia] = useState(false);

  // Debug log untuk memastikan data situs diterima dengan benar
  console.log('📍 SitusDetailScreen received situs data:', situs);

  const handleStartGameJourney = () => {
    console.log('🚀 Starting game journey for:', situs.nama_situs);
    setShowOverview(true);
  };

  const handleStartTrivia = () => {
    setShowOverview(false);
    setShowTrivia(true);
  };

  const handleTriviaComplete = (result) => {
    setShowTrivia(false);
    // You can handle the result here (show badge earned, etc.)
    console.log('Trivia completed:', result);
  };

  const handleCloseOverview = () => {
    setShowOverview(false);
  };

  const handleCloseTrivia = () => {
    setShowTrivia(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
        <TouchableOpacity
          onPress={onClose}
          className="p-2"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Text 
          className="text-lg font-medium"
          style={{
            fontFamily: 'Poppins_500Medium',
            fontSize: 18,
            color: '#1F2937'
          }}
        >
          Situs Details
        </Text>
        
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {situs.image_situs ? (
          <Image 
            source={{ 
              uri: getImageUrl(situs.image_situs),
              headers: {
                Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
              },
              cache: 'force-cache'
            }}
            className="h-48 w-full"
            style={{ resizeMode: 'cover' }}
            onError={(e) => {
              console.error('Image load error:', e.nativeEvent.error);
            }}
          />
        ) : (
          <View 
            className="h-48 bg-gray-200 justify-center items-center"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <Ionicons name="image-outline" size={64} color="#9CA3AF" />
          </View>
        )}

        {/* Content */}
        <View className="px-6 py-6">
          {/* Title and Location */}
          <Text 
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 24,
              color: '#1F2937'
            }}
          >
            {situs.nama_situs}
          </Text>
          
          <View className="flex-row items-center mb-4">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text 
              className="ml-2 text-base"
              style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: 16,
                color: '#6B7280'
              }}
            >
              {situs.lokasi_daerah}
            </Text>
          </View>

          {/* Brief Info Cards */}
          <View className="flex-row justify-between mb-6">
            {situs.tahun_dibangun && (
              <View className="bg-gray-50 rounded-xl p-4 flex-1 mr-2">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="time-outline" size={16} color="#461C07" />
                  <Text 
                    className="ml-2 text-sm font-medium"
                    style={{
                      fontFamily: 'Poppins_500Medium',
                      fontSize: 12,
                      color: '#461C07'
                    }}
                  >
                    Built Year
                  </Text>
                </View>
                <Text 
                  className="text-lg font-bold"
                  style={{
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 16,
                    color: '#1F2937'
                  }}
                >
                  {situs.tahun_dibangun}
                </Text>
              </View>
            )}
            
            {situs.estimated_duration_minutes && (
              <View className="bg-gray-50 rounded-xl p-4 flex-1 ml-2">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="hourglass-outline" size={16} color="#461C07" />
                  <Text 
                    className="ml-2 text-sm font-medium"
                    style={{
                      fontFamily: 'Poppins_500Medium',
                      fontSize: 12,
                      color: '#461C07'
                    }}
                  >
                    Duration
                  </Text>
                </View>
                <Text 
                  className="text-lg font-bold"
                  style={{
                    fontFamily: 'Poppins_600SemiBold',
                    fontSize: 16,
                    color: '#1F2937'
                  }}
                >
                  {situs.estimated_duration_minutes} min
                </Text>
              </View>
            )}
          </View>

          {/* Buildings Count */}
          {situs.bangunan_count && situs.bangunan_count[0]?.count > 0 && (
            <View className="bg-orange-50 rounded-xl p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons name="business-outline" size={16} color="#461C07" />
                <Text 
                  className="ml-2 text-sm font-medium"
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 14,
                    color: '#461C07'
                  }}
                >
                  Buildings to Explore
                </Text>
              </View>
              <Text 
                className="text-2xl font-bold"
                style={{
                  fontFamily: 'Poppins_700Bold',
                  fontSize: 24,
                  color: '#1F2937'
                }}
              >
                {situs.bangunan_count[0].count} Buildings
              </Text>
            </View>
          )}

          {/* Description */}
          <View className="mb-8">
            <Text 
              className="text-lg font-bold mb-3"
              style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 18,
                color: '#1F2937'
              }}
            >
              About this place
            </Text>
            
            <Text 
              className="text-base leading-6"
              style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: 16,
                color: '#4B5563',
                lineHeight: 24
              }}
            >
              {situs.informasi_situs || 'Step into history and discover the cultural significance of this remarkable heritage site. Experience the stories, traditions, and architectural marvels that have stood the test of time.'}
            </Text>
          </View>



          {/* Features List */}
          <View className="mb-8">
            <Text 
              className="text-lg font-bold mb-4"
              style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 18,
                color: '#1F2937'
              }}
            >
              What you'll experience
            </Text>
            
            {[
              'Interactive historical storytelling',
              'Educational trivia questions',
              'Cultural significance insights', 
              'Heritage badge rewards',
              'Guided exploration experience'
            ].map((feature, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <View className="w-6 h-6 bg-green-100 rounded-full justify-center items-center mr-3">
                  <Ionicons name="checkmark" size={14} color="#10B981" />
                </View>
                <Text 
                  className="flex-1 text-base"
                  style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 16,
                    color: '#4B5563'
                  }}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="px-6 py-4 border-t border-gray-200">
        <TouchableOpacity
          onPress={handleStartGameJourney}
          className="rounded-xl py-4"
          style={{ backgroundColor: '#461C07' }}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
            <Text 
              className="ml-2 text-center text-white text-lg font-medium"
              style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 18
              }}
            >
              Mulai Pertualangan
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Overview Modal */}
      <Modal
        visible={showOverview}
        animationType="slide"
        onRequestClose={handleCloseOverview}
      >
        <OverviewScreen
          situs={situs}
          onClose={handleCloseOverview}
          onStartTrivia={handleStartTrivia}
        />
      </Modal>

      {/* Trivia Modal */}
      <Modal
        visible={showTrivia}
        animationType="slide"
        onRequestClose={handleCloseTrivia}
      >
        <TriviaScreen
          situs={situs}
          onClose={handleCloseTrivia}
          onTriviaComplete={handleTriviaComplete}
        />
      </Modal>
    </SafeAreaView>
  );
} 