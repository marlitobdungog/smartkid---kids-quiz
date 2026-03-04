import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Timer as TimerIcon, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Settings, 
  Play, 
  RotateCcw,
  ChevronRight,
  Home,
  Save
} from 'lucide-react';
import { Question, GameState } from './types';

const DEFAULT_QUESTIONS: Question[] = [
  { id: '1', text: 'Is the sky blue on a sunny day?', correctAnswer: true },
  { id: '2', text: 'Do cows say "Meow"?', correctAnswer: false },
  { id: '3', text: 'Is an apple a fruit?', correctAnswer: true },
  { id: '4', text: 'Can elephants fly?', correctAnswer: false },
  { id: '5', text: 'Is 1 + 1 equal to 2?', correctAnswer: true },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('kids-quiz-questions');
    return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
  });
  const [timerDuration, setTimerDuration] = useState<number>(() => {
    const saved = localStorage.getItem('kids-quiz-timer-duration');
    return saved ? parseInt(saved) : 10;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showNext, setShowNext] = useState(false);

  // Persist questions and settings
  useEffect(() => {
    localStorage.setItem('kids-quiz-questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('kids-quiz-timer-duration', timerDuration.toString());
  }, [timerDuration]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING' && !showNext && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showNext) {
      handleAnswer(null); // Time's up!
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, showNext]);

  const handleStart = () => {
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(timerDuration);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowNext(false);
    setGameState('PLAYING');
  };

  const handleAnswer = (answer: boolean | null) => {
    if (showNext) return;
    
    setSelectedAnswer(answer);
    const correct = answer === questions[currentIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore((prev) => prev + 1);
    setShowNext(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(timerDuration);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowNext(false);
    } else {
      setGameState('FINISHED');
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      correctAnswer: true,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-amber-50 font-sans text-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-amber-200">
        
        {/* Header */}
        <div className="bg-amber-400 p-6 flex justify-between items-center text-white">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ThumbsUp className="w-8 h-8" />
            Kids Quiz!
          </h1>
          <div className="flex items-center gap-2">
            {gameState !== 'START' && gameState !== 'SETUP' && (
              <button 
                onClick={() => setGameState('START')}
                className="p-2 hover:bg-amber-500 rounded-full transition-colors"
                title="Go Home"
              >
                <Home className="w-6 h-6" />
              </button>
            )}
            {gameState !== 'PLAYING' && (
              <button 
                onClick={() => setGameState(gameState === 'SETUP' ? 'START' : 'SETUP')}
                className="p-2 hover:bg-amber-500 rounded-full transition-colors"
                title={gameState === 'SETUP' ? "Back" : "Settings"}
              >
                {gameState === 'SETUP' ? <RotateCcw className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {gameState === 'START' && (
              <motion.div 
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6"
              >
                <div className="bg-amber-100 p-8 rounded-full inline-block">
                  <Play className="w-16 h-16 text-amber-500 fill-amber-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-amber-600">Ready to Play?</h2>
                  <p className="text-slate-500">Answer with Thumbs Up or Down!</p>
                </div>
                <button 
                  onClick={handleStart}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
                >
                  Start Game
                </button>
              </motion.div>
            )}

            {gameState === 'PLAYING' && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Progress & Timer */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                      Question {currentIndex + 1} of {questions.length}
                    </div>
                    <div className={`flex items-center gap-2 font-mono font-bold text-xl ${timeLeft < 4 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                      <TimerIcon className="w-5 h-5" />
                      {timeLeft}s
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ 
                        width: `${(timeLeft / timerDuration) * 100}%`,
                        backgroundColor: timeLeft < 4 ? '#ef4444' : '#fbbf24'
                      }}
                      transition={{ duration: 1, ease: "linear" }}
                      className="h-full"
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="min-h-[120px] flex items-center justify-center text-center">
                  <h2 className="text-2xl font-bold leading-tight text-slate-800">
                    {questions[currentIndex].text}
                  </h2>
                </div>

                {/* Answers */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    disabled={showNext}
                    onClick={() => handleAnswer(true)}
                    className={`group flex flex-col items-center gap-3 p-6 rounded-3xl border-4 transition-all ${
                      showNext 
                        ? (questions[currentIndex].correctAnswer === true ? 'bg-emerald-100 border-emerald-500' : 'bg-slate-50 border-slate-200 opacity-50')
                        : 'bg-white border-amber-100 hover:border-amber-400 hover:bg-amber-50 active:scale-95'
                    }`}
                  >
                    <ThumbsUp className={`w-16 h-16 ${showNext && questions[currentIndex].correctAnswer === true ? 'text-emerald-600' : 'text-amber-500'}`} />
                    <span className="font-bold text-lg">Yes!</span>
                  </button>

                  <button
                    disabled={showNext}
                    onClick={() => handleAnswer(false)}
                    className={`group flex flex-col items-center gap-3 p-6 rounded-3xl border-4 transition-all ${
                      showNext 
                        ? (questions[currentIndex].correctAnswer === false ? 'bg-emerald-100 border-emerald-500' : 'bg-slate-50 border-slate-200 opacity-50')
                        : 'bg-white border-amber-100 hover:border-amber-400 hover:bg-amber-50 active:scale-95'
                    }`}
                  >
                    <ThumbsDown className={`w-16 h-16 ${showNext && questions[currentIndex].correctAnswer === false ? 'text-emerald-600' : 'text-amber-500'}`} />
                    <span className="font-bold text-lg">No!</span>
                  </button>
                </div>

                {/* Feedback & Next */}
                <div className="h-20 flex items-center justify-center">
                  {showNext && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        ) : (
                          <XCircle className="w-8 h-8 text-red-500" />
                        )}
                        <span className={`font-bold text-lg ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isCorrect ? 'Great Job!' : 'Oops! Not quite.'}
                        </span>
                      </div>
                      <button 
                        onClick={handleNext}
                        className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-bold transition-colors"
                      >
                        Next <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {gameState === 'FINISHED' && (
              <motion.div 
                key="finished"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="space-y-4">
                  <div className="text-6xl font-black text-amber-500">
                    {Math.round((score / questions.length) * 100)}%
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800">All Done!</h2>
                  <p className="text-xl text-slate-500">
                    You got <span className="font-bold text-emerald-500">{score}</span> out of {questions.length} right!
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleStart}
                    className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xl font-bold shadow-lg shadow-amber-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-6 h-6" /> Play Again
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === 'SETUP' && (
              <motion.div 
                key="setup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="space-y-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-amber-800 flex items-center gap-2">
                      <TimerIcon className="w-4 h-4" /> Game Settings
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-amber-700">
                      <span>Timer per question:</span>
                      <span className="font-bold">{timerDuration} seconds</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="30" 
                      step="5"
                      value={timerDuration}
                      onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                      className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-amber-400 font-bold uppercase">
                      <span>5s</span>
                      <span>15s</span>
                      <span>30s</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-800">Edit Questions</h2>
                  <button 
                    onClick={addQuestion}
                    className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-bold"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {questions.map((q, index) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {index + 1}</span>
                        <button 
                          onClick={() => deleteQuestion(q.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                        placeholder="Type your question here..."
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 outline-none text-sm min-h-[80px] resize-none"
                      />
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-600">Correct Answer:</span>
                        <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden">
                          <button
                            onClick={() => updateQuestion(q.id, { correctAnswer: true })}
                            className={`px-4 py-1 flex items-center gap-1 transition-colors ${q.correctAnswer ? 'bg-emerald-500 text-white' : 'hover:bg-slate-50'}`}
                          >
                            <ThumbsUp className="w-4 h-4" /> Yes
                          </button>
                          <button
                            onClick={() => updateQuestion(q.id, { correctAnswer: false })}
                            className={`px-4 py-1 flex items-center gap-1 transition-colors ${!q.correctAnswer ? 'bg-red-500 text-white' : 'hover:bg-slate-50'}`}
                          >
                            <ThumbsDown className="w-4 h-4" /> No
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setGameState('START')}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xl font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-6 h-6" /> Save & Back
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-8 text-amber-600/60 text-sm font-medium">
        Made for kids with ❤️
      </p>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fbbf24;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f59e0b;
        }
      `}</style>
    </div>
  );
}
