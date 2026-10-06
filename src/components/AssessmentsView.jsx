import React, { useState, useEffect, useRef } from 'react';
import {
  mockAssessments,
  mockAssessmentQuestions,
  mockRecommendations,
  mockEmployee
} from '../mock/employeeData';
import { api, mapAssessmentSubmissionResult } from '../api/client';
import { useEmployee } from '../context/SessionContext';

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
  const { employee, refreshEmployee } = useEmployee();

  // Mode: 'hub' | 'onboarding' | 'active' | 'results'
  const [mode, setMode] = useState('hub');
  const [assessments, setAssessments] = useState(mockAssessments);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('asm1');
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState(mockAssessmentQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('forward'); // 'forward' | 'backward'
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [saveStatus, setSaveStatus] = useState('Draft saved');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResults, setSubmissionResults] = useState(null);
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [baselineApplied, setBaselineApplied] = useState(false);
  const [resultsLoaded, setResultsLoaded] = useState(false);

  // Keep a ref of answers to guard against out-of-order async autosave responses
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // Load available assessments from API on mount
  useEffect(() => {
    let isMounted = true;
    api.getAssessments()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAssessments(data);
          if (!selectedAssessmentId) {
            setSelectedAssessmentId(data[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn('[AssessmentsView] Using mockAssessments fallback:', err.message);
      });

    api.getRecommendations()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setRecommendations(data);
        }
      })
      .catch((err) => {
        console.warn('[AssessmentsView] Using mockRecommendations fallback:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedAssessment = assessments.find((a) => a.id === selectedAssessmentId) || assessments[0] || mockAssessments[0];
  const currentQ = questions[currentQuestionIndex] || mockAssessmentQuestions[0];
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
  const handleStartOnboarding = (assessmentId) => {
    if (typeof assessmentId === 'string') {
      setSelectedAssessmentId(assessmentId);
    } else if (!selectedAssessmentId && assessments.length > 0) {
      setSelectedAssessmentId(assessments[0].id);
    }
    setMode('onboarding');
  };

  const handleBeginAssessment = async () => {
    setSlideDirection('forward');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFlaggedQuestions(new Set());
    setSaveStatus('Draft saved');
    setIsSaving(false);
    setSubmissionResults(null);

    const targetAsmId = selectedAssessmentId || 'asm1';

    try {
      const [attemptRes, questionsRes] = await Promise.all([
        api.startAssessmentAttempt(targetAsmId).catch((err) => {
          console.warn('[AssessmentsView] Could not start backend attempt, using local fallback:', err.message);
          return null;
        }),
        api.getAssessmentQuestions(targetAsmId).catch((err) => {
          console.warn('[AssessmentsView] Could not fetch questions, using mock questions:', err.message);
          return null;
        }),
      ]);

      if (attemptRes && attemptRes.attempt_id) {
        setAttemptId(attemptRes.attempt_id);
      } else {
        setAttemptId(null);
      }

      if (Array.isArray(questionsRes) && questionsRes.length > 0) {
        setQuestions(questionsRes);
      } else {
        setQuestions(mockAssessmentQuestions);
      }
    } catch (err) {
      console.warn('[AssessmentsView] Error preparing assessment attempt:', err.message);
      setQuestions(mockAssessmentQuestions);
    }

    setMode('active');
  };

  const handleSelectOption = (optionId) => {
    const qId = currentQ?.id;
    if (!qId) return;

    // Immediately update local UI state
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionId,
    }));
    setIsSaving(true);
    setSaveStatus('Saving...');

    if (attemptId) {
      api.autosaveAnswer(attemptId, qId, optionId)
        .then((res) => {
          // Guard against out-of-order responses:
          // Check if current user answer in ref still matches optionId
          if (answersRef.current[qId] === optionId) {
            setIsSaving(false);
            setSaveStatus('Draft saved');
          }
        })
        .catch((err) => {
          console.warn('[AssessmentsView] Autosave failed for', qId, err.message);
          setIsSaving(false);
          setSaveStatus('Draft saved locally (retry on next)');
        });
    } else {
      setTimeout(() => {
        setSaveStatus('Draft saved');
        setIsSaving(false);
      }, 320);
    }
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSaveStatus('Evaluating baseline...');

    try {
      if (attemptId) {
        const apiResult = await api.submitAssessmentAttempt(attemptId);
        const mapped = mapAssessmentSubmissionResult(apiResult);
        setSubmissionResults(mapped);

        // Step 3: Refresh employee competency state immediately
        refreshEmployee();
      } else {
        const fallback = computeResults();
        setSubmissionResults(fallback);
        refreshEmployee();
      }
    } catch (err) {
      console.warn('[AssessmentsView] Submit error, using local fallback:', err.message);
      const fallback = computeResults();
      setSubmissionResults(fallback);
      refreshEmployee();
    } finally {
      setIsSubmitting(false);
      setMode('results');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setSlideDirection('forward');
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finished all questions -> evaluate and go to Results
      handleSubmit();
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
    // Refresh assessments list to reflect any newly established baselines
    api.getAssessments().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setAssessments(data);
      }
    }).catch(() => {});
    setMode('hub');
  };

  const handleRetake = () => {
    setAnswers({});
    setFlaggedQuestions(new Set());
    setCurrentQuestionIndex(0);
    setSlideDirection('forward');
    setBaselineApplied(false);
    setSubmissionResults(null);
    setAttemptId(null);
    setMode('onboarding');
  };

  const handleApplyBaseline = () => {
    setBaselineApplied(true);
    refreshEmployee();
  };

  // Compute results analytics (Offline fallback)
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
        targetRole={employee?.targetRole || mockEmployee.targetRole}
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
          title={selectedAssessment?.title || "Cloud Infrastructure & AWS Fundamentals"}
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
    const results = submissionResults || computeResults();

    return (
      <AssessmentResults
        targetRole={employee?.targetRole || mockEmployee.targetRole}
        results={results}
        recommendations={recommendations.length > 0 ? recommendations : mockRecommendations}
        resultsLoaded={resultsLoaded}
        baselineApplied={baselineApplied}
        onApplyBaseline={handleApplyBaseline}
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
      assessments={assessments}
      onStartOnboarding={handleStartOnboarding}
      targetRole={employee?.targetRole || mockEmployee.targetRole}
    />
  );
}
