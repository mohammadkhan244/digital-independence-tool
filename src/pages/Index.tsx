import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { eadlModules, getModuleIcon } from '@/data/modules';
import { ModuleCard } from '@/components/assessment/ModuleCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DemoSection } from '@/components/landing/DemoSection';
import {
  Play,
  Settings,
  BarChart3,
  Accessibility,
  Eye,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
} from 'lucide-react';

const FounderPhoto: React.FC<{ src: string; initials: string }> = ({ src, initials }) => {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <div className="h-28 w-28 rounded-full bg-primary/10 ring-4 ring-primary/20 flex items-center justify-center shrink-0">
        <span className="text-2xl font-bold text-primary">{initials}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={initials}
      onError={() => setFailed(true)}
      className="h-28 w-28 rounded-full object-cover ring-4 ring-primary/20 shrink-0"
    />
  );
};

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [eyeTracking, setEyeTracking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleStartAssessment = () => {
    sessionStorage.removeItem('eadl_session');
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen">

      {/* ── Hero ── white + teal gradient */}
      <header className="relative overflow-hidden bg-card border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
        <div className="container relative px-4 py-14 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              eADL Assessment Tool v1.0
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Digital Activities of
              <span className="block text-primary">Daily Living Assessment</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl leading-relaxed">
              Interactive evaluation of technology skills for post-stroke patients using
              simulated smartphone and web interfaces.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={handleStartAssessment} className="gap-2 text-base min-h-[48px]">
                <Play className="h-5 w-5" />
                Start Assessment
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')} className="gap-2 min-h-[48px]">
                <BarChart3 className="h-5 w-5" />
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Demo ── muted teal-gray */}
      <section className="bg-muted py-14">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">See It in Action</h2>
              <p className="text-muted-foreground text-sm">
                Try one task from the assessment — no sign-up, no commitment.
              </p>
            </div>
            <DemoSection />
          </div>
        </div>
      </section>

      {/* ── Features ── white, cards elevated with shadow */}
      <section className="bg-card py-14">
        <div className="container px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Key Features</h2>
            <p className="text-muted-foreground">Comprehensive assessment with advanced analytics</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-muted/60 p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Accessibility className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Adaptive Difficulty</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automatically adjusts between simple and complex modes based on performance.
              </p>
            </div>
            <div className="rounded-xl border bg-muted/60 p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
                <BarChart3 className="h-6 w-6 text-chart-1" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Performance Analytics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track timing, errors, and completion metrics with detailed breakdowns.
              </p>
            </div>
            <div className="rounded-xl border bg-muted/60 p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                <Eye className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Eye-Tracking Ready</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compatible with external eye-tracking for spatial neglect research.
              </p>
            </div>
            <div className="rounded-xl border bg-muted/60 p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All data stored locally. Optional anonymized research mode available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Settings ── muted teal-gray */}
      <section className="bg-muted py-10">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6 shadow-sm">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex w-full items-center justify-between min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-foreground">Assessment Settings</span>
              </div>
              <ArrowRight className={cn(
                'h-5 w-5 text-muted-foreground transition-transform duration-200',
                showSettings && 'rotate-90',
              )} />
            </button>
            {showSettings && (
              <div className="mt-6 space-y-6 border-t pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-foreground">Adaptive Mode</div>
                    <p className="text-sm text-muted-foreground">Automatically adjust difficulty based on performance</p>
                  </div>
                  <Switch checked={adaptiveMode} onCheckedChange={setAdaptiveMode} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-foreground">Eye-Tracking Mode</div>
                    <p className="text-sm text-muted-foreground">Enable markers and AOI export for eye-tracking research</p>
                  </div>
                  <Switch checked={eyeTracking} onCheckedChange={setEyeTracking} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Modules ── white, cards on slight secondary bg */}
      <section className="bg-card py-14">
        <div className="container px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Assessment Modules</h2>
            <p className="text-muted-foreground">Covering essential digital activities of daily living</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eadlModules.map((module, index) => (
              <div
                key={module.id}
                className="rounded-xl border bg-muted/50 p-5 shadow-sm transition-all hover:shadow-md hover:bg-muted/80"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                    {getModuleIcon(module.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1">
                      <span className="text-xs font-semibold text-primary/70 uppercase tracking-wide">
                        eADL {index + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{module.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
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
        </div>
      </section>

      {/* ── Scoring ── muted teal-gray, white card pops */}
      <section className="bg-muted py-14">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl rounded-xl border bg-card p-8 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-2 text-center">Scoring System</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Each task is rated on a 4-point cue hierarchy
            </p>
            <div className="grid gap-6 sm:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 ring-4 ring-success/5">
                  <CheckCircle2 className="h-7 w-7 text-success" />
                </div>
                <div className="font-semibold text-foreground">Independent</div>
                <div className="text-xs text-muted-foreground mt-1">No prompting needed</div>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 ring-4 ring-warning/5">
                  <span className="text-2xl font-bold text-warning">2</span>
                </div>
                <div className="font-semibold text-foreground">Verbal Cue</div>
                <div className="text-xs text-muted-foreground mt-1">Completed with hint</div>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-chart-2/10 ring-4 ring-chart-2/5">
                  <span className="text-2xl font-bold text-chart-2">1</span>
                </div>
                <div className="font-semibold text-foreground">Demonstration</div>
                <div className="text-xs text-muted-foreground mt-1">Completed after shown</div>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/5">
                  <span className="text-2xl font-bold text-destructive">0</span>
                </div>
                <div className="font-semibold text-foreground">Unable</div>
                <div className="text-xs text-muted-foreground mt-1">Could not complete</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Platform ── white card */}
      <section className="bg-card py-14" id="about">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">About the DADL Platform</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A patient recovering from a stroke once told co-founder Rafay Khan that being able to
                text their family mattered as much as their ability to walk again. Even if their arm and
                hand strength returned, they explained, being unable to use their phone would still mean
                losing an important part of their independence.
              </p>
              <p>
                That conversation became the starting point for the Digital Activities of Daily Living
                (DADL) Assessment and Rehabilitation Platform. We asked whether assessing DADLs could
                capture functional outcomes that conventional neurological scores and examinations might miss.
              </p>
              <p>
                The platform currently includes texting tasks and a simulated patient portal, bringing
                together task-based assessment, rehabilitation practice, and reassessment. It is designed
                to help identify where patients encounter difficulty, provide opportunities to practice
                these skills, and track performance over time.
              </p>
              <p>
                Patient feedback sparked this project and continues to guide its development. Conversations
                with patients, clinicians, and developers have helped us refine the tasks, recognize gaps,
                and prepare for a clinical pilot. We want the platform to reflect what patients themselves
                consider meaningful progress, including the everyday activities they most want to regain.
              </p>
              <p>
                The platform is currently in the prototype phase, with pilot study preparation and the
                required institutional review process underway. Our initial focus is on people recovering
                from stroke or traumatic brain injury, with the broader goal of supporting patients across
                a range of conditions and abilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Founders ── muted bg */}
      <section className="bg-muted py-14">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">About the Co-Founders</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">

              {/* Rafay Khan */}
              <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center text-center gap-4">
                <FounderPhoto src="/rafay.jpg" initials="RK" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Rafay Khan</h3>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-0.5 mb-3">
                    Co-Founder
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A fourth-year medical student at New York Medical College pursuing residency training
                    in neurology. His interests span neurointervention, neurotechnology, and
                    brain-computer interfaces, with a focus on translating advances in treatment into
                    meaningful everyday independence. At the 2026 New York Brain-Computer Interface (BCI)
                    Symposium, he will participate in the main panel, "BCIs as a System of Care,"
                    discussing the role of practical, patient-centered digital function in evaluating BCI
                    outcomes.
                  </p>
                </div>
              </div>

              {/* Mohammad Khan */}
              <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center text-center gap-4">
                <FounderPhoto src="/mohammad.jpg" initials="MK" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Mohammad Khan</h3>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-0.5 mb-3">
                    Co-Founder
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A robotics engineer with experience in the medical device and assistive technology
                    space since 2019. During undergrad, he helped found the Accessible Prosthetics
                    Initiative whose mission was to increase access to prosthetics in the Columbus, Ohio
                    area. At Battelle, he prototyped a modular attachment for upper limb prosthetic arms.
                    Now, he works at a robotic welding company.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── secondary blue-gray */}
      <footer className="bg-secondary border-t py-8">
        <div className="container px-4 text-center">
          <p className="text-sm text-secondary-foreground font-medium">
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
