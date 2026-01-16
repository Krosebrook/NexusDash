import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Bot, User, Sparkles, Terminal } from 'lucide-react';
import { DashboardChatSession } from '../services/aiService';
import { DashboardMetric } from '../types';

interface ChatWidgetProps {
  metrics: DashboardMetric[];
  onResolveIssue: (source: string) => Promise<boolean>;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ metrics, onResolveIssue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'bot',
      text: "Hello! I'm Nexus. I can help you analyze metrics or fix integration errors. How can I help?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const sessionRef = useRef<DashboardChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session on open or when metrics change (for fresh context)
  useEffect(() => {
    if (isOpen && !sessionRef.current) {
        sessionRef.current = new DashboardChatSession(metrics, async (name, args: any) => {
            if (name === 'resolve_integration_issue') {
                const result = await onResolveIssue(args.source);
                return result ? "Success: Issue resolved." : "Error: Could not resolve.";
            }
            return "Unknown tool";
        });
    }
  }, [isOpen, metrics, onResolveIssue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || !sessionRef.current) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const responseText = await sessionRef.current.sendMessage(userMsg.text);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
       console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div 
        className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right mb-4 overflow-hidden ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none h-0'
        }`}
        style={{ maxHeight: '600px', height: '500px' }}
      >
        {/* Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 rounded-lg">
                    <Terminal size={16} className="text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-100">Nexus Assistant</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] text-slate-400 font-medium">Online</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
            >
                <X size={18} />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.sender === 'user' ? 'bg-slate-700' : 'bg-indigo-600/20 text-indigo-400'
                    }`}>
                        {msg.sender === 'user' ? <User size={14} /> : <Bot size={16} />}
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed ${
                        msg.sender === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex-shrink-0 flex items-center justify-center">
                        <Bot size={16} />
                    </div>
                    <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-slate-800 border-t border-slate-700">
            <div className="relative">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Nexus to fix issues..."
                    className="w-full bg-slate-900 text-slate-200 placeholder-slate-500 rounded-xl pl-4 pr-12 py-3 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputText.trim() || isTyping}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Send size={14} />
                </button>
            </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto p-4 rounded-full shadow-lg shadow-indigo-900/30 transition-all duration-300 hover:scale-105 active:scale-95 group ${
            isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-indigo-600 text-white hover:bg-indigo-500'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:animate-pulse" />}
      </button>
    </div>
  );
};