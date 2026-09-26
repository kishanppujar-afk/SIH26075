import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, LogOut } from 'lucide-react';
import { mockEmployee } from '../mock/employeeData';
import { useSession } from '../context/SessionContext';
import { getStageInfo } from '../utils/growthStage';
import Card from './common/Card';
import Skeleton from './common/Skeleton';
import KpiStatsRow from './KpiStatsRow';

export default function ProfileView({ setActiveTab = () => {} }) {
  const navigate = useNavigate();
  const { displayName, signOut } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const stageInfo = getStageInfo(mockEmployee.readinessScore);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-slate-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-56 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-72 bg-slate-100 rounded animate-pulse" />
            <div className="h-6 w-48 bg-slate-100 rounded-full animate-pulse" />
          </div>
        </div>
        <Skeleton variant="stat-card" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-56 rounded-xl bg-slate-200/70 animate-pulse" />
          <div className="h-56 rounded-xl bg-slate-200/70 animate-pulse" />
        </div>
      </div>
    );
  }

  const profileFacts = [
    { label: 'Employee ID', value: mockEmployee.id },
    { label: 'Role', value: mockEmployee.role },
    { label: 'Target role', value: mockEmployee.targetRole },
    { label: 'Department', value: mockEmployee.department },
    { label: 'Pending assessments', value: mockEmployee.pendingAssessmentsCount },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        type="button"
        onClick={() => setActiveTab('dashboard')}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <img
            src={mockEmployee.avatarUrl}
            alt={displayName || mockEmployee.name}
            className="h-24 w-24 rounded-full object-cover ring-2 ring-teal-100"
          />
          <div>
            <h1 className="typography-display text-slate-900">{displayName || mockEmployee.name}</h1>
            <p className="typography-body text-slate-500 mt-1">{mockEmployee.role}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200/60">
              <TrendingUp className="h-3.5 w-3.5" />
              Target: {mockEmployee.targetRole}
            </span>
          </div>
        </div>

        {/* De-emphasized Sign Out action with lightweight confirmation */}
        <div className="sm:self-start pt-1">
          {!confirmSignOut ? (
            <button
              type="button"
              onClick={() => setConfirmSignOut(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 transition-all active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs animate-fade-in">
              <span className="font-medium text-slate-700">Are you sure?</span>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  navigate('/login');
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmSignOut(false)}
                className="px-2 py-1 rounded-lg bg-[#F8FCFD] border border-slate-200/80 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <KpiStatsRow />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="ambient">
          <h2 className="typography-h2 text-slate-900 mb-4">About</h2>
          <dl className="space-y-3">
            {profileFacts.map((fact) => (
              <div key={fact.label} className="flex items-start justify-between gap-4">
                <dt className="typography-caption uppercase tracking-wider text-slate-400">{fact.label}</dt>
                <dd className="typography-body text-slate-800 text-right font-medium">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card variant="ambient">
          <h2 className="typography-h2 text-slate-900 mb-1">Growth snapshot</h2>
          <p className="typography-caption text-slate-500 mb-4">
            Same stage as the sidebar growth tree at {mockEmployee.readinessScore}% readiness
          </p>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${stageInfo.accentClass}`}
          >
            {stageInfo.badge}
          </span>
          <p className="mt-3 font-semibold text-slate-900 text-sm">{stageInfo.name}</p>
          <p className="mt-1 typography-body text-slate-600">{stageInfo.narrative}</p>
        </Card>
      </div>
    </div>
  );
}
