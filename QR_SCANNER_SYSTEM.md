# QR Scanner System - MAKNA Heritage

## 📱 Sistem QR Scanner untuk Situs Bersejarah

Sistem QR scanner ini memungkinkan pengguna untuk scan QR code yang akan mengarahkan langsung ke detail situs bersejarah yang sesuai.

## 🏗️ Arsitektur Sistem

### 1. Database Schema
```sql
-- Tabel situs dengan QR code data
CREATE TABLE public.situs (
  uid uuid PRIMARY KEY,
  nama_situs VARCHAR NOT NULL,
  lokasi_daerah VARCHAR NOT NULL,
  qr_code_data text UNIQUE, -- QR code untuk scanning
  -- fields lainnya...
);
```

### 2. QR Codes yang Tersedia
- **Candi Borobudur**: `BOROBUDUR_QR_2024`
- **Candi Prambanan**: `PRAMBANAN_QR_2024`

## 🔄 Flow Aplikasi

1. **User menekan tombol QR** di tab navigation
2. **QRScannerScreen terbuka** dengan kamera (mobile) atau input manual (web)
3. **Scanner membaca QR code** dan mendapat text UID
4. **TripService.findSitusByQRCode()** mencari situs di database
5. **Jika valid** → menampilkan konfirmasi
6. **User konfirm** → `SitusDetailScreen` terbuka dengan data situs yang sesuai

## 🧪 Testing QR Scanner

### Web Version (Manual Input)
1. Buka aplikasi di browser
2. Klik tombol QR scanner
3. Input manual: `BOROBUDUR_QR_2024` atau `PRAMBANAN_QR_2024`
4. Atau gunakan tombol test yang tersedia

### Mobile Version (Camera Scan)
1. Generate QR code online:
   - Buka: https://www.qr-code-generator.com/
   - Pilih "Text"
   - Input: `BOROBUDUR_QR_2024` atau `PRAMBANAN_QR_2024`
   - Generate QR code
2. Scan dengan aplikasi mobile

## 📁 File Structure

```
components/
├── screens/
│   ├── QRScannerScreen.jsx       # Main QR scanner interface
│   └── SitusDetailScreen.jsx     # Detail situs setelah scan
├── TabNavigation.jsx             # Handles QR scanner modal
lib/
├── tripService.js                # API calls untuk QR scanning
└── supabase.js                   # Database connection
database/
└── setup-clean.sql               # Database schema dengan sample data
utils/
└── qrCodeGenerator.js            # Helper functions untuk QR codes
```

## 🔧 Key Functions

### QRScannerScreen.jsx
- `handleBarCodeScanned()`: Handle scan result
- `handleManualQRSubmit()`: Handle manual input (web)

### TripService.js
- `findSitusByQRCode(qrCodeData)`: Cari situs berdasarkan QR code

### TabNavigation.jsx
- `handleSitusFound()`: Handle hasil scan dan buka detail situs

## 🎯 Features

✅ **Camera scanning** (mobile devices)
✅ **Manual input** (web browsers)
✅ **Real-time validation** QR codes
✅ **Error handling** untuk QR codes tidak valid
✅ **Smooth navigation** ke detail situs
✅ **Testing buttons** untuk development
✅ **Logging** untuk debugging

## 🚀 Cara Menambah Situs Baru

1. **Tambah data di database**:
```sql
INSERT INTO public.situs (uid, nama_situs, lokasi_daerah, qr_code_data, ...)
VALUES (uuid_generate_v4(), 'Nama Situs', 'Lokasi', 'SITUS_QR_2024', ...);
```

2. **Update qrCodeGenerator.js** dengan QR code baru
3. **Test dengan QR code generator online**

## 🔍 Debugging

Console logs tersedia untuk tracking:
- `🔍 QR Code scanned: [data]`
- `🔎 Searching for situs with QR code: [data]`
- `✅ Situs found: [nama_situs]`
- `❌ QR Code not found: [error]`
- `📍 SitusDetailScreen received situs data: [data]`

## 📱 User Experience

### Successful Scan
1. QR code detected
2. Show loading indicator
3. Display confirmation dengan info situs
4. Navigate to SitusDetailScreen
5. User can start heritage journey

### Failed Scan
1. QR code detected
2. Show error message dengan guidance
3. Option to try again
4. Stay in scanner mode

## 🌐 Platform Support

- ✅ **iOS**: Camera scanning + manual input
- ✅ **Android**: Camera scanning + manual input  
- ✅ **Web**: Manual input dengan test buttons
- ✅ **Expo Go**: Full support untuk development

## 🔐 Security

- QR codes validated against database
- No direct URL execution
- Controlled navigation flow
- Error boundaries untuk exception handling

---

**Note**: Sistem ini sudah fully functional dan terintegrasi dengan database Supabase dan navigation system aplikasi.
