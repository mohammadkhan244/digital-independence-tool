import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment, computeAnalytics } from '@/hooks/useAssessment';
import { loadAllSessions, fetchSessionsFromApi, mergeApiSessionsToLocal } from '@/hooks/useAssessmentPersistence';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { eadlModules } from '@/data/modules';
import { AssessmentSession } from '@/types/assessment';
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

const SELECT_CLS =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ' +
  'text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ' +
  'disabled:opacity-50';

function formatSessionLabel(s: AssessmentSession): string {
  const mode =
    s.assessmentMode === 'rehabilitation' ? 'Rehabilitation' :
    s.assessmentMode === 'reassessment'   ? 'Reassessment'   : 'Assessment';
  const d    = new Date(s.startTime);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${mode} — ${date} ${time}`;
}

function buildSessionCSV(s: AssessmentSession): string {
  const rows = ['Module,Step,Score,AutomatedScore,Overridden,TimeToCompletion,Misclicks,Backtracks,Abandoned,Errors'];
  s.moduleResults.forEach(result => {
    const def = eadlModules.find(m => m.id === result.moduleId);
    result.stepResults.forEach(step => {
      rows.push([
        def?.name || result.moduleId,
        step.stepId,
        step.score,
        step.automatedScore,
        step.overridden,
        step.timeToCompletion,
        step.misclicks,
        step.backtracks,
        step.abandoned,
        step.errors.join(';'),
      ].join(','));
    });
  });
  return rows.join('\n');
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { session, hasLoaded, exportAOIMap, resetAssessment } = useAssessment();
  const [retakeOpen, setRetakeOpen] = useState(false);

  // ── Session history ───────────────────────────────────────────────────────
  const [allSessions, setAllSessions] = useState<AssessmentSession[]>([]);
  const [dataLoaded, setDataLoaded]   = useState(false);
  const initialized = useRef(false);

  // Filter state
  const [filterParticipant, setFilterParticipant] = useState('');
  const [filterMode, setFilterMode]               = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');

  // Merge helper — dedup by id, completed only, newest first
  const mergeSessions = (lists: AssessmentSession[][]): AssessmentSession[] => {
    const seen = new Set<string>();
    const out: AssessmentSession[] = [];
    lists.flat().forEach(s => {
      if (s.endTime && !seen.has(s.id)) { seen.add(s.id); out.push(s); }
    });
    return out.sort((a, b) => b.startTime - a.startTime);
  };

  // Load once after the hook has read from localStorage
  useEffect(() => {
    if (!hasLoaded || initialized.current) return;
    initialized.current = true;

    // 1. Show localStorage data immediately (fast)
    const local   = loadAllSessions();
    const initial = mergeSessions([local, session ? [session] : []]);
    setAllSessions(initial);
    const def = session ?? initial[0] ?? null;
    if (def) setSelectedSessionId(def.id);
    setDataLoaded(true);

    // 2. Fetch from KV in background — merge and write back to localStorage
    fetchSessionsFromApi().then(apiSessions => {
      if (apiSessions.length === 0) return;
      mergeApiSessionsToLocal(apiSessions);
      setAllSessions(prev => mergeSessions([prev, apiSessions]));
    });
  }, [hasLoaded, session]);

  // ── Derived values ────────────────────────────────────────────────────────
  const participants = useMemo(
    () => [...new Set(allSessions.map(s => s.participantId))].sort(),
    [allSessions],
  );

  const filteredSessions = useMemo(() => {
    return allSessions.filter(s => {
      if (filterParticipant && s.participantId !== filterParticipant) return false;
      if (filterMode && (s.assessmentMode ?? 'assessment') !== filterMode) return false;
      return true;
    });
  }, [allSessions, filterParticipant, filterMode]);

  // When filters change, keep selectedSessionId valid
  useEffect(() => {
    if (filteredSessions.length > 0 && !filteredSessions.find(s => s.id === selectedSessionId)) {
      setSelectedSessionId(filteredSessions[0].id);
    }
  }, [filteredSessions, selectedSessionId]);

  const activeSession = useMemo(
    () => allSessions.find(s => s.id === selectedSessionId) ?? null,
    [allSessions, selectedSessionId],
  );

  const analytics = useMemo(() => computeAnalytics(activeSession), [activeSession]);

  const selectedIndex = filteredSessions.findIndex(s => s.id === selectedSessionId);

  // ── Exports ───────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!activeSession) return;
    const blob = new Blob([buildSessionCSV(activeSession)], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `eadl-assessment-${activeSession.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAOI = () => {
    const aoi  = exportAOIMap();
    const blob = new Blob([aoi], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `eadl-aoi-map-${activeSession?.id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Loading states ────────────────────────────────────────────────────────
  if (!hasLoaded || !dataLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (allSessions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-foreground mb-2">Results Not Found</h2>
          <p className="text-muted-foreground mb-2">No completed assessment was found on this device.</p>
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

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md">
        <div className="container px-4">
          <div className="flex h-14 items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-foreground leading-tight">Assessment Results</h1>
              <p className="text-xs text-muted-foreground truncate">
                {activeSession ? `Participant ${activeSession.participantId}` : 'No session selected'}
              </p>
            </div>

            {/* Desktop action buttons */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!activeSession}>
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              {activeSession?.eyeTrackingEnabled && (
                <Button variant="outline" size="sm" onClick={handleExportAOI}>
                  <Eye className="h-4 w-4 mr-1" />
                  AOI Map
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setRetakeOpen(true)}>
                <RotateCcw className="h-4 w-4 mr-1" />
                New Session
              </Button>
            </div>
          </div>

          {/* Mobile action buttons */}
          <div className="flex sm:hidden gap-2 pb-3">
            <Button variant="outline" size="sm" className="flex-1 min-w-0" onClick={handleExportCSV} disabled={!activeSession}>
              <FileSpreadsheet className="h-4 w-4 mr-1 flex-shrink-0" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="flex-1 min-w-0" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1 flex-shrink-0" />
              Print
            </Button>
            {activeSession?.eyeTrackingEnabled && (
              <Button variant="outline" size="sm" className="flex-1 min-w-0" onClick={handleExportAOI}>
                <Eye className="h-4 w-4 mr-1 flex-shrink-0" />
                AOI
              </Button>
            )}
            <Button variant="outline" size="sm" className="flex-1 min-w-0" onClick={() => setRetakeOpen(true)}>
              <RotateCcw className="h-4 w-4 mr-1 flex-shrink-0" />
              New Session
            </Button>
          </div>
        </div>
      </header>

      {/* Retake confirmation */}
      <AlertDialog open={retakeOpen} onOpenChange={setRetakeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start New Session</AlertDialogTitle>
            <AlertDialogDescription>
              This starts a fresh assessment for a new participant or session. All previous sessions remain available in the Session History dropdown — nothing is deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { resetAssessment(); navigate('/assessment'); }}
            >
              Start New Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="container px-4 py-6 space-y-6">
        {/* ── Session Selector ─────────────────────────────────────────────── */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Session History</h2>

          {/* Row 1: Participant + Mode */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Participant
              </label>
              <select
                className={SELECT_CLS}
                value={filterParticipant}
                onChange={e => setFilterParticipant(e.target.value)}
              >
                <option value="">All Participants</option>
                {participants.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Mode
              </label>
              <select
                className={SELECT_CLS}
                value={filterMode}
                onChange={e => setFilterMode(e.target.value)}
              >
                <option value="">All Modes</option>
                <option value="assessment">Assessment</option>
                <option value="rehabilitation">Rehabilitation</option>
                <option value="reassessment">Reassessment</option>
              </select>
            </div>
          </div>

          {/* Row 2: Session (full width) */}
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Session
            </label>
            {filteredSessions.length > 0 ? (
              <select
                className={SELECT_CLS}
                value={selectedSessionId}
                onChange={e => setSelectedSessionId(e.target.value)}
              >
                {filteredSessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {formatSessionLabel(s)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                No sessions match the selected filters.
              </div>
            )}
          </div>

          {/* Status line */}
          {filteredSessions.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Showing session {selectedIndex + 1} of {filteredSessions.length}
              {filterParticipant ? ` for ${filterParticipant}` : ''}
              {filterMode ? ` · ${filterMode === 'rehabilitation' ? 'Rehabilitation' : filterMode === 'reassessment' ? 'Reassessment' : 'Assessment'} mode` : ''}
            </p>
          )}
        </div>

        {/* ── Session Info ──────────────────────────────────────────────────── */}
        {activeSession && (
          <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Session ID</div>
                <div className="font-mono text-sm break-all">{activeSession.id}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Started</div>
                <div className="text-sm">{new Date(activeSession.startTime).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Assessment Mode</div>
                <div className="text-sm">
                  {activeSession.assessmentMode === 'rehabilitation'
                    ? 'Rehabilitation'
                    : activeSession.assessmentMode === 'reassessment'
                    ? 'Reassessment'
                    : 'Assessment'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Version</div>
                <div className="text-sm">{activeSession.version}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Analytics ────────────────────────────────────────────────────── */}
        {analytics ? (
          <AnalyticsDashboard analytics={analytics} />
        ) : (
          <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground text-sm">
            No data for the selected session.
          </div>
        )}

        {/* ── Open-Ended Responses ──────────────────────────────────────────── */}
        {activeSession?.moduleResults.some(m => m.openEndedResponse) && (
          <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Patient Responses</h3>
            <div className="space-y-4">
              {activeSession.moduleResults
                .filter(m => m.openEndedResponse)
                .map(result => {
                  const module = eadlModules.find(m => m.id === result.moduleId);
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
