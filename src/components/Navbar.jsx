import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sparkles, Search, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mockEmployee, searchOfficialTraining } from '../mock/employeeData';
import { useSession } from '../context/SessionContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { displayName } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Debounce keystroke filtering at 200ms
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDebouncedQuery('');
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsDebouncing(false);
    }, 200);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const results = searchOfficialTraining(debouncedQuery);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/70 px-6 py-3 backdrop-blur-md shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 text-white shadow-xs">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-lg">SkillStat AI</span>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200/60">
              Employee Portal
            </span>
          </div>
          <p className="text-xs text-slate-600 font-normal">Autonomous Career Growth &amp; Skill Intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Search for NSSTA & MoSPI Opportunities */}
        <div ref={searchRef} className="relative hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setIsOpen(true);
                }
              }}
              placeholder="Search NSSTA & MoSPI trainings (e.g. data analysis, AI)..."
              className="w-64 lg:w-96 rounded-xl border border-slate-200/90 bg-white/80 py-1.5 pl-9 pr-8 text-sm placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all duration-200 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedQuery('');
                  setIsOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Animated Search Dropdown */}
          <AnimatePresence>
            {isOpen && searchQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ transformOrigin: 'top' }}
                className="absolute right-0 top-full mt-2 w-[480px] lg:w-[540px] max-w-[90vw] bg-[#F8FCFD] rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/90 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Search NSSTA &amp; MoSPI
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-ai-accent-50 px-2 py-0.5 text-[10px] font-semibold text-ai-accent-700 border border-ai-accent-200/60">
                      Official Portals Only
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {isDebouncing ? (
                      <span className="flex items-center gap-1 text-ai-accent-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-ai-accent-500 animate-ping"></span>
                        <span>Filtering...</span>
                      </span>
                    ) : (
                      `${results.length} ${results.length === 1 ? 'training resource' : 'training resources'}`
                    )}
                  </span>
                </div>

                {/* Results List */}
                <div className="overflow-y-auto p-3 space-y-3 divide-y divide-slate-100 max-h-[420px]">
                  {isDebouncing ? (
                    /* Subtle 2-dot pulse loader while debounced */
                    <div className="py-10 flex flex-col items-center justify-center gap-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-ai-accent-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2.5 w-2.5 rounded-full bg-ai-accent-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      </div>
                      <p className="text-xs text-slate-400 font-medium">Matching official resources...</p>
                    </div>
                  ) : results.length > 0 ? (
                    results.map((res, idx) => (
                      <motion.div
                        key={res.url + idx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.025 }}
                        className={idx > 0 ? 'pt-3' : ''}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${
                                  res.source === 'NSSTA'
                                    ? 'bg-ai-accent-50 text-ai-accent-700 border border-ai-accent-200/80'
                                    : 'bg-teal-50 text-teal-700 border border-teal-200/80'
                                }`}
                              >
                                {res.source}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {res.source === 'NSSTA' ? 'National Statistical Academy' : 'Ministry of Statistics'}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                              {res.title}
                            </h4>
                            <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {res.description}
                            </p>

                            {/* Skills & Topics Tags */}
                            <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                              {res.topics.slice(0, 3).map((topic, tIdx) => (
                                <span
                                  key={`topic-${tIdx}`}
                                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 font-medium"
                                >
                                  {topic}
                                </span>
                              ))}
                              {res.relatedSkills.slice(0, 2).map((skill, sIdx) => (
                                <span
                                  key={`skill-${sIdx}`}
                                  className="rounded-md bg-teal-50 text-teal-700 px-2 py-0.5 text-[11px] font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 btn-primary text-xs px-3 py-1.5 group"
                          >
                            <span>View Training</span>
                            <ExternalLink className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </a>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 px-4 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                        <Search className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        We couldn't find a matching training resource yet.
                      </p>
                      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                        All opportunities are sourced strictly from NSSTA and MoSPI portals. Try exploring these domains:
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
                        {[
                          'Data Analysis',
                          'Statistics',
                          'Survey',
                          'Econometrics',
                          'Visualization',
                          'Sampling',
                          'Official Statistics',
                          'AI',
                          'R',
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              setSearchQuery(suggestion);
                              setIsOpen(true);
                            }}
                            className="rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 px-2.5 py-1 text-xs text-slate-600 transition-colors duration-150 border border-slate-200 active:scale-95 cursor-pointer"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Verified Government Sources</span>
                  <div className="flex gap-2 text-teal-600 font-medium">
                    <a
                      href="https://nssta.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-0.5"
                    >
                      nssta.gov.in <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    <span>•</span>
                    <a
                      href="https://mospi.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-0.5"
                    >
                      mospi.gov.in <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-opportunity-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 border-l border-slate-200/80 pl-4 pr-2 py-1.5 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
          aria-label="Open profile"
        >
          <img
            src={mockEmployee.avatarUrl}
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-2 ring-teal-100"
          />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-900 leading-none">{displayName || mockEmployee.name}</p>
            <p className="text-xs text-slate-600 mt-1 font-medium">{mockEmployee.role}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
