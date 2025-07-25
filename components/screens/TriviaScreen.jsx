import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TripService } from '../../lib/tripService';
import { useAuthContext } from '../../contexts/AuthContext';
import { BadgeIcon } from '../IconBar';

const { width } = Dimensions.get('window');

export default function TriviaScreen({ situs, onClose, onTriviaComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gameSession, setGameSession] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const { user } = useAuthContext();

  useEffect(() => {
    loadTriviaData();
    startTriviaSession();
  }, []);

  const loadTriviaData = async () => {
    try {
      const result = await TripService.getTriviaQuestions(situs.uid);
      if (result.success) {
        setQuestions(result.data);
      }
    } catch (error) {
      console.error('Error loading trivia data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTriviaSession = async () => {
    try {
      if (user?.id) {
        const sessionResult = await TripService.startGameSession(user.id, situs.uid, 'trivia');
        if (sessionResult.success) {
          setGameSession(sessionResult.data);
        }
      }
    } catch (error) {
      console.error('Error starting trivia session:', error);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !user?.id) return;

    setSubmitting(true);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const result = await TripService.submitTriviaAnswer(
        user.id,
        situs.uid,
        currentQuestion.uid,
        selectedAnswer
      );

      if (result.success) {
        const newAnswer = {
          questionId: currentQuestion.uid,
          selectedAnswer,
          isCorrect: result.data.is_correct,
          correctAnswer: result.data.correct_answer,
          explanation: result.data.explanation
        };

        setUserAnswers(prev => [...prev, newAnswer]);
        setShowResult(true);

        // Show result animation
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', 'Gagal mengirim jawaban. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      completeTriviaSession();
    }
  };

  const completeTriviaSession = async () => {
    try {
      if (!user?.id) return;

      const result = await TripService.completeTriviaSession(user.id, situs.uid);
      if (result.success) {
        const { badge_earned, final_score, badge_info } = result.data;
        
        Alert.alert(
          'Trivia Selesai!',
          `Skor Anda: ${final_score.correct_answers}/${final_score.total_questions} (${Math.round(final_score.score_percentage)}%)\n\n${
            badge_earned 
              ? `🎉 Selamat! Anda mendapat badge "${badge_info.badge_title}"!` 
              : 'Coba lagi untuk mendapatkan badge! (minimal 3 dari 5 jawaban benar)'
          }`,
          [
            {
              text: 'OK',
              onPress: () => onTriviaComplete({
                badgeEarned: badge_earned,
                score: final_score,
                badgeInfo: badge_info
              })
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error completing trivia:', error);
    }
  };

  const renderProgressBar = () => {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    return (
      <View className="px-6 py-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text 
            className="text-sm font-medium"
            style={{
              fontFamily: 'Poppins_500Medium',
              color: '#6B7280'
            }}
          >
            Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
          </Text>
          <Text 
            className="text-sm font-medium"
            style={{
              fontFamily: 'Poppins_500Medium',
              color: '#461C07'
            }}
          >
            {Math.round(progress)}%
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full">
          <View 
            className="h-2 rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: '#461C07'
            }}
          />
        </View>
      </View>
    );
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    const options = [
      { key: 'A', text: question.option_a },
      { key: 'B', text: question.option_b },
      { key: 'C', text: question.option_c },
      { key: 'D', text: question.option_d }
    ];

    return (
      <Animated.View className="flex-1 px-6" style={{ opacity: fadeAnim }}>
        {/* Question Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-100">
          <View className="flex-row items-center mb-4">
            <View className="bg-amber-100 rounded-full p-3 mr-4">
              <Ionicons name="help-circle-outline" size={24} color="#D97706" />
            </View>
            <View className="flex-1">
              <Text 
                className="text-xs font-medium mb-1"
                style={{
                  fontFamily: 'Poppins_500Medium',
                  color: '#6B7280'
                }}
              >
                {question.difficulty?.toUpperCase() || 'MEDIUM'}
              </Text>
              <Text 
                className="text-lg font-semibold"
                style={{
                  fontFamily: 'Poppins_600SemiBold',
                  color: '#1F2937'
                }}
              >
                Pertanyaan
              </Text>
            </View>
          </View>
          
          <Text 
            className="text-base leading-6"
            style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: 16,
              color: '#374151',
              lineHeight: 24
            }}
          >
            {question.question}
          </Text>
        </View>

        {/* Answer Options */}
        <View className="space-y-3 mb-6">
          {options.map((option) => {
            let buttonStyle = 'bg-white border-2 border-gray-200';
            let textColor = '#374151';
            let iconName = 'radio-button-off-outline';
            let iconColor = '#9CA3AF';

            if (showResult) {
              const correctAnswer = userAnswers[userAnswers.length - 1]?.correctAnswer;
              const userAnswer = userAnswers[userAnswers.length - 1]?.selectedAnswer;
              
              if (option.key === correctAnswer) {
                buttonStyle = 'bg-green-50 border-2 border-green-300';
                textColor = '#047857';
                iconName = 'checkmark-circle';
                iconColor = '#10B981';
              } else if (option.key === userAnswer && option.key !== correctAnswer) {
                buttonStyle = 'bg-red-50 border-2 border-red-300';
                textColor = '#DC2626';
                iconName = 'close-circle';
                iconColor = '#EF4444';
              }
            } else if (selectedAnswer === option.key) {
              buttonStyle = 'bg-amber-50 border-2 border-amber-300';
              textColor = '#D97706';
              iconName = 'radio-button-on-outline';
              iconColor = '#D97706';
            }

            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => !showResult && handleAnswerSelect(option.key)}
                disabled={showResult}
                className={`p-4 rounded-xl flex-row items-center ${buttonStyle}`}
                activeOpacity={0.7}
              >
                <View className="mr-4">
                  <Ionicons name={iconName} size={24} color={iconColor} />
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-sm font-semibold mb-1"
                    style={{
                      fontFamily: 'Poppins_600SemiBold',
                      color: textColor
                    }}
                  >
                    {option.key}
                  </Text>
                  <Text 
                    className="text-base"
                    style={{
                      fontFamily: 'Poppins_400Regular',
                      color: textColor
                    }}
                  >
                    {option.text}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation (shown after answer) */}
        {showResult && userAnswers[userAnswers.length - 1]?.explanation && (
          <View className="bg-blue-50 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
              <Text 
                className="ml-2 font-semibold"
                style={{
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: 14,
                  color: '#3B82F6'
                }}
              >
                Penjelasan
              </Text>
            </View>
            <Text 
              className="text-sm"
              style={{
                fontFamily: 'Poppins_400Regular',
                color: '#1E40AF'
              }}
            >
              {userAnswers[userAnswers.length - 1].explanation}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text 
            className="text-lg"
            style={{
              fontFamily: 'Poppins_500Medium',
              color: '#6B7280'
            }}
          >
            Memuat pertanyaan trivia...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="help-circle-outline" size={64} color="#9CA3AF" />
          <Text 
            className="text-lg text-center mt-4"
            style={{
              fontFamily: 'Poppins_500Medium',
              color: '#6B7280'
            }}
          >
            Pertanyaan trivia tidak tersedia untuk situs ini.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity
            onPress={onClose}
            className="p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text 
              className="text-lg font-medium text-center"
              style={{
                fontFamily: 'Poppins_500Medium',
                fontSize: 18,
                color: '#1F2937'
              }}
            >
              Trivia {situs.nama_situs}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <BadgeIcon color="#461C07" size={20} />
            <Text 
              className="ml-1 text-sm font-medium"
              style={{
                fontFamily: 'Poppins_500Medium',
                color: '#461C07'
              }}
            >
              {userAnswers.filter(a => a.isCorrect).length}
            </Text>
          </View>
        </View>
        
        {renderProgressBar()}
      </View>

      {/* Content */}
      {renderQuestion()}

      {/* Bottom Actions */}
      <View className="bg-white px-6 py-4 border-t border-gray-200">
        {!showResult ? (
          <TouchableOpacity
            onPress={handleSubmitAnswer}
            disabled={!selectedAnswer || submitting}
            className={`rounded-xl py-4 ${
              !selectedAnswer || submitting ? 'bg-gray-300' : 'bg-amber-600'
            }`}
            activeOpacity={0.8}
          >
            <Text 
              className="text-center font-semibold"
              style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 16,
                color: !selectedAnswer || submitting ? '#9CA3AF' : '#FFFFFF'
              }}
            >
              {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleNextQuestion}
            className="rounded-xl py-4"
            style={{ backgroundColor: '#461C07' }}
            activeOpacity={0.8}
          >
            <Text 
              className="text-center text-white font-semibold"
              style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 16
              }}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Selesai' : 'Pertanyaan Selanjutnya'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
} 