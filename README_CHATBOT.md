# MAKNA ChatBot Integration

## 🤖 Deskripsi
Integrasi chatbot popup menggunakan JotForm yang memberikan pengalaman user-friendly untuk komunikasi dengan pengguna aplikasi MAKNA.

## ✨ Fitur
- **Floating Action Button**: Tombol chat mengambang dengan animasi menarik
- **Popup Modal**: Chatbot muncul dalam modal full-screen yang responsif  
- **WebView Integration**: Menampilkan JotForm chatbot menggunakan WebView
- **Animasi Smooth**: Animasi pulse, scale, dan fade untuk UX yang lebih baik
- **Tooltip Interaktif**: Tooltip yang muncul untuk menarik perhatian user
- **Status Indicator**: Menampilkan status online/connecting chatbot
- **Navigation Controls**: Tombol back, refresh, dan share dalam chatbot
- **Error Handling**: Penanganan error koneksi dengan alert dialog
- **Responsive Design**: Desain yang responsif untuk berbagai ukuran layar

## 🛠️ Komponen

### 1. FloatingChatButton.jsx
Tombol floating yang memicu popup chatbot.

**Fitur:**
- Animasi pulse berulang setiap 5 detik
- Tooltip dengan fade in/out animation
- Badge notifikasi dengan pulse effect
- Gradient overlay untuk efek visual

### 2. ChatBotPopup.jsx  
Modal popup yang menampilkan JotForm chatbot.

**Fitur:**
- WebView dengan konfigurasi optimal untuk JotForm
- Header dengan status indicator dan navigation controls
- Loading screen dengan spinner dan text
- Footer dengan branding info
- Alert confirmation saat close
- Share functionality untuk berbagi chatbot

## 🚀 Cara Penggunaan

### Instalasi
Komponen sudah terintegrasi otomatis ke dalam aplikasi. Tombol chat akan muncul di pojok kanan bawah layar saat user sudah login.

### Kustomisasi URL Chatbot
Untuk mengganti URL chatbot JotForm, edit file `components/ChatBotPopup.jsx`:

```javascript
// Ganti URL ini dengan URL JotForm chatbot Anda
const chatbotUrl = 'https://www.jotform.com/app/252044483767463';
```

### Posisi Floating Button
Untuk mengubah posisi floating button, edit style di `components/FloatingChatButton.jsx`:

```javascript
container: {
  position: 'absolute',
  bottom: 90, // Jarak dari bawah (di atas tab navigation)
  right: 20,  // Jarak dari kanan
  // ...
}
```

## 🎨 Kustomisasi Style

### Warna Button
```javascript
button: {
  backgroundColor: '#007AFF', // Warna utama button
  shadowColor: '#007AFF',     // Warna shadow
  // ...
}
```

### Warna Badge
```javascript
badge: {
  backgroundColor: '#FF3B30', // Warna badge notifikasi
  // ...
}
```

### Header Chatbot
```javascript
header: {
  backgroundColor: 'white',     // Background header
  borderBottomColor: '#e9ecef', // Warna border
  // ...
}
```

## 📱 Responsive Behavior
- Button menggunakan dimensi device untuk positioning yang optimal
- Modal menggunakan `presentationStyle="pageSheet"` untuk iOS native feel
- WebView dikonfigurasi dengan user agent mobile untuk kompatibilitas optimal

## 🔧 Dependensi
- `react-native-webview`: Untuk menampilkan JotForm chatbot
- `@expo/vector-icons`: Untuk ikon-ikon dalam UI
- `react-native-reanimated`: Untuk animasi (sudah ada di project)

## 🐛 Troubleshooting

### Chatbot tidak muncul
1. Pastikan koneksi internet stabil
2. Cek apakah URL JotForm chatbot masih valid
3. Periksa console untuk error WebView

### Button tidak responsif
1. Pastikan `zIndex: 1000` pada container FloatingChatButton
2. Cek apakah ada overlay yang menghalangi touch events

### Animasi tidak smooth
1. Pastikan `useNativeDriver: true` pada semua animasi
2. Cek performance device untuk animasi kompleks 