'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ArrowRight, Loader2, Trophy } from 'lucide-react';

export default function QuizClient() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchQuiz = () => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    fetch('/api/quizzes/daily')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.quizzes) {
          const shuffled = data.quizzes
            .sort(() => Math.random() - 0.5)
            .map((quiz: any) => ({
              ...quiz,
              options: [...quiz.options].sort(() => Math.random() - 0.5),
            }));
          setQuizzes(shuffled);
        } else {
          setError(data.error || 'Tactical data unavailable. Please reconnect.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Communication error with Command Center. Check your network.');
        setLoading(false);
      });
  };

  useEffect(() => { fetchQuiz(); }, []);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === quizzes[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
      submitScore(score);
    }
  };

  const submitScore = async (finalScore: number) => {
    try {
      // Prioritize identifying user via the API if localStorage is missing
      const email = localStorage.getItem('userEmail');
      if (!email) {
        console.warn('Score submission paused: No user identity confirmed.');
        return;
      }
      
      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          score: finalScore, 
          totalQuestions: quizzes.length 
        })
      });

      if (!response.ok) {
        throw new Error('Mission report failed to upload.');
      }
    } catch (err) {
      console.error('Failed to submit score', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading today's challenge...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
        <div className="h-20 w-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
          <XCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Tactical Intel Lost</h2>
        <p className="text-slate-500 max-w-sm">{error}</p>
        <button onClick={fetchQuiz} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition shadow-xl">
          🔄 Retry Connection
        </button>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Trophy className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold">No quizzes available yet</h2>
        <p className="text-slate-500 max-w-md">The admin hasn't generated today's quizzes from the latest news. Please check back later.</p>
        <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition">
          Return Home
        </button>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / quizzes.length) * 100);
    return (
      <div className="mt-10 p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 text-center space-y-6 opacity-0 animate-fade-in-up hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="h-24 w-24 bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-float">
          <Trophy className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Quiz Completed!</h2>
        <p className="text-lg text-slate-500">You scored <strong>{score}</strong> out of <strong>{quizzes.length}</strong> ({percentage}%)</p>
        
        <div className="pt-6 border-t mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={fetchQuiz} className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">
            🔀 Retake with Shuffled Questions
          </button>
          <button onClick={() => router.push('/')} className="px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[currentIndex];

  return (
    <div className="opacity-0 animate-fade-in-up duration-500">
      <div className="mb-8 flex items-center justify-between text-sm font-bold text-slate-500">
        <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-1.5 rounded-full shadow-sm border border-blue-100/50">{currentQuiz.category}</span>
        <span>Question {currentIndex + 1} of {quizzes.length}</span>
      </div>

      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-6 sm:space-y-8 hover:-translate-y-1 transition-transform duration-500">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug text-slate-900">{currentQuiz.question}</h2>

        <div className="space-y-4">
          {currentQuiz.options.map((option: string, idx: number) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQuiz.correctAnswer;
            
            let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium flex items-center justify-between ";
            
            if (!isAnswered) {
              btnClass += "border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700";
            } else if (isCorrect) {
              btnClass += "border-green-500 bg-green-50 text-green-700";
            } else if (isSelected && !isCorrect) {
              btnClass += "border-red-500 bg-red-50 text-red-700";
            } else {
              btnClass += "border-slate-200 opacity-50 text-slate-500";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleOptionSelect(option)}
                className={btnClass}
              >
                <span>{option}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="p-6 bg-slate-50/80 backdrop-blur rounded-2xl border border-slate-200 mt-6 opacity-0 animate-fade-in-up">
            <h4 className="font-extrabold text-slate-900 mb-2">Explanation:</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{currentQuiz.explanation}</p>
          </div>
        )}

        {isAnswered && (
          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
            >
              <span>{currentIndex < quizzes.length - 1 ? 'Next Question' : 'See Results'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
