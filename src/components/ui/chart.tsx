import React from 'react';
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface BarChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  className?: string;
}

export function BarChart({ data, className }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300} className={className}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '0.375rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }} 
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function LineChart() {
  return <div>Line Chart Implementation</div>;
}

export function PieChart() {
  return <div>Pie Chart Implementation</div>;
}

export function DoughnutChart() {
  return <div>Doughnut Chart Implementation</div>;
}

export function AreaChart() {
  return <div>Area Chart Implementation</div>;
}
