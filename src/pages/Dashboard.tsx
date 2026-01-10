import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAssessment } from '@/hooks/useAssessment';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  ChevronLeft,
  Eye,
  Printer,
  Share2,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { session, getAnalytics, exportCSV, exportAOIMap } = useAssessment();
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'aoi' | null>(null);

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

  if (!session || !analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">No Assessment Data</h2>
          <p className="text-muted-foreground mb-4">Complete an assessment to view the dashboard.</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">Assessment Results</h1>
              <p className="text-sm text-muted-foreground">
                Participant {session.participantId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {/* Session Info */}
        <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Session ID</div>
              <div className="font-mono text-sm">{session.id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Started</div>
              <div className="text-sm">
                {new Date(session.startTime).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Difficulty Mode</div>
              <div className="text-sm capitalize">{session.difficultyMode}</div>
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
          <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Patient Responses</h3>
            <div className="space-y-4">
              {session.moduleResults
                .filter(m => m.openEndedResponse)
                .map(result => {
                  const module = require('@/data/modules').eadlModules.find(
                    (m: any) => m.id === result.moduleId
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
