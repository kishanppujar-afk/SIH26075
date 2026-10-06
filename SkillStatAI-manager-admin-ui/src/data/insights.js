// ---- Threshold flags ----
export function getSeverity(gap) {
  if (gap >= 40) return { level: 'critical', label: 'Critical', color: '#B23A2E', bg: '#FCEDEB' };
  if (gap >= 25) return { level: 'watch', label: 'Watch', color: '#A56B1F', bg: '#FBF3E7' };
  return { level: 'healthy', label: 'On track', color: '#1B4332', bg: '#E7F0EA' };
}

// ---- Insight text generator ----
export function generateInsight(name, overallGapPercent, breakdown, orgAvg) {
  const worst = [...breakdown].sort((a, b) => b.gapPercent - a.gapPercent)[0];
  const diff = overallGapPercent - orgAvg;

  const diffPhrase =
    diff > 5 ? `, well above the organisation average of ${orgAvg}%`
    : diff > 0 ? `, slightly above the organisation average of ${orgAvg}%`
    : diff < -5 ? `, well below the organisation average of ${orgAvg}%`
    : `, close to the organisation average of ${orgAvg}%`;

  return `${name} has an overall gap of ${overallGapPercent}%${diffPhrase}, driven primarily by ${worst.skill} (${worst.gapPercent}%).`;
}

// ---- Simple deterministic hash: same id always produces the same number ----
function hashId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0; // unsigned 32-bit
  }
  return hash;
}

// ---- Recommendations (mock, mapped by weakest skill category, 3 variants each) ----
const RECOMMENDATIONS = {
  Technical: [
    {
      title: 'Technical fundamentals refresher',
      source: 'iGOT Karmayogi',
      blurb: 'Structured module covering core statistical methods and tools used across MoSPI reporting.',
    },
    {
      title: 'Advanced Data Handling & Analysis',
      source: 'iGOT Karmayogi',
      blurb: 'Hands-on course on cleaning, validating, and analysing large-scale survey datasets.',
    },
    {
      title: 'Statistical Software Proficiency Track',
      source: 'NSSTA TPAC',
      blurb: 'Guided practice sessions on the statistical software tools used in day-to-day MoSPI work.',
    },
  ],
  Communication: [
    {
      title: 'Effective Reporting & Communication',
      source: 'NSSTA TPAC',
      blurb: 'Workshop on translating technical findings into clear reports for non-technical stakeholders.',
    },
    {
      title: 'Stakeholder Communication Essentials',
      source: 'iGOT Karmayogi',
      blurb: 'Short course on presenting data-driven recommendations clearly to senior stakeholders.',
    },
    {
      title: 'Writing for Government Reports',
      source: 'NSSTA TPAC',
      blurb: 'Focused module on structuring and writing official statistical reports and briefs.',
    },
  ],
  'Problem Solving': [
    {
      title: 'Applied Problem Solving in Public Data Systems',
      source: 'iGOT Karmayogi',
      blurb: 'Case-based course on diagnosing and resolving data quality and process issues.',
    },
    {
      title: 'Root Cause Analysis for Data Teams',
      source: 'NSSTA TPAC',
      blurb: 'Practical framework for identifying and fixing recurring issues in survey pipelines.',
    },
    {
      title: 'Decision-Making Under Data Constraints',
      source: 'iGOT Karmayogi',
      blurb: 'Course on making sound recommendations when data is incomplete or ambiguous.',
    },
  ],
  Leadership: [
    {
      title: 'Foundations of Team Leadership',
      source: 'NSSTA TPAC',
      blurb: 'Programme for first-time and early-career managers on delegation, feedback, and team growth.',
    },
    {
      title: 'Leading Through Change',
      source: 'iGOT Karmayogi',
      blurb: 'Module on guiding a team through shifting priorities and organisational change.',
    },
    {
      title: 'Coaching & Mentoring Essentials',
      source: 'NSSTA TPAC',
      blurb: 'Practical techniques for developing junior staff through regular coaching conversations.',
    },
  ],
};

// id is optional — falls back to variant 0 if not provided, so existing calls still work
export function getRecommendation(breakdown, id = '') {
  const worst = [...breakdown].sort((a, b) => b.gapPercent - a.gapPercent)[0];
  const variants = RECOMMENDATIONS[worst.skill] || RECOMMENDATIONS['Technical'];
  const index = id ? hashId(id) % variants.length : 0;
  return variants[index];
}