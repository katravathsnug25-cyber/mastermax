import { useState, useCallback } from 'react';
import type { ChatMessage } from '@/types';

export function useMessages(initial: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateLast = useCallback((content: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...last, content: last.content + content }];
    });
  }, []);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, addMessage, updateLast, clear, setMessages };
}