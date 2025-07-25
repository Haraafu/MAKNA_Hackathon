import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../contexts/AuthContext';
import EditProfileModal from '../EditProfileModal';

export default function ProfileScreen({ onShowTestAuth, navigation }) {
  const { user, profile, signOut } = useAuthContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const handleSignOut = async () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Gagal logout');
            }
          },
        },
      ]
    );
  };

  // FAQ Data
  const faqData = [
    {
      id: 1,
      question: "Apa itu aplikasi MAKNA?",
      answer: "MAKNA adalah aplikasi mobile yang dirancang untuk memperkenalkan dan melestarikan budaya Indonesia melalui pengalaman interaktif. Aplikasi ini memungkinkan pengguna untuk menjelajahi destinasi budaya, mengikuti quest edukatif, dan belajar tentang warisan budaya Nusantara."
    },
    {
      id: 2,
      question: "Bagaimana cara mengikuti quest budaya?",
      answer: "Anda dapat mengikuti quest budaya dengan:\n1. Memilih destinasi yang ingin dikunjungi di halaman utama\n2. Mengaktifkan lokasi GPS untuk tracking\n3. Mengikuti petunjuk dan menyelesaikan tantangan di setiap spot\n4. Mengumpulkan badge dan poin setelah menyelesaikan quest"
    },
    {
      id: 3,
      question: "Apakah aplikasi ini gratis?",
      answer: "Ya, aplikasi MAKNA dapat diunduh dan digunakan secara gratis. Semua fitur utama seperti quest budaya, peta destinasi, dan koleksi badge tersedia tanpa biaya. Namun, beberapa konten premium mungkin memerlukan pembelian dalam aplikasi."
    },
    {
      id: 4,
      question: "Bagaimana cara mendapatkan badge dan sertifikat?",
      answer: "Badge dan sertifikat digital dapat diperoleh dengan:\n• Menyelesaikan quest di destinasi budaya\n• Mengunjungi jumlah minimum lokasi dalam satu daerah\n• Mencapai milestone tertentu dalam perjalanan budaya\n• Berpartisipasi dalam event khusus\n• Berbagi pengalaman dan foto di komunitas"
    },
    {
      id: 5,
      question: "Apakah bisa digunakan tanpa koneksi internet?",
      answer: "Beberapa fitur dapat digunakan offline setelah konten diunduh sebelumnya, seperti peta dasar dan informasi destinasi. Namun, untuk fitur real-time seperti tracking quest, berbagi konten, dan sinkronisasi progress, diperlukan koneksi internet."
    },
    {
      id: 6,
      question: "Destinasi apa saja yang tersedia?",
      answer: "MAKNA mencakup berbagai destinasi budaya Indonesia seperti:\n• Candi bersejarah (Borobudur, Prambanan, dll)\n• Keraton dan istana tradisional\n• Desa wisata budaya\n• Museum dan galeri seni\n• Site arkeologi\n• Kawasan heritage dan bangunan bersejarah"
    },
    {
      id: 7,
      question: "Bagaimana cara melaporkan bug atau masalah?",
      answer: "Anda dapat melaporkan bug melalui:\n1. Menu Settings > Help > Report Bug\n2. Email ke support@makna.app\n3. Fitur feedback dalam aplikasi\n4. Menghubungi customer service di media sosial resmi kami"
    },
    {
      id: 8,
      question: "Apakah data pribadi saya aman?",
      answer: "Ya, kami menjaga keamanan data pribadi Anda dengan:\n• Enkripsi data end-to-end\n• Tidak membagikan data ke pihak ketiga tanpa izin\n• Penyimpanan data sesuai standar keamanan internasional\n• Kebijakan privasi yang transparan\nBaca lebih lanjut di Privacy Policy kami."
    }
  ];

  // FAQ Component
  const FAQScreen = () => (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView className="bg-white">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 mt-6">
          <TouchableOpacity onPress={() => {
            setShowFAQ(false);
            setShowSettings(true);
          }} className="mr-4">
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-black">FAQ</Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-gray-600 text-sm mb-6">
          Temukan jawaban untuk pertanyaan yang sering diajukan tentang aplikasi MAKNA
        </Text>

        {faqData.map((faq) => (
          <View key={faq.id} className="mb-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <TouchableOpacity
              onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
              className="p-4 flex-row items-center justify-between"
            >
              <Text className="text-black text-base font-medium flex-1 mr-3">
                {faq.question}
              </Text>
              <Ionicons 
                name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#8B4513" 
              />
            </TouchableOpacity>
            
            {expandedFAQ === faq.id && (
              <View className="px-4 pb-4 border-t border-gray-100">
                <Text className="text-gray-700 text-sm leading-6 mt-3">
                  {faq.answer}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Contact Support */}
        <View className="mt-8 p-4 bg-amber-50 rounded-lg">
          <Text className="text-amber-800 font-semibold mb-2">Masih ada pertanyaan?</Text>
          <Text className="text-amber-700 text-sm mb-3">
            Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi tim support kami.
          </Text>
          <TouchableOpacity className="bg-amber-800 rounded-lg py-3 px-4">
            <Text className="text-white text-center font-medium">Hubungi Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // Settings Component
  const SettingsScreen = () => (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView className="bg-white">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 mt-6">
          <TouchableOpacity onPress={() => setShowSettings(false)} className="mr-4">
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-black">Settings</Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        {/* Sistem Section */}
        <View className="mb-6">
          <Text className="text-black text-base font-semibold mb-4">Sistem</Text>
          
          {/* Dark Mode */}
          <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="moon-outline" size={18} color="#8B4513" />
              </View>
              <Text className="text-black text-base font-medium">Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{  false: '#E5E7EB', true: '#8B4513'}}
              thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {/* Notification */}
          <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="notifications-outline" size={18} color="#8B4513" />
              </View>
              <Text className="text-black text-base font-medium">Notification</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E5E7EB', true: '#8B4513' }}
              thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Help Section */}
        <View className="mb-6">
          <Text className="text-black text-base font-semibold mb-4">Help</Text>
          
          {/* Report Bug */}
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="bug-outline" size={18} color="#8B4513" />
              </View>
              <Text className="text-black text-base font-medium">Report Bug</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Help Center */}
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="help-circle-outline" size={18} color="#8B4513" />
              </View>
              <Text className="text-black text-base font-medium">Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View className="mb-6">
          <Text className="text-black text-base font-semibold mb-4">Information</Text>
          
          {/* FAQ */}
          <TouchableOpacity 
            onPress={() => {
              setShowSettings(false);
              setShowFAQ(true);
            }}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="help-outline" size={18} color="#8B4513" />
              </View>
              <Text className="text-black text-base font-medium">FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* User Guide */}
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="book-outline" size={18} color="#8B4513" />
              </View>
              <Text className="text-black text-base font-medium">User Guide</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="shield-outline" size={18} color="#8B4513" />
              </View>
              <Text className="text-black text-base font-medium">Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Version */}
          <View className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="information-circle-outline" size={18} color="#8B4513" />
              </View>
              <Text className="text-black text-base font-medium">Version</Text>
            </View>
            <Text className="text-gray-500 text-sm">1.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // Personal Information Component
  const PersonalInformation = () => (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView className="bg-white">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 mt-6">
          <TouchableOpacity onPress={() => setShowPersonalInfo(false)} className="mr-4">
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-black">Personal Information</Text>
        </View>
      </SafeAreaView>

      {/* Form */}
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-4">
          {/* First Name */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">First Name</Text>
            <View className="border border-gray-200 rounded-lg px-4 py-3">
              <Text className="text-black text-base">
                {profile?.full_name?.split(' ')[0] || 'Deandro'}
              </Text>
            </View>
          </View>

          {/* Last Name */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Last Name</Text>
            <View className="border border-gray-200 rounded-lg px-4 py-3">
              <Text className="text-black text-base">
                {profile?.full_name?.split(' ').slice(1).join(' ') || 'Najiwan'}
              </Text>
            </View>
          </View>

          {/* Phone Number */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Phone Number</Text>
            <View className="border border-gray-200 rounded-lg px-4 py-3">
              <Text className="text-black text-base">
                {profile?.phone_number || '+62 812 345 678 89'}
              </Text>
            </View>
          </View>

          {/* Email */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-2">Email</Text>
            <View className="border border-gray-200 rounded-lg px-4 py-3">
              <Text className="text-black text-base">
                {user?.email || 'deandroelektromaestro@gmail.com'}
              </Text>
            </View>
          </View>

          {/* Save Changes Button */}
          <TouchableOpacity className="bg-amber-800 rounded-lg py-4 mt-8">
            <Text className="text-white text-center font-semibold text-base">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // Main Profile Screen
  if (showPersonalInfo) {
    return <PersonalInformation />;
  }

  if (showSettings) {
    return <SettingsScreen />;
  }

  if (showFAQ) {
    return <FAQScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView className="bg-white">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 mt-6">
          <Text className="text-lg font-semibold text-black">Profile More</Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        {/* Menu Items */}
        <View className="space-y-1">
          {/* Personal Information */}
          <TouchableOpacity 
            onPress={() => setShowPersonalInfo(true)}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="person-outline" size={18} color="#8B4513" />
              </View>
              <Text className="text-black text-base font-medium">Personal Information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity 
            onPress={() => setShowSettings(true)}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="settings-outline" size={18} color="#8B4513" />
              </View>
              <Text className="text-black text-base font-medium">Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View className="mt-auto pt-8">
          <TouchableOpacity 
            onPress={handleSignOut}
            className="border border-red-500 rounded-lg py-4"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" className="mr-2" />
              <Text className="text-red-500 text-center font-medium text-base ml-2">Logout Account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          console.log('Profile updated successfully');
        }}
      />
    </View>
  );
}
