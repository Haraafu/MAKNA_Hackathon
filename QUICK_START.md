# 🚀 Quick Start - Auth System MAKNA

## 📋 Langkah Setup Cepat

### 1. Setup Supabase Database
```sql
-- Jalankan di Supabase SQL Editor
-- Copy paste seluruh isi dari file: database/setup.sql
```

### 2. Environment Variables
Buat file `.env` di root project:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Install & Run
```bash
npm install
npm start
```

## ✅ Test Checklist

1. **Buka aplikasi** - Lihat splash screen
2. **Registrasi user baru:**
   - Nama lengkap: "John Doe"
   - Username: "johndoe"
   - Phone: "08123456789"
   - Email: "john@example.com"
   - Password: "password123"

3. **Verifikasi email** (opsional, bisa skip)
4. **Login** dengan akun yang baru dibuat
5. **Akses ProfileScreen** dan coba edit profile
6. **Logout** dan pastikan kembali ke auth screen

## 🔍 Troubleshooting

### Error: "Missing Supabase environment variables"
- Cek file `.env` ada di root folder
- Restart development server: `npm start`

### Error saat registrasi
- Cek Supabase dashboard → Authentication → Users
- Cek tabel `profiles` ada data baru

### Username already taken
- Coba username yang berbeda
- Username harus unique

## 📱 Features Ready

✅ **Registrasi** - Form lengkap dengan validasi  
✅ **Login** - Email + password  
✅ **Auth Gate** - Wajib login untuk akses app  
✅ **Profile Management** - View & edit profile  
✅ **Session Management** - Auto login  
✅ **Logout** - Clear session  
✅ **UI/UX** - Tema batik, bahasa Indonesia  
✅ **Database** - PostgreSQL dengan RLS  
✅ **Validation** - Client & server side  

🎉 **Sistem auth sudah siap digunakan!**
