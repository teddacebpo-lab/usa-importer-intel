
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { searchImporters, fetchDetailedImporterData, searchSimilarImporters } from './services/geminiService';
import type { ImporterSummary, DetailedImporterResult, Subscription, Notification, ContactInfo, ParsedImporterData } from './types';
import { ImporterCard } from './components/ImporterCard';
import { ImporterSummaryCard } from './components/ImporterSummaryCard';
import { Spinner } from './components/Spinner';
import { ShipLoadingAnimation } from './components/ShipLoadingAnimation';
import { BellIcon, SearchIcon, ArrowPathIcon, BuildingOfficeIcon, GlobeIcon, ChartBarIcon, XCircleIcon } from './components/icons';
import { AlertModal } from './components/AlertModal';
import { NotificationPanel } from './components/NotificationPanel';
import { DetailedViewModal } from './components/DetailedViewModal';

const FilterIconComp: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
);

interface SearchFormProps {
    query: string;
    setQuery: (q: string) => void;
    city: string;
    setCity: (c: string) => void;
    state: string;
    setState: (s: string) => void;
    industry: string;
    setIndustry: (i: string) => void;
    isAdvancedOpen: boolean;
    setIsAdvancedOpen: (isOpen: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ 
    query, setQuery, 
    city, setCity,
    state, setState,
    industry, setIndustry,
    isAdvancedOpen, setIsAdvancedOpen,
    onSubmit, onCancel, isLoading 
}) => {
    const [validationError, setValidationError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isLoading) inputRef.current?.focus();
    }, [isLoading]);

    const inputClass = "block w-full border-none rounded-2xl bg-slate-800/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-base sm:text-sm shadow-inner";
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            setValidationError("Please enter an importer name or industry.");
            return;
        }
        setValidationError(null);
        onSubmit(e);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full group">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (validationError) setValidationError(null);
                        }}
                        placeholder="Importer name, commodity, HS Code, Port Examiner..."
                        className={`${inputClass} pl-12 pr-4 py-4.5`}
                        disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {isLoading ? <Spinner /> : <SearchIcon className="h-6 w-6 text-slate-500 group-focus-within:text-orange-500 transition-colors" />}
                    </div>
                </div>
                {isLoading ? (
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="bg-slate-800 hover:bg-orange-600/20 text-orange-500 border border-orange-500/30 font-black py-4 px-8 rounded-2xl transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
                    >
                        <XCircleIcon className="h-5 w-5" />
                        <span>Cancel Task</span>
                    </button>
                ) : (
                    <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
                    >
                        <SearchIcon className="h-5 w-5" />
                        <span>Run Intelligence</span>
                    </button>
                )}
            </div>
            
            <div className="flex flex-wrap items-center justify-between mt-4 px-2 gap-4">
                <div className="flex-grow">
                    {validationError && (
                        <p className="text-sm text-orange-400 font-bold animate-in slide-in-from-left-2">{validationError}</p>
                    )}
                </div>
                <button 
                    type="button" 
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-all bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/50"
                >
                    <FilterIconComp className="h-3.5 w-3.5" />
                    {isAdvancedOpen ? 'Hide Parameters' : 'Refine Search'}
                </button>
            </div>

            {isAdvancedOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 p-6 bg-slate-800/50 rounded-3xl border border-slate-700/30 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">City Focus</label>
                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Los Angeles" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-orange-500 transition-colors text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">State Territory</label>
                        <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. California" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-orange-500 transition-colors text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Industry Sector</label>
                        <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Tech, USITC Category" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-orange-500 transition-colors text-sm" />
                    </div>
                </div>
            )}
        </form>
    );
};

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshingDetails, setIsRefreshingDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ImporterSummary[]>([]);
  const [similarResults, setSimilarResults] = useState<ImporterSummary[]>([]);
  const [selectedImporter, setSelectedImporter] = useState<DetailedImporterResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [alertCompanyName, setAlertCompanyName] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState<boolean>(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const storedSubscriptions = localStorage.getItem('importerIntel-subscriptions');
      if (storedSubscriptions) setSubscriptions(JSON.parse(storedSubscriptions));
      const storedNotifications = localStorage.getItem('importerIntel-notifications');
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('importerIntel-subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);
  useEffect(() => {
    localStorage.setItem('importerIntel-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const cancelSearch = useCallback(() => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setIsLoading(false);
        setError("Search task was cancelled by user.");
    }
  }, []);

  const triggerSearch = useCallback(async (searchParams: { query: string; city: string; state: string; industry: string; }) => {
    const { query, city, state, industry } = searchParams;
    if ((!query.trim() && !city.trim() && !state.trim() && !industry.trim()) || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

 try {
  const [results, similar] = await Promise.all([
    searchImporters({ query, city, state, industry }),
    searchSimilarImporters(query || industry)
  ]);

  setResults(results);
  setSimilarResults(similar);

} catch (err: any) {
  console.error('Indexing error:', err);

  if (err.name === 'AbortError') {
    setError('Search operation terminated.');
  } else {
    setError(err.message || 'Network latency detected.');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading]);

  const handleViewDetails = useCallback(async (importerName: string) => {
    const summary = [...results, ...similarResults].find(r => r.importerName === importerName);
    if (!summary) return;

    setSelectedImporter({
      parsedData: {
        importerName: summary.importerName,
        location: summary.location,
        lastShipmentDate: summary.lastShipmentDate,
        commodities: summary.primaryCommodities,
        information: '',
        shipmentActivity: '',
        shipmentCounts: { lastMonth: '...', lastQuarter: '...', lastYear: '...' },
        shipmentHistory: [],
        shipmentVolumeHistory: [],
        contact: { phone: '...', website: '...', email: '...', address: '...' },
        riskAssessment: { financialStability: 'Pending...', regulatoryCompliance: 'Pending...', geopoliticalRisk: 'Pending...' },
        topTradePartners: [],
        topCommodityFlows: [],
        topSuppliers: [],
      }
    });
    setIsModalOpen(true);

    try {
      const fullData = await fetchDetailedImporterData(importerName, summary);
      setSelectedImporter(fullData);
    } catch (err: any) {
        setError("Failed to resolve detailed CBP logs.");
    }
  }, [results, similarResults]);

  const handleRefreshDetails = useCallback(async (name: string) => {
    setIsRefreshingDetails(true);
    try {
        const fullData = await fetchDetailedImporterData(name);
        setSelectedImporter(fullData);
    } catch (e) {} finally {
        setIsRefreshingDetails(false);
    }
  }, []);

  const deleteNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-orange-500/30">
        <header className="fixed top-0 inset-x-0 h-20 border-b border-orange-600 bg-slate-950/80 backdrop-blur-xl z-40">
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-b border-orange-600 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/40">
                        <GlobeIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white">Importer<span className="text-orange-500">Intel</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        ref={notificationButtonRef}
                        onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                        className="p-3 rounded-xl text-slate-400 bg-slate-900 hover:bg-slate-800 hover:text-orange-500 transition-all relative"
                    >
                        <BellIcon className="w-6 h-6" />
                        {notifications.length > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-orange-600 animate-pulse"></span>
                        )}
                    </button>
                    {isNotificationPanelOpen && (
                        <NotificationPanel
                            notifications={notifications}
                            onClose={() => setIsNotificationPanelOpen(false)}
                            onClearAll={() => setNotifications([])}
                            onDelete={deleteNotification}
                            parentRef={notificationButtonRef}
                        />
                    )}
                </div>
            </div>
        </header>

        <main className="flex-grow max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center w-full">
            {results.length === 0 && !isLoading && (
                <div className="w-full max-w-4xl text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white mb-6">
                        Find any US <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">Importer</span> details.
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">
                        Auditing Port Examiner, USITC, and Census manifest logs for real-time trade signals.
                    </p>
                </div>
            )}

            <div className={`w-full max-w-4xl transition-all duration-500 ${results.length > 0 ? 'mb-12' : 'mb-24'}`}>
                <SearchForm 
                    query={query} setQuery={setQuery}
                    city={city} setCity={setCity}
                    state={state} setState={setState}
                    industry={industry} setIndustry={setIndustry}
                    isAdvancedOpen={isAdvancedSearchOpen}
                    setIsAdvancedOpen={setIsAdvancedSearchOpen}
                    onSubmit={() => triggerSearch({ query, city, state, industry })}
                    onCancel={cancelSearch}
                    isLoading={isLoading}
                />
            </div>

            {isLoading && (
                <div className="w-full max-w-2xl">
                    <ShipLoadingAnimation />
                    <div className="text-center mt-4">
                        <button 
                            onClick={cancelSearch}
                            className="text-xs font-black text-slate-500 hover:text-orange-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto px-4 py-2 border border-slate-800 rounded-full hover:bg-orange-500/5"
                        >
                            <XCircleIcon className="w-4 h-4" />
                            Abort Sequence
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-orange-950/20 border border-orange-500/30 p-6 rounded-3xl text-orange-400 text-center max-w-lg mb-10 flex flex-col items-center gap-2">
                    <span className="font-bold">{error}</span>
                    <button onClick={() => setError(null)} className="text-[10px] font-black uppercase tracking-widest hover:underline">Dismiss</button>
                </div>
            )}

            {!isLoading && results.length > 0 && (
                <div className="w-full max-w-4xl space-y-20">
                    <section>
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h2 className="text-2xl font-black text-white tracking-tight">Consignee Intelligence</h2>
                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{results.length} Entities Found</span>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {results.map((r, i) => (
                                <ImporterSummaryCard key={i} summary={r} onViewDetails={handleViewDetails} />
                            ))}
                        </div>
                    </section>

                    {similarResults.length > 0 && (
                        <section className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800/50">
                            <h2 className="text-2xl font-black text-white tracking-tight mb-8">Related Trade Entities</h2>
                            <div className="grid grid-cols-1 gap-6">
                                {similarResults.map((r, i) => (
                                    <ImporterSummaryCard key={i} summary={r} onViewDetails={handleViewDetails} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </main>

        <footer className="w-full py-10 border-t border-slate-800 bg-slate-950 text-center no-print">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] transition-all hover:text-orange-500 cursor-default">
                Powered by JUNAID ABBASI
            </p>
        </footer>

        {isModalOpen && selectedImporter && (
            <DetailedViewModal onClose={() => setIsModalOpen(false)}>
                <ImporterCard 
                    data={selectedImporter.parsedData}
                    onClose={() => setIsModalOpen(false)}
                    onRefresh={handleRefreshDetails}
                    isRefreshing={isRefreshingDetails}
                    onSubscribe={(name) => { setAlertCompanyName(name); setIsAlertModalOpen(true); }}
                    onExport={() => {}} 
                    onExportPDF={() => window.print()}
                    onExportJSON={() => {}}
                    onSearchSimilar={(name) => { setIsModalOpen(false); setQuery(name); triggerSearch({query: name, city: '', state: '', industry: ''}); }}
                />
            </DetailedViewModal>
        )}

        {isAlertModalOpen && (
            <AlertModal 
                companyName={alertCompanyName} 
                onClose={() => setIsAlertModalOpen(false)}
                onSubscribe={(name, email) => {
                    setSubscriptions(prev => [...prev, { companyName: name, email }]);
                    setNotifications(prev => [{ id: Date.now().toString(), message: `Alert activated for ${name}`, timestamp: Date.now() }, ...prev]);
                    setIsAlertModalOpen(false);
                }}
                subscriptions={subscriptions}
            />
        )}
    </div>
  );
};

export default App;
