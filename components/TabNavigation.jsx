import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, HomeIcon2, MapIcon, MapIcon2, LeaderboardIcon, LeaderboardIcon2, ProfileIcon, ProfileIcon2, ScannerIcon } from './IconBar';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import HistoryScreen from './screens/HistoryScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import SitusDetailScreen from './screens/SitusDetailScreen';
import TripProgressScreen from './screens/TripProgressScreen';
import TestQRData from './TestQRData';
import TestAuthFlow from './TestAuthFlow';

export default function TabNavigation() {
  const [activeTab, setActiveTab] = useState('Home');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSitusDetail, setShowSitusDetail] = useState(false);
  const [selectedSitus, setSelectedSitus] = useState(null);
  const [showTestQR, setShowTestQR] = useState(false);
  const [showTestAuth, setShowTestAuth] = useState(false);
  const [activeTripData, setActiveTripData] = useState(null);
  const [showTripProgress, setShowTripProgress] = useState(false);
  const insets = useSafeAreaInsets();

  const tabs = [
    { 
      name: 'Home', 
      icon: (active) => active ? <HomeIcon2 color="#461C07" size={24} /> : <HomeIcon color="#9CA3AF" size={24} />,
      component: HomeScreen, 
      label: 'Home' 
    },
    { 
      name: 'Map', 
      icon: (active) => active ? <MapIcon2 color="#461C07" size={24} /> : <MapIcon color="#9CA3AF" size={24} />,
      component: ExploreScreen, 
      label: 'Map' 
    },
    { 
      name: 'QR', 
      icon: (active) => <ScannerIcon color="#FFFFFF" size={32} />,
      component: null, 
      label: 'QR', 
      isCenter: true 
    },
    { 
      name: 'Leaderboard', 
      icon: (active) => active ? <LeaderboardIcon2 color="#461C07" size={24} /> : <LeaderboardIcon color="#9CA3AF" size={24} />,
      component: LeaderboardScreen, 
      label: 'Leaderboard' 
    },
    { 
      name: 'Profile', 
      icon: (active) => active ? <ProfileIcon2 color="#461C07" size={24} /> : <ProfileIcon color="#9CA3AF" size={24} />,
      component: ProfileScreen, 
      label: 'Profile' 
    },
  ];

  const handleTripStart = (tripData) => {
    setActiveTripData(tripData);
    setShowTripProgress(true);
  };

  const handleTripComplete = (badgeData) => {
    setShowTripProgress(false);
    setActiveTripData(null);
    setActiveTab('Home');
  };

  const handleQRPress = () => {
    setShowQRScanner(true);
  };

  const handleSitusFound = (situsData) => {
    setSelectedSitus(situsData);
    setShowSitusDetail(true);
  };

  const handleCloseSitusDetail = () => {
    setShowSitusDetail(false);
    setSelectedSitus(null);
  };

  const renderContent = () => {
    const activeTabData = tabs.find(tab => tab.name === activeTab);
    if (activeTabData?.component) {
      const ActiveComponent = activeTabData.component;
      const props = { onTripStart: handleTripStart };
      if (activeTab === 'Profile') {
        props.onShowTestAuth = () => setShowTestAuth(true);
      }
      return <ActiveComponent {...props} />;
    }
    return <HomeScreen onTripStart={handleTripStart} />;
  };

  return (
    <View className="flex-1 bg-white">
      {/* Main Content */}
      <View className="flex-1">
        {renderContent()}
      </View>

      {/* Bottom Tab Bar */}
      <View 
        className="bg-white border-t border-gray-200"
        style={{ 
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10
        }}
      >
        <View className="flex-row justify-around items-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => {
                  if (tab.isCenter) {
                    handleQRPress();
                  } else {
                    setActiveTab(tab.name);
                  }
                }}
                className="items-center"
                style={{ 
                  flex: 1,
                  paddingVertical: tab.isCenter ? 0 : 4
                }}
                activeOpacity={0.7}
              >
                {tab.isCenter ? (
                  <View 
                    className="bg-[#461C07] rounded-full w-16 h-16 items-center justify-center -mt-8"
                  >
                    <View className="w-8 h-8">
                      {tab.icon(false)}
                    </View>
                  </View>
                ) : (
                  <>
                    <View className="h-6 mb-1">
                      {tab.icon(isActive)}
                    </View>
                    <Text 
                      className="text-xs"
                      style={{
                        fontFamily: 'Poppins_400Regular',
                        color: isActive ? "#461C07" : "#9CA3AF"
                      }}
                    >
                      {tab.label}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Modals */}
      <Modal
        visible={showQRScanner}
        animationType="slide"
        onRequestClose={() => setShowQRScanner(false)}
      >
        <QRScannerScreen
          onSitusFound={handleSitusFound}
          onClose={() => setShowQRScanner(false)}
        />
      </Modal>

      <Modal
        visible={showTripProgress}
        animationType="slide"
        onRequestClose={() => setShowTripProgress(false)}
      >
        {activeTripData && (
          <TripProgressScreen
            tripData={activeTripData}
            onTripComplete={handleTripComplete}
            onClose={() => setShowTripProgress(false)}
          />
        )}
      </Modal>

      <Modal
        visible={showSitusDetail}
        animationType="slide"
        onRequestClose={handleCloseSitusDetail}
      >
        {selectedSitus && (
          <SitusDetailScreen
            situs={selectedSitus}
            onClose={handleCloseSitusDetail}
          />
        )}
      </Modal>

      <Modal
        visible={showTestQR}
        animationType="slide"
        onRequestClose={() => setShowTestQR(false)}
      >
        <TestQRData
          onTripStart={handleTripStart}
          onClose={() => setShowTestQR(false)}
        />
      </Modal>

      <Modal
        visible={showTestAuth}
        animationType="slide"
        onRequestClose={() => setShowTestAuth(false)}
      >
        <TestAuthFlow
          onClose={() => setShowTestAuth(false)}
        />
      </Modal>
    </View>
  );
}
