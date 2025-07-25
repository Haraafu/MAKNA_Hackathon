import { supabase } from './supabase';

export class TripService {
  // Start a new trip by scanning QR code
  static async startTrip(profileId, qrCodeData) {
    try {
      const { data, error } = await supabase.rpc('start_trip', {
        p_profile_id: profileId,
        p_qr_code_data: qrCodeData
      });

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Visit a building in current trip
  static async visitBuilding(tripId, buildingId, notes = null) {
    try {
      const { data, error } = await supabase.rpc('visit_building', {
        p_trip_uid: tripId,
        p_bangunan_uid: buildingId,
        p_notes: notes
      });

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user's active trips
  static async getActiveTrips(profileId) {
    try {
      const { data, error } = await supabase
        .from('user_trips')
        .select(`
          *,
          situs:situs_uid (
            uid,
            nama_situs,
            lokasi_daerah,
            informasi_situs,
            estimated_duration_minutes
          )
        `)
        .eq('profile_id', profileId)
        .eq('status', 'active');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get buildings for a trip with visit status
  static async getTripBuildings(tripId, situsId) {
    try {
      const { data, error } = await supabase
        .from('bangunan_situs')
        .select(`
          uid,
          nama_bangunan,
          jenis_bangunan,
          deskripsi,
          urutan_kunjungan,
          latitude,
          longitude,
          building_visits!left (
            uid,
            visited_at,
            notes
          )
        `)
        .eq('situs_uid', situsId)
        .eq('building_visits.trip_uid', tripId)
        .order('urutan_kunjungan');

      if (error) throw error;
      
      // Transform data to include visit status
      const buildingsWithStatus = data.map(building => ({
        ...building,
        is_visited: building.building_visits.length > 0,
        visited_at: building.building_visits[0]?.visited_at || null,
        notes: building.building_visits[0]?.notes || null
      }));

      return { success: true, data: buildingsWithStatus };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user's earned badges (legacy function)
  static async getUserBadges(profileId) {
    try {
      const { data, error } = await supabase
        .from('profile_badges')
        .select(`
          *,
          badges:badge_id (
            uid,
            badge_title,
            badge_info,
            badge_image_url,
            situs:situs_uid (
              nama_situs,
              lokasi_daerah
            )
          )
        `)
        .eq('profile_id', profileId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user's badge statistics using new schema
  static async getUserBadgeStats(profileId) {
    try {
      const { data, error } = await supabase.rpc('get_user_badge_stats', {
        p_profile_id: profileId
      });

      if (error) throw error;
      
      const result = data[0] || { total_badges: 0, badges_earned: [], last_badge_earned_at: null };
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in getUserBadgeStats:', error);
      
      // Fallback: try to get total badges directly from profiles table
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('total_badges')
          .eq('id', profileId)
          .single();

        if (!profileError && profileData) {
          return { 
            success: true, 
            data: { 
              total_badges: profileData.total_badges || 0, 
              badges_earned: [], 
              last_badge_earned_at: null 
            } 
          };
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      return { success: false, error: error.message };
    }
  }



  // Get user's total badge count from profile
  static async getUserTotalBadges(profileId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('total_badges')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      return { success: true, data: data.total_badges || 0 };
    } catch (error) {
      console.error('Error in getUserTotalBadges:', error);
      return { success: false, error: error.message };
    }
  }

  // Get leaderboard data - top users by total badges
  static async getLeaderboard(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          firstname,
          lastname,
          total_badges,
          created_at
        `)
        .order('total_badges', { ascending: false })
        .order('created_at', { ascending: true }) // Secondary sort by registration date
        .limit(limit);

      if (error) throw error;

      // Get user locations from their most recent completed trip
      const leaderboardWithLocations = await Promise.all(
        data.map(async (user, index) => {
          try {
            // Get the most recent completed trip for location info
            const { data: tripData } = await supabase
              .from('user_trips')
              .select(`
                situs:situs_uid (
                  lokasi_daerah
                )
              `)
              .eq('profile_id', user.id)
              .eq('status', 'completed')
              .order('completed_at', { ascending: false })
              .limit(1)
              .single();

            return {
              ...user,
              rank: index + 1,
              location: tripData?.situs?.lokasi_daerah || 'Jakarta, Indonesia' // Default location
            };
          } catch {
            return {
              ...user,
              rank: index + 1,
              location: 'Jakarta, Indonesia' // Default location if no trips found
            };
          }
        })
      );

      return { success: true, data: leaderboardWithLocations };
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return { success: false, error: error.message };
    }
  }


  // Get trip history (completed trips)
  static async getTripHistory(profileId) {
    try {
      const { data, error } = await supabase
        .from('user_trips')
        .select(`
          *,
          situs:situs_uid (
            uid,
            nama_situs,
            lokasi_daerah,
            informasi_situs
          )
        `)
        .eq('profile_id', profileId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get available situs for exploration
  static async getAvailableSitus() {
    try {
      const { data, error } = await supabase
        .from('situs')
        .select(`
          uid,
          nama_situs,
          lokasi_daerah,
          informasi_situs,
          tahun_dibangun,
          estimated_duration_minutes,
          image_situs,
          bangunan_count:bangunan_situs(count)
        `)
        .order('nama_situs');

      if (error) throw error;

      // Log the first item to debug image path
      if (data?.length > 0) {
        console.log('First situs image path:', data[0].image_situs);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getAvailableSitus:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate QR code - check if situs exists
  static async validateQRCode(qrCodeData) {
    try {
      const { data, error } = await supabase
        .from('situs')
        .select('*')
        .eq('qr_code_data', qrCodeData)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'QR code not found' };
        }
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in validateQRCode:', error);
      return { success: false, error: error.message };
    }
  }

  // Find situs by QR code (new function for QR scanner)
  static async findSitusByQRCode(qrCodeData) {
    try {
      console.log('🔍 Finding situs with QR code data:', qrCodeData);
      
      // First try to find by qr_code_data
      let { data, error } = await supabase
        .from('situs')
        .select(`
          *,
          bangunan_count:bangunan_situs(count)
        `)
        .eq('qr_code_data', qrCodeData)
        .single();

      // If not found by qr_code_data, try to find by UID
      if (error && error.code === 'PGRST116') {
        console.log('❌ Not found by qr_code_data, trying by UID...');
        
        const result = await supabase
          .from('situs')
          .select(`
            *,
            bangunan_count:bangunan_situs(count)
          `)
          .eq('uid', qrCodeData)
          .single();
          
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.log('❌ Database error:', error);
        if (error.code === 'PGRST116') {
          return { success: false, error: 'QR code tidak ditemukan dalam sistem' };
        }
        throw error;
      }

      console.log('✅ Found situs data:', {
        uid: data.uid,
        nama_situs: data.nama_situs,
        qr_code_data: data.qr_code_data,
        building_count: data.bangunan_count?.[0]?.count
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error in findSitusByQRCode:', error);
      return { success: false, error: error.message };
    }
  }

  // Debug function to get all situs data
  static async getAllSitusData() {
    try {
      const { data, error } = await supabase
        .from('situs')
        .select(`
          uid,
          nama_situs,
          lokasi_daerah,
          qr_code_data,
          bangunan_count:bangunan_situs(count)
        `);

      if (error) throw error;

      console.log('🏛️ All situs data in database:');
      data.forEach((situs, index) => {
        console.log(`${index + 1}. ${situs.nama_situs}:`);
        console.log(`   - UID: ${situs.uid}`);
        console.log(`   - QR Code Data: ${situs.qr_code_data}`);
        console.log(`   - Lokasi: ${situs.lokasi_daerah}`);
        console.log(`   - Buildings: ${situs.bangunan_count?.[0]?.count || 0}`);
        console.log('---');
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error getting all situs data:', error);
      return { success: false, error: error.message };
    }
  }

  // GAME MECHANISM FUNCTIONS
  
  // Get situs overview content
  static async getSitusOverview(situsUid) {
    try {
      const { data, error } = await supabase
        .from('situs_overview')
        .select('*')
        .eq('situs_uid', situsUid)
        .order('order_sequence', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in getSitusOverview:', error);
      return { success: false, error: error.message };
    }
  }

  // Get trivia questions for situs
  static async getTriviaQuestions(situsUid) {
    try {
      const { data, error } = await supabase
        .from('trivia_questions')
        .select('*')
        .eq('situs_uid', situsUid)
        .order('order_sequence', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in getTriviaQuestions:', error);
      return { success: false, error: error.message };
    }
  }

  // Start game session
  static async startGameSession(profileId, situsUid, sessionType) {
    try {
      const { data, error } = await supabase.rpc('start_game_session', {
        p_profile_id: profileId,
        p_situs_uid: situsUid,
        p_session_type: sessionType
      });

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in startGameSession:', error);
      return { success: false, error: error.message };
    }
  }

  // Submit trivia answer
  static async submitTriviaAnswer(profileId, situsUid, questionUid, selectedAnswer, attemptNumber = 1) {
    try {
      const { data, error } = await supabase.rpc('submit_trivia_answer', {
        p_profile_id: profileId,
        p_situs_uid: situsUid,  
        p_question_uid: questionUid,
        p_selected_answer: selectedAnswer,
        p_attempt_number: attemptNumber
      });

      if (error) throw error;
      
      // Map the new column name to the expected format
      const result = data[0];
      return { 
        success: true, 
        data: {
          is_correct: result.answer_is_correct,
          correct_answer: result.correct_answer,
          explanation: result.explanation,
          current_score: result.current_score
        }
      };
    } catch (error) {
      console.error('Error in submitTriviaAnswer:', error);
      return { success: false, error: error.message };
    }
  }

  // Complete trivia session
  static async completeTriviaSession(profileId, situsUid) {
    try {
      const { data, error } = await supabase.rpc('complete_trivia_session', {
        p_profile_id: profileId,
        p_situs_uid: situsUid
      });

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error in completeTriviaSession:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's game session for a situs
  static async getUserGameSession(profileId, situsUid, sessionType) {
    try {
      const { data, error } = await supabase
        .from('user_game_sessions')
        .select('*')
        .eq('profile_id', profileId)
        .eq('situs_uid', situsUid)
        .eq('session_type', sessionType)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data: data || null };
    } catch (error) {
      console.error('Error in getUserGameSession:', error);
      return { success: false, error: error.message };
    }
  }
} 