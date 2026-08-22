/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, RotateCcw, User, Users, Volume2, VolumeX, Settings, Plus, Trash2, Save, X, Info } from 'lucide-react';

// --- DỮ LIỆU CÀI ĐẶT MẪU ---
const GRADE_TOPICS = {
  grade1: [
    { id: 'num100', name: 'Identify numbers up to 100' },
    { id: 'calc100', name: 'Addition and subtraction without carrying over (≤100)' },
    { id: 'geo', name: 'Basic geometry' },
    { id: 'length', name: 'Measure length (cm)' },
    { id: 'custom', name: 'Questions' }
  ],
  grade2: [
    { id: 'calc100_carry', name: 'Addition and subtraction without carrying over (≤100)' },
    { id: 'mul_div_2_5', name: 'Multiplying and dividing by 2 and 5' },
    { id: 'time', name: 'Hour' },
    { id: 'unit', name: 'Measure (kg, l, m...)' },
    { id: 'geo_perimeter', name: 'Perimeter of basic shapes' },
    { id: 'custom', name: 'Questions' }
  ],
  grade3: [
    { id: 'num100000', name: 'Numbers up to 100.000' },
    { id: 'mul_div_big', name: 'Multiplying and dividing by numbers' },
    { id: 'geo_corner', name: 'Right angle' },
    { id: 'perimeter_area', name: 'Perimeter, area' },
    { id: 'remainder', name: 'Division with a remainder' },
    { id: 'custom', name: 'Questions' }
  ],
  grade4: [
    { id: 'num_big', name: 'Large Numbers & Comparison' },
    { id: 'four_ops', name: '4 Basic Operations (Large)' },
    { id: 'fraction', name: 'Fraction' },
    { id: 'corner', name: 'Acute angle, obtuse angle, straight angle' },
    { id: 'avg', name: 'Arithmetic mean' },
    { id: 'custom', name: 'Questions' }
  ],
  grade5: [
    { id: 'decimal', name: 'Decimal' },
    { id: 'percent', name: 'Percent' },
    { id: 'motion', name: 'Motion problem' },
    { id: 'geo_space', name: 'Solid geometry' },
    { id: 'interest', name: 'Interest Rates & the Economy' },
    { id: 'custom', name: 'Questions' }
  ]
};

// --- HÀM TẠO CÂU HỎI AI PROCEDURAL ---
const generateAIQuestion = (grade, topic, customList = []) => {
  if (topic === 'custom' && customList.length > 0) {
    return customList[Math.floor(Math.random() * customList.length)];
  }

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  switch (grade) {
    case 'grade1':
      if (topic === 'num100') {
        const n = rand(10, 99);
        const types = [
          { q: `The number immediately following ${n}?`, a: (n + 1).toString() },
          { q: `The number immediately preceding ${n}?`, a: (n - 1).toString() },
          { q: `How many tens and ones does the number a consist of ${n}?`, a: `ten of ${Math.floor(n/10)} and ${n%10} unit`.toLowerCase() },
          { q: `Which number is larger: ${n} or ${n + rand(-5, 5) || 1}?`, a: Math.max(n, n+2).toString() }
        ];
        const picked = pick(types);
        return picked;
      }
      if (topic === 'calc100') {
        const a = rand(10, 50);
        const b = rand(1, 40);
        return rand(0, 1) ? { q: `${a} + ${b} = ?`, a: (a+b).toString() } : { q: `${a+b} - ${a} = ?`, a: b.toString() };
      }
      if (topic === 'geo') {
        return pick([
          { q: "Which shape has 3 sides??", a: "triangle" },
          { q: "How many sides does a circle have?", a: "0" },
          { q: "How many sides does a square have?", a: "4" }
        ]);
      }
      if (topic === 'length') {
        const a = rand(2, 10);
        const b = rand(1, 5);
        return pick([
          { q: `If you add ${b}cm to a line segment of ${a}cm, how many centimeters is it?`, a: (a+b).toString() },
          { q: `How many centimeters is ${a*10} mm?`, a: a.toString() }
        ]);
      }
      break;

    case 'grade2':
      if (topic === 'calc100_carry') {
        const a = rand(15, 45);
        const b = rand(15, 45);
        return pick([{ q: `${a} + ${b} = ?`, a: (a+b).toString() }, { q: `${a+b} - ${a} = ?`, a: b.toString() }]);
      }
      if (topic === 'mul_div_2_5') {
        const m = pick([2, 5]);
        const n = rand(1, 10);
        return rand(0, 1) ? { q: `${m} x ${n} = ?`, a: (m*n).toString() } : { q: `${m*n} : ${m} = ?`, a: n.toString() };
      }
      if (topic === 'time') {
        const h = rand(1, 12);
        return { q: `What time is it when the hour hand points to ${h} and the minute hand points to 12?`, a: h.toString() };
      }
      break;

    case 'grade3':
      if (topic === 'num100000') {
        const n = rand(10000, 99999);
        return { q: `What is the value of the digit ${Math.floor(n/10000)} in ${n}?`, a: (Math.floor(n/10000)*10000).toString() };
      }
      if (topic === 'remainder') {
        const a = rand(10, 30);
        const b = rand(2, 6);
        const q = Math.floor(a/b);
        const r = a % b;
        return { q: `${a} : ${b} = ? (residual ?)`, a: `${q} dư ${r}` };
      }
      break;

    case 'grade4':
      if (topic === 'fraction') {
        const a = rand(1, 5);
        return { q: `${a}/2 + ${a}/2 = ?`, a: a.toString() };
      }
      if (topic === 'avg') {
        const a = rand(10, 20);
        const b = rand(20, 30);
        return { q: `TWhat is the arithmetic mean of ${a} and ${b}?`, a: ((a+b)/2).toString() };
      }
      break;

    case 'grade5':
      if (topic === 'decimal') {
        const a = (rand(10, 50) / 10).toFixed(1);
        const b = (rand(10, 50) / 10).toFixed(1);
        return { q: `${a} + ${b} = ?`, a: (parseFloat(a) + parseFloat(b)).toFixed(1).replace('.0', '') };
      }
      if (topic === 'percent') {
        const base = pick([100, 200, 300, 400, 500]);
        const p = pick([10, 20, 25, 50]);
        return { q: `What is ${p}% of ${base}?`, a: (base * p / 100).toString() };
      }
      if (topic === 'motion') {
        const v = rand(30, 60);
        const t = rand(2, 5);
        return { q: `At a speed of ${v} km/h, how many kilometers are covered in ${t} hours?`, a: (v*t).toString() };
      }
  }

  return { q: "2 + 2 = ?", a: "4" };
};

export default function App() {
  const [selectedGrade, setSelectedGrade] = useState(() => localStorage.getItem('tug-math-grade') || 'grade1');
  const [selectedTopic, setSelectedTopic] = useState(() => localStorage.getItem('tug-math-topic') || 'num100');
  const [timeLimit, setTimeLimit] = useState(() => parseInt(localStorage.getItem('tug-math-time')) || 10);
  const [customQuestions, setCustomQuestions] = useState(() => JSON.parse(localStorage.getItem('tug-math-custom')) || []);
  
  const [gameState, setGameState] = useState('start');
  const [isAIMode, setIsAIMode] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [turn, setTurn] = useState('A');
  const [position, setPosition] = useState(0); 
  const [currentQuestion, setCurrentQuestion] = useState({ q: '', a: '' });
  const [userAnswer, setUserAnswer] = useState('');
  const [winner, setWinner] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Teacher Mode Tabs
  const [teacherTab, setTeacherTab] = useState('settings');
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');

  const inputRef = useRef(null);
  const audioRef = useRef(null);

  const WIN_THRESHOLD = 5;

  const nextQuestion = useCallback(() => {
    const qObj = generateAIQuestion(selectedGrade, selectedTopic, customQuestions);
    setCurrentQuestion(qObj);
    setUserAnswer('');
    setFeedback(null);
    setTimeLeft(timeLimit);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  }, [selectedGrade, selectedTopic, customQuestions, timeLimit]);

  // Khởi động trò chơi
  const startGame = (aiMode = false) => {
    setIsAIMode(aiMode);
    setGameState('playing');
    setPosition(0);
    setTurn('A');
    setWinner(null);
    setIsPaused(false);
    setTimeLeft(timeLimit);
    nextQuestion();
    
    // Bắt đầu phát nhạc khi người chơi tương tác
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log("Autoplay blocked:", err));
    }
  };

  // Cập nhật âm lượng
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Xử lý khi trả lời sai
  const handleWrongAnswer = useCallback((msg = "Wrong") => {
    setFeedback({ type: 'wrong', text: msg });
    setTimeout(() => {
      setTurn(prev => prev === 'A' ? 'B' : 'A');
      nextQuestion();
    }, 1500);
  }, [nextQuestion]);

  const handleCorrectAnswer = () => {
    playSound('/dapan.mp3');
    setFeedback({ type: 'correct', text: 'Right' });
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    const newPos = turn === 'A' ? position + 1 : position - 1;
    setPosition(newPos);

    if (Math.abs(newPos) >= WIN_THRESHOLD) {
      const finalPos = newPos > 0 ? 15 : -15; // Push outwards
      setPosition(finalPos);
      setWinner(newPos > 0 ? 'A' : 'B');
      playSound('/dich.mp3');
      setTimeout(() => {
        setGameState('won');
      }, 1000);
    } else {
      setTimeout(() => {
        setTurn(turn === 'A' ? 'B' : 'A');
        nextQuestion();
      }, 1500);
    }
  };

  // Timer logic
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && feedback === null && !winner && !isPaused) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleWrongAnswer("Time's up");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, feedback, winner, isPaused, handleWrongAnswer]);

  // Keyboard shortcut for Pause (P)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'p' && gameState === 'playing' && !winner && !feedback) {
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, winner, feedback]);

  // AI Turn Logic
  useEffect(() => {
    if (gameState === 'playing' && turn === 'B' && isAIMode && !feedback && !isPaused) {
      const aiThinkingTime = 1500 + Math.random() * 1000;
      const timer = setTimeout(() => {
        // AI success rate (e.g., 75%)
        const isCorrect = Math.random() < 0.75;
        if (isCorrect) {
          setUserAnswer(currentQuestion.a.toString());
          setTimeout(() => {
            handleCorrectAnswer();
          }, 500);
        } else {
          // AI "types" a wrong answer or just fails
          setUserAnswer("?"); 
          setTimeout(() => {
            handleWrongAnswer("The AI ​​gave the wrong answer!");
          }, 500);
        }
      }, aiThinkingTime);
      return () => clearTimeout(timer);
    }
  }, [turn, isAIMode, gameState, currentQuestion, feedback, handleCorrectAnswer, handleWrongAnswer]);

  const playSound = (src) => {
    if (isMuted) return;
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(err => console.log("Sound play blocked or failed:", err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userAnswer === '' || feedback || isPaused) return;

    const normalizedUserAnswer = userAnswer.toString().trim().toLowerCase();
    const normalizedCorrectAnswer = currentQuestion.a.toString().trim().toLowerCase();

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-game flex flex-col items-center justify-center p-2 font-sans text-stone-900">
      <audio ref={audioRef} src="/nhacchinh.mp3" loop />
      
      {/* Volume Control */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {/* Nút Info (i) */}
        <button
          onClick={() => setShowInfo(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white"
          title="Game Introduction"
        >
          <Info size={20} />
        </button>

        {/* Nút Settings (i) */}
        <button
          onClick={() => setShowSettings(true)}
          className="bg-stone-600 hover:bg-stone-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white"
          title="Setting time"
        >
          <Settings size={20} />
        </button>

        <div className="bg-white/80 backdrop-blur p-2 rounded-2xl shadow-lg border-2 border-amber-200 flex items-center gap-2">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="text-amber-600 hover:text-amber-700 transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-24 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-6 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-amber-500"
          >
            <h1 className="text-3xl font-bold text-amber-600 mb-4 uppercase tracking-wider">Stick-Pushing Game</h1>
            <div className="flex justify-center mb-6 gap-6">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-lg border-4 border-blue-500 overflow-hidden">
                  <User size={40} className="text-blue-600" />
                </div>
                <span className="mt-1 font-bold text-blue-600 text-sm">Group A</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-lg border-4 border-red-500 overflow-hidden">
                  <User size={40} className="text-red-600" />
                </div>
                <span className="mt-1 font-bold text-red-600 text-sm">Group B</span>
              </div>
            </div>
            <p className="text-stone-600 mb-6 leading-relaxed text-sm">
              Answer correctly to push the stick toward your opponent. Push your opponent out of the circle to win!
            </p>
            <div className="flex flex-col gap-3">
              <div className="bg-stone-50 px-4 py-2 rounded-xl text-stone-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-center border-2 border-stone-200">
                {selectedGrade.replace('lớp', 'grade ')} - {GRADE_TOPICS[selectedGrade].find(t => t.id === selectedTopic)?.name || ''}
              </div>
              <button
                onClick={() => setShowRules(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded-full text-sm shadow transition-all flex items-center justify-center gap-2 mx-auto w-full"
              >
                Rules game
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => startGame(false)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-full text-sm shadow-lg transition-all flex items-center justify-center gap-2 flex-1"
                >
                  <Users size={18} /> 2 Players
                </button>
                <button
                  onClick={() => startGame(true)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-full text-sm shadow-lg transition-all flex items-center justify-center gap-2 flex-1"
                >
                  <Play fill="currentColor" size={18} /> Play with AI
                </button>
              </div>
              <button
                onClick={() => setGameState('teacher')}
                className="bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-2 px-8 rounded-full text-sm shadow transition-all flex items-center justify-center gap-2 mx-auto w-full"
              >
                ⚙️ Teacher
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'teacher' && (
          <motion.div
            key="teacher"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full border-4 border-stone-400 flex flex-col h-[85vh]"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Settings size={20} /> Teacher Settings
              </h2>
              <button onClick={() => setGameState('start')} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-2 mb-4 bg-stone-100 p-1 rounded-xl">
              <button 
                onClick={() => setTeacherTab('settings')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${teacherTab === 'settings' ? 'bg-white shadow text-amber-600' : 'text-stone-500'}`}
              >
                Setting
              </button>
              <button 
                onClick={() => setTeacherTab('custom')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${teacherTab === 'custom' ? 'bg-white shadow text-amber-600' : 'text-stone-500'}`}
              >
                Custom questions
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
              {teacherTab === 'settings' ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest px-1">Selecting grade</label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => {
                        const grade = e.target.value;
                        setSelectedGrade(grade);
                        setSelectedTopic(GRADE_TOPICS[grade][0].id);
                      }}
                      className="w-full p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl font-bold text-stone-700 outline-none"
                    >
                      <option value="grade1">Grade 1</option>
                      <option value="grade2">Grade 2</option>
                      <option value="grade3">Grade 3</option>
                      <option value="grade4">Grade 4</option>
                      <option value="grade5">Grade 5</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest px-1">Select a topic</label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl font-bold text-stone-700 outline-none"
                    >
                      {GRADE_TOPICS[selectedGrade].map(topic => (
                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest px-1">Time (5-60 seconds)</label>
                    <div className="flex gap-4 items-center">
                      <input
                        type="range"
                        min="5"
                        max="60"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                        className="flex-1 h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="w-12 h-10 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-center justify-center font-black text-amber-600">
                        {timeLimit}s
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 p-3 bg-amber-50 rounded-2xl border-2 border-amber-100">
                    <input
                      type="text"
                      placeholder="Question: Ex 2 + 3 = ?"
                      value={newQ}
                      onChange={(e) => setNewQ(e.target.value)}
                      className="p-3 border-2 border-stone-200 rounded-xl text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Answer"
                      value={newA}
                      onChange={(e) => setNewA(e.target.value)}
                      className="p-3 border-2 border-stone-200 rounded-xl text-sm"
                    />
                    <button
                      onClick={() => {
                        if (newQ && newA) {
                          setCustomQuestions([...customQuestions, { q: newQ, a: newA }]);
                          setNewQ('');
                          setNewA('');
                        }
                      }}
                      className="bg-green-500 text-white font-bold py-2 rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={18} /> Add questions
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-stone-400 uppercase ml-1 underline">Saved questions:</h3>
                    {customQuestions.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border-2 border-stone-100">
                        <div className="text-xs">
                          <span className="font-bold text-stone-700">{item.q}</span>
                          <span className="ml-2 text-green-600 font-black">= {item.a}</span>
                        </div>
                        <button
                          onClick={() => setCustomQuestions(customQuestions.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {customQuestions.length === 0 && (
                      <p className="text-xs text-stone-400 italic text-center py-4">No custom questions yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                localStorage.setItem('tug-math-grade', selectedGrade);
                localStorage.setItem('tug-math-topic', selectedTopic);
                localStorage.setItem('tug-math-time', timeLimit.toString());
                localStorage.setItem('tug-math-custom', JSON.stringify(customQuestions));
                setGameState('start');
              }}
              className="bg-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} /> Save settings
            </button>
          </motion.div>
        )}

        {gameState === 'playing' || gameState === 'won' ? (
          <motion.div
            key="game-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl flex flex-col items-center gap-2"
          >
            {gameState === 'playing' && (
              <>
                {/* Header: Turn & Timer */}
                <div className="w-full flex justify-between items-center bg-white/80 backdrop-blur p-2 rounded-2xl shadow-md border-b-4 border-amber-200">
                  <div className={`flex items-center gap-2 px-4 py-1 rounded-full transition-colors ${turn === 'A' ? 'bg-blue-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                    <Users size={18} />
                    <span className="font-bold text-lg">Đội A</span>
                  </div>

                  <div className="flex flex-col items-center gap-0">
                    <div className="flex items-center gap-1 mb-[-2px]">
                      <span className="text-[7px] font-black uppercase text-amber-500">
                        {selectedGrade.replace('grade', 'Lớp ')} - {GRADE_TOPICS[selectedGrade].find(t => t.id === selectedTopic)?.name || ''}
                      </span>
                    </div>
                    <div className={`text-2xl font-black tabular-nums transition-colors ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-amber-600'}`}>
                      {timeLeft}s
                    </div>
                    {/* Pause Button Small */}
                    <button 
                      onClick={() => setIsPaused(!isPaused)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-600 p-1 rounded-lg transition-colors mt-1"
                      title="Phím tắt: P"
                    >
                      {isPaused ? <Play size={12} fill="currentColor" /> : <X size={12} className="rotate-45" /* Custom pause icon using lucide if no Pause icon imported, but I can use lucide Pause if available */ />} 
                      <span className="text-[8px] font-bold ml-1 uppercase">{isPaused ? 'Continue' : 'Pause'}</span>
                    </button>
                  </div>

                  <div className={`flex items-center gap-2 px-4 py-1 rounded-full transition-colors ${turn === 'B' ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                    <span className="font-bold text-lg">{isAIMode ? 'Machine (AI)' : 'Group B'}</span>
                    <Users size={18} />
                  </div>
                </div>

                {/* Question Area */}
                <div className="bg-white p-3 rounded-2xl shadow-xl w-full max-w-md border-4 border-amber-400 text-center">
                  <h2 className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">The question for group {turn}</h2>
                  <div className="text-3xl font-black text-stone-800 mb-3">{currentQuestion.q}</div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={feedback !== null || isPaused}
                      placeholder={isPaused ? "Pausing...." : "Enter your answer..."}
                      className="w-full text-center text-2xl p-2 rounded-xl border-4 border-stone-200 focus:border-amber-500 outline-none transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={feedback !== null || isPaused}
                      className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-bold py-2 rounded-xl text-lg shadow-lg transition-all"
                    >
                      Trả lời
                    </button>
                  </form>

                  {/* Feedback Overlay */}
                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className={`mt-2 p-2 rounded-lg font-bold text-lg ${feedback.type === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {feedback.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {gameState === 'won' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
              >
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="bg-white p-6 rounded-3xl shadow-2xl text-center max-w-sm w-full border-8 border-yellow-400"
                >
                  <div className="flex justify-center mb-2">
                    <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                      <Trophy size={48} />
                    </div>
                  </div>
                <h1 className="text-3xl font-black text-stone-800 mb-1 uppercase">Win!</h1>
                <p className="text-xl font-bold text-amber-600 mb-4 uppercase tracking-widest">
                  {isAIMode && winner === 'B' ? 'Machien (AI) won' : `Group ${winner} won`}
                </p>
                  <div className="bg-stone-50 p-3 rounded-xl mb-4">
                    <p className="text-stone-600 italic text-sm">"A magnificent performance!"</p>
                  </div>
                  <button
                    onClick={startGame}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-10 rounded-full text-lg shadow-lg transition-all flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw size={20} /> Chơi lại
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* Game Arena */}
            <div className={`relative w-full h-[250px] bg-stone-200/50 rounded-full border-4 border-stone-300 flex items-center justify-center overflow-hidden shadow-inner transition-all ${isPaused ? 'blur-md' : ''}`}>
              {/* Center Line */}
              <div className="absolute h-full w-1 bg-stone-400/50 left-1/2 -translate-x-1/2"></div>

              {/* Stick & Characters Container */}
              <motion.div
                animate={{ x: position * 40 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className={`relative ${isShaking ? 'animate-shake' : ''}`}
              >
                <img 
                  src="/nhanvat.png" 
                  alt="Stick-pushing" 
                  className="w-[800px] h-auto max-h-[200px] object-contain" 
                  referrerPolicy="no-referrer" 
                />
              </motion.div>
            </div>
          </motion.div>
        ) : null}

        {/* Pause Overlay */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-amber-400"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-amber-100 p-4 rounded-full text-amber-600 animate-pulse">
                    <Play size={40} className="ml-1" fill="currentColor" />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-stone-800 mb-2 uppercase tracking-tight">Pausing</h2>
                <p className="text-stone-500 mb-8 text-sm px-4">The game is currently paused. Get ready to resume the competition.!</p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    <Play size={20} fill="currentColor" /> Continue playing
                  </button>
                  <button
                    onClick={() => {
                      setIsPaused(false);
                      setGameState('start');
                    }}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} /> Start over from the beginning
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRules(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-4 border-blue-500 relative"
            >
              <button 
                onClick={() => setShowRules(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center gap-2">
                <Trophy size={24} /> Rules of the Stick-Pushing Game
              </h2>
              <div className="space-y-4 text-stone-700 leading-relaxed">
                <div className="flex gap-3">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                  <p>A game for two groups (Group A and Group B).</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                  <p>n each turn, a group receives a math question..</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                  <p>If the answer is <b>correct</b>, your group will push the stick toward the opponent.</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                  <p>If the answer is <b>wrong</b>, the turn goes to the opposing group.</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0">5</div>
                  <p>The team that manages to push their opponents out of the circle first wins.</p>
                </div>
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
              >
                Understand!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal (Game Introduction) */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInfo(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border-4 border-orange-500 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={28} />
              </button>
              
              <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center uppercase tracking-tight">
                Game Introduction
              </h2>
              
              <div className="space-y-4 text-stone-700 leading-relaxed text-justify">
                <p>
                  The folk game of stick pushing (Drút ‘long ira) is a traditional sport of the Bahnar people that is popular among children and adolescents. It typically takes place in the "rong" house courtyard or on a flat open area, involving two participants per round who use a bamboo pole as the competition implement.
                </p>
                <p>
                  Two players stand facing each other across a boundary line, each holding one end of a stick and using their strength to push the other person away from the line. The winner is the one who succeeds in pushing their opponent across the boundary. 
                </p>
                <p>
                  TThe game not only brings joy but also helps improve physical health, dexterity, and competitive spirit, while contributing to the preservation of national cultural identity.
                </p>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowInfo(false)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-10 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 border-4 border-stone-600 relative"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                <Settings size={24} /> Setting time
              </h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-stone-500 uppercase">Response time (seconds)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="5"
                      max="90"
                      value={timeLimit}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 5;
                        setTimeLimit(val);
                      }}
                      className="flex-1 p-3 border-2 border-stone-200 rounded-xl text-xl font-bold focus:border-amber-500 outline-none"
                    />
                    <span className="text-xl font-bold text-stone-400">seconds</span>
                  </div>
                  <p className="text-xs text-stone-400 italic">Duration from 5 to 90 seconds</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  let finalLimit = timeLimit;
                  if (finalLimit < 5) finalLimit = 5;
                  if (finalLimit > 90) finalLimit = 90;
                  setTimeLimit(finalLimit);
                  localStorage.setItem('tug-math-time-limit', finalLimit.toString());
                  setShowSettings(false);
                  if (gameState === 'playing') {
                    setTimeLeft(finalLimit); // Reset timer immediately if playing
                  }
                }}
                className="mt-8 w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} /> Save settings
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
    </div>
  );
}
