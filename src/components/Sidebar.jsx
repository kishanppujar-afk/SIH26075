import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react';
import { mockEmployee } from '../mock/employeeData';
import GrowthTreeWidget from './GrowthTreeWidget';

// Toggle flag to easily disable dev preview controls for final hackathon demo
export const SHOW_DEV_CONTROLS = true;

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'skills', label: 'Skills & Benchmarks', icon: Target },
  { id: 'courses', label: 'Upskilling & Courses', icon: GraduationCap },
  { id: 'assessments', label: 'Skill Assessments', icon: ClipboardCheck },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Local state to preview growth stages on demand without altering real employee data
  const [previewScore, setPreviewScore] = useState(null);

  const pathSegment = location.pathname.replace(/^\//, '') || 'dashboard';
  const isPreviewing = previewScore !== null;
  const effectiveScore = isPreviewing ? previewScore : mockEmployee.readinessScore;

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-[#F2F8FA] flex flex-col shrink-0 min-h-[calc(100vh-57px)] max-h-[calc(100vh-57px)] overflow-y-auto">
      {/* 1. Primary Navigation List */}
      <div className="p-3 pb-2 space-y-1">
        <div className="px-3 py-1.5 typography-caption uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathSegment === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate('/' + item.id)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                isActive
                  ? 'bg-teal-50 text-teal-700 shadow-2xs font-semibold translate-x-0.5'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5'
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-transform duration-200 ${
                  isActive
                    ? 'text-teal-600 scale-105'
                    : 'text-slate-400 group-hover:text-slate-600 group-hover:scale-110'
                }`}
              />
              <span className="transition-colors duration-200">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Dominant Growth Tree Widget — Immediately visible below nav with zero scrolling */}
      <div className="w-full px-2.5 pb-2">
        <GrowthTreeWidget
          readinessScore={effectiveScore}
        />
      </div>

      {/* Dev / Testing Control: Growth Stage Preview Slider (gated by SHOW_DEV_CONTROLS) */}
      {SHOW_DEV_CONTROLS && (
        <div className="mx-2.5 mb-2.5 p-2.5 rounded-xl border border-dashed border-amber-300/90 bg-amber-50/70 text-slate-700 select-none transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <span>🛠️</span> Preview Stages
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded-md border border-amber-200">
              {effectiveScore}%
            </span>
          </div>

          <div className="mt-2">
            <input
              type="range"
              min="0"
              max="100"
              value={effectiveScore}
              onChange={(e) => setPreviewScore(Number(e.target.value))}
              className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none"
            />
            <div className="mt-1 flex justify-between text-[9px] font-medium text-slate-500">
              <span>0% Sprout</span>
              <span>25% Sapling</span>
              <span>50% Tree</span>
              <span>75% Bloom</span>
            </div>
          </div>

          {isPreviewing && (
            <div className="mt-2 pt-1.5 border-t border-amber-200/80 flex items-center justify-between">
              <span className="text-[10px] text-amber-900 font-medium">
                Simulating ({effectiveScore}%)
              </span>
              <button
                type="button"
                onClick={() => setPreviewScore(null)}
                className="text-[10px] font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Reset to {mockEmployee.readinessScore}%
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Target Goal Panel — Below the tree widget; scrolls if screen height is very short */}
      <div className="px-2.5 pb-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-50/70 to-teal-100/50 border border-teal-200/80 transition-all duration-200">
          <div className="flex items-center justify-between text-teal-700">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800">
                Target Goal
              </span>
            </div>
            <span className="text-[11px] font-bold text-teal-600">
              {mockEmployee.readinessScore}%
            </span>
          </div>
          <p className="mt-1.5 text-xs font-semibold text-slate-800 leading-snug">
            {mockEmployee.targetRole}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-teal-100">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-700 ease-out"
              style={{ width: `${mockEmployee.readinessScore}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
