import { useState } from 'react';
import { Sparkles, Check, RefreshCw } from 'lucide-react';
import { getRecommendation } from '../data/insights';

function RecommendationCard({ breakdown, id }) {
  const [variantOffset, setVariantOffset] = useState(0);
  const [approved, setApproved] = useState(false);

  // shift the hash by adding offset characters, so cycling gives a different (deterministic) variant
  const effectiveId = id ? `${id}${'x'.repeat(variantOffset)}` : '';
  const rec = getRecommendation(breakdown, effectiveId);

  function handleSuggestDifferent() {
    setApproved(false);
    setVariantOffset((prev) => prev + 1);
  }

  return (
    <div className="bg-white border border-[#EDEBE6] rounded-2xl p-4">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-[#F4F3EF] flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-[#14140F]" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-[#A8A59C] mb-0.5">Suggested action &middot; {rec.source}</p>
          <p className="text-sm font-semibold text-[#14140F]">{rec.title}</p>
          <p className="text-sm text-[#5B5850] mt-1">{rec.blurb}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F4F3EF]">
        {approved ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#1B4332] bg-[#E7F0EA] px-2.5 py-1 rounded-full">
            <Check size={12} /> Reviewed and approved
          </span>
        ) : (
          <>
            <button
              onClick={() => setApproved(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#14140F] text-white px-3 py-1.5 rounded-full hover:bg-[#2B2A24] transition-colors"
            >
              <Check size={12} /> Approve
            </button>
            <button
              onClick={handleSuggestDifferent}
              className="flex items-center gap-1.5 text-xs font-medium text-[#5B5850] px-3 py-1.5 rounded-full border border-[#EDEBE6] hover:border-[#14140F]/40 transition-colors"
            >
              <RefreshCw size={12} /> Suggest different
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default RecommendationCard;