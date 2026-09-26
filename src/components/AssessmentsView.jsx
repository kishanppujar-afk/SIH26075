import React, { useState, useEffect } from 'react';
import {
  mockAssessments,
  mockAssessmentQuestions,
  mockRecommendations,
  mockEmployee
} from '../mock/employeeData';

import AssessmentHub from './assessment/AssessmentHub';
import AssessmentOnboarding from './assessment/AssessmentOnboarding';
import AssessmentFocusHeader from './assessment/AssessmentFocusHeader';
import AssessmentQuestionCard from './assessment/AssessmentQuestionCard';
import AssessmentNavigation from './assessment/AssessmentNavigation';
import AssessmentResults from './assessment/AssessmentResults';

export default function AssessmentsView({
  isAssessmentFocused = false,
  setIsAssessmentFocused = () => {},
  setActiveTab = () => {},
}) {
  // Mode: 'hub' | 'onboarding' | 'active' | 'results'
  const [mode, setMode] = useState('hub');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('forward'); // 'forward' | 'backward'
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [saveStatus, setSaveStatus] = useState('Draft saved');
  const [isSaving, setIsSaving] = useState(false);
  const [baselineApplied, setBaselineApplied] = useState(false);
  const [resultsLoaded, setResultsLoaded] = useState(false);

  const questions = mockAssessmentQuestions;
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  // Trigger smooth progressive reveal for Results
  useEffect(() => {
    if (mode === 'results') {
      setResultsLoaded(false);
      const timer = setTimeout(() => setResultsLoaded(true), 120);
      return () => clearTimeout(timer);
    } else {
      setResultsLoaded(false);
    }
  }, [mode]);

  // Synchronize focus mode with parent App.jsx layout
  useEffect(() => {
    if (mode === 'onboarding' || mode === 'active') {
      setIsAssessmentFocused(true);
    } else {
      setIsAssessmentFocused(false);
    }
  }, [mode, setIsAssessmentFocused]);

  // Handlers
  const handleStartOnboarding = () => {
    setMode('onboarding');
  };

  const handleBeginAssessment = () => {
    setSlideDirection('forward');
    setMode('active');
  };

  const handleSelectOption = (optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
    setIsSaving(true);
    setSaveStatus('Saving...');
    setTimeout(() => {
      setSaveStatus('Draft saved');
      setIsSaving(false);
    }, 320);
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) {
        next.delete(currentQ.id);
      } else {
        next.add(currentQ.id);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setSlideDirection('forward');
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finished all questions -> go to Results
      setMode('results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setSlideDirection('backward');
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (idx) => {
    if (idx === currentQuestionIndex) return;
    setSlideDirection(idx > currentQuestionIndex ? 'forward' : 'backward');
    setCurrentQuestionIndex(idx);
  };

  const handleExitToHub = () => {
    setMode('hub');
  };

  const handleRetake = () => {
    setAnswers({});
    setFlaggedQuestions(new Set());
    setCurrentQuestionIndex(0);
    setSlideDirection('forward');
    setBaselineApplied(false);
    setMode('onboarding');
  };

  // Compute results analytics
  const computeResults = () => {
    let confidentCorrect = [];
    let growthOpportunities = [];
    let capabilityScores = {
      'Cloud Architecture (AWS/GCP)': { count: 0, score: 0, target: 85 },
      'Docker & Container Orchestration': { count: 0, score: 0, target: 80 },
      'System Design & Scalability': { count: 0, score: 0, target: 85 },
    };

    questions.forEach((q) => {
      const selected = answers[q.id];
      const isUnsure = selected === q.uncertaintyOption?.id;
      const isCorrect = selected === q.correctOptionId;

      const comp = capabilityScores[q.competency] || { count: 0, score: 0, target: 80 };
      comp.count += 1;

      if (isCorrect) {
        comp.score += 100;
        confidentCorrect.push({
          topic: q.topic,
          competency: q.competency,
          rationale: q.rationale,
        });
      } else if (isUnsure) {
        comp.score += 45; // partial baseline credit for diagnostic self-awareness
        growthOpportunities.push({
          topic: q.topic,
          competency: q.competency,
          reason: 'Identified as a growth opportunity (Uncertainty noted to guide personalized recommendations).',
          resource: q.growthResource,
        });
      } else {
        comp.score += 55;
        growthOpportunities.push({
          topic: q.topic,
          competency: q.competency,
          reason: 'Emerging competency to reinforce with targeted hands-on labs for Senior role benchmark.',
          resource: q.growthResource,
        });
      }

      capabilityScores[q.competency] = comp;
    });

    const capabilityList = Object.keys(capabilityScores).map((name) => {
      const item = capabilityScores[name];
      const avg = item.count > 0 ? Math.round(item.score / item.count) : 70;
      return {
        name,
        score: avg,
        target: item.target,
        status: avg >= 80 ? 'Solid Foundation' : avg >= 60 ? 'Developing' : 'Baseline Exploring',
      };
    });

    return {
      confidentCorrect,
      growthOpportunities,
      capabilityList,
    };
  };

  // ==========================================
  // VIEW 1: ONBOARDING SCREEN
  // ==========================================
  if (mode === 'onboarding') {
    return (
      <AssessmentOnboarding
        targetRole={mockEmployee.targetRole}
        onBegin={handleBeginAssessment}
        onExit={handleExitToHub}
      />
    );
  }

  // ==========================================
  // VIEW 2: FOCUSED ASSESSMENT WORKSPACE
  // ==========================================
  if (mode === 'active') {
    return (
      <div className="min-h-screen bg-[#F0F7F9] text-slate-800 flex flex-col justify-between animate-fade-in">
        <AssessmentFocusHeader
          title="Cloud Infrastructure & AWS Fundamentals"
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          saveStatus={saveStatus}
          isSaving={isSaving}
          onExit={handleExitToHub}
        />

        <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
          <AssessmentQuestionCard
            question={currentQ}
            selectedAnswer={answers[currentQ?.id]}
            isFlagged={flaggedQuestions.has(currentQ?.id)}
            slideDirection={slideDirection}
            onSelectOption={handleSelectOption}
            onToggleFlag={handleToggleFlag}
          />
        </main>

        <AssessmentNavigation
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          questions={questions}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onJump={handleJumpToQuestion}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW 3: GROWTH-FOCUSED RESULTS SCREEN
  // ==========================================
  if (mode === 'results') {
    const results = computeResults();

    return (
      <AssessmentResults
        targetRole={mockEmployee.targetRole}
        results={results}
        recommendations={mockRecommendations}
        resultsLoaded={resultsLoaded}
        baselineApplied={baselineApplied}
        onApplyBaseline={() => setBaselineApplied(true)}
        onRetake={handleRetake}
        onExitToHub={handleExitToHub}
        onViewCourses={() => setActiveTab('courses')}
      />
    );
  }

  // ==========================================
  // VIEW 0: HUB OVERVIEW (Default)
  // ==========================================
  return (
    <AssessmentHub
      assessments={mockAssessments}
      onStartOnboarding={handleStartOnboarding}
      targetRole={mockEmployee.targetRole}
    />
  );
}
