import { useTheme } from '../../context/ThemeContext';

export default function Watermark() {
  const { isDark } = useTheme();
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 14,
      zIndex: 9000,
      pointerEvents: 'none',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 1,
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1.2,
        color: isDark ? 'rgba(59,127,232,0.55)' : 'rgba(59,127,232,0.7)',
        fontFamily: 'Inter, sans-serif',
        textTransform: 'uppercase',
      }}>
        Syed Mukeeth
      </div>
      <div style={{
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: 0.8,
        color: isDark ? 'rgba(124,77,255,0.45)' : 'rgba(124,77,255,0.65)',
        fontFamily: 'Inter, sans-serif',
        textTransform: 'uppercase',
      }}>
        Industrial AI
      </div>
    </div>
  );
}
