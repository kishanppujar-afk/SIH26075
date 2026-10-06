import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { generateInsight } from '../data/insights';
import Breadcrumbs from './Breadcrumbs';
import SeverityBadge from './SeverityBadge';
import InsightBanner from './InsightBanner';
import RecommendationCard from './RecommendationCard';
import DashboardSkeleton from './DashboardSkeleton';
import { AlertCircle } from 'lucide-react';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { domain, value } = payload[0].payload;
  return (
    <div className="bg-[#14140F] text-white text-xs px-3 py-2 rounded-lg shadow-lg">
      <p className="font-medium">{domain}</p>
      <p className="text-white/70">{value}% gap</p>
    </div>
  );
}

function EmployeeDetails({ backTo = '/admin' }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [profile, setProfile] = useState(null);
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

        const [profData, orgSummary] = await Promise.all([
          api.getEmployeeCompetencyProfile(employeeId),
          api.getOrgSummary().catch(() => ({})),
        ]);

        if (!isMounted) return;
        setProfile(profData);
        setOrgAvg(16);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || `Employee profile '${employeeId}' could not be loaded.`);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [employeeId]);

  if (loading) return <DashboardSkeleton />;

  if (error || !profile) {
    return (
      <div className="px-8 py-10 max-w-2xl mx-auto">
        <div className="bg-[#FCEDEB] border border-[#B23A2E]/20 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-[#B23A2E]" />
            <h2 className="text-base font-bold text-[#B23A2E]">Profile Not Found</h2>
          </div>
          <p className="text-sm text-[#5B5850]">{error || 'Employee not found.'}</p>
        </div>
        <Link to={backTo} className="text-[#14140F] font-medium text-sm hover:underline">
          &larr; Back
        </Link>
      </div>
    );
  }

  const isManagerSide = backTo.startsWith('/manager');
  const gaps = profile.domain_gaps || {};
  const gapValues = Object.values(gaps);
  const empGap = gapValues.length > 0
    ? Math.round(gapValues.reduce((a, b) => a + b, 0) / gapValues.length)
    : 0;

  const breakdown = [
    { skill: 'Statistical', gapPercent: Math.round(gaps['Statistical'] || 0) },
    { skill: 'Technical', gapPercent: Math.round(gaps['Technical'] || 0) },
    { skill: 'Digital Governance', gapPercent: Math.round(gaps['Digital Governance'] || 0) },
    { skill: 'Behavioural', gapPercent: Math.round(gaps['Behavioural'] || 0) },
  ];

  const insightText = generateInsight(profile.name, empGap, breakdown, orgAvg);
  const radarData = breakdown.map((b) => ({ domain: b.skill, value: b.gapPercent }));

  const trail = isManagerSide
    ? [{ label: 'Your stats', to: '/manager' }, { label: 'My employees', to: '/manager/employees' }, { label: profile.name }]
    : [
        { label: 'Admin', to: '/admin' },
        {
          label: profile.department || 'Department',
          to: profile.department_id ? `/admin/department/${profile.department_id}` : '/admin',
        },
        { label: profile.name },
      ];

  return (
    <div className="px-8 py-10 max-w-2xl mx-auto">
      <Breadcrumbs trail={trail} />

      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-extrabold text-[#14140F]">{profile.name}</h1>
        <SeverityBadge gap={empGap} />
      </div>

      <p className="text-sm text-[#5B5850]">
        {profile.role_title || 'Official Cadre'} &middot; {profile.department}
      </p>
      <p className="text-sm text-[#5B5850] mb-6 font-semibold">
        Readiness Score: {profile.readiness_score}/100 &middot; {empGap}% overall skill gap
      </p>

      <InsightBanner text={insightText} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-[#EDEBE6] rounded-2xl p-4 mb-4"
        style={{ height: 320 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#EDEBE6" />
            <PolarAngleAxis dataKey="domain" tick={{ fill: '#5B5850', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#A8A59C', fontSize: 10 }} axisLine={false} />
            <Radar dataKey="value" stroke="#14140F" fill="#14140F" fillOpacity={0.12} strokeWidth={2} animationDuration={600} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      <RecommendationCard breakdown={breakdown} id={profile.id} />
    </div>
  );
}

export default EmployeeDetails;