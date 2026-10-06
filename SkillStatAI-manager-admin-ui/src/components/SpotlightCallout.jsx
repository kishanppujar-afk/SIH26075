import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';

function SpotlightCallout({ departments, orgAvg }) {
  if (!departments.length) return null;

  const worst = departments[0];
  const everyone = worst.employeeCount + worst.managerCount;
  if (everyone === 0) return null;

  const diff = worst.avgSkillGap - orgAvg;

  return (
    <Link
      to={`/admin/department/${worst.id}`}
      className="block bg-[#1C1C1E] text-white rounded-2xl px-6 py-5 mb-8 group hover:bg-[#2B2A24] transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="relative w-9 h-9 shrink-0 mt-0.5">
            <motion.div
              className="absolute inset-0 rounded-full bg-[#B23A2E]/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative w-9 h-9 rounded-full bg-[#B23A2E]/20 flex items-center justify-center">
              <AlertTriangle size={16} className="text-[#E8877A]" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#E8877A] uppercase tracking-wide mb-1">
              Needs attention
            </p>
            <p className="text-base font-medium">
              <span className="font-extrabold">{worst.name}</span> has the widest skill gap in the organisation
              &mdash; {worst.avgSkillGap}% ({diff > 0 ? `${diff}% above` : 'at'} the org average).
            </p>
          </div>
        </div>
        <ArrowRight size={18} className="text-white/60 group-hover:text-white transition-colors shrink-0" />
      </div>
    </Link>
  );
}

export default SpotlightCallout;