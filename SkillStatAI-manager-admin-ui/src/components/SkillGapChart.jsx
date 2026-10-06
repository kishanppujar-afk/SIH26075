import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { skill, gapPercent } = payload[0].payload;
  return (
    <div className="bg-white border border-[#EDEBE6] shadow-lg text-xs px-3 py-2 rounded-xl">
      <p className="font-bold text-[#14140F]">{skill}</p>
      <p className="text-[#5B5850]">{gapPercent}% gap</p>
    </div>
  );
}

function SkillGapChart({ data, height = 250 }) {
  return (
    <div className="bg-white border border-[#EDEBE6] rounded-2xl p-5">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 0, bottom: 4 }} barCategoryGap={18}>
          <CartesianGrid horizontal={false} stroke="#F4F3EF" />
          <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#A8A59C', fontSize: 11 }} axisLine={{ stroke: '#EDEBE6' }} tickLine={false} />
          <YAxis type="category" dataKey="skill" width={120} tick={{ fill: '#14140F', fontSize: 12.5, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FAFAF8' }} />
          <Bar dataKey="gapPercent" fill="#1B4332" radius={[0, 8, 8, 0]} maxBarSize={20} animationDuration={700} animationEasing="ease-out">
            <LabelList dataKey="gapPercent" position="right" formatter={(v) => `${v}%`} style={{ fill: '#14140F', fontSize: 12, fontWeight: 700 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SkillGapChart;