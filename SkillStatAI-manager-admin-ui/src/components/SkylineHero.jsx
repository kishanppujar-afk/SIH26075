import { motion } from 'framer-motion';

const TILE_COLORS = ['#1B4332', '#B5651D', '#7B2D3E', '#264653', '#5C4B99', '#1D5C63'];
const CHART_HEIGHT = 110; // fixed pixel height, bars scale against this directly

function SkylineHero({ departments }) {
  if (!departments.length) return null;

  const maxGap = Math.max(...departments.map((d) => d.avgSkillGap), 1);

  return (
    <div className="bg-white border border-[#EDEBE6] rounded-2xl px-6 pt-6 pb-4 mb-6">
      <p className="text-xs font-semibold text-[#A8A59C] uppercase tracking-wide mb-4">
        Skill gap by department
      </p>
      <div className="flex items-end justify-between gap-3" style={{ height: CHART_HEIGHT }}>
        {departments.map((dept, i) => {
          const barPx = Math.max((dept.avgSkillGap / maxGap) * CHART_HEIGHT, 10);
          return (
            <div key={dept.id} className="flex-1 flex flex-col items-center justify-end h-full">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: barPx }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="w-full rounded-t-md relative"
                style={{ backgroundColor: TILE_COLORS[i % TILE_COLORS.length] }}
                title={`${dept.name}: ${dept.avgSkillGap}%`}
              >
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-bold text-[#14140F] whitespace-nowrap">
                  {dept.avgSkillGap}%
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-3 mt-2 pt-2 border-t border-[#F4F3EF]">
        {departments.map((dept) => (
          <p key={dept.id} className="flex-1 text-center text-[11px] text-[#5B5850] truncate">
            {dept.name}
          </p>
        ))}
      </div>
    </div>
  );
}

export default SkylineHero;