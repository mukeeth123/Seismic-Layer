import { useState, useRef, useEffect } from 'react';
import { X, Send, Trash2, Download, Bot, User, Zap } from 'lucide-react';
import { useCopilot } from '../../hooks/useCopilot';
import { Button, ProgressBar } from '../ui';

export default function CopilotPanel({ open, onClose, module, context = {}, title = 'AI Copilot' }) {
  const { messages, thinking, ask, clear } = useCopilot(module, context);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  function handleSend() {
    if (!input.trim() || thinking) return;
    ask(input);
    setInput('');
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function exportChat() {
    const text = messages.map(m => `[${m.role.toUpperCase()}] ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'copilot-chat.txt'; a.click();
  }

  const suggestions = messages.length === 0 ? getDefaultSuggestions(module) : (messages[messages.length - 1]?.content?.followUp ?? []);

  return (
    <div style={{
      position: 'fixed', top: 0, right: open ? 0 : -380, width: 360, height: '100vh',
      background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)',
      zIndex: 500, display: 'flex', flexDirection: 'column', transition: 'right 0.25s ease',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,127,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={16} color="var(--accent-blue)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{title}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{getContextLabel(module, context)}</div>
        </div>
        <button onClick={exportChat} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><Download size={14} /></button>
        <button onClick={clear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><Trash2 size={14} /></button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><X size={16} /></button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,127,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Bot size={24} color="var(--accent-blue)" />
            </div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>SIOS Copilot</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Context-aware AI assistant. Ask me about the current seismic data, model performance, or drilling candidates.
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'user' ? 'rgba(124,77,255,0.2)' : 'rgba(59,127,232,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {msg.role === 'user' ? <User size={13} color="var(--accent-purple)" /> : <Bot size={13} color="var(--accent-blue)" />}
            </div>
            <div style={{ maxWidth: '85%' }}>
              {msg.role === 'user' ? (
                <div style={{ background: 'rgba(124,77,255,0.12)', border: '1px solid rgba(124,77,255,0.2)', borderRadius: '8px 2px 8px 8px', padding: '8px 12px', fontSize: 12, color: 'var(--text-primary)' }}>
                  {msg.content}
                </div>
              ) : (
                <AIResponseCard response={msg.content} onFollowUp={q => { ask(q); }} />
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(59,127,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={13} color="var(--accent-blue)" />
            </div>
            <div style={{ background: 'rgba(15,21,32,0.8)', border: '1px solid var(--border-subtle)', borderRadius: '2px 8px 8px 8px', padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)', display: 'inline-block', animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && !thinking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>SUGGESTED</div>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => ask(s)} style={{
                background: 'rgba(59,127,232,0.06)', border: '1px solid rgba(59,127,232,0.15)',
                borderRadius: 6, padding: '6px 10px', color: 'var(--text-secondary)', fontSize: 11,
                cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,127,232,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,127,232,0.06)'}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Ask about seismic data, models, or candidates..."
            rows={2} style={{
              flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)',
              fontSize: 12, fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none',
            }} />
          <button onClick={handleSend} disabled={!input.trim() || thinking} style={{
            width: 36, height: 36, borderRadius: 8, background: 'var(--accent-blue)', border: 'none',
            cursor: input.trim() && !thinking ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: input.trim() && !thinking ? 1 : 0.4, alignSelf: 'flex-end',
          }}>
            <Send size={14} color="#fff" />
          </button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>Enter to send · Shift+Enter for new line</div>
      </div>
    </div>
  );
}

function AIResponseCard({ response, onFollowUp }) {
  if (typeof response === 'string') {
    return (
      <div style={{ background: 'rgba(15,21,32,0.8)', border: '1px solid var(--border-subtle)', borderRadius: '2px 8px 8px 8px', padding: '10px 12px', fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>
        {response}
      </div>
    );
  }
  return (
    <div style={{ background: 'rgba(15,21,32,0.8)', border: '1px solid var(--border-subtle)', borderRadius: '2px 8px 8px 8px', padding: '12px', fontSize: 12 }}>
      {response.observation && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, letterSpacing: 0.5 }}>OBSERVATION</div>
          <div style={{ color: 'var(--accent-blue)', lineHeight: 1.5 }}>{response.observation}</div>
        </div>
      )}
      {response.interpretation && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, letterSpacing: 0.5 }}>INTERPRETATION</div>
          <div style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{response.interpretation}</div>
        </div>
      )}
      {response.confidence !== undefined && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>CONFIDENCE</span>
            <span style={{ fontSize: 11, color: response.confidence > 80 ? 'var(--success)' : response.confidence > 60 ? 'var(--warning)' : 'var(--danger)', fontWeight: 600 }}>{response.confidence}%</span>
          </div>
          <ProgressBar value={response.confidence} color={response.confidence > 80 ? 'var(--success)' : response.confidence > 60 ? 'var(--warning)' : 'var(--danger)'} height={4} />
        </div>
      )}
      {response.recommendation && (
        <div style={{ marginBottom: 8, background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.15)', borderRadius: 4, padding: '6px 8px' }}>
          <div style={{ fontSize: 10, color: 'var(--success)', marginBottom: 2, letterSpacing: 0.5 }}>RECOMMENDATION</div>
          <div style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>{response.recommendation}</div>
        </div>
      )}
      {response.sources?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {response.sources.map((s, i) => (
            <span key={i} style={{ fontSize: 10, background: 'rgba(59,127,232,0.1)', color: 'var(--accent-blue)', padding: '2px 6px', borderRadius: 3 }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function getDefaultSuggestions(module) {
  const map = {
    interpretation: ['Explain this bright spot', 'What structure is this?', 'Show horizon analysis'],
    seismic: ['What horizons are present?', 'Detect faults in this section', 'Explain amplitude variation'],
    data: ['Why is quality score low?', 'Is this dataset ready?', 'Compare datasets'],
    models: ['Why is loss high?', 'Is this model converging?', 'Compare versions'],
    decision: ['Which location has the best risk-adjusted return?', 'Compare top 3 candidates', 'Generate a drilling recommendation memo'],
  };
  return map[module] || ['What can you help me with?'];
}

function getContextLabel(module, context) {
  if (module === 'interpretation' || module === 'seismic') return `Inline ${context.activeInline ?? '—'} · Xline ${context.activeXline ?? '—'} · ${context.activeTime ?? '—'}ms`;
  if (module === 'data') return context.datasetName ?? 'Dataset Analysis';
  if (module === 'models') return context.modelActive ?? 'Model Analysis';
  if (module === 'decision') return 'Drilling Candidates · 15 locations';
  return 'Context-aware analysis';
}
