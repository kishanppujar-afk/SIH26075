import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

function badgeStyle(gap) {
  if (gap <= 25) return { color: '#1B4332', bg: '#E7F0EA' };
  if (gap <= 40) return { color: '#A56B1F', bg: '#FBF3E7' };
  return { color: '#B23A2E', bg: '#FCEDEB' };
}

function EmployeeList({ employees, linkBase = '/employee' }) {
  const [query, setQuery] = useState('');

  if (!employees.length) {
    return (
      <div className="bg-white border border-[#EDEBE6] rounded-2xl p-8 text-center text-sm text-[#5B5850]">
        No employees assigned yet.
      </div>
    );
  }

  const filtered = employees.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      {employees.length > 5 && (
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A59C]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            className="w-full border border-[#EDEBE6] rounded-full pl-10 pr-4 py-2.5 text-sm text-[#14140F] focus:outline-none focus:border-[#14140F] transition-colors"
          />
        </div>
      )}

      <div className="bg-white border border-[#EDEBE6] rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-[#5B5850] py-8">No employees match "{query}".</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#EDEBE6] text-[#5B5850]">
                <th className="py-3.5 px-5 font-medium">Name</th>
                <th className="py-3.5 px-5 font-medium">Overall gap</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                // Use the pre-computed overallGap provided by the caller,
                // falling back to top_gap_value or 0 if not available.
                const gap = typeof emp.overallGap === 'number'
                  ? emp.overallGap
                  : (typeof emp.top_gap_value === 'number' ? Math.round(emp.top_gap_value) : 0);
                const s = badgeStyle(gap);
                return (
                  <tr key={emp.id} className="border-b border-[#EDEBE6] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-3.5 px-5">
                      <Link to={`${linkBase}/${emp.id}`} className="font-medium text-[#14140F] hover:underline">
                        {emp.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold" style={{ color: s.color, backgroundColor: s.bg }}>
                        {gap}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default EmployeeList;