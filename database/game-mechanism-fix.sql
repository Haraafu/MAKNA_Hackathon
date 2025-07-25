-- Fixed version of submit_trivia_answer function to resolve ambiguous column reference

-- Drop and recreate the function with proper column aliasing
DROP FUNCTION IF EXISTS submit_trivia_answer(uuid, uuid, uuid, char, integer);

CREATE OR REPLACE FUNCTION submit_trivia_answer(
  p_profile_id uuid,
  p_situs_uid uuid,
  p_question_uid uuid,
  p_selected_answer char,
  p_attempt_number integer DEFAULT 1
)
RETURNS TABLE(
  answer_is_correct boolean,
  correct_answer char,
  explanation text,
  current_score jsonb
) AS $$
DECLARE
  v_question_record record;
  v_is_answer_correct boolean;
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
  v_is_answer_correct := (p_selected_answer = v_question_record.correct_answer);
  
  -- Record the attempt with explicit column references
  INSERT INTO public.user_trivia_attempts 
    (profile_id, situs_uid, question_uid, selected_answer, is_correct, attempt_number)
  VALUES 
    (p_profile_id, p_situs_uid, p_question_uid, p_selected_answer, v_is_answer_correct, p_attempt_number)
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
    
    -- Count correct answers by this user for this situs with explicit table alias
    SELECT COUNT(*) INTO v_correct_count
    FROM public.user_trivia_attempts uta
    WHERE uta.profile_id = p_profile_id 
      AND uta.situs_uid = p_situs_uid
      AND uta.is_correct = true
      AND uta.attempt_number = p_attempt_number;
    
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
    v_is_answer_correct as answer_is_correct,
    v_question_record.correct_answer,
    v_question_record.explanation,
    jsonb_build_object(
      'total_questions', COALESCE(v_total_questions, 0),
      'correct_answers', COALESCE(v_correct_count, 0),
      'score_percentage', COALESCE(v_score_percentage, 0)
    ) as current_score;
END;
$$ LANGUAGE plpgsql; 