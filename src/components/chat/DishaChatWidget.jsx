import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useEmployee } from '../../context/SessionContext';

// Possible values: null (no response yet), 'local_llm', 'template_fallback'
const AI_MODE_LABELS = {
  local_llm: { label: 'Ollama', color: '#10b981', tooltip: 'Powered by local Ollama LLM (gemma3:4b)' },
  template_fallback: { label: 'Fallback', color: '#f59e0b', tooltip: 'Using deterministic template fallback (Ollama offline)' },
};

/**
 * Custom SVG Mark for Disha (दिशा — Direction).
 * An organic directional compass spark intertwining four orbital skill nodes
 * and a central illuminated core, styled in the app's ai-accent palette.
 */
export function DishaMark({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Disha AI Navigation Icon"
    >
      <defs>
        <linearGradient id="dishaGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7FA99B" />
          <stop offset="50%" stopColor="#5B8C7B" />
          <stop offset="100%" stopColor="#395A4E" />
        </linearGradient>
        <linearGradient id="dishaCore" x1="12" y1="12" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2EDE8" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      {/* 4-point directional compass spark (Direction / Disha) */}
      <path
        d="M16 2.5C16 2.5 18 9 20 12C21.5 14.25 24 15 29.5 16C24 17 21.5 17.75 20 20C18 23 16 29.5 16 29.5C16 29.5 14 23 12 20C10.5 17.75 8 17 2.5 16C8 15 10.5 14.25 12 12C14 9 16 2.5 16 2.5Z"
        fill="url(#dishaGrad)"
      />
      {/* 4 peripheral competency nodes */}
      <circle cx="7" cy="7" r="1.5" fill="#7FA99B" opacity="0.8" />
      <circle cx="25" cy="7" r="1.5" fill="#7FA99B" opacity="0.8" />
      <circle cx="7" cy="25" r="1.5" fill="#5B8C7B" opacity="0.8" />
      <circle cx="25" cy="25" r="1.5" fill="#5B8C7B" opacity="0.8" />
      {/* Core illumination center */}
      <circle cx="16" cy="16" r="3.2" fill="url(#dishaCore)" />
      <circle cx="16" cy="16" r="1.6" fill="#395A4E" />
    </svg>
  );
}

const SUGGESTED_QUERIES = [
  '🎯 What are my top skill gaps?',
  '📚 Which course should I take first?',
  '📝 Tell me about my diagnostic assessments',
];

const createInitialGreeting = (emp) => ({
  id: `welcome-${emp?.id || 'guest'}`,
  role: 'assistant',
  content: `Namaste${emp?.name ? ` ${emp.name}` : ''}. I am Disha (दिशा), your AI competency and learning guide. I track your benchmarks for ${emp?.targetRole || 'your target role'} and direct your next development steps. How can I guide you today?`,
  timestamp: new Date(),
});

export default function DishaChatWidget() {
  const { employee } = useEmployee();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAiMode] = useState(null); // 'local_llm' | 'template_fallback' | null

  const activeEmpId = employee?.id || null;
  const currentEmpIdRef = useRef(activeEmpId);

  const [messages, setMessages] = useState(() => [createInitialGreeting(employee)]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Clear/reset conversation history on login, logout, or account switch
  useEffect(() => {
    if (activeEmpId !== currentEmpIdRef.current) {
      currentEmpIdRef.current = activeEmpId;
      setMessages([createInitialGreeting(employee)]);
      setInputMessage('');
      setIsLoading(false);
      setAiMode(null);
      setIsOpen(false);
    }
  }, [activeEmpId, employee]);

  // Keep initial greeting up to date if employee profile (name/targetRole) hydrates from backend
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id.startsWith('welcome')) {
        const fresh = createInitialGreeting(employee);
        if (prev[0].content !== fresh.content) {
          return [fresh];
        }
      }
      return prev;
    });
  }, [employee?.name, employee?.targetRole, employee?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    // Format last 4 conversation turns for API (excluding welcome banner)
    const historyPayload = newMessages
      .filter((m) => !m.id.startsWith('welcome'))
      .slice(-4)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const data = await api.sendChatMessage(text, historyPayload);
      const assistantText = data?.response || data?.reply || data?.message || 'I have analyzed your profile. Next step: Explore your recommended courses in the Courses tab.';

      // Track AI mode from the generated_by field in the response
      if (data?.generated_by) {
        setAiMode(data.generated_by);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: assistantText,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error('[DishaChatWidget] Error sending chat message:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            'I encountered a temporary connection issue reaching the competency telemetry service. Next step: Check your Development Path directly in the Skills tab, or retry in a moment.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="disha-panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            aria-label="Disha AI Chat Window"
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-7.5rem)] rounded-2xl bg-white shadow-2xl border border-ai-accent-200/70 flex flex-col overflow-hidden"
          >
            {/* Soft Header with ai-accent gradient */}
            <div className="bg-gradient-to-r from-ai-accent-700 via-ai-accent-600 to-ai-accent-500 px-4 py-3.5 text-white flex items-center justify-between shadow-xs select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/25 backdrop-blur-xs flex items-center justify-center p-1 shadow-2xs">
                  <DishaMark size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold tracking-tight">Disha</span>
                    <span className="text-[11px] font-medium text-ai-accent-100 bg-white/20 px-1.5 py-0.2 rounded">
                      दिशा
                    </span>
                  </div>
                  <div className="text-[11px] text-ai-accent-100/90 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>MoSPI Learning Navigation</span>
                    {aiMode && AI_MODE_LABELS[aiMode] && (
                      <span
                        className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-medium cursor-default"
                        title={AI_MODE_LABELS[aiMode].tooltip}
                      >
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: AI_MODE_LABELS[aiMode].color }}
                        />
                        {AI_MODE_LABELS[aiMode].label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors text-base font-medium"
                aria-label="Close Disha Assistant"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#FAFDFB] to-white text-sm">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-6 h-6 rounded-lg bg-ai-accent-100/80 border border-ai-accent-200/90 flex items-center justify-center shrink-0 mt-0.5 p-0.5">
                        <DishaMark size={14} />
                      </div>
                    )}
                    <div
                      className={`px-3.5 py-2.5 leading-relaxed text-sm shadow-2xs ${
                        isUser
                          ? 'bg-ai-accent-600 text-white rounded-2xl rounded-tr-xs max-w-[82%]'
                          : 'bg-ai-accent-50/80 border border-ai-accent-100 text-slate-800 rounded-2xl rounded-tl-xs max-w-[85%]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                );
              })}

              {/* Typing / Thinking Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2 justify-start">
                  <div className="w-6 h-6 rounded-lg bg-ai-accent-100/80 border border-ai-accent-200/90 flex items-center justify-center shrink-0 mt-0.5 p-0.5">
                    <DishaMark size={14} />
                  </div>
                  <div className="bg-ai-accent-50/80 border border-ai-accent-100 text-ai-accent-800 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs flex items-center gap-2 shadow-2xs">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-ai-accent-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-ai-accent-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-ai-accent-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span>Disha is analyzing your competency benchmarks...</span>
                  </div>
                </div>
              )}

              {/* Quick suggestion pills (visible when only welcome message or few turns) */}
              {messages.length <= 2 && !isLoading && (
                <div className="pt-2 space-y-1.5">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider px-1">
                    Quick Directions
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {SUGGESTED_QUERIES.map((queryText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(queryText)}
                        className="text-left text-xs px-3 py-2 rounded-xl bg-ai-accent-50/70 hover:bg-ai-accent-100/90 border border-ai-accent-200/70 text-ai-accent-900 transition-colors shadow-2xs"
                      >
                        {queryText}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Disha for direction on skill gaps or courses..."
                disabled={isLoading}
                className="flex-1 text-sm bg-slate-50/80 border border-slate-200/90 rounded-xl px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-ai-accent-500 focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-ai-accent-600 hover:bg-ai-accent-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-2xs shrink-0 active:scale-95"
                aria-label="Send Message to Disha"
              >
                <svg
                  className="w-4 h-4 translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3 21l18-9L3 3l3 9zm0 0h12" />
                </svg>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Floating Circular Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-ai-accent-700 via-ai-accent-600 to-ai-accent-500 text-white shadow-lg hover:shadow-xl hover:ring-4 hover:ring-ai-accent-200/50 flex items-center justify-center transition-all duration-200 group focus:outline-none"
        aria-label={isOpen ? 'Close Disha AI Chat' : 'Open Disha AI Assistant (दिशा)'}
      >
        {/* Subtle living pulse indicator on corner */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
        </span>

        {/* Center Custom Icon or Close indicator */}
        {isOpen ? (
          <span className="text-xl font-light leading-none text-white">✕</span>
        ) : (
          <DishaMark size={28} className="drop-shadow-xs" />
        )}
      </motion.button>
    </>
  );
}
