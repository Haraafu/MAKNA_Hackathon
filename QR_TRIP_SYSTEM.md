# MAKNA QR Trip System Documentation

## Overview
Sistem QR Trip untuk aplikasi MAKNA memungkinkan pengguna untuk:
1. Scan QR code untuk memulai trip situs bersejarah
2. Melakukan perjalanan virtual/fisik ke bangunan-bangunan bersejarah
3. Mendapatkan badge setelah menyelesaikan semua bangunan dalam situs

## Database Schema Changes

### 1. Updated Profiles Table
```sql
-- Tabel profiles yang baru dengan field sesuai permintaan
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,        -- Field email baru
  firstname text NOT NULL,           -- Field firstname baru  
  lastname text NOT NULL,            -- Field lastname baru
  password text NOT NULL,            -- Field password baru
  username text UNIQUE,              -- Field username (optional)
  avatar_url text,
  phone_number text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Enhanced Situs Table
```sql
-- Tambahan field untuk mendukung QR system
ALTER TABLE public.situs ADD COLUMN qr_code_data text UNIQUE;
ALTER TABLE public.situs ADD COLUMN estimated_duration_minutes integer DEFAULT 60;
```

### 3. Enhanced Bangunan Situs Table
```sql
-- Tambahan field untuk urutan kunjungan dan koordinat
ALTER TABLE public.bangunan_situs ADD COLUMN urutan_kunjungan integer NOT NULL DEFAULT 1;
ALTER TABLE public.bangunan_situs ADD COLUMN latitude decimal(10, 8);
ALTER TABLE public.bangunan_situs ADD COLUMN longitude decimal(11, 8);
ALTER TABLE public.bangunan_situs ADD COLUMN deskripsi text;
```

### 4. New Tables for Trip System

#### User Trips Table
```sql
-- Track trip aktif dan selesai dari user
CREATE TABLE public.user_trips (
  uid uuid PRIMARY KEY,
  profile_id uuid NOT NULL,
  situs_uid uuid NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  total_buildings integer DEFAULT 0,
  visited_buildings integer DEFAULT 0
);
```

#### Building Visits Table
```sql
-- Track kunjungan ke setiap bangunan
CREATE TABLE public.building_visits (
  uid uuid PRIMARY KEY,
  trip_uid uuid NOT NULL,
  bangunan_uid uuid NOT NULL,
  visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes text,
  CONSTRAINT unique_trip_building UNIQUE (trip_uid, bangunan_uid)
);
```

## System Flow

### 1. QR Code Scanning Flow
```
User scan QR → Get UUID/Code → Check database → Display situs info → Start trip
```

### 2. Trip Progress Flow
```
Start trip → Visit building 1 → Mark visited → Next building → ... → Complete all → Get badge
```

### 3. Badge System Flow
```
Complete all buildings → Auto award badge → Update profile_badges → Notification
```

## Database Functions

### 1. Start Trip Function
```sql
-- Memulai trip baru berdasarkan QR code
SELECT * FROM start_trip(user_profile_id, 'QR_CODE_DATA');
```

**Returns:**
- `trip_uid`: ID trip yang baru dibuat
- `situs_info`: Informasi lengkap situs (JSON)
- `total_buildings`: Jumlah total bangunan yang harus dikunjungi

**Error Cases:**
- QR code tidak valid atau situs tidak ditemukan
- User sudah memiliki trip aktif untuk situs tersebut

### 2. Visit Building Function
```sql
-- Mencatat kunjungan ke bangunan
SELECT * FROM visit_building(trip_uid, bangunan_uid, 'Optional notes');
```

**Returns:**
- `success`: Boolean status berhasil
- `visited_count`: Jumlah bangunan yang sudah dikunjungi
- `total_count`: Total bangunan dalam situs
- `is_trip_completed`: Boolean apakah trip sudah selesai
- `badge_earned`: Info badge yang didapat (jika trip selesai)

## Frontend Integration Examples

### 1. QR Code Scanner Integration
```javascript
// Setelah scan QR code berhasil
const startTripResult = await supabase.rpc('start_trip', {
  p_profile_id: user.id,
  p_qr_code_data: scannedQRCode
});

if (startTripResult.data && startTripResult.data.length > 0) {
  const { trip_uid, situs_info, total_buildings } = startTripResult.data[0];
  
  // Tampilkan info situs
  console.log('Situs:', situs_info.nama_situs);
  console.log('Total bangunan:', total_buildings);
  
  // Navigate ke trip screen
  navigation.navigate('TripScreen', { 
    tripId: trip_uid, 
    situsInfo: situs_info 
  });
}
```

### 2. Building Visit Integration
```javascript
// Ketika user mengklik "Kunjungi" atau "Next" pada bangunan
const visitResult = await supabase.rpc('visit_building', {
  p_trip_uid: currentTripId,
  p_bangunan_uid: currentBuildingId,
  p_notes: userNotes || null
});

if (visitResult.data && visitResult.data.length > 0) {
  const { 
    success, 
    visited_count, 
    total_count, 
    is_trip_completed, 
    badge_earned 
  } = visitResult.data[0];
  
  // Update progress UI
  setProgress(visited_count / total_count);
  
  if (is_trip_completed && badge_earned) {
    // Show badge earned notification
    showBadgeNotification(badge_earned);
    
    // Navigate to completion screen
    navigation.navigate('TripCompleted', { badge: badge_earned });
  } else {
    // Move to next building
    moveToNextBuilding();
  }
}
```

### 3. Get Trip Progress
```sql
-- Query untuk mendapatkan progress trip
SELECT 
  ut.uid as trip_id,
  ut.status,
  ut.visited_buildings,
  ut.total_buildings,
  s.nama_situs,
  s.lokasi_daerah,
  COALESCE(ut.visited_buildings::float / ut.total_buildings * 100, 0) as progress_percentage
FROM user_trips ut
JOIN situs s ON ut.situs_uid = s.uid
WHERE ut.profile_id = $1 AND ut.status = 'active';
```

### 4. Get Building Sequence for Trip
```sql
-- Query untuk mendapatkan urutan bangunan dan status kunjungan
SELECT 
  bs.uid,
  bs.nama_bangunan,
  bs.jenis_bangunan,
  bs.deskripsi,
  bs.urutan_kunjungan,
  CASE WHEN bv.uid IS NOT NULL THEN true ELSE false END as is_visited,
  bv.visited_at
FROM bangunan_situs bs
LEFT JOIN building_visits bv ON bs.uid = bv.bangunan_uid AND bv.trip_uid = $1
WHERE bs.situs_uid = $2
ORDER BY bs.urutan_kunjungan;
```

## Sample Usage Scenarios

### Scenario 1: User Scan QR Borobudur
1. User scan QR dengan data `BOROBUDUR_QR_2024`
2. System find situs Borobudur
3. Create new trip dengan 4 bangunan
4. Show info: "Candi Borobudur - 4 bangunan - Estimasi 120 menit"

### Scenario 2: User Complete Building Visit
1. User di bangunan "Gerbang Utama" (urutan 1)
2. User klik "Selesai" atau "Next"
3. System mark building as visited
4. Show progress: "1/4 bangunan selesai"
5. Navigate ke "Tingkat Kamadhatu" (urutan 2)

### Scenario 3: Trip Completion
1. User selesai kunjungi bangunan terakhir "Tingkat Arupadhatu"
2. System mark trip as completed
3. Auto award badge "Penjelajah Borobudur"
4. Show notification & badge screen
5. Update user profile dengan badge baru

## Error Handling

### Common Errors:
1. **Invalid QR Code**: QR code tidak ditemukan di database
2. **Duplicate Active Trip**: User sudah punya trip aktif untuk situs yang sama
3. **Invalid Building**: Bangunan tidak belong ke situs dalam trip
4. **Trip Not Found**: Trip ID tidak valid atau sudah selesai

### Error Response Format:
```javascript
// Error response example
{
  error: {
    message: "Invalid QR code or situs not found",
    code: "INVALID_QR_CODE"
  }
}
```

## Performance Optimizations

### Indexes Created:
- `idx_user_trips_profile_status`: Query trip berdasarkan user dan status
- `idx_building_visits_trip`: Query kunjungan berdasarkan trip
- `idx_bangunan_situs_urutan`: Query bangunan berdasarkan urutan
- `idx_situs_qr_code`: Query situs berdasarkan QR code

### Recommended Caching:
1. Cache situs information setelah QR scan
2. Cache building sequence untuk trip aktif
3. Cache user progress untuk offline capability

## Testing Data

Schema sudah include sample data untuk testing:
- Situs: Candi Borobudur (4 bangunan) dan Candi Prambanan
- QR Codes: `BOROBUDUR_QR_2024`, `PRAMBANAN_QR_2024`
- Badges untuk masing-masing situs

## Next Steps

1. **Frontend Implementation**: 
   - QR Scanner screen
   - Trip progress screen
   - Building detail screen
   - Badge collection screen

2. **Additional Features**:
   - Trip history
   - Social sharing badges
   - Leaderboard integration
   - Offline mode support

3. **Content Management**:
   - Admin panel untuk manage situs dan bangunan
   - QR code generator
   - Badge design system 