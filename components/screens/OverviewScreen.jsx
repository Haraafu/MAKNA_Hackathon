import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TripService } from '../../lib/tripService';
import { useAuthContext } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function OverviewScreen({ situs, onClose, onStartTrivia }) {
  const [overviewData, setOverviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const { user } = useAuthContext();

  useEffect(() => {
    loadOverviewData();
    startOverviewSession();
  }, []);

  const loadOverviewData = async () => {
    try {
      const result = await TripService.getSitusOverview(situs.uid);
      if (result.success) {
        setOverviewData(result.data);
      }
    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startOverviewSession = async () => {
    try {
      if (user?.id) {
        await TripService.startGameSession(user.id, situs.uid, 'overview');
      }
    } catch (error) {
      console.error('Error starting overview session:', error);
    }
  };

  const handleNext = () => {
    if (currentPage < overviewData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onStartTrivia();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderProgressBar = () => {
    return (
      <View className="flex-row justify-center mb-6">
        {overviewData.map((_, index) => (
          <View
            key={index}
            className="h-1 mx-1 rounded-full"
            style={{
              width: width / overviewData.length - 16,
              backgroundColor: index <= currentPage ? '#461C07' : '#E5E7EB'
            }}
          />
        ))}
      </View>
    );
  };

  const renderOverviewContent = (content, index) => {
    return (
      <View key={index} className="flex-1">
        {/* Hero Section */}
        <View className="h-64 bg-gradient-to-b from-amber-100 to-amber-50 justify-center items-center px-6">
          <View className="bg-white rounded-full p-4 mb-4 shadow-lg">
            <Ionicons 
              name={index === 0 ? "library-outline" : index === 1 ? "home-outline" : index === 2 ? "document-text-outline" : index === 3 ? "time-outline" : "heart-outline"} 
              size={48} 
              color="#461C07" 
            />
          </View>
          <Text 
            className="text-2xl font-bold text-center"
            style={{
              fontFamily: 'Poppins_700Bold',
              fontSize: 24,
              color: '#461C07'
            }}
          >
            {content.title}
          </Text>
        </View>

        {/* Content Section */}
        <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
          <Text 
            className="text-base leading-7 mb-6"
            style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: 16,
              color: '#374151',
              lineHeight: 28,
              textAlign: 'justify'
            }}
          >
            {content.content}
          </Text>

          {/* Decorative Elements */}
          <View className="flex-row justify-center items-center my-8">
            <View className="h-px bg-gray-300 flex-1" />
            <View className="mx-4">
              <Ionicons name="diamond-outline" size={20} color="#461C07" />
            </View>
            <View className="h-px bg-gray-300 flex-1" />
          </View>

          {/* Fun Facts Section */}
          <View className="bg-amber-50 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb-outline" size={20} color="#D97706" />
              <Text 
                className="ml-2 font-semibold"
                style={{
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: 16,
                  color: '#D97706'
                }}
              >
                Tahukah Anda?
              </Text>
            </View>
            <Text 
              className="text-sm"
              style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: 14,
                color: '#92400E'
              }}
            >
              {situs.nama_situs} merupakan salah satu warisan budaya dunia yang diakui UNESCO dan menjadi kebanggaan Indonesia.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text 
            className="text-lg"
            style={{
              fontFamily: 'Poppins_500Medium',
              color: '#6B7280'
            }}
          >
            Memuat konten overview...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (overviewData.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="document-outline" size={64} color="#9CA3AF" />
          <Text 
            className="text-lg text-center mt-4"
            style={{
              fontFamily: 'Poppins_500Medium',
              color: '#6B7280'
            }}
          >
            Konten overview tidak tersedia untuk situs ini.
          </Text>
          <TouchableOpacity
            onPress={onStartTrivia}
            className="bg-amber-600 rounded-xl px-6 py-3 mt-6"
            activeOpacity={0.8}
          >
            <Text 
              className="text-white font-semibold"
              style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 16
              }}
            >
              Lanjut ke Trivia
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        
        <View className="flex-1">
          <Text 
            className="text-lg font-medium text-center"
            style={{
              fontFamily: 'Poppins_500Medium',
              fontSize: 18,
              color: '#1F2937'
            }}
          >
            {situs.nama_situs}
          </Text>
          <Text 
            className="text-sm text-center"
            style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: 12,
              color: '#6B7280'
            }}
          >
            Overview {currentPage + 1} dari {overviewData.length}
          </Text>
        </View>
        
        <View className="w-8" />
      </View>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Content */}
      {overviewData[currentPage] && renderOverviewContent(overviewData[currentPage], currentPage)}

      {/* Navigation Buttons */}
      <View className="px-6 py-4 border-t border-gray-200">
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={currentPage === 0}
            className={`flex-row items-center px-6 py-3 rounded-xl ${
              currentPage === 0 ? 'bg-gray-100' : 'bg-gray-200'
            }`}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={currentPage === 0 ? '#9CA3AF' : '#374151'} 
            />
            <Text 
              className="ml-2 font-medium"
              style={{
                fontFamily: 'Poppins_500Medium',
                fontSize: 16,
                color: currentPage === 0 ? '#9CA3AF' : '#374151'
              }}
            >
              Sebelumnya
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            className="flex-row items-center px-6 py-3 rounded-xl"
            style={{ backgroundColor: '#461C07' }}
            activeOpacity={0.8}
          >
            <Text 
              className="mr-2 text-white font-medium"
              style={{
                fontFamily: 'Poppins_500Medium',
                fontSize: 16
              }}
            >
              {currentPage === overviewData.length - 1 ? 'Mulai Trivia' : 'Selanjutnya'}
            </Text>
            <Ionicons 
              name={currentPage === overviewData.length - 1 ? "play" : "chevron-forward"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
} 