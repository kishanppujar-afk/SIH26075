import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import EmployeeList from './EmployeeList';
import Breadcrumbs from './Breadcrumbs';
import DashboardSkeleton from './DashboardSkeleton';
import { AlertCircle } from 'lucide-react';

function ManagerEmployees() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { managerId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getManagerTeam(managerId);
        if (!isMounted) return;
        setTeam(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || `Could not load employees under manager '${managerId}'.`);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [managerId]);

  if (loading) return <DashboardSkeleton />;

  if (error || !team) {
    return (
      <div className="px-8 py-10 max-w-2xl mx-auto">
        <div className="bg-[#FCEDEB] border border-[#B23A2E]/20 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-[#B23A2E]" />
            <h2 className="text-base font-bold text-[#B23A2E]">Team Roster Unavailable</h2>
          </div>
          <p className="text-sm text-[#5B5850]">{error || 'Manager not found.'}</p>
        </div>
        <Link to="/admin" className="text-[#14140F] font-medium text-sm hover:underline">
          &larr; Back to admin
        </Link>
      </div>
    );
  }

  const reports = (team.direct_reports || []).map((r) => {
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
      <Breadcrumbs trail={[
        { label: 'Admin', to: '/admin' },
        { label: team.department || 'Department', to: team.department_id ? `/admin/department/${team.department_id}` : '/admin' },
        { label: team.manager_name, to: `/admin/manager/${team.manager_id}` },
        { label: 'Employees' },
      ]} />
      <h1 className="text-3xl font-extrabold text-[#14140F]">Employees under {team.manager_name}</h1>
      <p className="text-sm text-[#5B5850] mb-6">{reports.length} direct reports</p>
      <EmployeeList employees={reports} linkBase="/admin/employee" />
    </div>
  );
}

export default ManagerEmployees;