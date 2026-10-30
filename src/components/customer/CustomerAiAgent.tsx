import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User as UserIcon, 
  Key, 
  Trash2, 
  Check, 
  Copy, 
  ExternalLink, 
  Wrench, 
  HelpCircle, 
  ShieldCheck, 
  Phone, 
  MessageSquare,
  ArrowRight,
  Settings
} from 'lucide-react';
import { geminiService, ChatMessage } from '../../services/geminiService';
import { Button } from '../common/Button';

interface CustomerAiAgentProps {
  customerName?: string;
  onNavigateTab?: (tab: 'marketplace' | 'bookings') => void;
}

export const CustomerAiAgent: React.FC<CustomerAiAgentProps> = ({
  customerName = 'Customer',
  onNavigateTab
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: `👋 Hello **${customerName}**! I am your **Tegagn AI Assistant**, powered by the **Google Gemini API**.\n\nI can answer anything about how our home repair marketplace works, including:\n- 🛠️ **How to book** a verified plumber, electrician, carpenter, or painter\n- 💰 **Hourly rates** and pricing in Addis Ababa (ETB)\n- 📍 **GPS location detection** and uploading problem photos\n- 📦 **Tracking your requests** in your Cart\n- ⭐ **Rating and reviewing** technicians\n\nHow can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Explore Marketplace', action: 'marketplace' },
          { label: 'View My Requests (Cart)', action: 'bookings' },
          { label: 'Official Telegram', action: 'telegram' }
        ]
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => geminiService.getApiKey());
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickQuestions = [
    { label: '🛠️ How to book a pro?', query: 'How do I book a trade professional on Tegagn step by step?' },
    { label: '💰 Typical hourly rates?', query: 'What are the typical hourly rates in Ethiopian Birr for plumbing and electrical work?' },
    { label: '📍 GPS & photo upload?', query: 'How does GPS location detection and photo upload work when making a booking?' },
    { label: '📦 How to track my Cart?', query: 'How do I check the status of my active repair bookings in the Cart?' },
    { label: '⭐ How to rate a technician?', query: 'How do I review and rate a technician after the repair job is done?' },
    { label: '📞 Contact customer support?', query: 'How can I contact Tegagn support or Mati Israel directly?' }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const responseText = await geminiService.askAgent(text, messages);

      // Determine smart contextual actions based on response
      const suggestedActions: { label: string; action: 'marketplace' | 'bookings' | 'telegram' | 'contact' }[] = [];
      const lowerResp = responseText.toLowerCase();
      if (lowerResp.includes('marketplace') || lowerResp.includes('browse') || lowerResp.includes('select a specialist')) {
        suggestedActions.push({ label: 'Open Marketplace', action: 'marketplace' });
      }
      if (lowerResp.includes('cart') || lowerResp.includes('my request') || lowerResp.includes('booking')) {
        suggestedActions.push({ label: 'View My Requests (Cart)', action: 'bookings' });
      }
      if (lowerResp.includes('telegram') || lowerResp.includes('@cocacola_factory')) {
        suggestedActions.push({ label: 'Join Telegram Channel', action: 'telegram' });
      }

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch {
      const fallbackMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'I apologize, but I could not connect to the AI model right now. You can check the **Marketplace** or contact support at **+251 91 764 3789**.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    geminiService.setApiKey(apiKeyInput.trim());
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome-new',
        role: 'model',
        text: `Chat cleared! How can I help you with Tegagn home repair marketplace today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleActionClick = (action: 'marketplace' | 'bookings' | 'telegram' | 'contact') => {
    if (action === 'telegram') {
      window.open('https://t.me/CocaCola_factory', '_blank');
    } else if (action === 'contact') {
      window.location.href = 'tel:+251917643789';
    } else if (onNavigateTab) {
      onNavigateTab(action);
    }
  };

  // Helper to format basic markdown (bold, headers, bullets, links) safely
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-base font-black text-amber-600 dark:text-amber-400 mt-3 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Header 2 or 1
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return (
          <h3 key={idx} className="text-lg font-black text-slate-900 dark:text-white mt-4 mb-2">
            {line.replace(/^#+\s/, '')}
          </h3>
        );
      }
      // Bullet list
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().replace(/^[-*]\s/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-0.5">
            {renderInlineMarkdown(bulletText)}
          </li>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line.trim())) {
        const numText = line.trim().replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="ml-4 list-decimal text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-0.5">
            {renderInlineMarkdown(numText)}
          </li>
        );
      }
      // Empty line spacer
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Normal paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (text: string) => {
    // Basic bold **text** parsing
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const isLive = geminiService.isLiveApiConfigured();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HERO BANNER */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Tegagn AI Assistant
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300">
                  Gemini API
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Ask anything about booking, trade crafts, transparent pricing, or using Tegagn.
              </p>
            </div>
          </div>

          {/* Status & Settings Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
              isLive 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              <span>{isLive ? 'Gemini 2.5 Flash Connected' : 'Smart Knowledge Engine'}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4 text-amber-500" />
            </button>

            <button
              type="button"
              onClick={handleClearChat}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-500" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 pt-4 border-t border-amber-500/10 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q.query)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN CHAT DISPLAY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col h-[580px] overflow-hidden">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  <div
                    className={`rounded-2xl p-4 sm:p-5 text-sm shadow-xs ${
                      isUser
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700/60 rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    ) : (
                      <div>{renderFormattedText(msg.text)}</div>
                    )}
                  </div>

                  {/* Actions & Copy buttons */}
                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Suggested Contextual Action Pills */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestedActions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          type="button"
                          onClick={() => handleActionClick(act.action)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 hover:bg-amber-200 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs mt-1 font-bold text-xs">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs mt-1">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gemini is thinking</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about how to book, prices, or services in Addis Ababa..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-xs"
            />
            <Button
              type="submit"
              variant="accent"
              size="md"
              disabled={!input.trim() || isLoading}
              className="rounded-2xl px-5 py-3 font-bold shrink-0"
              icon={<Send className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Powered by Google Gemini 2.5 Flash & Tegagn Knowledge Base</span>
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="hover:text-amber-500 underline transition-colors cursor-pointer"
            >
              Gemini API Key Settings
            </button>
          </div>
        </div>

      </div>

      {/* 3. GEMINI API KEY CONFIGURATION MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-xs">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Google Gemini API Key
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect live Google Gemini API
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <span>Get your free key from</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-500 hover:underline font-bold inline-flex items-center gap-0.5"
                  >
                    Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              {keySavedToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Gemini API Key saved successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowKeyModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  className="font-bold"
                >
                  Save API Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
