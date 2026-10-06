import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, BookOpen, Award, AlertTriangle, CheckCircle2, ChevronRight, Sparkles, Layers, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import AnimatedNumber from './AnimatedNumber';

function getGapBadgeStyle(gap) {
  if (gap >= 35) return { color: '#B23A2E', bg: '#FCEDEB', border: 'border-[#B23A2E]/20' };
  if (gap >= 20) return { color: '#A56B1F', bg: '#FBF3E7', border: 'border-[#A56B1F]/20' };
  return { color: '#1B4332', bg: '#E7F0EA', border: 'border-[#1B4332]/20' };
}

export default function AdminCadreTelemetry() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [participation, setParticipation] = useState(null);
  const [effectiveness, setEffectiveness] = useState(null);
  const [activeTab, setActiveTab] = useState('gaps'); // 'gaps' | 'training' | 'effectiveness'

  useEffect(() => {
    let isMounted = true;

    async function loadTelemetry() {
      try {
        setLoading(true);
        setError(null);

        const [gapsRes, partRes, effRes] = await Promise.all([
          api.getSkillGapDistribution(),
          api.getTrainingParticipation(),
          api.getTrainingEffectiveness(),
        ]);

        if (!isMounted) return;
        setSkillGaps(gapsRes || []);
        setParticipation(partRes || null);
        setEffectiveness(effRes || null);
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load admin telemetry:', err);
        setError(err.message || 'Failed to fetch cadre telemetry.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTelemetry();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6 mb-12 animate-pulse">
        <div className="h-6 w-52 bg-[#F4F3EF] rounded-md mb-4" />
        <div className="h-32 bg-[#F4F3EF] rounded-xl" />
      </div>
    );
  }

  if (error || !participation || !effectiveness) {
    return null; // Gracefully degrade if telemetry endpoints fail
  }

  const topGaps = skillGaps.slice(0, 5);

  return (
    <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6 mb-12">
      {/* Header and Telemetry Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EDEBE6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1B4332] animate-pulse" />
            <h2 className="text-lg font-extrabold text-[#14140F]">Cadre Capacity & Training Telemetry</h2>
          </div>
          <p className="text-xs text-[#5B5850] mt-0.5">
            Real-time analytics across competency deficits, course uptake, and diagnostic lifts
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#F4F3EF] p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('gaps')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'gaps' ? 'bg-white text-[#14140F] shadow-xs' : 'text-[#5B5850] hover:text-[#14140F]'
            }`}
          >
            <Target size={13} />
            Top Skill Gaps
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'training' ? 'bg-white text-[#14140F] shadow-xs' : 'text-[#5B5850] hover:text-[#14140F]'
            }`}
          >
            <BookOpen size={13} />
            Training Uptake
          </button>
          <button
            onClick={() => setActiveTab('effectiveness')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'effectiveness' ? 'bg-white text-[#14140F] shadow-xs' : 'text-[#5B5850] hover:text-[#14140F]'
            }`}
          >
            <Award size={13} />
            Diagnostic Lift
          </button>
        </div>
      </div>

      {/* Tab 1: Top Skill Gaps Distribution */}
      {activeTab === 'gaps' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="pt-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#5B5850] uppercase tracking-wider">
              Priority Focus Areas (Highest Deficits Across Cadre)
            </span>
            <span className="text-xs text-[#5B5850]">
              Showing top {topGaps.length} of {skillGaps.length} competencies
            </span>
          </div>

          <div className="space-y-3.5">
            {topGaps.map((sk) => {
              const badge = getGapBadgeStyle(sk.average_gap);
              return (
                <div key={sk.skill_id} className="p-3.5 rounded-xl border border-[#EDEBE6] bg-[#FAFAF9] hover:border-[#DCDAD4] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#14140F]">{sk.skill_name}</p>
                        <span className="text-[10px] font-semibold bg-[#EDEBE6] text-[#5B5850] px-2 py-0.5 rounded-full">
                          {sk.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#5B5850] mt-0.5">
                        Current Avg: <span className="font-semibold text-[#14140F]">{sk.average_current_score}%</span> &middot; Target: <span className="font-semibold text-[#14140F]">{sk.average_target_score}%</span> &middot; Evaluated: {sk.employee_count_evaluated} officials
                      </p>
                    </div>
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${badge.border}`} style={{ color: badge.color, backgroundColor: badge.bg }}>
                      +{sk.average_gap}% gap
                    </span>
                  </div>

                  {/* Visual Progress / Gap Bar */}
                  <div className="w-full bg-[#E5E3DD] h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#14140F] h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${Math.min(100, sk.average_current_score)}%` }}
                      title={`Current Score: ${sk.average_current_score}%`}
                    />
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100 - sk.average_current_score, sk.average_gap)}%`,
                        backgroundColor: badge.color,
                        opacity: 0.85,
                      }}
                      title={`Competency Gap: ${sk.average_gap}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Tab 2: Training Participation & Resource Breakdown */}
      {activeTab === 'training' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="pt-5">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-[#FAFAF9] border border-[#EDEBE6] rounded-xl p-3.5">
              <p className="text-xs text-[#5B5850]">Completed Modules</p>
              <p className="text-2xl font-extrabold text-[#14140F] mt-1">
                <AnimatedNumber value={participation.completed_courses_total} />
              </p>
              <p className="text-[11px] text-[#1B4332] font-semibold mt-0.5">Across all departments</p>
            </div>
            <div className="bg-[#FAFAF9] border border-[#EDEBE6] rounded-xl p-3.5">
              <p className="text-xs text-[#5B5850]">Active Recommendations</p>
              <p className="text-2xl font-extrabold text-[#14140F] mt-1">
                <AnimatedNumber value={participation.total_recommendations} />
              </p>
              <p className="text-[11px] text-[#5B5850] mt-0.5">Personalised study paths</p>
            </div>
            <div className="bg-[#FCEDEB] border border-[#B23A2E]/20 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-[#B23A2E]">
                <ShieldAlert size={14} />
                <p className="text-xs font-semibold">Urgent Interventions</p>
              </div>
              <p className="text-2xl font-extrabold text-[#B23A2E] mt-1">
                <AnimatedNumber value={participation.urgent_recommendations} />
              </p>
              <p className="text-[11px] text-[#B23A2E]/80 mt-0.5">Gaps exceeding 30%</p>
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="mb-5 p-4 rounded-xl border border-[#EDEBE6] bg-[#FAFAF9]">
            <p className="text-xs font-bold text-[#5B5850] uppercase tracking-wider mb-2.5">
              Curriculum Source Allocation
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1B4332]" />
                <span className="text-xs font-bold text-[#14140F]">NSSTA Greater Noida:</span>
                <span className="text-xs text-[#5B5850] font-semibold">{participation.source_breakdown?.NSSTA || 0} modules</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#B5651D]" />
                <span className="text-xs font-bold text-[#14140F]">MoSPI Training Division:</span>
                <span className="text-xs text-[#5B5850] font-semibold">{participation.source_breakdown?.MoSPI || 0} modules</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#A8A59C]" />
                <span className="text-xs font-bold text-[#5B5850]">iGOT Karmayogi:</span>
                <span className="text-[11px] font-semibold text-[#A8A59C]">Staged / In-flight</span>
              </div>
            </div>
          </div>

          {/* Top Engaged Resources */}
          <div>
            <p className="text-xs font-bold text-[#5B5850] uppercase tracking-wider mb-2.5">
              High-Engagement Programmes (MoSPI Cadre Alignment)
            </p>
            <div className="space-y-2">
              {(participation.top_engaged_resources || []).map((res, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-[#EDEBE6] bg-white text-xs">
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-[#14140F] truncate">{res.title}</p>
                    <p className="text-[#5B5850] text-[11px]">{res.provider} &middot; {res.type}</p>
                  </div>
                  <span className="shrink-0 font-bold text-[#1B4332] bg-[#E7F0EA] px-2 py-0.5 rounded-full">
                    {res.match_score}% match
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 3: Diagnostic Assessment Effectiveness */}
      {activeTab === 'effectiveness' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="pt-5">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#FAFAF9] border border-[#EDEBE6] rounded-xl p-4">
              <p className="text-xs text-[#5B5850]">Completed Diagnostics</p>
              <p className="text-2xl font-extrabold text-[#14140F] mt-1">
                <AnimatedNumber value={effectiveness.completed_assessments_count} />
              </p>
              <p className="text-[11px] text-[#5B5850] mt-0.5">Zero-penalty baseline evaluations</p>
            </div>
            <div className="bg-[#E7F0EA] border border-[#1B4332]/20 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-[#1B4332]">
                <CheckCircle2 size={15} />
                <p className="text-xs font-semibold">Average Competency Lift</p>
              </div>
              <p className="text-2xl font-extrabold text-[#1B4332] mt-1">
                +{effectiveness.average_improvement_points} pts
              </p>
              <p className="text-[11px] text-[#1B4332]/80 mt-0.5">Post-course re-evaluation delta</p>
            </div>
          </div>

          {/* Baseline Cohort Distribution */}
          <div className="p-4 rounded-xl border border-[#EDEBE6] bg-[#FAFAF9]">
            <p className="text-xs font-bold text-[#5B5850] uppercase tracking-wider mb-3">
              Cadre Evaluation Cohorts Distribution
            </p>
            <div className="space-y-3">
              {Object.entries(effectiveness.baseline_distribution || {}).map(([cohort, count]) => {
                const total = Math.max(1, effectiveness.completed_assessments_count);
                const pct = Math.round((count / total) * 100);
                const isExceeds = cohort.includes('Exceeds');
                const isFoundational = cohort.includes('Foundational');
                const barColor = isExceeds ? '#1B4332' : isFoundational ? '#B23A2E' : '#264653';

                return (
                  <div key={cohort}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-[#14140F]">{cohort}</span>
                      <span className="font-bold text-[#5B5850]">{count} officials ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#E5E3DD] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
