import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Minimize2, Sparkles, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../services/api';
import { logger } from '../lib/logger'

// Get API URL from environment (same as api.ts)
const API_URL = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5001';

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
  'Career Engine', 'Business Engine', 'Investment Engine', 'Learning Engine'
];

function GuideBot() {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [isBotMinimized, setIsBotMinimized] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend connection status
  useEffect(() => {
    const checkBackend = async () => {
      try {
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

  // Extract artifact mentions from message content
  const extractArtifacts = (content: string): string[] => {
    const found: string[] = [];
    ARTIFACT_NAMES.forEach(artifact => {
      if (content.toLowerCase().includes(artifact.toLowerCase())) {
        found.push(artifact);
      }
    });
    return found;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isBotMinimized) {
      scrollToBottom();
    }
  }, [chatMessages, isBotMinimized]);

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
    } catch (error: any) {
      logger.error('Chat error:', error);
      
      // Determine error type and provide helpful message
      let errorContent = '';
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
        errorContent = `**Backend unavailable**

I cannot connect to the backend server. The system is currently offline.

**To fix:**
1. Ensure the backend is running: \`cd apps/backend && npm run dev\`
2. Check the backend is accessible at \`http://localhost:5001\`
3. Verify your network connection

I remain available, but cannot process queries until the backend is restored.`;
        setIsBackendAvailable(false);
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorContent = `**Authentication required**

Please log in to use Query.`;
      } else {
        errorContent = `**Error occurred**

${errorMessage}

Please try again or check the backend logs for details.`;
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

  if (isBotMinimized) {
    return (
      <button
        onClick={() => setIsBotMinimized(false)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group border-2 border-gray-700 overflow-hidden relative"
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
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-gray-800 rounded-lg shadow-2xl border-2 border-gray-700 flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-700 relative overflow-hidden">
        {/* Yin-yang background */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-meaning-DEFAULT/90"></div>
          <div className="w-1/2 bg-optionality-DEFAULT/90"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                {/* Yin-yang icon */}
                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-optionality-light"></div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white drop-shadow">Query</h2>
            </div>
            <button
              onClick={() => setIsBotMinimized(true)}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              aria-label="Minimize"
            >
              <Minimize2 className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-white/90 drop-shadow">
              Question ↔ Answer. Seeking ↔ Knowing.
            </p>
            {/* Backend connection status */}
            {isBackendAvailable !== null && (
              <div className="flex items-center gap-1.5 text-xs">
                {isBackendAvailable ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-capacity-DEFAULT" />
                    <span className="text-capacity-light">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-400">Offline</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {chatMessages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            {/* Yin-yang symbol */}
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="w-full h-full rounded-full border-2 border-gray-600 flex">
                <div className="w-1/2 bg-meaning-DEFAULT/20 rounded-l-full"></div>
                <div className="w-1/2 bg-optionality-DEFAULT/20 rounded-r-full"></div>
              </div>
              <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-optionality-DEFAULT/30 border-2 border-gray-600"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-meaning-DEFAULT/30 border-2 border-gray-600"></div>
            </div>
            <p className="font-medium mb-2 text-gray-300">Query</p>
            <p className="text-sm text-gray-400">Question ↔ Answer</p>
            <p className="text-xs text-gray-500 mt-2">Seeking ↔ Knowing</p>
            {isBackendAvailable === false ? (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-red-400 mb-1">Backend Offline</p>
                <p className="text-xs text-gray-500">I remain visible but cannot process queries until the backend is restored.</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">What would you like to understand?</p>
            )}
          </div>
        )}
        {chatMessages.map((message) => {
          const artifacts = message.role === 'assistant' ? extractArtifacts(message.content) : [];
          
          return (
            <div key={message.id}>
              <div
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-meaning-DEFAULT/20 border border-meaning-DEFAULT/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-meaning-light" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2.5 relative ${
                    message.role === 'user'
                      ? 'bg-engines-DEFAULT text-white'
                      : 'bg-gray-800 border border-gray-700 text-gray-100'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-meaning-DEFAULT to-optionality-DEFAULT rounded-l-lg"></div>
                  )}
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="text-sm prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 text-gray-200">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-gray-300">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-300">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          code: ({ children }) => <code className="bg-gray-700 px-1.5 py-0.5 rounded text-engines-light text-xs">{children}</code>,
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-engines-light hover:text-engines-DEFAULT underline">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
              
              {/* Suggested Artifacts */}
              {artifacts.length > 0 && message.role === 'assistant' && (
                <div className="mt-2 ml-11 flex flex-wrap gap-2">
                  {artifacts.map((artifact) => (
                    <button
                      key={artifact}
                      onClick={() => navigate(`/knowledge/artifacts?search=${encodeURIComponent(artifact)}`)}
                      className="text-xs px-2 py-1 bg-optionality-DEFAULT/20 border border-optionality-DEFAULT/30 rounded text-optionality-light hover:bg-optionality-DEFAULT/30 transition-colors flex items-center gap-1"
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
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-meaning-DEFAULT/20 border border-meaning-DEFAULT/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-meaning-light animate-pulse" />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-meaning-light rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-optionality-light rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-engines-light rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700 bg-gray-800">
        {isBackendAvailable === false && (
          <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-red-400">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Backend unavailable. Query will remain visible but cannot process messages.</span>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isBackendAvailable === false ? "Backend offline - messages will queue..." : "What do you want to understand about Life World OS?"}
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-meaning-DEFAULT focus:border-transparent disabled:opacity-50"
            disabled={isLoading || isBackendAvailable === false}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isBackendAvailable === false}
            className="px-4 py-2 bg-engines-DEFAULT text-white rounded-lg hover:bg-engines-dark disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            title={isBackendAvailable === false ? "Backend is offline" : ""}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuideBot;


