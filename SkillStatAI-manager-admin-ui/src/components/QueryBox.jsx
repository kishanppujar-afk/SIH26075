import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getDepartments, getOrgAvgGap, getOrgStats } from '../data/orgData';

function normalize(str) {
  return str.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

function interpretQuery(raw, navigate) {
  const q = normalize(raw);
  const departments = [...getDepartments()].sort((a, b) => b.avgSkillGap - a.avgSkillGap);
  const orgAvg = getOrgAvgGap();
  const stats = getOrgStats();

  const directMatch = departments.find((d) => q.includes(normalize(d.name)));
  if (directMatch) {
    navigate(`/admin/department/${directMatch.id}`);
    return `Here's ${directMatch.name} — ${directMatch.avgSkillGap}% overall gap, ${directMatch.employeeCount} employees, ${directMatch.managerCount} manager${directMatch.managerCount !== 1 ? 's' : ''}.`;
  }

  if (/worst|widest|biggest gap|highest gap|most critical|needs attention|struggl|underperform|lagging|behind/.test(q)) {
    const worst = departments[0];
    navigate(`/admin/department/${worst.id}`);
    return `${worst.name} has the widest gap in the organisation at ${worst.avgSkillGap}%. Taking you there.`;
  }

  if (/best|healthiest|lowest gap|smallest gap|top perform|strongest|leading|better/.test(q)) {
    const best = departments[departments.length - 1];
    navigate(`/admin/department/${best.id}`);
    return `${best.name} is the strongest department at ${best.avgSkillGap}% gap. Taking you there.`;
  }

  if (/critical|urgent|danger|alarm|red flag|above 40|over 40/.test(q)) {
    const critical = departments.filter((d) => d.avgSkillGap >= 40);
    if (critical.length === 0) {
      return `Good news — no departments are currently critical (≥40% gap). Organisation average is ${orgAvg}%.`;
    }
    navigate(`/admin/department/${critical[0].id}`);
    return `${critical.length} department${critical.length > 1 ? 's are' : ' is'} critical: ${critical.map((d) => d.name).join(', ')}. Showing ${critical[0].name} first.`;
  }

  if (/above average|worse than average|underperforming departments/.test(q)) {
    const aboveAvg = departments.filter((d) => d.avgSkillGap > orgAvg);
    if (aboveAvg.length === 0) return `No departments are currently above the ${orgAvg}% org average.`;
    navigate(`/admin/department/${aboveAvg[0].id}`);
    return `${aboveAvg.length} department${aboveAvg.length > 1 ? 's are' : ' is'} above the ${orgAvg}% average: ${aboveAvg.map((d) => d.name).join(', ')}.`;
  }
  if (/below average|better than average|outperforming/.test(q)) {
    const belowAvg = departments.filter((d) => d.avgSkillGap < orgAvg);
    if (belowAvg.length === 0) return `No departments are currently below the ${orgAvg}% average.`;
    navigate(`/admin/department/${belowAvg[belowAvg.length - 1].id}`);
    return `${belowAvg.length} department${belowAvg.length > 1 ? 's are' : ' is'} below the ${orgAvg}% average: ${belowAvg.map((d) => d.name).join(', ')}.`;
  }

  if (/compare|comparison|side by side|versus|vs\b/.test(q)) {
    navigate('/admin/compare');
    return `Opening department comparison.`;
  }

  if (/average|org avg|overall gap|how are we doing|how is the organisation/.test(q)) {
    return `The organisation-wide average skill gap is ${orgAvg}%, across ${stats.totalDepartments} departments, ${stats.totalManagers} managers, and ${stats.totalEmployees} employees.`;
  }

  if (/how many employees|total employees|employee count/.test(q)) {
    return `There are ${stats.totalEmployees} employees across the organisation.`;
  }
  if (/how many managers|total managers|manager count/.test(q)) {
    return `There are ${stats.totalManagers} managers across the organisation.`;
  }
  if (/how many departments|total departments/.test(q)) {
    return `There are ${stats.totalDepartments} departments: ${departments.map((d) => d.name).join(', ')}.`;
  }

  if (/rank|ranking|list all|order|sorted/.test(q)) {
    navigate('/admin');
    return `Departments ranked by gap: ${departments.map((d, i) => `${i + 1}. ${d.name} (${d.avgSkillGap}%)`).join(', ')}.`;
  }

  if (/^hi$|^hello$|^hey$/.test(q)) {
    return `Hi! Ask me things like "which department is worst", "show critical departments", "how many employees do we have", or type a department name.`;
  }

  return `I couldn't match that to a specific view. Try: "which department is worst", "show critical departments", "compare departments", "how many employees", or a department name.`;
}

const SUGGESTIONS = [
  'Which department is worst?',
  'Which department is best?',
  'Show critical departments',
  'Compare departments',
  'How many employees do we have?',
  'Rank departments by gap',
];

function QueryBox() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [response, setResponse] = useState(null);

  function runQuery(text) {
    const result = interpretQuery(text, navigate);
    setResponse(result);
    setValue(text);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    runQuery(value);
  }

  return (
    <div className="bg-white border border-[#EDEBE6] rounded-2xl px-5 py-4 mb-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Search size={16} className="text-[#5B5850] shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search organisation stats — e.g. &quot;which department is worst?&quot;"
          className="flex-1 text-sm text-[#14140F] placeholder:text-[#A8A59C] focus:outline-none"
        />
        <button
          type="submit"
          className="bg-[#14140F] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#2B2A24] transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Search size={14} /> Search
        </button>
      </form>

      {!response && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#F4F3EF]">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => runQuery(s)}
              className="text-xs font-medium text-[#5B5850] bg-[#F4F3EF] px-2.5 py-1.5 rounded-full hover:bg-[#EDEBE6] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {response && (
        <p className="text-sm text-[#5B5850] mt-3 pt-3 border-t border-[#F4F3EF]">
          {response}
        </p>
      )}
    </div>
  );
}

export default QueryBox;