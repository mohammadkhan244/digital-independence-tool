import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '@/hooks/useAssessment';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { eadlModules } from '@/data/modules';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FileSpreadsheet,
  ChevronLeft,
  Eye,
  Printer,
  RotateCcw,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { session, hasLoaded, getAnalytics, exportCSV, exportAOIMap, resetAssessment } = useAssessment();
  const [retakeOpen, setRetakeOpen] = useState(false);

  const analytics = getAnalytics();

  const handleExportCSV = () => {
    const csv = exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eadl-assessment-${session?.id || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAOI = () => {
    const aoi = exportAOIMap();
    const blob = new Blob([aoi], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eadl-aoi-map-${session?.id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session || !analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-foreground mb-2">Results Not Found</h2>
          <p className="text-muted-foreground mb-2">
            No completed assessment was found on this device.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            If you just finished an assessment, your session data has been saved — return to the assessment to resume or retry.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/assessment')}>Back to Assessment</Button>
            <Button variant="ghost" onClick={() => navigate('/')}>Return Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header — single title row on desktop, title + button bar on mobile */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md">
        <div className="container px-4">
          {/* Title row — always visible */}
          <div className="flex h-14 items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-foreground leading-tight">Assessment Results</h1>
              <p className="text-xs text-muted-foreground truncate">
                Participant {session.participantId}
              </p>
            </div>

            {/* Desktop buttons — hidden below sm */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                CSV
              </Button>

              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>

              {session.eyeTrackingEnabled && (
                <Button variant="outline" size="sm" onClick={handleExportAOI}>
                  <Eye className="h-4 w-4 mr-1" />
                  AOI Map
                </Button>
              )}

              <Button variant="destructive" size="sm" onClick={() => setRetakeOpen(true)}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Retake
              </Button>
            </div>
          </div>

          {/* Mobile button bar — visible only below sm, full-width evenly spaced */}
          <div className="flex sm:hidden gap-2 pb-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-0"
              onClick={handleExportCSV}
            >
              <FileSpreadsheet className="h-4 w-4 mr-1 flex-shrink-0" />
              CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-0"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-1 flex-shrink-0" />
              Print
            </Button>

            {session.eyeTrackingEnabled && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-w-0"
                onClick={handleExportAOI}
              >
                <Eye className="h-4 w-4 mr-1 flex-shrink-0" />
                AOI
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              className="flex-1 min-w-0"
              onClick={() => setRetakeOpen(true)}
            >
              <RotateCcw className="h-4 w-4 mr-1 flex-shrink-0" />
              Retake
            </Button>
          </div>
        </div>
      </header>

      {/* Retake confirmation dialog — single instance, controlled by retakeOpen */}
      <AlertDialog open={retakeOpen} onOpenChange={setRetakeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retake Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your current results. Are you sure? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                resetAssessment();
                navigate('/assessment');
              }}
            >
              Yes, clear and retake
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {/* Session Info */}
        <div className="mb-6 rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Session ID</div>
              <div className="font-mono text-sm break-all">{session.id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Started</div>
              <div className="text-sm">
                {new Date(session.startTime).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Assessment Mode</div>
              <div className="text-sm capitalize">
                {session.assessmentMode === 'rehabilitation'
                  ? 'Rehabilitation'
                  : session.assessmentMode === 'reassessment'
                  ? 'Reassessment'
                  : 'Assessment'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Version</div>
              <div className="text-sm">{session.version}</div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard analytics={analytics} />

        {/* Open-Ended Responses */}
        {session.moduleResults.some(m => m.openEndedResponse) && (
          <div className="mt-6 rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Patient Responses</h3>
            <div className="space-y-4">
              {session.moduleResults
                .filter(m => m.openEndedResponse)
                .map(result => {
                  const module = eadlModules.find(
                    (m) => m.id === result.moduleId
                  );
                  return (
                    <div key={result.moduleId} className="border-l-4 border-primary pl-4">
                      <div className="font-medium text-foreground">{module?.name}</div>
                      <div className="text-sm text-muted-foreground italic mt-1">
                        "{module?.openEndedQuestion}"
                      </div>
                      <p className="text-foreground mt-2">{result.openEndedResponse}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
