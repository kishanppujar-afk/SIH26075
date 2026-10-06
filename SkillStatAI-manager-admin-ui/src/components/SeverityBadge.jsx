import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { getSeverity } from '../data/insights';

function SeverityBadge({ gap }) {
  const s = getSeverity(gap);
  if (s.level !== 'critical') return null;

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      <AlertTriangle size={11} /> Critical
    </motion.span>
  );
}

export default SeverityBadge;