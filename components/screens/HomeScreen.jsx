import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { TripService } from '../../lib/tripService';
import { BadgeIcon } from '../IconBar';

export default function HomeScreen({ onTripStart }) {
  const [userBadges, setUserBadges] = useState([]);
  const [totalBadges, setTotalBadges] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, profile } = useAuthContext();

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    } else {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available');
        return;
      }

      const badgesResult = await TripService.getUserBadgeStats(user.id);
      
      if (badgesResult.success) {
        setUserBadges(badgesResult.data.badges_earned || []);
        setTotalBadges(badgesResult.data.total_badges || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const getUserName = () => {
    if (profile?.firstname) {
      return profile.firstname;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };



  return (
    <ScrollView 
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View className="px-6 pt-12 pb-6">
        <Text 
          className="text-3xl mb-2"
          style={{
            fontFamily: 'Poppins_600SemiBold',
            fontSize: 28,
            color: '#1F2937'
          }}
        >
          Hello, {getUserName()}
        </Text>
        <Text 
          className="text-base"
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: 16,
            color: '#6B7280'
          }}
        >
          Jelajahi budaya, resapi MAKNA!
        </Text>
      </View>

      {/* Badges Section */}
      <View className="px-6 mb-8">
        <View className="flex-row items-center">
          <Text 
            className="text-lg mr-3"
            style={{
              fontFamily: 'Poppins_500Medium',
              fontSize: 18,
              color: '#1F2937'
            }}
          >
            Badges:
          </Text>
          <View className="flex-row items-center">
            <BadgeIcon color="#461C07" size={24} style={{ marginRight: 8 }} />
            <Text 
              className="text-2xl"
              style={{
                fontFamily: 'Poppins_700Bold',
                fontSize: 24,
                color: '#1F2937'
              }}
            >
              {totalBadges}
            </Text>
          </View>
        </View>

      </View>

      {/* Central Logo Section */}
      <View className="px-6 items-center justify-center flex-1 py-12">
        {/* Large Batik Logo */}
        <View className="mb-8 items-center">
          <Image
            source={require('../../assets/icon.png')}
            style={{
              width: 280,
              height: 280,
              resizeMode: 'contain'
            }}
          />
        </View>
        
        {/* Tagline */}
        <Text 
          className="text-center text-xl px-8 leading-7"
          style={{
            fontFamily: 'Poppins_500Medium',
            fontSize: 20,
            color: '#1F2937',
            lineHeight: 28
          }}
        >
          Step into history. Feel the meaning behind every place.
        </Text>
      </View>

      {/* Bottom spacing for tab navigation */}
      <View className="h-20" />
    </ScrollView>
  );
}
