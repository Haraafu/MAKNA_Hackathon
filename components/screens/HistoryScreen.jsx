import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { TripService } from '../../lib/tripService';

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [completedTrips, setCompletedTrips] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  
  const filters = ['Semua', 'Selesai', 'Berlangsung'];

  useEffect(() => {
    if (user?.id) {
      loadHistoryData();
    }
  }, [user]);

  const loadHistoryData = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available');
        return;
      }

      const [completedResult, activeResult, badgesResult] = await Promise.all([
        TripService.getTripHistory(user.id),
        TripService.getActiveTrips(user.id),
        TripService.getUserBadges(user.id)
      ]);

      if (completedResult.success) {
        setCompletedTrips(completedResult.data);
      }
      
      if (activeResult.success) {
        setActiveTrips(activeResult.data);
      }
      
      if (badgesResult.success) {
        setUserBadges(badgesResult.data);
      }
    } catch (error) {
      console.error('Error loading history data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistoryData();
  };

  // Combine trips for filtering
  const allTrips = [
    ...completedTrips.map(trip => ({
      ...trip,
      status: 'Selesai',
      progress: 100
    })),
    ...activeTrips.map(trip => ({
      ...trip,
      status: 'Berlangsung',
      progress: trip.total_buildings > 0 ? (trip.visited_buildings / trip.total_buildings) * 100 : 0
    }))
  ];

  const filteredHistory = allTrips.filter(quest => {
    if (activeFilter === 'Semua') return true;
    return quest.status === activeFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selesai': return 'bg-green-500';
      case 'Berlangsung': return 'bg-blue-500';
      case 'Favorit': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Selesai': return 'checkmark-circle';
      case 'Berlangsung': return 'play-circle';
      case 'Favorit': return 'star';
      default: return 'time';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} minggu yang lalu`;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-batik-50">
        <Ionicons name="hourglass-outline" size={48} color="#6F4E37" />
        <Text className="text-batik-700 text-lg font-bold mt-4">Memuat Riwayat...</Text>
      </View>
    );
  }

  const completedQuests = completedTrips.length;
  const totalBadges = userBadges.length;
  const activeQuestCount = activeTrips.length;

  return (
    <View className="flex-1 bg-batik-50">
      {/* Header */}
      <View className="bg-batik-700 px-4 py-6 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-batik-100 text-2xl font-bold">Riwayat Perjalanan</Text>
          <TouchableOpacity className="bg-batik-600 px-3 py-2 rounded-lg">
            <Text className="text-batik-100 text-sm font-medium">Filter</Text>
          </TouchableOpacity>
        </View>
        
        {/* Stats */}
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-batik-100 text-2xl font-bold">{completedQuests}</Text>
            <Text className="text-batik-200 text-sm">Selesai</Text>
          </View>
          <View className="items-center">
            <Text className="text-batik-100 text-2xl font-bold">{totalBadges}</Text>
            <Text className="text-batik-200 text-sm">Badge</Text>
          </View>
          <View className="items-center">
            <Text className="text-batik-100 text-2xl font-bold">{activeQuestCount}</Text>
            <Text className="text-batik-200 text-sm">Berlangsung</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter Tabs */}
        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full mr-3 ${
                  activeFilter === filter 
                    ? 'bg-batik-600' 
                    : 'bg-white border border-batik-300'
                }`}
              >
                <Text className={`font-medium ${
                  activeFilter === filter 
                    ? 'text-batik-100' 
                    : 'text-batik-700'
                }`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Achievement Highlight */}
        {userBadges.length > 0 && (
          <View className="mb-6">
            <Text className="text-batik-800 text-lg font-bold mb-3">Pencapaian Terbaru</Text>
            <View className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="bg-white w-12 h-12 rounded-full justify-center items-center">
                    <Ionicons name="trophy" size={24} color="#EAB308" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-yellow-900 font-bold">{userBadges[0].badges.badge_title}</Text>
                    <Text className="text-yellow-800 text-sm">{userBadges[0].badges.badge_info}</Text>
                    <Text className="text-yellow-700 text-xs">{userBadges[0].badges.situs.nama_situs}</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Ionicons name="chevron-forward" size={20} color="#EAB308" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Trip History List */}
        <View>
          <Text className="text-batik-800 text-lg font-bold mb-3">
            {activeFilter === 'Semua' ? 'Semua Perjalanan' : `Perjalanan ${activeFilter}`} ({filteredHistory.length})
          </Text>
          
          {filteredHistory.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center border border-batik-200">
              <Ionicons name="time-outline" size={48} color="#A0522D" />
              <Text className="text-batik-700 text-lg font-medium mt-4">Tidak ada riwayat</Text>
              <Text className="text-batik-600 text-sm text-center mt-2">
                Perjalanan {activeFilter.toLowerCase()} Anda akan muncul di sini
              </Text>
            </View>
          ) : (
            filteredHistory.map((trip) => {
              const relatedBadge = userBadges.find(badge => 
                badge.badges.situs_uid === trip.situs_uid
              );
              
              return (
                <TouchableOpacity 
                  key={trip.uid}
                  className="bg-white rounded-xl p-4 mb-3 border border-batik-200"
                >
                  <View className="flex-row items-start">
                    <View className={`w-12 h-12 rounded-full justify-center items-center ${getStatusColor(trip.status)}`}>
                      <Ionicons name={getStatusIcon(trip.status)} size={20} color="white" />
                    </View>
                    <View className="ml-4 flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-batik-800 font-bold text-lg">{trip.situs.nama_situs}</Text>
                        {relatedBadge && trip.status === 'Selesai' && (
                          <View className="bg-yellow-100 px-2 py-1 rounded-full">
                            <Text className="text-yellow-700 text-xs font-bold">+BADGE</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-batik-600 text-sm mb-1">{trip.situs.lokasi_daerah}</Text>
                      <Text className="text-batik-500 text-xs mb-2">
                        {trip.visited_buildings}/{trip.total_buildings} bangunan
                      </Text>
                      
                      {trip.status === 'Berlangsung' && (
                        <View className="mb-2">
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-batik-600 text-xs">Progress</Text>
                            <Text className="text-batik-600 text-xs">{Math.round(trip.progress)}%</Text>
                          </View>
                          <View className="bg-batik-100 h-2 rounded-full overflow-hidden">
                            <View 
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${trip.progress}%` }}
                            />
                          </View>
                        </View>
                      )}
                      
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Text className="text-batik-500 text-xs">
                            {trip.status === 'Selesai' 
                              ? formatTimeAgo(trip.completed_at)
                              : formatTimeAgo(trip.started_at)
                            }
                          </Text>
                        </View>
                        <TouchableOpacity className="p-1">
                          <Ionicons name="ellipsis-vertical" size={16} color="#A0522D" />
                        </TouchableOpacity>
                      </View>
                      
                      {relatedBadge && trip.status === 'Selesai' && (
                        <View className="mt-2 bg-batik-50 px-2 py-1 rounded-lg">
                          <Text className="text-batik-700 text-xs font-medium">
                            🏆 {relatedBadge.badges.badge_title}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
