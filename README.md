# MAKNA - Platform Wisata Budaya Indonesia

Aplikasi mobile React Native Expo yang menyajikan pengalaman wisata budaya Indonesia melalui quest interaktif dengan desain yang terinspirasi dari pola batik tradisional.

## 🎯 Konsep Aplikasi

**MAKNA** adalah platform interaktif untuk mengeksplorasi cerita budaya dan sejarah Indonesia. Pengguna dapat mengunjungi landmark tertentu (misalnya: Candi Borobudur), dan aplikasi akan menyajikan cerita edukatif dan multimedia yang dikurasi dalam bentuk **quest interaktif**.

### 🧩 Alur Pengalaman Pengguna (Flow):

1. **Homepage**: 
   - Desain mobile-first dengan tema budaya Indonesia
   - Warna-warna batik (coklat tua, krem, emas)
   - Navigasi bawah dengan 4 tab: Home, Explore, History, Profile

2. **Explore Page**: 
   - Daftar lokasi wisata budaya (Candi Borobudur, Desa Penglipuran, dll)
   - Setiap lokasi bisa diklik untuk memulai "quest"

3. **Story/Quest Page**: 
   - Konten edukatif dengan video, artikel, dan cerita sejarah
   - Tombol "Selesai Menonton" untuk melanjutkan
   - Notifikasi setelah quest selesai: "🎉 Anda telah menyelesaikan pengalaman wisata di [lokasi] bersama MAKNA."

4. **Profile Page**: 
   - Riwayat lokasi yang sudah diselesaikan
   - Badge dan pencapaian
   - Progress dan statistik perjalanan budaya

## 🎨 Fitur Utama

### ✅ Quest Interaktif
- **6+ Destinasi Budaya**: Borobudur, Prambanan, Desa Penglipuran, Museum Nasional, Keraton Yogya, Wae Rebo
- **Konten Multi-step**: Intro → Video → Cerita → Highlights
- **Progress Tracking**: Real-time progress untuk setiap quest
- **Completion Rewards**: Badge dan sertifikat digital

### ✅ Sistem Pencapaian
- **Badge Collection**: Penjelajah Candi, Pecinta Desa, Raja Budaya, dll
- **Progress Tracking**: Quest selesai, waktu belajar, destinasi dikunjungi
- **Level System**: Penjelajah Level 1-10 berdasarkan aktivitas

### ✅ Desain Budaya Indonesia
- **Palet Warna Batik**: #6F4E37, #A0522D, #D2B48C (coklat tradisional)
- **Pola Batik Dekoratif**: Background dengan motif geometris Indonesia
- **Bahasa Indonesia**: Interface lengkap dalam Bahasa Indonesia
- **Iconografi Budaya**: Ikon yang mencerminkan kekayaan budaya Nusantara

### ✅ Mobile-First Experience
- **Bottom Tab Navigation**: 4 tab utama yang responsif
- **Touch-Friendly**: Button size dan spacing yang optimal
- **Smooth Animations**: Transisi halus antar screen
- **Safe Area Handling**: Mendukung berbagai ukuran layar

## 🚀 Tech Stack

- **React Native** dengan Expo Router
- **Tailwind CSS** (NativeWind) dengan custom batik colors
- **Supabase** untuk autentikasi dan backend (opsional)
- **Expo Vector Icons** untuk iconografi konsisten
- **React Native Safe Area Context** untuk handling layar

## � Destinasi Quest

### 🏛️ Candi & Sejarah
1. **Candi Borobudur** - Sejarah kemegahan Buddha (45 menit)
2. **Candi Prambanan** - Epik Ramayana dalam relief (50 menit)
3. **Museum Nasional** - Ribuan tahun sejarah Nusantara (60 menit)

### 🏡 Desa Budaya
4. **Desa Penglipuran** - Kehidupan tradisional Bali (40 menit)
5. **Desa Wae Rebo** - Rumah adat di atas awan (50 menit)

### 👑 Keraton & Istana
6. **Keraton Yogyakarta** - Filosofi Jawa dalam arsitektur (55 menit)

## 🎯 Fitur Quest

### 📖 Konten Edukatif
- **Video Interaktif**: Dokumenter singkat tentang setiap lokasi
- **Cerita Bersejarah**: Narasi mendalam tentang latar belakang budaya
- **Poin Menarik**: Highlight fakta unik dan filosofi
- **Multi-langkah**: Pengalaman terstruktur dengan progress tracking

### 🏆 Sistem Reward
- **Badge Digital**: Koleksi achievement berdasarkan aktivitas
- **Sertifikat**: Digital certificate untuk quest yang diselesaikan
- **Poin XP**: Experience points untuk leveling up
- **Statistik**: Tracking waktu belajar dan progress personal

## 📊 Tracking & Analytics

### 📈 User Progress
- Quest selesai vs total quest
- Total waktu pembelajaran
- Kategori destinasi yang dikunjungi
- Badge dan achievement yang diraih

### 📝 History Management
- Riwayat quest yang sudah diselesaikan
- Quest yang sedang berjalan dengan progress
- Favorit dan bookmark
- Rating dan review untuk setiap quest

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup (Opsional)
Copy `.env.example` ke `.env` untuk konfigurasi Supabase jika ingin menggunakan autentikasi cloud:

```bash
# Supabase Configuration (Optional)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run the App
```bash
npm start
```

### 4. Testing
- Scan QR code dengan Expo Go (iOS/Android)
- Atau tekan 'w' untuk web browser
- Atau tekan 'a' untuk Android emulator

## 🎨 Palet Warna Batik

```css
batik: {
  50: '#FAF7F0',   // Krem terang
  100: '#F5EFE7',  // Krem
  200: '#E8D5B7',  // Beige
  300: '#D2B48C',  // Tan
  400: '#C19A6B',  // Coklat muda
  500: '#A0522D',  // Coklat sedang
  600: '#8B4513',  // Saddle brown
  700: '#6F4E37',  // Coklat tua (primary)
  800: '#5D4037',  // Coklat lebih tua
  900: '#3E2723',  // Coklat terdalam
}
```

## 📱 Struktur Navigasi

### 🏠 Tab Utama
- **Beranda**: Quest unggulan, progress aktif, quick actions
- **Jelajahi**: Daftar semua destinasi dengan filter kategori
- **Riwayat**: Quest selesai, badge, statistik pembelajaran
- **Profil**: Achievement, settings, informasi user

### 🎯 Quest Flow
1. **Pilih Destinasi** → Browse atau search lokasi budaya
2. **Mulai Quest** → Intro dan overview destinasi
3. **Konten Edukatif** → Video, cerita, dan highlights
4. **Selesai Quest** → Reward badge dan sertifikat
5. **Review** → Rating dan feedback (opsional)

## 🛠️ Development

### Project Structure
```
├── app/                    # Expo Router screens
├── components/
│   ├── screens/           # Tab dan quest screens
│   ├── BatikPattern.jsx   # Ornamen batik background
│   ├── TabNavigation.jsx  # Bottom navigation
│   └── QuestDetailScreen.jsx # Quest experience
├── contexts/              # State management
├── hooks/                 # Custom hooks
└── lib/                   # Utilities dan konfigurasi
```

### 🎯 Pengembangan Selanjutnya

**Siap untuk pengembangan lanjutan:**
- **Backend Integration**: Database quest dan user progress
- **Social Features**: Share achievement, review destinasi
- **Offline Support**: Download quest untuk akses offline
- **Gamification**: Leaderboard, challenges, streak counter
- **AR/VR Features**: Augmented reality tour guide
- **Multi-language**: Support English dan bahasa daerah

---

**Dibuat dengan ❤️ untuk Budaya Indonesia**
*MAKNA v1.0.0*
