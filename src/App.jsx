import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SkillsView from './components/SkillsView';
import CoursesView from './components/CoursesView';
import AssessmentsView from './components/AssessmentsView';
import ProfileView from './components/ProfileView';
import LoginView from './components/LoginView';
import DishaChatWidget from './components/chat/DishaChatWidget';
import { SessionProvider, useEmployee } from './context/SessionContext';

const VALID_TABS = ['dashboard', 'skills', 'courses', 'assessments', 'profile', 'login'];

function AppContent() {
  const { employee } = useEmployee();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAssessmentFocused, setIsAssessmentFocused] = useState(false);

  // Derive activeTab from URL path.
  const pathSegment = location.pathname.replace(/^\//, '') || 'login';

  // Entry routing: redirect '/' to '/login' as initial entry point
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '') {
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  const activeTab = VALID_TABS.includes(pathSegment) ? pathSegment : 'dashboard';
  const isLoginPage = activeTab === 'login';

  const [selectedSkillId, setSelectedSkillId] = useState(null);

  // Drop-in replacement for setActiveTab — updates the URL instead of state.
  const setActiveTab = (tab, skillId = null) => {
    if (skillId) {
      setSelectedSkillId(skillId);
    }
    navigate('/' + tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            setActiveTab={setActiveTab}
            onOpenDevelopmentPath={(skillId) => {
              setSelectedSkillId(skillId);
              navigate('/skills');
            }}
          />
        );
      case 'skills':
        return (
          <SkillsView
            initialSkillId={selectedSkillId}
            setActiveTab={setActiveTab}
          />
        );
      case 'courses':
        return <CoursesView />;
      case 'assessments':
        return (
          <AssessmentsView
            isAssessmentFocused={isAssessmentFocused}
            setIsAssessmentFocused={setIsAssessmentFocused}
            setActiveTab={setActiveTab}
          />
        );
      case 'profile':
        return <ProfileView setActiveTab={setActiveTab} />;
      default:
        return (
          <Dashboard
            setActiveTab={setActiveTab}
            onOpenDevelopmentPath={(skillId) => {
              setSelectedSkillId(skillId);
              navigate('/skills');
            }}
          />
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoginPage ? (
        /* Full-Bleed Twilight Login View without Navbar/Sidebar */
        <motion.div
          key="login-scene"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="w-full min-h-screen"
        >
          <LoginView />
        </motion.div>
      ) : (
        /* Authenticated Main App Shell with cross-fade entry */
        <motion.div
          key="main-app-shell"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="min-h-screen bg-[#F0F7F9] flex flex-col font-sans text-slate-800"
        >
          {!isAssessmentFocused && <Navbar />}
          <div className="flex flex-1">
            {!isAssessmentFocused && (
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
            <main
              className={`flex-1 ${
                isAssessmentFocused ? 'p-0 w-full' : 'p-6 lg:p-8 max-w-7xl mx-auto w-full'
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    enter: { duration: 0.2, ease: 'easeOut' },
                    exit: { duration: 0.15 },
                  }}
                  className="w-full"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
          <DishaChatWidget key={employee?.id || 'guest'} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
