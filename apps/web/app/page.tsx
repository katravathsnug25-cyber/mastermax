'use client';

import { useEffect, useRef, useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { streamChat } from '@/lib/ai-core-provider';
import type { ChatMessage } from '@/types';

export default function Home() {
  const { messages, addMessage, updateLast, clear, setMessages } = useMessages();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<AsyncGenerator<string | null>>();

  // Focus handling
  useEffect(() => {
    const inputEl = document.getElementById('chat-input');
    if (inputEl) {
      inputEl.focus();
    }
  }, []);

  // Handle keydown for send/enter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      // Clear any previous stream
      if (streamRef.current) {
        // Just let the generator complete naturally
      }
      streamRef.current = streamChat(
        [userMsg],
        process.env.FREELLM_DEFAULT_MODEL ?? 'auto',
        0.7,
      );

      const chunks: string[] = [];
      for await (const chunk of streamRef.current) {
        if (chunk === null) continue;
        if (typeof chunk === 'string') {
          chunks.push(chunk);
          updateLast(chunk);
        }
      }

      // If we have no content, add a default
      if (chunks.length === 0) {
        addMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'No response from model',
          timestamp: Date.now(),
        });
      }

    } catch (err) {
      console.error('Chat error:', err);
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, there was an error. Please try again.',
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        // Generator will be GC'd
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white font-sans antialiased">
      <div className="flex flex-col h-full">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* System message when empty */}
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <p>Start a conversation by typing a message</p>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`prose prose-sm max-w prose-chat ${msg.role === 'user' ? 'items-end text-right' : 'items-start text-left'} mb-4`}
            >
              {msg.role === 'user' && (
                <div className="inline-block bg-primary text-white rounded-md px-3 py-2 max-w-[85%] text-sm">
                  {msg.content}
                </div>
              )}

              {msg.role === 'assistant' && (
                <div className="inline-block bg-gray-800 rounded-md px-3 py-2 max-w-[85%] text-sm text-gray-300">
                  <p>{msg.content}</p>
                  {msg.reasoning && (
                    <p className="text-xs text-gray-500 mt-1 break-words">{msg.reasoning}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Scroll to bottom */}
          {messages.length > 0 && (
            <div
              ref={chatRef}
              className="h-0"
              onScroll={() => {
                chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
              }}
            />
          )}
        </div>

        {/* Input area */}
        <div className="p-6 border-t border-gray-800 bg-gray-950/30">
          <div className="flex items-start space-x-3">
            <div
              className={`w-8 h-8 rounded-full flex-shrink-0 ${
                messages.length > 0 && messages[messages.length - 1]?.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              {messages.length > 0 && messages[messages.length - 1]?.role === 'user' ? (
                'Y'
              ) : (
                '<Claude'
              )}
            </div>
            <div className="flex-1 relative">
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="bg-gray-900 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:min-w[200px]"
                placeholder="Type a message..."
                disabled={loading}
                autoFocus
              />
            </div>
            <button
              onClick={sendMessage}
              className="rounded-md bg-primary text-white px-4 py-2 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center space-x-2 py-2">
              <div className="w-4 h-4 border-2 border-primary border-t-0 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}