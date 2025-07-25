import React, { useState, useEffect, useRef } from 'react';
import { View, Modal, Pressable, Platform, StyleSheet, Dimensions, Image, Animated } from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { WebView } from 'react-native-webview';

export default function Chatbot({ currentScreen = 'Home' }) {
  const [visible, setVisible] = useState(false);
  const chatbotUrl = 'https://www.jotform.com/app/252044483767463';
  const { user } = useAuthContext();
  
  // Animation untuk efek kedip-kedip
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Efek animasi kedip-kedip
  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const createGlowAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const pulseAnimation = createPulseAnimation();
    const glowAnimation = createGlowAnimation();
    
    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  // Hanya tampilkan chatbot di homepage
  if (!user || currentScreen !== 'Home') return null;

  return (
    <>
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowAnim,
            },
          ]}
        />
        <Pressable
          style={styles.fab}
          onPress={() => setVisible(true)}
          accessibilityLabel="Open Chatbot"
        >
          <Image
            source={require('../assets/Maya.png')}
            style={styles.chatbotImage}
          />
        </Pressable>
      </Animated.View>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeButton} onPress={() => setVisible(false)}>
              <View style={styles.closeBar} />
            </Pressable>
            {Platform.OS === 'web' ? (
              <iframe
                src={chatbotUrl}
                title="Chatbot AI"
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
                allow="clipboard-write; microphone"
              />
            ) : (
              <WebView
                source={{ uri: chatbotUrl }}
                style={{ flex: 1, borderRadius: 12 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: width * 0.02,
    bottom: height * 0.70, 
    zIndex: 10000,
    elevation: 10,
  },
  glowEffect: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    top: -8,
    left: -8,
    zIndex: -1,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatbotImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    resizeMode: 'cover',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10001,
  },
  modalContent: {
    width: 340,
    maxWidth: '90vw',
    height: 600,
    maxHeight: '90vh',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
  },
  closeButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  closeBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginBottom: 4,
  },
});
