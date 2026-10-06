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
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CANONICAL_DOMAINS = ['Statistical', 'Technical', 'Digital Governance', 'Behavioural'];

function ManagerDetails() {
  const { token } = useAuth();
  const { managerId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

        const [teamData, orgSummary] = await Promise.all([
          api.getManagerTeam(managerId),
          api.getOrgSummary().catch(() => ({})),
        ]);

        if (!isMounted) return;
        setTeam(teamData);
        setOrgAvg(16);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || `Manager telemetry for '${managerId}' could not be loaded.`);
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
            <h2 className="text-base font-bold text-[#B23A2E]">Manager Telemetry Unavailable</h2>
          </div>
          <p className="text-sm text-[#5B5850]">{error || 'Manager not found.'}</p>
        </div>
        <Link to="/admin" className="text-[#14140F] font-medium text-sm hover:underline">
          &larr; Back to admin
        </Link>
      </div>
    );
  }

  const reports = team.direct_reports || [];
  const domainAverages = {};
  CANONICAL_DOMAINS.forEach((domain) => {
    if (reports.length > 0) {
      const sum = reports.reduce((acc, r) => acc + (r.domain_gaps?.[domain] || 0), 0);
      domainAverages[domain] = Math.round(sum / reports.length);
    } else {
      domainAverages[domain] = 0;
    }
  });

  const breakdown = CANONICAL_DOMAINS.map((domain) => ({
    skill: domain,
    gapPercent: domainAverages[domain],
  }));

  const mgrGap = Math.round(
    breakdown.reduce((sum, b) => sum + b.gapPercent, 0) / breakdown.length
  );

  const insightText = generateInsight(team.manager_name, mgrGap, breakdown, orgAvg);

  return (
    <div className="px-8 py-10 max-w-2xl mx-auto">
      <Breadcrumbs trail={[
        { label: 'Admin', to: '/admin' },
        { label: team.department || 'Department', to: team.department_id ? `/admin/department/${team.department_id}` : '/admin' },
        { label: team.manager_name },
      ]} />

      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-extrabold text-[#14140F]">{team.manager_name}</h1>
        <SeverityBadge gap={mgrGap} />
      </div>
      <p className="text-sm text-[#5B5850] mb-1">Division Director &middot; {team.department}</p>
      <p className="text-sm text-[#5B5850] mb-6 font-semibold">{mgrGap}% overall team competency gap</p>

      <InsightBanner text={insightText} />

      <h2 className="text-lg font-bold text-[#14140F] mb-3">Team domain gap statistics</h2>
      <div className="mb-4">
        <SkillGapChart data={breakdown} />
      </div>
      <div className="mb-8">
        <RecommendationCard breakdown={breakdown} id={team.manager_id} />
      </div>

      <button
        onClick={() => navigate(`/admin/manager/${team.manager_id}/employees`)}
        className="bg-[#14140F] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#2B2A24] transition-colors"
      >
        View employees ({team.direct_reports_count})
      </button>
    </div>
  );
}

export default ManagerDetails;