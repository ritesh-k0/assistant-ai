import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Trash2,
  Volume2,
  CheckCircle,
  Clock,
  Brain,
  Repeat,
  Share2,
  Calendar,
  Phone,
  Copy,
  Check,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';

export const ChatView: React.FC = () => {
  const {
    chatMessages,
    sendUserMessage,
    clearChat,
    isAiThinking,
    isListening,
    startVoiceListening,
    stopVoiceListening,
    speakLakshmiText,
    isSpeaking,
    stopSpeaking,
  } = useAssistant();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAiThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAiThinking) return;
    sendUserMessage(input);
    setInput('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    'Kal 7 baje Java practice yaad dila dena',
    'Aaj mera schedule kya hai?',
    'Papa ko call karna yaad dila dena',
    'Remember that I practice Java every evening at 7 PM',
    'Create a task for my React project',
    'Show my pending tasks',
    'Employee Management System ke liye LinkedIn post bana do',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-rose-500/20">
            <span>ल</span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Lakshmi</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                Personal AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Hindi • English • Hinglish Auto-Detect</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse"
              title="Stop speaking"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Speaking</span>
            </button>
          )}

          <button
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white'
                }`}
              >
                {isUser ? 'R' : 'ल'}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none shadow'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Structured Action Execution Badge */}
                  {msg.actionTaken && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <span className="font-bold">Authorized Action: </span>
                        <span>{msg.actionTaken.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer timestamp & actions */}
                <div
                  className={`flex items-center gap-2 text-[10px] text-slate-500 px-1 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <>
                      <button
                        onClick={() => speakLakshmiText(msg.text)}
                        className="hover:text-rose-400 p-0.5"
                        title="Listen to response"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-slate-300 p-0.5"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isAiThinking && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              ल
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:0.4s]" />
              </span>
              <span>Lakshmi is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts carousel */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/60 overflow-x-auto flex gap-2 no-scrollbar">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => sendUserMessage(prompt)}
            className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition active:scale-95 shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Form */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={isListening ? stopVoiceListening : startVoiceListening}
            className={`p-3 rounded-2xl border transition active:scale-95 ${
              isListening
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500/50'
            }`}
            title={isListening ? 'Stop recording voice' : 'Speak to Lakshmi'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Lakshmi se kuch bhi poochein ya command dein..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />

          <button
            type="submit"
            disabled={!input.trim() || isAiThinking}
            className="p-3 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white disabled:opacity-50 transition shadow-lg shadow-rose-600/20 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
