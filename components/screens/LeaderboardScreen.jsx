import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { TripService } from '../../lib/tripService';
import { useAuthContext } from '../../contexts/AuthContext';
import { BadgeIcon } from '../IconBar';

export default function LeaderboardScreen() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      const result = await TripService.getLeaderboard(50);
      if (result.success && result.data.length > 0) {
        setLeaderboardData(result.data);
      } else {
        // Use sample data when no real users exist
        const sampleResult = await TripService.generateSampleLeaderboardData();
        if (sampleResult.success) {
          setLeaderboardData(sampleResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      // Fallback to sample data on error
      const sampleResult = await TripService.generateSampleLeaderboardData();
      if (sampleResult.success) {
        setLeaderboardData(sampleResult.data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboardData();
  };

  const getRankSuffix = (rank) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#461C07'; // Default brown
  };

  const renderLeaderboardItem = (item, index) => {
    const isCurrentUser = user?.id === item.id;
    
    return (
      <View 
        key={item.id} 
        className={`mx-4 mb-3 rounded-2xl p-4 flex-row items-center ${
          isCurrentUser ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-white'
        }`}
        style={{
          backgroundColor: isCurrentUser ? '#FEF3C7' : '#8B4513',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        {/* Rank */}
        <View className="mr-4">
          <Text 
            className="text-2xl font-bold"
            style={{
              fontFamily: 'Poppins_700Bold',
              fontSize: 18,
              color: isCurrentUser ? '#D97706' : '#FFFFFF'
            }}
          >
            {item.rank}{getRankSuffix(item.rank)}
          </Text>
        </View>

        {/* User Info */}
        <View className="flex-1">
          <Text 
            className="text-lg font-semibold mb-1"
            style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 16,
              color: isCurrentUser ? '#92400E' : '#FFFFFF'
            }}
          >
            {item.firstname} {item.lastname}
          </Text>
          <Text 
            className="text-sm"
            style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: 14,
              color: isCurrentUser ? '#A78B0A' : '#E5E7EB'
            }}
          >
            {item.location}
          </Text>
        </View>

        {/* Badge Count */}
        <View className="flex-row items-center">
          <View style={{ marginRight: 8 }}>
            <BadgeIcon 
              color={isCurrentUser ? '#D97706' : '#FFFFFF'} 
              size={24} 
            />
          </View>
          <Text 
            className="text-2xl font-bold"
            style={{
              fontFamily: 'Poppins_700Bold',
              fontSize: 20,
              color: isCurrentUser ? '#D97706' : '#FFFFFF'
            }}
          >
            {item.total_badges}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text 
          className="text-lg"
          style={{
            fontFamily: 'Poppins_500Medium',
            color: '#6B7280'
          }}
        >
          Loading leaderboard...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-6 bg-white">
        <Text 
          className="text-3xl mb-2"
          style={{
            fontFamily: 'Poppins_700Bold',
            fontSize: 28,
            color: '#1F2937'
          }}
        >
          Leaderboard
        </Text>
        <Text 
          className="text-base"
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: 16,
            color: '#6B7280'
          }}
        >
          View Top Explorers!
        </Text>
      </View>

      {/* Leaderboard List */}
      <ScrollView 
        className="flex-1 pt-4"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#461C07']}
            tintColor="#461C07"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {leaderboardData.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text 
              className="text-lg text-center"
              style={{
                fontFamily: 'Poppins_500Medium',
                color: '#6B7280'
              }}
            >
              No explorers yet!{'\n'}Be the first to complete a journey.
            </Text>
          </View>
        ) : (
          leaderboardData.map((item, index) => renderLeaderboardItem(item, index))
        )}
        
        {/* Bottom spacing for tab navigation */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
} 