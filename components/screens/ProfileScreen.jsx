import React, { useState, useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../contexts/AuthContext';
import EditProfileModal from '../EditProfileModal';

export default function ProfileScreen({ onShowTestAuth, navigation }) {
  const { user, profile, signOut, updateProfile } = useAuthContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  
  // Personal Information form states
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone_number: '',
  });

  // Check if form has been modified
  const isFormModified = React.useMemo(() => {
    if (!profile) return false;
    return (
      formData.firstname !== (profile.firstname || '') ||
      formData.lastname !== (profile.lastname || '') ||
      formData.phone_number !== (profile.phone_number || '')
    );
  }, [formData, profile]);

  // Update form data when profile changes
  React.useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        firstname: profile.firstname || '',
        lastname: profile.lastname || '',
        phone_number: profile.phone_number || '',
      });
    }
  }, [profile, isEditing]);

  // Optimized handlers to prevent re-renders
  const handleFirstNameChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, firstname: text }));
  }, []);

  const handleLastNameChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, lastname: text }));
  }, []);

  const handlePhoneChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, phone_number: text }));
  }, []);

  // Stable callback handlers for PersonalInformation component
  const handlePersonalInfoBack = useCallback(() => {
    if (isEditing && isFormModified) {
      Alert.alert(
        'Perubahan Belum Disimpan',
        'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?',
        [
          {
            text: 'Batal',
            style: 'cancel',
          },
          {
            text: 'Keluar',
            style: 'destructive',
            onPress: () => {
              setIsEditing(false);
              setShowPersonalInfo(false);
            },
          },
        ]
      );
    } else {
      setShowPersonalInfo(false);
      setIsEditing(false);
    }
  }, [isEditing, isFormModified]);

  const handlePersonalInfoEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

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

  const handleSavePersonalInfo = async () => {
    if (!formData.firstname.trim()) {
      Alert.alert('Error', 'First name harus diisi');
      return;
    }

    // Validate phone number if provided
    if (formData.phone_number.trim() && !formData.phone_number.match(/^[\+]?[(]?[\+]?\d{10,15}$/)) {
      Alert.alert('Error', 'Format nomor telepon tidak valid');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateProfile({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        phone_number: formData.phone_number.trim(),
      });

      if (error) {
        Alert.alert('Error', error.message || 'Gagal memperbarui profil');
      } else {
        Alert.alert('Berhasil', 'Profil berhasil diperbarui');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (isFormModified) {
      Alert.alert(
        'Batalkan Perubahan',
        'Apakah Anda yakin ingin membatalkan perubahan yang telah Anda buat?',
        [
          {
            text: 'Tidak',
            style: 'cancel',
          },
          {
            text: 'Ya, Batalkan',
            style: 'destructive',
            onPress: () => {
              // Reset form to original values
              if (profile) {
                setFormData({
                  firstname: profile.firstname || '',
                  lastname: profile.lastname || '',
                  phone_number: profile.phone_number || '',
                });
              }
              setIsEditing(false);
            },
          },
        ]
      );
    } else {
      setIsEditing(false);
    }
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

// Personal Information Component - Separated to prevent re-renders
const PersonalInformationComponent = memo(({ 
  isEditing, 
  formData, 
  profile, 
  user, 
  loading,
  isFormModified,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onSave,
  onBack,
  onEdit
}) => (
  <View className="flex-1 bg-white">
    {/* Header */}
    <SafeAreaView className="bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 mt-12">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#000', flex: 1 }}>Personal Information</Text>
      </View>
    </SafeAreaView>

    {/* Form */}
    <ScrollView 
      className="flex-1 px-4 py-6"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="space-y-4">
        {/* First Name */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginBottom: 8 }}>First Name</Text>
          {isEditing ? (
            <View className="border border-gray-200 rounded-lg px-4 py-3">
              <TextInput
                style={{ fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#000' }}
                value={formData.firstname}
                onChangeText={onFirstNameChange}
                placeholder="Masukkan first name"
                autoCapitalize="words"
              />
            </View>
          ) : (
            <View className="border border-gray-200 rounded-lg px-4 py-3">
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#000' }}>
                {profile?.firstname || 'Belum diisi'}
              </Text>
            </View>
          )}
        </View>

        {/* Last Name */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginBottom: 8 }}>Last Name</Text>
          {isEditing ? (
            <View className="border border-gray-200 rounded-lg px-4 py-3">
              <TextInput
                style={{ fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#000' }}
                value={formData.lastname}
                onChangeText={onLastNameChange}
                placeholder="Masukkan last name"
                autoCapitalize="words"
              />
            </View>
          ) : (
            <View className="border border-gray-200 rounded-lg px-4 py-3">
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#000' }}>
                {profile?.lastname || 'Belum diisi'}
              </Text>
            </View>
          )}
        </View>

        {/* Phone Number */}
        <View className="mb-4">
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginBottom: 8 }}>Phone Number</Text>
          {isEditing ? (
            <View className="border border-gray-200 rounded-lg px-4 py-3">
              <TextInput
                style={{ fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#000' }}
                value={formData.phone_number}
                onChangeText={onPhoneChange}
                placeholder="Masukkan nomor telepon"
                keyboardType="phone-pad"
              />
            </View>
          ) : (
            <View className="border border-gray-200 rounded-lg px-4 py-3">
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#000' }}>
                {profile?.phone_number || 'Belum diisi'}
              </Text>
            </View>
          )}
        </View>

        {/* Email (Always Read-only) */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginBottom: 8 }}>Email</Text>
          <View className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#6B7280' }}>
              {user?.email || 'Tidak tersedia'}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
            Email tidak dapat diubah
          </Text>
        </View>

        {/* Action Buttons */}
        {isEditing ? (
          <TouchableOpacity 
            onPress={onSave}
            className={`bg-amber-800 rounded-lg py-4 mt-8 ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
          >
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF', textAlign: 'center' }}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={onEdit}
            className="bg-amber-800 rounded-lg py-4 mt-8"
          >
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF', textAlign: 'center' }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  </View>
));

  // FAQ Component
  const FAQScreen = () => (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView className="bg-white">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 mt-12">
          <TouchableOpacity onPress={() => {
            setShowFAQ(false);
            setShowSettings(true);
          }} className="mr-4">
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#000' }}>FAQ</Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
          Temukan jawaban untuk pertanyaan yang sering diajukan tentang aplikasi MAKNA
        </Text>

        {faqData.map((faq) => (
          <View key={faq.id} className="mb-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <TouchableOpacity
              onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
              className="p-4 flex-row items-center justify-between"
            >
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#000', flex: 1, marginRight: 12 }}>
                {faq.question}
              </Text>
              <Ionicons 
                name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#461C07" 
              />
            </TouchableOpacity>
            
            {expandedFAQ === faq.id && (
              <View className="px-4 pb-4 border-t border-gray-100">
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#374151', lineHeight: 24, marginTop: 12 }}>
                  {faq.answer}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Contact Support */}
        <View className="mt-8 p-4 bg-amber-50 rounded-lg">
          <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#92400E', marginBottom: 8 }}>Masih ada pertanyaan?</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#B45309', marginBottom: 12 }}>
            Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi tim support kami.
          </Text>
          <TouchableOpacity className="bg-amber-800 rounded-lg py-3 px-4">
            <Text style={{ fontFamily: 'Poppins_500Medium', color: '#FFFFFF', textAlign: 'center' }}>Hubungi Support</Text>
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
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 mt-12">
          <TouchableOpacity onPress={() => setShowSettings(false)} className="mr-4">
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#000' }}>Settings</Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sistem Section */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#000', marginBottom: 16 }}>Sistem</Text>
          
          {/* Dark Mode */}
          <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="moon-outline" size={18} color="#461C07" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#000' }}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{  false: '#E5E7EB', true: '#461C07'}}
              thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {/* Notification */}
          <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="notifications-outline" size={18} color="#461C07" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#000' }}>Notification</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E5E7EB', true: '#461C07' }}
              thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Help Section */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#000', marginBottom: 16 }}>Help</Text>
          
          {/* Report Bug */}
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="bug-outline" size={18} color="#461C07" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#000' }}>Report Bug</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Help Center */}
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="help-circle-outline" size={18} color="#461C07" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#000' }}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#000', marginBottom: 16 }}>Information</Text>
          
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
                <Ionicons name="help-outline" size={18} color="#461C07" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#000' }}>FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* User Guide */}
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="book-outline" size={18} color="#461C07" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#000' }}>User Guide</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="shield-outline" size={18} color="#461C07" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#000' }}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Version */}
          <View className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="information-circle-outline" size={18} color="#461C07" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#000' }}>Version</Text>
            </View>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280' }}>1.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // Main Profile Screen
  if (showPersonalInfo) {
    return (
      <PersonalInformationComponent
        isEditing={isEditing}
        formData={formData}
        profile={profile}
        user={user}
        loading={loading}
        isFormModified={isFormModified}
        onFirstNameChange={handleFirstNameChange}
        onLastNameChange={handleLastNameChange}
        onPhoneChange={handlePhoneChange}
        onSave={handleSavePersonalInfo}
        onBack={handlePersonalInfoBack}
        onEdit={handlePersonalInfoEdit}
      />
    );
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
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 mt-12">
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#000' }}>Profile More</Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Items */}
        <View className="space-y-1">
          {/* Personal Information */}
          <TouchableOpacity 
            onPress={() => setShowPersonalInfo(true)}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-4">
                <Ionicons name="person-outline" size={18} color="#461C07" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#000' }}>Personal Information</Text>
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
                <Ionicons name="settings-outline" size={18} color="#461C07" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#000' }}>Settings</Text>
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
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#EF4444', textAlign: 'center', marginLeft: 8 }}>Logout Account</Text>
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
