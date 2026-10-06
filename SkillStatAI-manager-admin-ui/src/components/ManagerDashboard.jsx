import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { LogOut, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import SkillGapChart from './SkillGapChart';
import DashboardSkeleton from './DashboardSkeleton';

function ManagerDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamData, setTeamData] = useState(null);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getMyTeamCompetency();
        if (!isMounted) return;
        setTeamData(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Could not load team competency data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [token]);

  if (!token || !user) return <Navigate to="/login" replace />;
  if (loading) return <DashboardSkeleton />;

  if (error || !teamData) {
    return (
      <div className="px-8 py-10 max-w-2xl mx-auto">
        <div className="bg-[#FCEDEB] border border-[#B23A2E]/20 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-[#B23A2E]" />
            <h2 className="text-base font-bold text-[#B23A2E]">Team Data Unavailable</h2>
          </div>
          <p className="text-sm text-[#5B5850]">{error || 'Unable to load team competency data.'}</p>
        </div>
      </div>
    );
  }

  // Build SkillGapChart data from 4-domain gaps
  const breakdown = (teamData.domain_gaps || []).map((g) => ({
    skill: g.domain,
    gapPercent: Math.round(g.gap),
  }));

  // Compute overall gap as average of domain gaps
  const overallGapValue = breakdown.length > 0
    ? Math.round(breakdown.reduce((acc, b) => acc + b.gapPercent, 0) / breakdown.length)
    : 0;

  const deptLabel = teamData.department
    ? teamData.department
    : (teamData.department_id || '').replace(/-/g, ' ');

  return (
    <div className="px-8 py-10 max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="text-sm text-[#6B6B6F] mb-1">
            {deptLabel}
          </p>
          <h1 className="text-2xl font-semibold text-[#1C1C1E]">
            Welcome, {teamData.manager_name || user?.name || 'Manager'}
          </h1>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-[#6B6B6F] hover:text-[#C1443A] transition-colors mt-1"
        >
          <LogOut size={14} /> Log out
        </button>
      </div>
      <p className="text-sm text-[#6B6B6F] mb-8">
        {overallGapValue}% overall team skill gap · {teamData.team_size} direct reports
      </p>

      <h2 className="text-sm font-medium text-[#1C1C1E] mb-3">Team competency gap by domain</h2>
      <div className="mb-6">
        <SkillGapChart data={breakdown} />
      </div>

      <button
        onClick={() => navigate('/manager/employees')}
        className="flex items-center gap-2 bg-[#1F3A5F] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#16293F] transition-colors"
      >
        View my employees <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default ManagerDashboard;