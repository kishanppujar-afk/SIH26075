import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sprout, BookOpen, BrainCircuit, Check, X, ArrowRight } from 'lucide-react';

export default function OnboardingTutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);

  // Auto-hide confetti after 3 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const slides = [
    {
      id: 'welcome',
      icon: <Sparkles className="w-12 h-12 text-teal-500" />,
      title: "Yayyy! You've been approved! 🎉",
      description: "Welcome to Capacity Connect, the official MoES & IMD capacity building platform. We're thrilled to have you on board!",
      bgStyle: "bg-gradient-to-br from-teal-50 to-white border-teal-100"
    },
    {
      id: 'tree',
      icon: <Sprout className="w-12 h-12 text-[#1B4332]" />,
      title: "Grow Your Expertise",
      description: "Your dashboard features a dynamic Growth Tree. As you master new competencies and pass assessments, your tree will physically blossom to reflect your real-time skills!",
      bgStyle: "bg-gradient-to-br from-[#E7F0EA] to-white border-[#CDE1D4]"
    },
    {
      id: 'courses',
      icon: <BookOpen className="w-12 h-12 text-blue-600" />,
      title: "AI-Curated Recommendations",
      description: "No more guessing what to learn. Our AI analyzes your department role and specifically recommends official MoES training modules tailored to close your skill gaps.",
      bgStyle: "bg-gradient-to-br from-blue-50 to-white border-blue-100"
    },
    {
      id: 'rag',
      icon: <BrainCircuit className="w-12 h-12 text-indigo-600" />,
      title: "Grounded RAG Assessments",
      description: "Ready to level up? Take rigorous, AI-generated quizzes created directly from official manuals. Prove your knowledge and watch your career flourish.",
      bgStyle: "bg-gradient-to-br from-indigo-50 to-white border-indigo-100"
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#14140F]/60 backdrop-blur-sm p-4">
      {/* Fake CSS Confetti for Step 0 */}
      {step === 0 && showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -50, x: Math.random() * window.innerWidth - window.innerWidth/2, opacity: 1, rotate: 0 }}
              animate={{ 
                y: window.innerHeight, 
                rotate: Math.random() * 360,
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }}
              className={`absolute w-3 h-3 rounded-sm ${['bg-teal-400', 'bg-amber-300', 'bg-blue-400', 'bg-pink-400'][Math.floor(Math.random() * 4)]}`}
            />
          ))}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EDEBE6] flex flex-col"
      >
        <button 
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-[#5B5850] hover:bg-[#F4F3EF] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-64 w-full flex items-center justify-center p-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-4 rounded-2xl border ${slides[step].bgStyle} flex flex-col items-center justify-center text-center p-6 shadow-inner`}
            >
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="mb-4 bg-white p-4 rounded-full shadow-sm"
              >
                {slides[step].icon}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-8 pb-8 pt-4 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 text-center"
            >
              <h2 className="text-xl font-extrabold text-[#14140F] mb-3">{slides[step].title}</h2>
              <p className="text-sm font-medium text-[#5B5850] leading-relaxed">
                {slides[step].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 my-6">
            {slides.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${idx === step ? 'w-6 bg-teal-500' : 'w-2 bg-[#E7E5E2]'}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3 mt-auto">
            {step > 0 && (
              <button 
                onClick={() => setStep(prev => prev - 1)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-[#5B5850] bg-[#F4F3EF] hover:bg-[#E7E5E2] transition-colors"
              >
                Back
              </button>
            )}
            <button 
              onClick={handleNext}
              className={`flex-[2] py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 ${
                step === slides.length - 1 
                  ? 'bg-[#1B4332] hover:bg-[#122c21] shadow-lg shadow-[#1B4332]/20' 
                  : 'bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/20'
              }`}
            >
              {step === slides.length - 1 ? (
                <>Get Started <Check className="w-4 h-4" /></>
              ) : (
                <>Next <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
