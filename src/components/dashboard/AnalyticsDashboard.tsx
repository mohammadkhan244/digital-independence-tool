import React from 'react';
import { cn } from '@/lib/utils';
import { PerformanceAnalytics, ErrorType } from '@/types/assessment';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { 
  Clock, 
  MousePointerClick, 
  RotateCcw, 
  AlertTriangle,
  Target,
  Trophy,
  TrendingUp,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  analytics: PerformanceAnalytics;
}

const ERROR_COLORS: Record<ErrorType, string> = {
  navigation: 'hsl(var(--chart-4))',
  targeting: 'hsl(var(--chart-2))',
  sequencing: 'hsl(var(--chart-5))',
  attention: 'hsl(var(--chart-3))',
  abandonment: 'hsl(var(--destructive))',
};

const ERROR_LABELS: Record<ErrorType, string> = {
  navigation: 'Navigation',
  targeting: 'Targeting',
  sequencing: 'Sequencing',
  attention: 'Attention',
  abandonment: 'Abandonment',
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
}) => {
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Prepare data for charts
  const moduleChartData = analytics.moduleScores.map(m => ({
    name: m.moduleName.replace('&', '\n&'),
    score: m.percentage,
    fullName: m.moduleName,
  }));

  const radarData = analytics.moduleScores.map(m => ({
    subject: m.moduleName.split(' ')[0],
    score: m.percentage,
    fullMark: 100,
  }));

  const errorData = Object.entries(analytics.errorProfile)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: ERROR_LABELS[type as ErrorType],
      value: count,
      color: ERROR_COLORS[type as ErrorType],
    }));

  const totalErrors = Object.values(analytics.errorProfile).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="analytics-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="analytics-value text-primary">
            {analytics.scorePercentage.toFixed(0)}%
          </div>
          <div className="analytics-label">Overall Score</div>
          <div className="text-xs text-muted-foreground mt-1">
            {analytics.compositeScore} / {analytics.maxPossibleScore} points
          </div>
        </div>

        <div className="analytics-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
              <Clock className="h-5 w-5 text-chart-1" />
            </div>
          </div>
          <div className="analytics-value text-chart-1">
            {formatTime(analytics.totalAssessmentTime)}
          </div>
          <div className="analytics-label">Total Time</div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg {formatTime(analytics.averageTimePerStep)}/step
          </div>
        </div>

        <div className="analytics-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <MousePointerClick className="h-5 w-5 text-chart-2" />
            </div>
          </div>
          <div className="analytics-value text-chart-2">
            {analytics.totalMisclicks}
          </div>
          <div className="analytics-label">Misclicks</div>
          <div className="text-xs text-muted-foreground mt-1">
            {analytics.totalBacktracks} backtracks
          </div>
        </div>

        <div className="analytics-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </div>
          <div className="analytics-value text-destructive">
            {totalErrors}
          </div>
          <div className="analytics-label">Total Errors</div>
          <div className="text-xs text-muted-foreground mt-1">
            {analytics.abandonedSteps} abandoned
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Module Scores Bar Chart */}
        <div className="analytics-card">
          <h3 className="font-semibold text-foreground mb-4">Performance by Module</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(0)}%`, 'Score']}
                  labelFormatter={(label) => moduleChartData.find(m => m.name === label)?.fullName}
                />
                <Bar 
                  dataKey="score" 
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="analytics-card">
          <h3 className="font-semibold text-foreground mb-4">Domain Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Tooltip formatter={(value: number) => [`${value.toFixed(0)}%`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Error Distribution */}
      {errorData.length > 0 && (
        <div className="analytics-card">
          <h3 className="font-semibold text-foreground mb-4">Error Distribution</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={errorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {errorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col justify-center gap-2">
              {errorData.map((error) => (
                <div key={error.name} className="flex items-center gap-3">
                  <div 
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: error.color }}
                  />
                  <span className="text-sm text-foreground flex-1">{error.name}</span>
                  <span className={cn(
                    "error-badge",
                    error.name === 'Navigation' && "error-navigation",
                    error.name === 'Targeting' && "error-targeting",
                    error.name === 'Sequencing' && "error-sequencing",
                    error.name === 'Attention' && "error-attention",
                    error.name === 'Abandonment' && "error-abandonment"
                  )}>
                    {error.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Module Details Table */}
      <div className="analytics-card overflow-hidden">
        <h3 className="font-semibold text-foreground mb-4">Detailed Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Module</th>
                <th className="text-center p-3 font-medium">Score</th>
                <th className="text-center p-3 font-medium">%</th>
                <th className="text-center p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.moduleScores.map((module) => (
                <tr key={module.moduleId} className="border-b last:border-0">
                  <td className="p-3 font-medium text-foreground">
                    {module.moduleName}
                  </td>
                  <td className="p-3 text-center text-muted-foreground">
                    {module.score} / {module.maxScore}
                  </td>
                  <td className="p-3 text-center">
                    <span className={cn(
                      "score-badge",
                      module.percentage >= 80 && "score-2",
                      module.percentage >= 50 && module.percentage < 80 && "score-1",
                      module.percentage < 50 && "score-0"
                    )}>
                      {module.percentage.toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {module.percentage >= 80 ? (
                      <span className="text-success font-medium">Excellent</span>
                    ) : module.percentage >= 50 ? (
                      <span className="text-warning font-medium">Needs Practice</span>
                    ) : (
                      <span className="text-destructive font-medium">Difficulty</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
