import React, { useEffect, useState } from 'react';
import { View, Text, Image, Animated } from 'react-native';

export default function SplashScreen({ onFinish }) {
  const [logoSlideAnim] = useState(new Animated.Value(200)); // Start from bottom
  const [logoOpacity] = useState(new Animated.Value(0));
  const [textOpacity] = useState(new Animated.Value(0));
  const [typingText, setTypingText] = useState('');
  const [screenOpacity] = useState(new Animated.Value(1));
  
  const fullText = 'MAKNA';

  useEffect(() => {
    // 1. Logo slide animation (dari bawah ke tengah atas)
    Animated.parallel([
      Animated.timing(logoSlideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Setelah logo selesai, tunggu 500ms lalu mulai typing effect
      setTimeout(() => {
        // Show text container
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();

        // 3. Typing animation
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
          if (currentIndex <= fullText.length) {
            setTypingText(fullText.substring(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typingInterval);
            // 4. Setelah typing selesai, tunggu 800ms lalu fade ke auth screen
            setTimeout(() => {
              Animated.timing(screenOpacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }).start(() => {
                if (onFinish) onFinish();
              });
            }, 800);
          }
        }, 100); // 150ms per karakter
      }, 500);
    });
  }, []);

  return (
    <Animated.View 
      className="flex-1 justify-center px-6" 
      style={{ 
        backgroundColor: '#461C07',
        opacity: screenOpacity 
      }}
    >
      
      <View 
        className="mb-8 items-center"
        style={{
          marginTop: -130,
        }}
      >
        <Text 
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: 24,
            color: 'transparent',
            marginBottom: 24
          }}
        >
          Welcome to
        </Text>
        
        {/* App Logo with slide animation */}
        <Animated.View 
          className="mb-8"
          style={{
            opacity: logoOpacity,
            transform: [{ translateY: logoSlideAnim }]
          }}
        >
          <Image 
            source={require('../assets/icon-2.png')} 
            style={{ width: 125, height: 126 }}
            resizeMode="contain"
          />
        </Animated.View>
        
        {/* App Name with typing animation */}
        <Animated.View style={{ opacity: textOpacity }}>
          <Text 
            style={{
              fontFamily: 'AveriaSerifLibre_400Regular',
              fontSize: 32,
              color: '#CF964A',
              letterSpacing: 2,
              marginBottom: 8,
              minHeight: 40, 
            }}
          >
            {typingText}
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
