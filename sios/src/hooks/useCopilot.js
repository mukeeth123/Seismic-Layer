import { useState, useCallback } from 'react';
import { generateResponse } from '../mock/copilotEngine';

export function useCopilot(module, contextData = {}) {
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);

  const ask = useCallback(async (query) => {
    if (!query.trim()) return;
    const userMsg = { role: 'user', content: query, ts: Date.now() };
    setMessages(m => [...m, userMsg]);
    setThinking(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const response = generateResponse({ module, ...contextData }, query);
    const aiMsg = { role: 'ai', content: response, ts: Date.now() };
    setMessages(m => [...m, aiMsg]);
    setThinking(false);
  }, [module, contextData]);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, thinking, ask, clear };
}
