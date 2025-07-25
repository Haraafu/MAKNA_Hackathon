import React, { useState } from 'react';
import { View, Modal, Pressable, Platform, StyleSheet, Dimensions, Image } from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { WebView } from 'react-native-webview';

export default function Chatbot() {
  const [visible, setVisible] = useState(false);
  const chatbotUrl = 'https://www.jotform.com/app/252044483767463';
  const { user } = useAuthContext();

  if (!user) return null;

  return (
    <>
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
  fab: {
    position: 'absolute',
    right: width * -0.02,
    bottom: height * 0.20, 
    zIndex: 10000,
    elevation: 10,
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
    width: 400,
    maxWidth: '90vw',
    height: 600,
    maxHeight: '90vh',
    backgroundColor: '#fff',
    borderRadius: 12,
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
