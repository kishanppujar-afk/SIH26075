import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function LastUpdated() {
  const [time] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const diffMs = now - time;
  const diffMin = Math.floor(diffMs / 60000);

  let label;
  if (diffMin < 1) label = 'Just now';
  else if (diffMin === 1) label = '1 minute ago';
  else label = `${diffMin} minutes ago`;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[#A8A59C]">
      <Clock size={12} /> Data last synced {label}
    </span>
  );
}

export default LastUpdated;