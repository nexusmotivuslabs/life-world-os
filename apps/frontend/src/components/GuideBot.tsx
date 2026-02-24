import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Minimize2, Sparkles, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { chatApi } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

// Artifact names that can be linked
const ARTIFACT_NAMES = [
  'Capacity', 'Engines', 'Oxygen', 'Meaning', 'Optionality',
  'Energy', 'Water', 'Gold', 'Armor', 'Keys',
  'Money System', 'Energy System', 'XP System',
  'Spring', 'Summer', 'Autumn', 'Winter',
  'Career Engine', 'Business Engine', 'Investment Engine', 'Learning Engine',
  // Priority Stack Items
  'Health and energy stability', 'Health', 'Energy stability',
  'Financial runway and optionality', 'Financial runway', 'Optionality',
  'Skill and capability compounding', 'Skill compounding', 'Capability compounding',
  'System durability and resilience', 'System durability', 'Resilience',
  'Meaning, narrative, and identity alignment', 'Meaning', 'Narrative', 'Identity alignment'
];

const PUBLIC_ROUTES = ['/', '/login', '/register'];

function GuideBot() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  const shouldHide = !token || isPublicRoute;

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [isBotMinimized, setIsBotMinimized] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check backend connection status
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Use the same API_URL as api.ts
        const API_URL = (import.meta.env?.VITE_API_URL as string | undefined) ?? '';
        const response = await fetch(`${API_URL}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        setIsBackendAvailable(response.ok);
      } catch (error) {
        setIsBackendAvailable(false);
      }
    };

    // Check immediately
    checkBackend();

    // Check periodically (every 10 seconds)
    const interval = setInterval(checkBackend, 10000);

    return () => clearInterval(interval);
  }, []);

  // Extract artifact mentions from message content (max 3 recommended artifacts)
  const extractArtifacts = (content: string): string[] => {
    const found: string[] = [];
    ARTIFACT_NAMES.forEach(artifact => {
      if (content.toLowerCase().includes(artifact.toLowerCase())) {
        found.push(artifact);
      }
    });
    // Limit to maximum 3 recommended artifacts
    return found.slice(0, 3);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isBotMinimized) {
      scrollToBottom();
    }
  }, [chatMessages, isBotMinimized]);

  // Handle click outside to minimize chat
  useEffect(() => {
    if (isBotMinimized) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside the chat container
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(target)
      ) {
        setIsBotMinimized(true);
      }
    };

    // Add event listener with a small delay to avoid immediate triggering
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBotMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(
        currentInput,
        chatSessionId || undefined
      );
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response,
        createdAt: new Date().toISOString(),
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      
      if (response.sessionId) {
        setChatSessionId(response.sessionId);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Provide user-friendly error messages
      let errorContent = 'Sorry, I encountered an error. Please try again.';
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
        errorContent = 'I\'ll be back online soon.';
        setIsBackendAvailable(false);
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorContent = 'Please log in to continue.';
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        errorContent = 'Something went wrong. I\'ll be back online soon.';
      }
      
      const errorMessageObj: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorContent,
        createdAt: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (shouldHide) return null;

  if (isBotMinimized) {
    return (
      <button
        onClick={() => setIsBotMinimized(false)}
        className="fixed bottom-6 right-6 z-[100] w-16 h-16 rounded-full shadow-2xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group border-2 border-white overflow-hidden relative bg-opacity-100"
        style={{ 
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 100,
        }}
        aria-label="Open Query"
      >
        {/* Yin-yang split: Meaning (purple) left, Optionality (orange) right */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-meaning-DEFAULT"></div>
          <div className="w-1/2 bg-optionality-DEFAULT"></div>
        </div>
        {/* Small circles for yin-yang effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-optionality-DEFAULT border-2 border-gray-800"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-meaning-DEFAULT border-2 border-gray-800"></div>
        <Sparkles className="w-6 h-6 text-white relative z-10 group-hover:scale-110 transition-transform drop-shadow-lg" />
      </button>
    );
  }

  return (
    <div ref={chatContainerRef} className="fixed bottom-6 right-6 z-[100] w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Query</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Head of Life-World</p>
            </div>
          </div>
          <button
            onClick={() => setIsBotMinimized(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50 dark:bg-gray-900">
        {chatMessages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Query</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">What would you like to understand?</p>
          </div>
        )}
        {chatMessages.map((message) => {
          const artifacts = message.role === 'assistant' ? extractArtifacts(message.content) : [];
          
          return (
            <div key={message.id} className="mb-4">
              <div
                className={`flex items-end gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Query Avatar (left side) */}
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mb-0.5">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="text-[15px] leading-relaxed">
                      {/* Simple text rendering for chat-like feel, only use markdown if needed */}
                      {/* Use markdown if content has markdown syntax (bold, links, code, etc.) */}
                      {message.content.includes('**') || message.content.includes('```') || (message.content.includes('[') && message.content.includes('](')) ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                            strong: ({ children }) => {
                              const text = typeof children === 'string' ? children : String(children);
                              // Check if this bold text is an artifact - if so, it will be linked below
                              return <strong className="font-semibold">{children}</strong>;
                            },
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => <code className="bg-gray-300 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
                                {children}
                              </a>
                            ),
                            // Minimal list styling
                            ul: ({ children }) => <ul className="list-disc list-inside mb-1.5 space-y-0.5 ml-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-1.5 space-y-0.5 ml-1">{children}</ol>,
                            li: ({ children }) => <li className="text-[15px]">{children}</li>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* User Avatar (right side) */}
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 mb-0.5">
                    <User className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  </div>
                )}
              </div>
              
              {/* Suggested Artifacts */}
              {artifacts.length > 0 && message.role === 'assistant' && (
                <div className="mt-2 ml-2 flex flex-wrap gap-2">
                  {artifacts.map((artifact) => (
                    <button
                      key={artifact}
                      onClick={() => navigate(`/knowledge/artifacts?search=${encodeURIComponent(artifact)}`)}
                      className="text-xs px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {artifact}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mb-0.5">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[15px]"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuideBot;


