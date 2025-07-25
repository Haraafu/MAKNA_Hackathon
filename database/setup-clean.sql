-- MAKNA Heritage Site Trip System Database Schema
-- This schema supports QR scanning, trip tracking, and badge system with badge counting

-- Drop existing tables and recreate with new structure
DROP TABLE IF EXISTS public.profile_badge_stats CASCADE;
DROP TABLE IF EXISTS public.profile_badges CASCADE;
DROP TABLE IF EXISTS public.building_visits CASCADE;
DROP TABLE IF EXISTS public.user_trips CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.bangunan_situs CASCADE;
DROP TABLE IF EXISTS public.situs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create updated profiles table with new fields
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  firstname text NOT NULL,
  lastname text NOT NULL,
  password text NOT NULL,
  avatar_url text,
  phone_number text,
  total_badges integer DEFAULT 0, -- Total badges earned by user
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authentication" ON public.profiles FOR INSERT WITH CHECK (true);

-- Situs table (heritage sites)
CREATE TABLE IF NOT EXISTS public.situs (
  uid uuid NOT NULL DEFAULT uuid_generate_v4(),
  nama_situs character varying NOT NULL,
  lokasi_daerah character varying NOT NULL,
  informasi_situs text,
  tahun_dibangun integer,
  qr_code_data text UNIQUE, -- QR code data for scanning
  estimated_duration_minutes integer DEFAULT 60, -- Estimated trip duration
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT situs_pkey PRIMARY KEY (uid)
);

-- Bangunan situs table with sequence order
CREATE TABLE IF NOT EXISTS public.bangunan_situs (
  uid uuid NOT NULL DEFAULT uuid_generate_v4(),
  nama_bangunan character varying NOT NULL,
  situs_uid uuid NOT NULL,
  jenis_bangunan character varying,
  kondisi character varying,
  deskripsi text,
  urutan_kunjungan integer NOT NULL DEFAULT 1, -- Order of visit in the trip
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT bangunan_situs_pkey PRIMARY KEY (uid),
  CONSTRAINT fk_situs_uid FOREIGN KEY (situs_uid) REFERENCES public.situs(uid) ON DELETE CASCADE
);

-- Badges table
CREATE TABLE IF NOT EXISTS public.badges (
  uid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  situs_uid uuid NOT NULL,
  badge_title VARCHAR NOT NULL,
  badge_info TEXT,
  badge_image_url text,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_badges_situs FOREIGN KEY (situs_uid)
    REFERENCES public.situs(uid)
    ON DELETE CASCADE
);

-- User trips table (tracking active and completed trips)
CREATE TABLE public.user_trips (
  uid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid NOT NULL,
  situs_uid uuid NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  total_buildings integer DEFAULT 0,
  visited_buildings integer DEFAULT 0,
  
  CONSTRAINT fk_user_trips_profile FOREIGN KEY (profile_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_user_trips_situs FOREIGN KEY (situs_uid)
    REFERENCES public.situs(uid)
    ON DELETE CASCADE,
    
  CONSTRAINT unique_active_trip UNIQUE (profile_id, situs_uid, status)
);

-- Building visits tracking table
CREATE TABLE public.building_visits (
  uid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_uid uuid NOT NULL,
  bangunan_uid uuid NOT NULL,
  visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes text,
  
  CONSTRAINT fk_building_visits_trip FOREIGN KEY (trip_uid)
    REFERENCES public.user_trips(uid)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_building_visits_bangunan FOREIGN KEY (bangunan_uid)
    REFERENCES public.bangunan_situs(uid)
    ON DELETE CASCADE,
    
  CONSTRAINT unique_trip_building UNIQUE (trip_uid, bangunan_uid)
);

-- Profile badges table (earned badges)
CREATE TABLE public.profile_badges (
  uid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid NOT NULL,
  badge_id uuid NOT NULL,
  trip_uid uuid, -- Reference to the trip that earned this badge
  jumlah INTEGER DEFAULT 1 CHECK (jumlah >= 0),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_profile_badges_profile FOREIGN KEY (profile_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_profile_badges_badge FOREIGN KEY (badge_id)
    REFERENCES public.badges(uid)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_profile_badges_trip FOREIGN KEY (trip_uid)
    REFERENCES public.user_trips(uid)
    ON DELETE SET NULL,

  CONSTRAINT unique_profile_badge UNIQUE (profile_id, badge_id)
);

-- Profile badge statistics table (for easier querying and performance)
CREATE TABLE public.profile_badge_stats (
  profile_id uuid PRIMARY KEY,
  total_badges integer DEFAULT 0,
  last_badge_earned_at TIMESTAMP,
  
  CONSTRAINT fk_profile_badge_stats_profile FOREIGN KEY (profile_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, firstname, lastname, password, total_badges)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstname', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'lastname', 'Name'),
    COALESCE(NEW.raw_user_meta_data->>'password', ''),
    0  -- Start with 0 badges
  );
  
  -- Initialize badge stats for new user
  INSERT INTO public.profile_badge_stats (profile_id, total_badges)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update badge counts when a badge is earned
CREATE OR REPLACE FUNCTION update_badge_counts()
RETURNS TRIGGER AS $$
DECLARE
  new_total integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update total badges in profiles table
    UPDATE public.profiles
    SET total_badges = total_badges + NEW.jumlah,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.profile_id;
    
    -- Update badge stats table
    INSERT INTO public.profile_badge_stats (profile_id, total_badges, last_badge_earned_at)
    VALUES (NEW.profile_id, NEW.jumlah, NEW.earned_at)
    ON CONFLICT (profile_id) DO UPDATE SET
      total_badges = profile_badge_stats.total_badges + NEW.jumlah,
      last_badge_earned_at = NEW.earned_at;
      
  ELSIF TG_OP = 'UPDATE' THEN
    -- Calculate the difference in badge count
    DECLARE
      badge_diff integer := NEW.jumlah - OLD.jumlah;
    BEGIN
      -- Update total badges in profiles table
      UPDATE public.profiles
      SET total_badges = total_badges + badge_diff,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.profile_id;
      
      -- Update badge stats table
      UPDATE public.profile_badge_stats
      SET total_badges = total_badges + badge_diff,
          last_badge_earned_at = NEW.earned_at
      WHERE profile_id = NEW.profile_id;
    END;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Update total badges in profiles table
    UPDATE public.profiles
    SET total_badges = total_badges - OLD.jumlah,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.profile_id;
    
    -- Update badge stats table
    UPDATE public.profile_badge_stats
    SET total_badges = total_badges - OLD.jumlah
    WHERE profile_id = OLD.profile_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update badge counts automatically
CREATE TRIGGER trigger_update_badge_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.profile_badges
  FOR EACH ROW EXECUTE FUNCTION update_badge_counts();

-- Indexes for better performance
CREATE INDEX idx_user_trips_profile_status ON public.user_trips(profile_id, status);
CREATE INDEX idx_building_visits_trip ON public.building_visits(trip_uid);
CREATE INDEX idx_bangunan_situs_urutan ON public.bangunan_situs(situs_uid, urutan_kunjungan);
CREATE INDEX idx_situs_qr_code ON public.situs(qr_code_data);
CREATE INDEX idx_profiles_total_badges ON public.profiles(total_badges);
CREATE INDEX idx_profile_badges_profile ON public.profile_badges(profile_id);

-- Functions for trip management

-- Function to start a new trip
CREATE OR REPLACE FUNCTION start_trip(
  p_profile_id uuid,
  p_qr_code_data text
)
RETURNS TABLE(
  trip_uid uuid,
  situs_info jsonb,
  total_buildings integer
) AS $$
DECLARE
  v_situs_uid uuid;
  v_trip_uid uuid;
  v_building_count integer;
  v_situs_data jsonb;
BEGIN
  -- Find situs by QR code
  SELECT uid INTO v_situs_uid 
  FROM public.situs 
  WHERE qr_code_data = p_qr_code_data;
  
  IF v_situs_uid IS NULL THEN
    RAISE EXCEPTION 'Invalid QR code or situs not found';
  END IF;
  
  -- Check if user already has an active trip for this situs
  IF EXISTS (
    SELECT 1 FROM public.user_trips 
    WHERE profile_id = p_profile_id 
    AND situs_uid = v_situs_uid 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User already has an active trip for this situs';
  END IF;
  
  -- Count total buildings in situs
  SELECT COUNT(*) INTO v_building_count
  FROM public.bangunan_situs
  WHERE situs_uid = v_situs_uid;
  
  -- Create new trip
  INSERT INTO public.user_trips (profile_id, situs_uid, total_buildings)
  VALUES (p_profile_id, v_situs_uid, v_building_count)
  RETURNING uid INTO v_trip_uid;
  
  -- Get situs information
  SELECT jsonb_build_object(
    'uid', s.uid,
    'nama_situs', s.nama_situs,
    'lokasi_daerah', s.lokasi_daerah,
    'informasi_situs', s.informasi_situs,
    'tahun_dibangun', s.tahun_dibangun,
    'estimated_duration_minutes', s.estimated_duration_minutes
  ) INTO v_situs_data
  FROM public.situs s
  WHERE s.uid = v_situs_uid;
  
  RETURN QUERY SELECT v_trip_uid, v_situs_data, v_building_count;
END;
$$ LANGUAGE plpgsql;

-- Function to visit a building
CREATE OR REPLACE FUNCTION visit_building(
  p_trip_uid uuid,
  p_bangunan_uid uuid,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  visited_count integer,
  total_count integer,
  is_trip_completed boolean,
  badge_earned jsonb
) AS $$
DECLARE
  v_trip_record record;
  v_visited_count integer;
  v_badge_data jsonb := NULL;
BEGIN
  -- Get trip information
  SELECT * INTO v_trip_record
  FROM public.user_trips
  WHERE uid = p_trip_uid AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active trip not found';
  END IF;
  
  -- Verify building belongs to the situs
  IF NOT EXISTS (
    SELECT 1 FROM public.bangunan_situs
    WHERE uid = p_bangunan_uid AND situs_uid = v_trip_record.situs_uid
  ) THEN
    RAISE EXCEPTION 'Building does not belong to this situs';
  END IF;
  
  -- Record the visit (will be ignored if already visited due to unique constraint)
  INSERT INTO public.building_visits (trip_uid, bangunan_uid, notes)
  VALUES (p_trip_uid, p_bangunan_uid, p_notes)
  ON CONFLICT (trip_uid, bangunan_uid) DO NOTHING;
  
  -- Count visited buildings
  SELECT COUNT(*) INTO v_visited_count
  FROM public.building_visits
  WHERE trip_uid = p_trip_uid;
  
  -- Update trip progress
  UPDATE public.user_trips
  SET visited_buildings = v_visited_count,
      updated_at = CURRENT_TIMESTAMP
  WHERE uid = p_trip_uid;
  
  -- Check if trip is completed
  IF v_visited_count >= v_trip_record.total_buildings THEN
    -- Complete the trip
    UPDATE public.user_trips
    SET status = 'completed',
        completed_at = CURRENT_TIMESTAMP
    WHERE uid = p_trip_uid;
    
    -- Award badge
    INSERT INTO public.profile_badges (profile_id, badge_id, trip_uid)
    SELECT v_trip_record.profile_id, b.uid, p_trip_uid
    FROM public.badges b
    WHERE b.situs_uid = v_trip_record.situs_uid
    ON CONFLICT (profile_id, badge_id) DO UPDATE SET
      jumlah = profile_badges.jumlah + 1,
      earned_at = CURRENT_TIMESTAMP;
    
    -- Get badge information
    SELECT jsonb_build_object(
      'badge_title', b.badge_title,
      'badge_info', b.badge_info,
      'badge_image_url', b.badge_image_url
    ) INTO v_badge_data
    FROM public.badges b
    WHERE b.situs_uid = v_trip_record.situs_uid;
    
    RETURN QUERY SELECT 
      true, 
      v_visited_count, 
      v_trip_record.total_buildings, 
      true, 
      v_badge_data;
  ELSE
    RETURN QUERY SELECT 
      true, 
      v_visited_count, 
      v_trip_record.total_buildings, 
      false, 
      v_badge_data;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert sample situs data with specific UIDs
INSERT INTO public.situs (uid, nama_situs, lokasi_daerah, informasi_situs, tahun_dibangun, qr_code_data, estimated_duration_minutes) VALUES
('bc28eb34-ddae-4504-932d-7d45efda169e', 'Candi Borobudur', 'Magelang, Jawa Tengah', 'Candi Buddha terbesar di dunia yang dibangun pada abad ke-8', 800, 'BOROBUDUR_QR_2024', 120),
('b862f681-baa9-4406-a303-8fad75ef480a', 'Candi Prambanan', 'Yogyakarta', 'Kompleks candi Hindu terbesar di Indonesia', 850, 'PRAMBANAN_QR_2024', 90);

-- Insert sample buildings for Candi Borobudur
INSERT INTO public.bangunan_situs (nama_bangunan, situs_uid, jenis_bangunan, kondisi, deskripsi, urutan_kunjungan) VALUES
('Gerbang Utama', 'bc28eb34-ddae-4504-932d-7d45efda169e', 'Candi Borobudur', 'Baik', 'Pintu masuk utama ke kompleks Borobudur', 1),
('Tingkat Kamadhatu', 'bc28eb34-ddae-4504-932d-7d45efda169e', 'Candi Borobudur', 'Baik', 'Tingkat dasar yang melambangkan dunia nafsu', 2),
('Tingkat Rupadhatu', 'bc28eb34-ddae-4504-932d-7d45efda169e', 'Candi Borobudur', 'Baik', 'Tingkat tengah dengan relief cerita Buddha', 3),
('Tingkat Arupadhatu', 'bc28eb34-ddae-4504-932d-7d45efda169e', 'Candi Borobudur', 'Baik', 'Tingkat tertinggi dengan stupa utama', 4);

-- Insert sample buildings for Candi Prambanan
INSERT INTO public.bangunan_situs (nama_bangunan, situs_uid, jenis_bangunan, kondisi, deskripsi, urutan_kunjungan) VALUES
('Candi Shiva Mahadeva', 'b862f681-baa9-4406-a303-8fad75ef480a', 'Candi Prambanan', 'Baik', 'Candi utama yang didedikasikan untuk Dewa Shiva', 1),
('Candi Brahma', 'b862f681-baa9-4406-a303-8fad75ef480a', 'Candi Prambanan', 'Baik', 'Candi yang didedikasikan untuk Dewa Brahma', 2),
('Candi Vishnu', 'b862f681-baa9-4406-a303-8fad75ef480a', 'Candi Prambanan', 'Baik', 'Candi yang didedikasikan untuk Dewa Vishnu', 3),
('Candi Nandi', 'b862f681-baa9-4406-a303-8fad75ef480a', 'Candi Prambanan', 'Baik', 'Candi kendaraan Dewa Shiva', 4);

-- Insert badges for both sites
INSERT INTO public.badges (situs_uid, badge_title, badge_info, badge_image_url) VALUES
('bc28eb34-ddae-4504-932d-7d45efda169e', 'Penjelajah Borobudur', 'Berhasil menyelesaikan perjalanan di Candi Borobudur dan mempelajari sejarah Buddha', '/badges/borobudur-explorer.png'),
('b862f681-baa9-4406-a303-8fad75ef480a', 'Penjelajah Prambanan', 'Berhasil menyelesaikan perjalanan di Candi Prambanan dan mempelajari arsitektur Hindu', '/badges/prambanan-explorer.png');

-- Function to get user badge statistics
CREATE OR REPLACE FUNCTION get_user_badge_stats(p_profile_id uuid)
RETURNS TABLE(
  total_badges integer,
  badges_earned jsonb,
  last_badge_earned_at timestamp
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.total_badges,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'badge_title', b.badge_title,
          'badge_info', b.badge_info,
          'badge_image_url', b.badge_image_url,
          'jumlah', pb.jumlah,
          'earned_at', pb.earned_at
        )
      ) FILTER (WHERE pb.uid IS NOT NULL),
      '[]'::jsonb
    ) as badges_earned,
    pbs.last_badge_earned_at
  FROM public.profiles p
  LEFT JOIN public.profile_badge_stats pbs ON p.id = pbs.profile_id
  LEFT JOIN public.profile_badges pb ON p.id = pb.profile_id
  LEFT JOIN public.badges b ON pb.badge_id = b.uid
  WHERE p.id = p_profile_id
  GROUP BY p.total_badges, pbs.last_badge_earned_at;
END;
$$ LANGUAGE plpgsql;