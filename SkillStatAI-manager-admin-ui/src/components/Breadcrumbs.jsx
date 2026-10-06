import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function Breadcrumbs({ trail }) {
  return (
    <nav className="flex items-center flex-wrap gap-1 text-sm mb-4">
      {trail.map((item, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={13} className="text-[#C9C7C3]" />}
            {isLast || !item.to ? (
              <span className={isLast ? 'text-[#1C1C1E] font-medium' : 'text-[#6B6B6F]'}>
                {item.label}
              </span>
            ) : (
              <Link to={item.to} className="text-[#6B6B6F] hover:text-[#1F3A5F] transition-colors">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;