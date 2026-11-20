import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  AudioWaveform,
  HelpCircle,
  Home,
  Lock
} from 'lucide-react';
import { ToastBanner } from './components/StudioComponents';
import { FaqPage } from './pages/FaqPage';
import { ImportPage } from './pages/ImportPage';
import { LandingPage } from './pages/LandingPage';
import { MatchingPage } from './pages/MatchingPage';
import { PreviewPage } from './pages/PreviewPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SummaryPage } from './pages/SummaryPage';
import { UnmatchedPage } from './pages/UnmatchedPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { useTuneShiftStore } from './state/useTuneShiftStore';

type AppRoute =
  | '/'
  | '/workspace'
  | '/import'
  | '/preview'
  | '/matching'
  | '/unmatched'
  | '/summary'
  | '/faq'
  | '/privacy';

const VALID_ROUTES = new Set<AppRoute>([
  '/',
  '/workspace',
  '/import',
  '/preview',
  '/matching',
  '/unmatched',
  '/summary',
  '/faq',
  '/privacy'
]);

function readCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') return '/';
  const raw = window.location.pathname as AppRoute;
  return VALID_ROUTES.has(raw) ? raw : '/';
}

export const App: React.FC = () => {
  const store = useTuneShiftStore();
  const [route, setRoute] = useState<AppRoute>(readCurrentRoute);

  const navigate = useCallback((nextRoute: AppRoute) => {
    if (typeof window !== 'undefined' && window.location.pathname !== nextRoute) {
      window.history.pushState({}, '', nextRoute);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(
    (fallback: AppRoute) => {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else {
        navigate(fallback);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const onPopState = () => {
      setRoute(readCurrentRoute());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!store.state.statusMessage) return;
    const timer = window.setTimeout(() => {
      store.clearStatusMessage();
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [store.state.statusMessage, store.clearStatusMessage]);

  const navigateToStep = useCallback(
    (step: number) => {
      switch (step) {
        case 1:
          navigate('/workspace');
          break;
        case 2:
          navigate('/import');
          break;
        case 3:
          navigate('/preview');
          break;
        case 4:
          navigate('/matching');
          break;
        default:
          navigate('/summary');
      }
    },
    [navigate]
  );

  const isTransferActive =
    route === '/workspace' ||
    route === '/import' ||
    route === '/preview' ||
    route === '/matching' ||
    route === '/unmatched' ||
    route === '/summary';

  const navItems: { label: string; route: AppRoute; active: boolean; icon: React.ReactNode }[] = [
    { label: 'Home', route: '/', active: route === '/', icon: <Home size={18} /> },
    {
      label: 'Transfer',
      route: '/workspace',
      active: isTransferActive,
      icon: <ArrowLeftRight size={18} />
    },
    { label: 'FAQ', route: '/faq', active: route === '/faq', icon: <HelpCircle size={18} /> },
    {
      label: 'Privacy',
      route: '/privacy',
      active: route === '/privacy',
      icon: <Lock size={18} />
    }
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button
            type="button"
            className="brand-button"
            onClick={() => navigate('/')}
          >
            <span className="brand-mark">
              <AudioWaveform size={19} />
            </span>
            <span>
              <span className="brand-name">TuneShift</span>
              <span className="brand-tagline">Your music. Anywhere.</span>
            </span>
          </button>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <button
                key={item.route}
                type="button"
                className={`nav-link ${item.active ? 'active' : ''}`}
                onClick={() => navigate(item.route)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main-container">
        {route === '/' && (
          <LandingPage
            savedPlaylists={store.state.savedPlaylists}
            migrationHistory={store.state.migrationHistory}
            onStartTransfer={() => navigate('/workspace')}
            onQuickImport={() => navigate('/import')}
            onOpenFaq={() => navigate('/faq')}
            onOpenPrivacy={() => navigate('/privacy')}
            onResumeSavedPlaylist={(id) => {
              const res = store.loadSavedPlaylist(id);
              if (res.loaded) {
                navigate(res.hasMatches ? '/matching' : '/preview');
              }
            }}
          />
        )}

        {route === '/workspace' && (
          <WorkspacePage
            sourcePlatform={store.state.sourcePlatform}
            destinationPlatform={store.state.destinationPlatform}
            tracks={store.state.tracks}
            matchCount={store.state.matchResults.length}
            destinationCatalog={store.state.destinationCatalog}
            destinationCatalogFileName={store.state.destinationCatalogFileName}
            savedPlaylists={store.state.savedPlaylists}
            onSelectSource={store.selectSourcePlatform}
            onSelectDestination={store.selectDestinationPlatform}
            onSwapPlatforms={store.swapPlatforms}
            onNavigateToStep={navigateToStep}
            onContinueToImport={() => navigate('/import')}
            onImportReferenceCatalog={store.importDestinationCatalogCsv}
            onLoadSampleCatalog={store.loadSampleDestinationCatalog}
            onClearReferenceCatalog={store.clearDestinationCatalog}
            onLoadSavedPlaylist={(id) => {
              const res = store.loadSavedPlaylist(id);
              if (res.loaded) {
                navigate(res.hasMatches ? '/matching' : '/preview');
              }
            }}
            onDeleteSavedPlaylist={store.deleteSavedPlaylist}
            onStartFreshTransfer={store.startFreshTransfer}
            onShowMessage={store.showMessage}
          />
        )}

        {route === '/import' && (
          <ImportPage
            playlistName={store.state.playlistName}
            sourcePlatform={store.state.sourcePlatform}
            destinationPlatform={store.state.destinationPlatform}
            importMethod={store.state.importMethod}
            structuredTextInput={store.state.structuredTextInput}
            importedFileName={store.state.importedFileName}
            detectedFormatLabel={store.state.detectedFormatLabel}
            importWarnings={store.state.importWarnings}
            importError={store.state.importError}
            tracks={store.state.tracks}
            matchCount={store.state.matchResults.length}
            onBack={() => goBack('/workspace')}
            onNavigateToStep={navigateToStep}
            onSelectImportMethod={store.setImportMethod}
            onUpdatePlaylistName={store.updatePlaylistName}
            onUpdateStructuredText={store.updateStructuredText}
            onInsertExampleTracklist={store.insertExampleTracklist}
            onImportCsvContent={(content, name) => {
              if (store.importFromCsvContent(content, name)) {
                navigate('/preview');
              }
            }}
            onParseStructuredText={() => {
              if (store.importFromStructuredText()) {
                navigate('/preview');
              }
            }}
            onAddManualTrack={store.addManualTrack}
            onGoToPreview={() => navigate('/preview')}
            onDismissError={store.clearImportError}
          />
        )}

        {route === '/preview' && (
          <PreviewPage
            playlistName={store.state.playlistName}
            sourcePlatform={store.state.sourcePlatform}
            destinationPlatform={store.state.destinationPlatform}
            tracks={store.state.tracks}
            selectedTrackCount={store.selectedTrackCount}
            duplicateTrackCount={store.duplicateTrackCount}
            totalDurationFormatted={store.totalDurationFormatted}
            matchCount={store.state.matchResults.length}
            onBack={() => goBack('/import')}
            onNavigateToStep={navigateToStep}
            onToggleTrack={store.toggleTrackSelection}
            onSelectAll={store.selectAllTracks}
            onDeselectAll={store.deselectAllTracks}
            onDeselectDuplicates={store.deselectDuplicates}
            onRemoveTrack={store.removeTrack}
            onRunMatching={() => {
              if (store.runMatchingEngine()) {
                navigate('/matching');
              }
            }}
            onGoToImport={() => navigate('/import')}
          />
        )}

        {route === '/matching' && (
          <MatchingPage
            destinationPlatform={store.state.destinationPlatform}
            destinationCatalog={store.state.destinationCatalog}
            destinationCatalogFileName={store.state.destinationCatalogFileName}
            matchResults={store.state.matchResults}
            matchFilter={store.state.matchFilter}
            summary={store.summary}
            onBack={() => goBack('/preview')}
            onNavigateToStep={navigateToStep}
            onSelectFilter={store.setMatchFilter}
            onConfirmMatch={store.confirmMatch}
            onRejectMatch={store.rejectMatch}
            onSkipTrack={store.skipTrack}
            onUnskipTrack={store.unskipAndRetryTrack}
            onSearchCatalog={store.searchReplacementCandidates}
            onApplyManualCorrection={store.applyManualMatchCorrection}
            onEditAndRetry={store.editTrackAndRetryMatch}
            onApplyCandidate={store.selectReplacementCandidate}
            onOpenUnmatchedScreen={() => navigate('/unmatched')}
            onContinueToSummary={() => navigate('/summary')}
            onRunMatchingAgain={store.runMatchingEngine}
          />
        )}

        {route === '/unmatched' && (
          <UnmatchedPage
            unmatchedTracks={store.unmatchedTracksList}
            skippedTracks={store.skippedTracksList}
            destinationCatalog={store.state.destinationCatalog}
            onBack={() => goBack('/matching')}
            onSearchCatalog={store.searchReplacementCandidates}
            onSelectReplacement={store.selectReplacementCandidate}
            onEditAndRetry={store.editTrackAndRetryMatch}
            onApplyManualReplacement={store.applyManualMatchCorrection}
            onSkipTrack={store.skipTrack}
            onUnskipTrack={store.unskipAndRetryTrack}
            onRetryAllUnmatched={store.retryAllUnmatched}
            onBuildUnmatchedExport={store.buildUnmatchedExportPayload}
            onRecordExportCompleted={store.recordExportCompleted}
            onShowMessage={store.showMessage}
            onGoToSummary={() => navigate('/summary')}
          />
        )}

        {route === '/summary' && (
          <SummaryPage
            playlistName={store.state.playlistName}
            sourcePlatform={store.state.sourcePlatform}
            destinationPlatform={store.state.destinationPlatform}
            matchResults={store.state.matchResults}
            confirmedExportable={store.confirmedExportableMatches}
            unmatchedList={store.unmatchedTracksList}
            includeNeedsReviewInExport={store.state.includeNeedsReviewInExport}
            lastExportedFileName={store.state.lastExportedFileName}
            lastExportedFormat={store.state.lastExportedFormat}
            summary={store.summary}
            onBack={() => goBack('/matching')}
            onNavigateToStep={navigateToStep}
            onToggleIncludeNeedsReview={store.toggleIncludeNeedsReviewInExport}
            onBuildConfirmedExport={store.buildConfirmedExportPayload}
            onBuildUnmatchedExport={store.buildUnmatchedExportPayload}
            onRecordExportCompleted={store.recordExportCompleted}
            onShowMessage={store.showMessage}
            onOpenUnmatchedScreen={() => navigate('/unmatched')}
            onOpenMatchReview={() => navigate('/matching')}
            onOpenFaqRoadmap={() => navigate('/faq')}
            onStartAnotherTransfer={() => {
              store.startFreshTransfer();
              navigate('/workspace');
            }}
          />
        )}

        {route === '/faq' && <FaqPage />}

        {route === '/privacy' && (
          <PrivacyPage
            savedCount={store.state.savedPlaylists.length}
            historyCount={store.state.migrationHistory.length}
            onClearAllLocalData={store.clearAllLocalData}
          />
        )}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <button
            key={item.route}
            type="button"
            className={`mobile-nav-btn ${item.active ? 'active' : ''}`}
            onClick={() => navigate(item.route)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <ToastBanner message={store.state.statusMessage} onClose={store.clearStatusMessage} />
    </div>
  );
};

export default App;
