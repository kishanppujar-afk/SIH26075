import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import DashboardSkeleton from './DashboardSkeleton';

const PALETTE = ['#1F3A5F', '#B8842E', '#2E7D5B'];
const DOMAINS = ['Statistical', 'Technical', 'Digital Governance', 'Behavioural'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C1C1E] text-white text-xs px-3 py-2 rounded-lg shadow-lg">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }}>{p.dataKey}: {p.value}%</p>
      ))}
    </div>
  );
}

function DepartmentComparison() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    let isMounted = true;
    async function fetchDepartments() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.compareDepartments();
        if (!isMounted) return;

        const rawDepts = res.departments || [];
        const formatted = rawDepts.map((d) => ({
          id: d.department_id,
          name: d.department_name,
          employeeCount: d.employee_count,
          domain_gaps: d.domain_gaps || [],
          domain_averages: d.domain_averages || {},
        }));

        setDepartments(formatted);
        // Pre-select first two departments if available for immediate comparison
        if (formatted.length >= 2) {
          setSelected([formatted[0].id, formatted[1].id]);
        } else if (formatted.length === 1) {
          setSelected([formatted[0].id]);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load department comparison telemetry.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDepartments();
    return () => {
      isMounted = false;
    };
  }, []);

  function toggle(id) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="px-8 py-10 max-w-3xl mx-auto">
        <Link to="/admin" className="flex items-center gap-1.5 text-sm text-[#1F3A5F] hover:underline w-fit mb-4">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <div className="bg-[#FCEDEB] border border-[#B23A2E]/20 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle size={20} className="text-[#B23A2E] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-[#B23A2E]">Failed to load comparison data</h2>
            <p className="text-sm text-[#5B5850] mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedDepts = departments.filter((d) => selected.includes(d.id));

  const chartData = DOMAINS.map((domainName) => {
    const row = { skill: domainName };
    selectedDepts.forEach((d) => {
      const found = (d.domain_gaps || []).find((g) => g.domain === domainName);
      row[d.name] = found ? Math.round(found.gap) : 0;
    });
    return row;
  });

  return (
    <div className="px-8 py-10 max-w-3xl mx-auto">
      <Link to="/admin" className="flex items-center gap-1.5 text-sm text-[#1F3A5F] hover:underline w-fit">
        <ArrowLeft size={14} /> Department heatmap
      </Link>
      <h1 className="text-2xl font-semibold text-[#1C1C1E] mt-3 mb-1">Compare departments</h1>
      <p className="text-sm text-[#6B6B6F] mb-6">Select up to 3 departments to compare competency gaps side by side</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {departments.map((dept) => {
          const isOn = selected.includes(dept.id);
          return (
            <button
              key={dept.id}
              onClick={() => toggle(dept.id)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                isOn
                  ? 'bg-[#1F3A5F] text-white border-[#1F3A5F]'
                  : 'bg-white text-[#4B4B4E] border-[#E7E5E2] hover:border-[#1F3A5F]/40'
              }`}
            >
              {dept.name}
            </button>
          );
        })}
      </div>

      {selectedDepts.length === 0 ? (
        <div className="bg-white border border-[#E7E5E2] rounded-[12px] p-10 text-center text-sm text-[#6B6B6F]">
          Select at least one department above to see its canonical competency gap breakdown.
        </div>
      ) : (
        <div className="bg-white border border-[#E7E5E2] rounded-[12px] p-5">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#F0EEEB" />
              <XAxis dataKey="skill" tick={{ fill: '#4B4B4E', fontSize: 12 }} axisLine={{ stroke: '#E7E5E2' }} tickLine={false} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fill: '#9B9B9E', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FAFAF9' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {selectedDepts.map((d, i) => (
                <Bar key={d.id} dataKey={d.name} fill={PALETTE[i % PALETTE.length]} radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={600} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default DepartmentComparison;