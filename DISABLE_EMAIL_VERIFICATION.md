# Disable Email Verification - MAKNA App

## Langkah-langkah untuk Disable Email Confirmation di Supabase

### 1. Masuk ke Supabase Dashboard
- Buka https://supabase.com/dashboard
- Login ke akun Anda
- Pilih project MAKNA

### 2. Disable Email Confirmation
1. **Pergi ke Authentication > Settings**
2. **Scroll ke bagian "User Signups"**
3. **Ubah "Enable email confirmations" menjadi OFF/Disabled**
4. **Klik "Save"**

### 3. Update Auth Policies (Optional)
Jika perlu, Anda bisa update RLS policies di SQL Editor:

```sql
-- Allow insert for new users (via trigger)
CREATE POLICY "Enable insert for authentication" ON public.profiles FOR INSERT WITH CHECK (true);

-- Update existing policies if needed
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
```

### 4. Testing Configuration
Setelah disable email confirmation:

1. **Test Sign Up**:
   - User bisa langsung sign up tanpa perlu konfirmasi email
   - Profile otomatis dibuat via database trigger
   - User langsung bisa login

2. **Test Sign In**:
   - User bisa langsung login dengan email/password
   - Profile data otomatis ter-load

### 5. Alternative: Auto-confirm via SQL (Jika masih ada masalah)

Jika masih ada user yang stuck di email_confirmation_pending, jalankan query ini:

```sql
-- Auto-confirm semua pending users
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    updated_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

### 6. Environment Variables
Pastikan di `.env` Anda sudah ada:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 7. Restart Development Server
Setelah perubahan, restart development server:

```bash
npx expo start --clear
```

## Troubleshooting Common Issues

### Issue 1: "Invalid login credentials"
**Solusi:**
- Pastikan email confirmation sudah di-disable
- Cek apakah user sudah ter-confirm di database
- Test dengan user baru

### Issue 2: "Profile not found"
**Solusi:**
- Pastikan trigger `handle_new_user()` berjalan
- Check di SQL Editor apakah profile ter-create otomatis
- Verify RLS policies

### Issue 3: "Password incorrect"
**Solusi:**
- Gunakan password yang sama saat sign up dan sign in
- Check apakah password ter-store dengan benar di profiles table

## Testing Commands

### Test di Supabase SQL Editor:
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- Check users
SELECT id, email, email_confirmed_at, created_at FROM auth.users;

-- Check profiles
SELECT id, email, firstname, lastname, username FROM public.profiles;

-- Test trigger manually (if needed)
SELECT public.handle_new_user();
```

## Final Steps
1. ✅ Disable email confirmation di dashboard
2. ✅ Run database setup script
3. ✅ Test sign up with new user
4. ✅ Test sign in with created user
5. ✅ Verify profile data loads correctly

Setelah mengikuti langkah-langkah ini, authentication flow akan bekerja tanpa email confirmation.
