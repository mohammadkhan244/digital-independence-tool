import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { eadlModules, getModuleIcon } from '@/data/modules';
import { ModuleCard } from '@/components/assessment/ModuleCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Settings, 
  BarChart3, 
  BookOpen,
  Accessibility,
  Eye,
  Sliders,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
} from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [eyeTracking, setEyeTracking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleStartAssessment = () => {
    // Clear any existing session
    sessionStorage.removeItem('eadl_session');
    navigate('/assessment');
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="container relative px-4 py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              eADL Assessment Tool v1.0
            </div>
            
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Electronic Activities of
              <span className="block text-primary">Daily Living Assessment</span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Interactive evaluation of technology skills for post-stroke patients using 
              simulated smartphone and web interfaces.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                onClick={handleStartAssessment}
                className="gap-2 text-lg"
              >
                <Play className="h-5 w-5" />
                Start Assessment
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleViewDashboard}
                className="gap-2"
              >
                <BarChart3 className="h-5 w-5" />
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="container px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Key Features</h2>
          <p className="text-muted-foreground">Comprehensive assessment with advanced analytics</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Accessibility className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Adaptive Difficulty</h3>
            <p className="text-sm text-muted-foreground">
              Automatically adjusts between simple and complex modes based on performance.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
              <BarChart3 className="h-6 w-6 text-chart-1" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Performance Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track timing, errors, and completion metrics with detailed breakdowns.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
              <Eye className="h-6 w-6 text-chart-2" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Eye-Tracking Ready</h3>
            <p className="text-sm text-muted-foreground">
              Compatible with external eye-tracking for spatial neglect research.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <Shield className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              All data stored locally. Optional anonymized research mode available.
            </p>
          </div>
        </div>
      </section>

      {/* Settings Panel */}
      <section className="container px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6 shadow-sm">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-foreground">Assessment Settings</span>
            </div>
            <ArrowRight className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              showSettings && "rotate-90"
            )} />
          </button>

          {showSettings && (
            <div className="mt-6 space-y-6 border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Adaptive Mode</div>
                  <p className="text-sm text-muted-foreground">
                    Automatically adjust difficulty based on performance
                  </p>
                </div>
                <Switch
                  checked={adaptiveMode}
                  onCheckedChange={setAdaptiveMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Eye-Tracking Mode</div>
                  <p className="text-sm text-muted-foreground">
                    Enable markers and AOI export for eye-tracking research
                  </p>
                </div>
                <Switch
                  checked={eyeTracking}
                  onCheckedChange={setEyeTracking}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Module Overview */}
      <section className="container px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Assessment Modules</h2>
          <p className="text-muted-foreground">7 domains covering essential electronic activities of daily living</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eadlModules.map((module, index) => (
            <div 
              key={module.id}
              className="rounded-xl border bg-card p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {getModuleIcon(module.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      eADL {index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{module.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {module.description}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {module.steps.length} steps
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scoring Info */}
      <section className="container px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-xl border bg-card p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">Scoring System</h2>
          
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div className="font-semibold text-foreground">Score 2</div>
              <div className="text-sm text-muted-foreground">Independent</div>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <span className="text-xl font-bold text-warning">1</span>
              </div>
              <div className="font-semibold text-foreground">Score 1</div>
              <div className="text-sm text-muted-foreground">With Help</div>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <span className="text-xl font-bold text-destructive">0</span>
              </div>
              <div className="font-semibold text-foreground">Score 0</div>
              <div className="text-sm text-muted-foreground">Unable</div>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <span className="text-lg font-bold text-muted-foreground">N/A</span>
              </div>
              <div className="font-semibold text-foreground">Not Applicable</div>
              <div className="text-sm text-muted-foreground">Not needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container px-4 text-center">
          <p className="text-sm text-muted-foreground">
            eADL Assessment Tool • For research and clinical use
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Data is stored locally. No information is transmitted without explicit consent.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
