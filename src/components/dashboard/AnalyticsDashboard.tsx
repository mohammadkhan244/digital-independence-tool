import React from 'react';
import { cn } from '@/lib/utils';
import { PerformanceAnalytics, ErrorType, CueLevel } from '@/types/assessment';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Clock,
  MousePointerClick,
  AlertTriangle,
  Trophy,
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

// Plain-language summary of cue dependence for a module
const getCueSummary = (
  cueBreakdown: Array<{
    cueLevel: CueLevel | null;
    cueLabel: string | null;
    stepLabel: string;
    completed: boolean;
  }>,
): string | null => {
  const withData = cueBreakdown.filter(s => s.cueLevel !== null);
  if (withData.length === 0) return null;

  const unableTasks = withData.filter(s => s.cueLevel === 0);
  const demoTasks = withData.filter(s => s.cueLevel === 1);
  const allIndependent = withData.every(s => s.cueLevel === 3);

  if (unableTasks.length > 0) {
    const names = unableTasks.map(s => s.stepLabel).join('; ');
    return `Priority for training: ${names}`;
  }
  if (demoTasks.length > 0) {
    const n = demoTasks.length;
    return `Required demonstration on ${n} task${n > 1 ? 's' : ''}`;
  }
  if (allIndependent) {
    return 'Completed all tasks independently';
  }
  return 'Completed most tasks with minimal cues';
};

// Color class per cue level for the breakdown badge
const cueLevelClass = (level: CueLevel): string => {
  if (level === 3) return 'bg-success/10 text-success';
  if (level === 2) return 'bg-chart-1/10 text-chart-1';
  if (level === 1) return 'bg-warning/10 text-warning';
  return 'bg-destructive/10 text-destructive';
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
}) => {
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const moduleChartData = analytics.moduleScores.map(m => ({
    name: m.moduleName,
    score: m.percentage,
    fullName: m.moduleName,
  }));

  const errorData = Object.entries(analytics.errorProfile)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: ERROR_LABELS[type as ErrorType],
      value: count,
      color: ERROR_COLORS[type as ErrorType],
    }));

  const totalErrors = Object.values(analytics.errorProfile).reduce((a, b) => a + b, 0);
  const wrongTaps = analytics.errorProfile.targeting ?? 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print-no-break">
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

        {/* Wrong Taps = targeting errors only (subset of total errors) */}
        <div className="analytics-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <MousePointerClick className="h-5 w-5 text-chart-2" />
            </div>
          </div>
          <div className="analytics-value text-chart-2">
            {wrongTaps}
          </div>
          <div className="analytics-label">Wrong Taps</div>
          <div className="text-xs text-muted-foreground mt-1">
            targeting errors
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
            all error types
          </div>
        </div>
      </div>

      {/* Bar Chart — full width now that radar is removed */}
      <div className="analytics-card print-no-break">
        <h3 className="font-semibold text-foreground mb-4">Performance by Module</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moduleChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
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

      {/* Error Distribution */}
      {errorData.length > 0 && (
        <div className="analytics-card print-no-break">
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
                    className="h-4 w-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: error.color }}
                  />
                  <span className="text-sm text-foreground flex-1">{error.name}</span>
                  <span className={cn(
                    'error-badge',
                    error.name === 'Navigation' && 'error-navigation',
                    error.name === 'Targeting' && 'error-targeting',
                    error.name === 'Sequencing' && 'error-sequencing',
                    error.name === 'Attention' && 'error-attention',
                    error.name === 'Abandonment' && 'error-abandonment',
                  )}>
                    {error.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Module Details Table — no qualitative labels */}
      <div className="analytics-card overflow-hidden print-no-break">
        <h3 className="font-semibold text-foreground mb-4">Detailed Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Module</th>
                <th className="text-center p-3 font-medium">Score</th>
                <th className="text-center p-3 font-medium">% Correct</th>
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
                      'score-badge',
                      module.percentage >= 80 && 'score-2',
                      module.percentage >= 50 && module.percentage < 80 && 'score-1',
                      module.percentage < 50 && 'score-0',
                    )}>
                      {module.percentage.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cue Level Breakdown — one sub-section per module, only shown when cue data exists */}
      {analytics.moduleScores.some(m =>
        m.cueBreakdown.some(s => s.cueLevel !== null),
      ) && (
        <div className="analytics-card print-no-break">
          <h3 className="font-semibold text-foreground mb-5">Cue Level Breakdown</h3>
          <div className="space-y-7">
            {analytics.moduleScores.map(module => {
              const hasCueData = module.cueBreakdown.some(s => s.cueLevel !== null);
              if (!hasCueData) return null;

              const summary = getCueSummary(module.cueBreakdown);

              return (
                <div key={module.moduleId}>
                  {/* Module name + summary label */}
                  <h4 className="font-medium text-foreground mb-1">{module.moduleName}</h4>
                  {summary && (
                    <p className="text-sm text-muted-foreground mb-3">{summary}</p>
                  )}

                  {/* Per-task breakdown table */}
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left p-3 font-medium">Task</th>
                          <th className="text-center p-3 font-medium">Outcome</th>
                          <th className="text-center p-3 font-medium">Cue Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {module.cueBreakdown.map(step => (
                          <tr key={step.stepId} className="border-b last:border-0">
                            <td className="p-3 text-muted-foreground">
                              {step.stepLabel}
                            </td>
                            <td className="p-3 text-center">
                              {step.cueLevel !== null ? (
                                <span
                                  className={cn(
                                    'font-medium',
                                    step.completed
                                      ? 'text-success'
                                      : 'text-destructive',
                                  )}
                                >
                                  {step.completed ? 'Completed' : 'Not completed'}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {step.cueLevel !== null ? (
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                                    cueLevelClass(step.cueLevel),
                                  )}
                                >
                                  <span className="font-bold">{step.cueLevel}</span>
                                  <span>{step.cueLabel}</span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
