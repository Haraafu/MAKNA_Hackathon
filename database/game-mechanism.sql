-- MAKNA Game Mechanism Database Schema
-- This extends the existing schema with overview content and trivia system

-- Situs Overview Content Table
CREATE TABLE IF NOT EXISTS public.situs_overview (
  uid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  situs_uid uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  order_sequence integer NOT NULL DEFAULT 1,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_situs_overview_situs FOREIGN KEY (situs_uid)
    REFERENCES public.situs(uid)
    ON DELETE CASCADE
);

-- Trivia Questions Table
CREATE TABLE IF NOT EXISTS public.trivia_questions (
  uid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  situs_uid uuid NOT NULL,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation text,
  difficulty VARCHAR(10) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  order_sequence integer NOT NULL DEFAULT 1,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_trivia_questions_situs FOREIGN KEY (situs_uid)
    REFERENCES public.situs(uid)
    ON DELETE CASCADE
);

-- User Trivia Attempts Table
CREATE TABLE IF NOT EXISTS public.user_trivia_attempts (
  uid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid NOT NULL,
  situs_uid uuid NOT NULL,
  question_uid uuid NOT NULL,
  selected_answer CHAR(1) NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct boolean NOT NULL,
  attempt_number integer DEFAULT 1,
  answered_at timestamp DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_trivia_profile FOREIGN KEY (profile_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_user_trivia_situs FOREIGN KEY (situs_uid)
    REFERENCES public.situs(uid)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_user_trivia_question FOREIGN KEY (question_uid)
    REFERENCES public.trivia_questions(uid)
    ON DELETE CASCADE,
    
  CONSTRAINT unique_user_question_attempt UNIQUE (profile_id, question_uid, attempt_number)
);

-- User Game Sessions Table
CREATE TABLE IF NOT EXISTS public.user_game_sessions (
  uid uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid NOT NULL,
  situs_uid uuid NOT NULL,
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('overview', 'trivia')),
  status VARCHAR(20) NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'abandoned')),
  total_questions integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  score_percentage decimal(5,2) DEFAULT 0.00,
  started_at timestamp DEFAULT CURRENT_TIMESTAMP,
  completed_at timestamp NULL,
  badge_earned boolean DEFAULT false,
  
  CONSTRAINT fk_user_game_profile FOREIGN KEY (profile_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_user_game_situs FOREIGN KEY (situs_uid)
    REFERENCES public.situs(uid)
    ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_situs_overview_situs ON public.situs_overview(situs_uid, order_sequence);
CREATE INDEX idx_trivia_questions_situs ON public.trivia_questions(situs_uid, order_sequence);
CREATE INDEX idx_user_trivia_attempts_profile ON public.user_trivia_attempts(profile_id, situs_uid);
CREATE INDEX idx_user_game_sessions_profile ON public.user_game_sessions(profile_id, situs_uid, status);

-- Function to start a game session
CREATE OR REPLACE FUNCTION start_game_session(
  p_profile_id uuid,
  p_situs_uid uuid,
  p_session_type text
)
RETURNS TABLE(
  session_uid uuid,
  session_info jsonb
) AS $$
DECLARE
  v_session_uid uuid;
  v_session_data jsonb;
BEGIN
  -- Create new game session
  INSERT INTO public.user_game_sessions (profile_id, situs_uid, session_type)
  VALUES (p_profile_id, p_situs_uid, p_session_type)
  RETURNING uid INTO v_session_uid;
  
  -- Get session information
  SELECT jsonb_build_object(
    'session_uid', v_session_uid,
    'profile_id', p_profile_id,
    'situs_uid', p_situs_uid,
    'session_type', p_session_type,
    'status', 'started',
    'started_at', CURRENT_TIMESTAMP
  ) INTO v_session_data;
  
  RETURN QUERY SELECT v_session_uid, v_session_data;
END;
$$ LANGUAGE plpgsql;

-- Function to submit trivia answer
CREATE OR REPLACE FUNCTION submit_trivia_answer(
  p_profile_id uuid,
  p_situs_uid uuid,
  p_question_uid uuid,
  p_selected_answer char,
  p_attempt_number integer DEFAULT 1
)
RETURNS TABLE(
  is_correct boolean,
  correct_answer char,
  explanation text,
  current_score jsonb
) AS $$
DECLARE
  v_question_record record;
  v_is_correct boolean;
  v_session_record record;
  v_total_questions integer;
  v_correct_count integer;
  v_score_percentage decimal;
BEGIN
  -- Get question details
  SELECT * INTO v_question_record
  FROM public.trivia_questions
  WHERE uid = p_question_uid AND situs_uid = p_situs_uid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question not found';
  END IF;
  
  -- Check if answer is correct
  v_is_correct := (p_selected_answer = v_question_record.correct_answer);
  
  -- Record the attempt
  INSERT INTO public.user_trivia_attempts 
    (profile_id, situs_uid, question_uid, selected_answer, is_correct, attempt_number)
  VALUES 
    (p_profile_id, p_situs_uid, p_question_uid, p_selected_answer, v_is_correct, p_attempt_number)
  ON CONFLICT (profile_id, question_uid, attempt_number) 
  DO UPDATE SET 
    selected_answer = EXCLUDED.selected_answer,
    is_correct = EXCLUDED.is_correct,
    answered_at = CURRENT_TIMESTAMP;
  
  -- Get current session and update score
  SELECT * INTO v_session_record
  FROM public.user_game_sessions
  WHERE profile_id = p_profile_id 
    AND situs_uid = p_situs_uid 
    AND session_type = 'trivia'
    AND status = 'started'
  ORDER BY started_at DESC
  LIMIT 1;
  
  IF FOUND THEN
    -- Count total questions for this situs
    SELECT COUNT(*) INTO v_total_questions
    FROM public.trivia_questions
    WHERE situs_uid = p_situs_uid;
    
    -- Count correct answers by this user for this situs
    SELECT COUNT(*) INTO v_correct_count
    FROM public.user_trivia_attempts
    WHERE profile_id = p_profile_id 
      AND situs_uid = p_situs_uid
      AND is_correct = true
      AND attempt_number = p_attempt_number;
    
    -- Calculate score percentage
    v_score_percentage := CASE 
      WHEN v_total_questions > 0 THEN (v_correct_count::decimal / v_total_questions::decimal) * 100
      ELSE 0
    END;
    
    -- Update session
    UPDATE public.user_game_sessions
    SET 
      total_questions = v_total_questions,
      correct_answers = v_correct_count,
      score_percentage = v_score_percentage
    WHERE uid = v_session_record.uid;
  END IF;
  
  RETURN QUERY SELECT 
    v_is_correct,
    v_question_record.correct_answer,
    v_question_record.explanation,
    jsonb_build_object(
      'total_questions', COALESCE(v_total_questions, 0),
      'correct_answers', COALESCE(v_correct_count, 0),
      'score_percentage', COALESCE(v_score_percentage, 0)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to complete trivia and award badge if eligible
CREATE OR REPLACE FUNCTION complete_trivia_session(
  p_profile_id uuid,
  p_situs_uid uuid
)
RETURNS TABLE(
  session_completed boolean,
  badge_earned boolean,
  final_score jsonb,
  badge_info jsonb
) AS $$
DECLARE
  v_session_record record;
  v_badge_earned boolean := false;
  v_badge_data jsonb := NULL;
  v_score_percentage decimal;
BEGIN
  -- Get current trivia session
  SELECT * INTO v_session_record
  FROM public.user_game_sessions
  WHERE profile_id = p_profile_id 
    AND situs_uid = p_situs_uid 
    AND session_type = 'trivia'
    AND status = 'started'
  ORDER BY started_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active trivia session found';
  END IF;
  
  v_score_percentage := v_session_record.score_percentage;
  
  -- Check if user earned badge (60% or higher = 3 out of 5 questions)
  IF v_score_percentage >= 60.00 THEN
    v_badge_earned := true;
    
    -- Award badge
    INSERT INTO public.profile_badges (profile_id, badge_id)
    SELECT p_profile_id, b.uid
    FROM public.badges b
    WHERE b.situs_uid = p_situs_uid
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
    WHERE b.situs_uid = p_situs_uid;
  END IF;
  
  -- Complete the session
  UPDATE public.user_game_sessions
  SET 
    status = 'completed',
    completed_at = CURRENT_TIMESTAMP,
    badge_earned = v_badge_earned
  WHERE uid = v_session_record.uid;
  
  RETURN QUERY SELECT 
    true,
    v_badge_earned,
    jsonb_build_object(
      'total_questions', v_session_record.total_questions,
      'correct_answers', v_session_record.correct_answers,
      'score_percentage', v_score_percentage
    ),
    v_badge_data;
END;
$$ LANGUAGE plpgsql; 