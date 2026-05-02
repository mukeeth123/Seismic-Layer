import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import CopilotPanel from './CopilotPanel';

export default function CopilotBubble({ module, context, title, position = 'bottom-right' }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(o => !o)} title="Open AI Copilot" style={{
        width: 28, height: 28, borderRadius: 6,
        background: open ? 'rgba(59,127,232,0.25)' : 'rgba(59,127,232,0.1)',
        border: '1px solid rgba(59,127,232,0.3)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s', flexShrink: 0,
      }}>
        <MessageSquare size={13} color="var(--accent-blue)" />
      </button>
      <CopilotPanel open={open} onClose={() => setOpen(false)} module={module} context={context} title={title ?? 'AI Copilot'} />
    </>
  );
}
