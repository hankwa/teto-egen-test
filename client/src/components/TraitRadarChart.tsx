import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import type { TraitScores } from '@shared/schema';

interface TraitRadarChartProps {
  scores: TraitScores;
}

export function TraitRadarChart({ scores }: TraitRadarChartProps) {
  const data = [
    {
      trait: '외향성',
      score: scores.extraversion,
      fullMark: 100,
    },
    {
      trait: '감각형',
      score: scores.sensing,
      fullMark: 100,
    },
    {
      trait: '사고형',
      score: scores.thinking,
      fullMark: 100,
    },
    {
      trait: '계획형',
      score: scores.judging,
      fullMark: 100,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis 
          dataKey="trait" 
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 14 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <Radar
          name="특성 점수"
          dataKey="score"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.6}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
