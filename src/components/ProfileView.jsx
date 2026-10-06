import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, LogOut } from 'lucide-react';
import { mockEmployee } from '../mock/employeeData';
import { useSession, useEmployee } from '../context/SessionContext';
import { getStageInfo } from '../utils/growthStage';
import Card from './common/Card';
import Skeleton from './common/Skeleton';
import KpiStatsRow from './KpiStatsRow';

import { api } from '../api/client';

export default function ProfileView({ setActiveTab = () => {} }) {
  const navigate = useNavigate();
  const { displayName, signOut } = useSession();
  const { employee, growthStage, isLoading } = useEmployee();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const activeEmployee = employee || mockEmployee;
  const stageInfo = growthStage || getStageInfo(activeEmployee.readinessScore);


  const handleEdit = () => {
    setEditData({
      interests: activeEmployee.interests?.join(', ') || '',
      qualifications: activeEmployee.qualifications?.join(', ') || '',
      certificates: activeEmployee.certificates?.join(', ') || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile({
        interests: editData.interests.split(',').map(s => s.trim()).filter(Boolean),
        qualifications: editData.qualifications.split(',').map(s => s.trim()).filter(Boolean),
        certificates: editData.certificates.split(',').map(s => s.trim()).filter(Boolean)
      });
      alert('Profile updated successfully! (Refresh to see changes)');
      setIsEditing(false);
    } catch (e) {
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };


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
    { label: 'Employee ID', value: activeEmployee.id },
    { label: 'Role', value: activeEmployee.role },
    { label: 'Target role', value: activeEmployee.targetRole },
    { label: 'Department', value: activeEmployee.department },
    { label: 'Pending assessments', value: activeEmployee.pendingAssessmentsCount },
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
            src={activeEmployee.avatarUrl}
            alt={displayName || activeEmployee.name}
            className="h-24 w-24 rounded-full object-cover ring-2 ring-teal-100"
          />
          <div>
            <h1 className="typography-display text-slate-900">{displayName || activeEmployee.name}</h1>
            <p className="typography-body text-slate-500 mt-1">{activeEmployee.role}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200/60">
              <TrendingUp className="h-3.5 w-3.5" />
              Target: {activeEmployee.targetRole}
            </span>
          </div>
        </div>

        <div className="sm:self-start pt-1 flex flex-col items-end gap-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1B4332] text-white hover:bg-[#122e22] transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1B4332] text-white hover:bg-[#122e22] transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          )}

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

      {isEditing && (
        <Card variant="ambient" className="mb-6">
          <h2 className="typography-h2 text-slate-900 mb-4">Edit Profile details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Interests (comma-separated)</label>
              <input value={editData.interests} onChange={e => setEditData({...editData, interests: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Qualifications (comma-separated)</label>
              <input value={editData.qualifications} onChange={e => setEditData({...editData, qualifications: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Certificates (comma-separated)</label>
              <input value={editData.certificates} onChange={e => setEditData({...editData, certificates: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </Card>
      )}

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
          
          {activeEmployee.interests?.length > 0 && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="typography-caption uppercase tracking-wider text-slate-400 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {activeEmployee.interests.map((interest, idx) => (
                  <span key={idx} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeEmployee.qualifications?.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <h3 className="typography-caption uppercase tracking-wider text-slate-400 mb-2">Qualifications</h3>
              <ul className="space-y-1">
                {activeEmployee.qualifications.map((qual, idx) => (
                  <li key={idx} className="typography-body text-slate-800 text-sm flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">•</span>
                    {qual}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <div className="space-y-6">
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

          {activeEmployee.certificates?.length > 0 && (
            <Card variant="ambient">
              <h2 className="typography-h2 text-slate-900 mb-3">Verified Certificates</h2>
              <div className="space-y-3">
                {activeEmployee.certificates.map((cert, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">{cert}</span>
                      <span className="text-[10px] text-teal-600 font-medium uppercase mt-0.5">MoES Verified</span>
                    </div>
                    <button className="text-xs px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}



