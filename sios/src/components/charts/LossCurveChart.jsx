import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LossCurveChart({ data, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,42,58,0.8)" />
        <XAxis dataKey="epoch" tick={{ fill: '#8A9BB5', fontSize: 10 }} tickLine={false} />
        <YAxis tick={{ fill: '#8A9BB5', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: '#0F1520', border: '1px solid #1E2A3A', borderRadius: 6, fontSize: 11 }}
          labelStyle={{ color: '#8A9BB5' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#8A9BB5' }} />
        <Line type="monotone" dataKey="trainLoss" stroke="#3B7FE8" strokeWidth={1.5} dot={false} name="Train Loss" />
        <Line type="monotone" dataKey="valLoss" stroke="#E84040" strokeWidth={1.5} dot={false} name="Val Loss" strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}
