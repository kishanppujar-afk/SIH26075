import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import EmployeeList from './EmployeeList';
import Breadcrumbs from './Breadcrumbs';
import DashboardSkeleton from './DashboardSkeleton';
import { AlertCircle } from 'lucide-react';

function MyEmployees() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [team, setTeam] = useState(null);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getMyTeam();
        if (!isMounted) return;
        setTeam(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Could not load your team.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [token]);

  if (!token || !user) return <Navigate to="/login" replace />;
  if (loading) return <DashboardSkeleton />;

  if (error || !team) {
    return (
      <div className="px-8 py-10 max-w-2xl mx-auto">
        <div className="bg-[#FCEDEB] border border-[#B23A2E]/20 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-[#B23A2E]" />
            <h2 className="text-base font-bold text-[#B23A2E]">Team Roster Unavailable</h2>
          </div>
          <p className="text-sm text-[#5B5850]">{error || 'Unable to load your employees.'}</p>
        </div>
      </div>
    );
  }

  const myEmployees = (team.direct_reports || []).map((r) => {
    const gaps = r.domain_gaps || {};
    const gapVals = Object.values(gaps);
    const avgGap = gapVals.length > 0
      ? Math.round(gapVals.reduce((a, b) => a + b, 0) / gapVals.length)
      : 0;

    return {
      id: r.id,
      name: r.name,
      overallGap: avgGap,
      domain_gaps: gaps,
      roleTitle: r.role_title,
      readinessScore: r.readiness_score,
    };
  });

  return (
    <div className="px-8 py-10 max-w-2xl mx-auto">
      <Breadcrumbs trail={[{ label: 'Your stats', to: '/manager' }, { label: 'My employees' }]} />
      <h1 className="text-3xl font-extrabold text-[#14140F]">My employees</h1>
      <p className="text-sm text-[#5B5850] mb-6">{myEmployees.length} people report to you</p>
      <EmployeeList employees={myEmployees} linkBase="/manager/employee" />
    </div>
  );
}

export default MyEmployees;