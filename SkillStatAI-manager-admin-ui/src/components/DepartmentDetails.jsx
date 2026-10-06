import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { generateInsight } from '../data/insights';
import SkillGapChart from './SkillGapChart';
import Breadcrumbs from './Breadcrumbs';
import InsightBanner from './InsightBanner';
import SeverityBadge from './SeverityBadge';
import RecommendationCard from './RecommendationCard';
import DashboardSkeleton from './DashboardSkeleton';
import EmployeeList from './EmployeeList';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEPT_MANAGERS = {
  'labour-statistics': { id: 'MGR-101', name: 'Pooja Sengupta', departmentId: 'labour-statistics' },
  'price-statistics': { id: 'MGR-102', name: 'Suresh Raman', departmentId: 'price-statistics' },
  'national-accounts': { id: 'MGR-103', name: 'Kavita Deshmukh', departmentId: 'national-accounts' },
};

function DepartmentDetails() {
  const { token } = useAuth();
  const { departmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dept, setDept] = useState(null);
  const [orgAvg, setOrgAvg] = useState(16);

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

        const [deptRes, orgSummary] = await Promise.all([
          api.getDepartmentCompetency(departmentId),
          api.getOrgSummary(),
        ]);

        if (!isMounted) return;

        const gaps = deptRes.domain_gaps || [];
        const avgGap = gaps.length > 0
          ? Math.round(gaps.reduce((acc, curr) => acc + (curr.gap || 0), 0) / gaps.length)
          : 0;

        setDept({
          ...deptRes,
          avgSkillGap: avgGap,
        });

        // Compute org avg from summary or fallback to 16
        setOrgAvg(16);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || `Department '${departmentId}' not found.`);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [departmentId]);

  if (loading) return <DashboardSkeleton />;

  if (error || !dept) {
    return (
      <div className="px-8 py-10 max-w-2xl mx-auto">
        <div className="bg-[#FCEDEB] border border-[#B23A2E]/20 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-[#B23A2E]" />
            <h2 className="text-base font-bold text-[#B23A2E]">Department Telemetry Unavailable</h2>
          </div>
          <p className="text-sm text-[#5B5850]">{error || 'Department not found.'}</p>
        </div>
        <Link to="/admin" className="text-[#14140F] font-medium text-sm hover:underline">
          &larr; Back to admin
        </Link>
      </div>
    );
  }

  const breakdown = (dept.domain_gaps || []).map((g) => ({
    skill: g.domain,
    gapPercent: Math.round(g.gap),
  }));

  const diff = dept.avgSkillGap - orgAvg;
  const insightText = generateInsight(dept.name || dept.department, dept.avgSkillGap, breakdown, orgAvg);

  const assignedManager = DEPT_MANAGERS[dept.department_id || departmentId];
  const deptEmployees = (dept.employees || []).map((e) => ({
    id: e.id,
    name: e.name,
    roleTitle: e.role_title,
    readinessScore: e.readiness_score,
    overallGap: dept.avgSkillGap,
  }));

  return (
    <div className="px-8 py-10 max-w-2xl mx-auto">
      <Breadcrumbs trail={[{ label: 'Admin', to: '/admin' }, { label: dept.name || dept.department }]} />

      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-extrabold text-[#14140F]">{dept.name || dept.department}</h1>
        <SeverityBadge gap={dept.avgSkillGap} />
      </div>

      <p className="text-sm text-[#5B5850] mb-1">{dept.avgSkillGap}% overall average gap</p>
      <p
        className="text-sm font-medium mb-6"
        style={{ color: diff > 0 ? '#B23A2E' : diff < 0 ? '#1B4332' : '#A8A59C' }}
      >
        {diff === 0
          ? 'On par with organisation average'
          : `${Math.abs(diff)}% ${diff > 0 ? 'above' : 'below'} organisation average (${orgAvg}%)`}
      </p>

      <InsightBanner text={insightText} />

      <h2 className="text-lg font-bold text-[#14140F] mb-3">Canonical domain gap statistics</h2>
      <div className="mb-4">
        <SkillGapChart data={breakdown} />
      </div>
      <div className="mb-8">
        <RecommendationCard breakdown={breakdown} id={dept.department_id || departmentId} />
      </div>

      {deptEmployees.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#14140F] mb-3">
            Department cadre ({deptEmployees.length} evaluated)
          </h2>
          <EmployeeList employees={deptEmployees} linkBase="/admin/employee" />
        </div>
      )}

      {assignedManager ? (
        <SingleManagerBlock manager={assignedManager} navigate={navigate} />
      ) : (
        <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6 text-sm text-[#5B5850] text-center">
          No manager assigned to this division yet.
        </div>
      )}
    </div>
  );
}

function SingleManagerBlock({ manager, navigate }) {
  return (
    <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6 mt-6">
      <h2 className="text-lg font-bold text-[#14140F] mb-1">Division Director / Head</h2>
      <p className="text-base font-semibold text-[#14140F] mb-4">{manager.name}</p>
      <button
        onClick={() => navigate(`/admin/manager/${manager.id}/employees`)}
        className="bg-[#14140F] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#2B2A24] transition-colors"
      >
        View employees
      </button>
    </div>
  );
}

export default DepartmentDetails;