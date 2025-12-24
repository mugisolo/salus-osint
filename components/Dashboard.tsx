import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Map as MapIcon, Users, BrainCircuit, Bell, Search, 
  Menu, ShieldAlert, TrendingUp, Radio, Landmark, LogOut, FileText, 
  ChevronRight, CheckCircle, AlertTriangle, Table, Database, Lock, 
  CloudUpload, Loader2, RefreshCw, Globe, Sparkles
} from 'lucide-react';
import { StatCard } from './StatCard';
import { ViolenceMap } from './ViolenceMap';
import { ConstituencyMap } from './ConstituencyMap';
import { CandidateList } from './CandidateList';
import { ReportAnalyzer } from './ReportAnalyzer';
import { ParliamentaryAnalytics } from './ParliamentaryAnalytics';
import { DailyOpEd } from './DailyOpEd';
import { Chatbot } from './Chatbot';
import { ViewState, Incident, Candidate, ParliamentaryCandidate } from '../types';
import { PARLIAMENTARY_DATA } from '../data/parliamentaryData';
import { liveDataService } from '../services/liveDataService';
import { syncLatestOSINT } from '../services/geminiService';
import { db } from '../firebaseConfig';
import { 
  subscribeToIncidents, subscribeToPresidential, subscribeToParliamentary,
  addIncidentToDb, deleteIncidentFromDb, addPresidentialToDb, 
  deletePresidentialFromDb, addParliamentaryToDb, deleteParliamentaryFromDb, seedDatabase
} from '../services/firestoreService';

interface DashboardProps {
  onReturnToSite: () => void;
}

const getRelativeDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// --- OSINT DATA: JANUARY - FEBRUARY 2025 ONLY ---
const MOCK_INCIDENTS: Incident[] = [
  { 
    id: 'inc-2025-01', 
    date: '2025-02-14',
    location: 'Kampala CBD (City Square)', 
    latitude: 0.3142, longitude: 32.5859, 
    type: 'Protest', fatalities: 0, injuries: 8, 
    description: 'Youth protest against the dissolution of UCDA and the new coffee regulations. Dispersed by tear gas and water cannons.', 
    verified: true,
    osintReport: {
      sourceReliability: 'A - Completely Reliable', credibilityScore: 95,
      verifiedSources: ['NTV Uganda', 'Daily Monitor Live', 'Human Rights Network'],
      aiAnalysis: 'High-density urban protest. Sentiment analysis of social media shows significant "Coffee Bill" agitation among youth. Logistics suggest decentralized mobilization.',
      timeline: [{ time: '10:15', event: 'First group converges near Parliament' }, { time: '11:45', event: 'Police engagement initiated' }]
    }
  },
  { 
    id: 'inc-2025-02', 
    date: '2025-02-08',
    location: 'Wakiso (Entebbe Road)', 
    latitude: 0.1234, longitude: 32.4567, 
    type: 'Arrest', fatalities: 0, injuries: 0, 
    description: 'Pre-emptive detention of three regional NUP coordinators ahead of a planned mobilization tour.', 
    verified: true,
    osintReport: {
      sourceReliability: 'B - Usually Reliable', credibilityScore: 92,
      verifiedSources: ['Official NUP Handle', 'Local Media Hub'],
      aiAnalysis: 'Part of a broader strategy to disrupt opposition supply lines in the Central Region. No violence reported during arrest.',
      timeline: [{ time: '04:30', event: 'Simultaneous raids on coordinator residences' }]
    }
  },
  { 
    id: 'inc-2025-03', 
    date: '2025-01-28',
    location: 'Jinja City', 
    latitude: 0.4479, longitude: 33.2026, 
    type: 'Violence', fatalities: 1, injuries: 12, 
    description: 'Clash between rival youth brigades during a PLU (Patriotic League of Uganda) regional launch event.', 
    verified: true,
    osintReport: {
      sourceReliability: 'B - Usually Reliable', credibilityScore: 85,
      verifiedSources: ['Nile Post', 'Police Statement'],
      aiAnalysis: 'Intra-political friction escalates to physical violence. Fatal injury confirmed by hospital records. Area remains tense with security patrols.',
      timeline: [{ time: '15:00', event: 'Heated verbal exchange at rally venue' }, { time: '16:30', event: 'Physical altercation breaks out' }]
    }
  },
  { 
    id: 'inc-2025-04', 
    date: '2025-01-15',
    location: 'Moroto', 
    latitude: 2.5345, longitude: 34.6666, 
    type: 'Intimidation', fatalities: 0, injuries: 2, 
    description: 'Reports of armed personnel intimidating voters at a local council primary election registration center.', 
    verified: false,
    osintReport: {
      sourceReliability: 'C - Fairly Reliable', credibilityScore: 65,
      verifiedSources: ['Community Radio Call-in', 'Election Observer Report'],
      aiAnalysis: 'Unverified field report. Localized intimidation consistent with regional power-struggle patterns. Low impact on national metrics.',
      timeline: [{ time: '09:00', event: 'Registration center opens' }]
    }
  }
];

const MOCK_CANDIDATES: Candidate[] = [
  { 
    id: 'c1', 
    name: 'Yoweri Tibuhaburwa Kaguta Museveni', 
    party: 'NRM', 
    district: 'National', 
    sentimentScore: 52, 
    mentions: 48500, 
    projectedVoteShare: 54.2, 
    imageUrl: '', 
    notes: 'Incumbent. Early 2025 focus on PDM wealth creation and stabilizing intra-party PLU dynamics.' 
  },
  { 
    id: 'c2', 
    name: 'Robert Kyagulanyi Ssentamu (Bobi Wine)', 
    party: 'NUP', 
    district: 'National', 
    sentimentScore: 69, 
    mentions: 55000, 
    projectedVoteShare: 39.1, 
    imageUrl: '', 
    notes: 'Lead opposition figure. Intense 2025 mobilization around the Coffee Bill protests and international advocacy.' 
  },
  { 
    id: 'c3', 
    name: 'Mugisha Gregory Muntu Oyera', 
    party: 'ANT', 
    district: 'National', 
    sentimentScore: 58, 
    mentions: 12500, 
    projectedVoteShare: 2.4, 
    imageUrl: '', 
    notes: 'Focusing on institutional building and moderate voters. Seen as a stabilizer in 2025 coalition talks.' 
  },
  { 
    id: 'c4', 
    name: 'James Nathan Nandala Mafabi', 
    party: 'FDC', 
    district: 'National', 
    sentimentScore: 46, 
    mentions: 15800, 
    projectedVoteShare: 3.1, 
    imageUrl: '', 
    notes: 'Managing internal FDC Najjanankumbi vs Katonga rift. Strong base in Eastern region.' 
  },
  { 
    id: 'c5', 
    name: "Mubarak Munyagwa Sserunga", 
    party: 'CMP', 
    district: 'National', 
    sentimentScore: 44, 
    mentions: 8200, 
    projectedVoteShare: 0.7, 
    imageUrl: '', 
    notes: 'Common Man\'s Party leader. High social media visibility through populist rhetoric.' 
  },
  { 
    id: 'c6', 
    name: 'Elton Joseph Mabirizi', 
    party: 'CP', 
    district: 'National', 
    sentimentScore: 41, 
    mentions: 4500, 
    projectedVoteShare: 0.3, 
    imageUrl: '', 
    notes: 'Conservative Party standard bearer focusing on cultural heritage and federalism.' 
  },
  { 
    id: 'c7', 
    name: 'Frank Bulira Kabinga', 
    party: 'RPP', 
    district: 'National', 
    sentimentScore: 39, 
    mentions: 3100, 
    projectedVoteShare: 0.2, 
    imageUrl: '', 
    notes: 'Revolutionary People\'s Party. Advocacy for radical socio-economic restructuring.' 
  },
  { 
    id: 'c8', 
    name: 'Robert Kasibante', 
    party: 'NPP', 
    district: 'National', 
    sentimentScore: 43, 
    mentions: 2900, 
    projectedVoteShare: 0.1, 
    imageUrl: '', 
    notes: 'National Peasants Party. Concentrating on grassroots agricultural reforms and farmer cooperatives.' 
  }
];

export const Dashboard: React.FC<DashboardProps> = ({ onReturnToSite }) => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [presidentialCandidates, setPresidentialCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [parliamentaryCandidates, setParliamentaryCandidates] = useState<ParliamentaryCandidate[]>(PARLIAMENTARY_DATA);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(!!db);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isDbEmpty, setIsDbEmpty] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [stats, setStats] = useState({
    violenceIndex: '0.0',
    activeIncidents: 0,
    daysToElection: 0,
    sentiment: 'Analyzing...',
    sentimentColor: 'text-slate-200'
  });

  useEffect(() => {
    if (!db) return;
    const unsubIncidents = subscribeToIncidents(data => { 
        if (data.length > 0) { 
            // Filter 2025 only from DB too
            const freshData = data.filter(d => d.date.startsWith('2025'));
            if (freshData.length > 0) setIncidents(freshData); 
            setIsDbEmpty(false); 
        } 
    }, err => {}, () => setIsDbEmpty(true));
    const unsubPresidential = subscribeToPresidential(data => { if (data.length > 0) setPresidentialCandidates(data); });
    const unsubParliamentary = subscribeToParliamentary(data => { if (data.length > 0) setParliamentaryCandidates(data); });
    return () => { unsubIncidents(); unsubPresidential(); unsubParliamentary(); };
  }, []);

  useEffect(() => {
    const targetDate = new Date('2026-01-14T00:00:00');
    const days = Math.ceil(Math.abs(targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    // Recent = last 30 days of 2025
    const recentIncidents = incidents.filter(inc => {
        const diff = new Date().getTime() - new Date(inc.date).getTime();
        return diff < (30 * 24 * 60 * 60 * 1000) && inc.date.startsWith('2025');
    });
    
    let totalSeverity = 0;
    incidents.forEach(inc => {
        let base = 1;
        if (inc.type === 'Violence') base = 8;
        else if (inc.type === 'Protest') base = 5;
        totalSeverity += base + (inc.fatalities * 5) + (inc.injuries * 0.5);
    });
    const vIndex = Math.min(10, (totalSeverity / Math.max(1, incidents.length)) * 1.5).toFixed(1);

    const weightedSentiment = presidentialCandidates.reduce((acc, c) => acc + (c.sentimentScore * (c.projectedVoteShare || 1)), 0) / (presidentialCandidates.reduce((acc, c) => acc + (c.projectedVoteShare || 1), 0) || 1);
    let sentLabel = weightedSentiment > 60 ? 'Optimistic' : weightedSentiment > 45 ? 'Tense' : 'Volatile';
    let sentColor = weightedSentiment > 60 ? 'green' : weightedSentiment > 45 ? 'orange' : 'red';

    setStats({ violenceIndex: vIndex, activeIncidents: recentIncidents.length, daysToElection: days, sentiment: sentLabel, sentimentColor: sentColor });
  }, [incidents, presidentialCandidates]);

  const handleSyncOSINT = async () => {
      setIsSyncing(true);
      try {
          const result = await syncLatestOSINT();
          
          if (result.incidents && result.incidents.length > 0) {
              // Strictly 2025 filter
              const freshIncidents = result.incidents.filter(i => i.date.startsWith('2025'));
              const mergedIncidents = [...freshIncidents, ...incidents].slice(0, 100);
              setIncidents(mergedIncidents);
              if (db) freshIncidents.forEach(i => addIncidentToDb(i));
          }

          if (result.candidates && result.candidates.length > 0) {
              const updatedCands = presidentialCandidates.map(c => {
                  const match = result.candidates.find(r => r.name?.includes(c.name) || c.name.includes(r.name || ''));
                  return match ? { ...c, sentimentScore: match.sentimentScore || c.sentimentScore, mentions: match.mentions || c.mentions } : c;
              });
              setPresidentialCandidates(updatedCands);
          }
          alert("OSINT Synchronized: 2025 Intelligence Briefing Ready.");
      } catch (err) {
          alert("OSINT Sync Interrupted. Check API Key permissions.");
      } finally {
          setIsSyncing(false);
      }
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Violence Intensity Index" value={stats.violenceIndex} change={Number(stats.violenceIndex) > 6 ? "High Alert" : "Stable"} changeType={Number(stats.violenceIndex) > 6 ? "negative" : "positive"} icon={ShieldAlert} color="red" />
              <StatCard title="Active Incidents (2025)" value={stats.activeIncidents} change={stats.activeIncidents > 2 ? "Surging" : "Stable"} icon={Bell} color="orange" />
              <StatCard title="Election Countdown" value={`${stats.daysToElection} Days`} icon={Radio} color="blue" />
              <StatCard title="Voter Sentiment" value={stats.sentiment} icon={TrendingUp} color={stats.sentimentColor} />
            </div>
            <div onClick={() => setCurrentView(ViewState.DAILY_OPED)} className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-6 cursor-pointer hover:border-purple-400 transition-all group relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                   <div className="p-3 bg-purple-500/20 rounded-full text-purple-300"><FileText size={24} /></div>
                   <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">Feb 2025 Situation Report <ChevronRight size={18} /></h3>
                      <h3 className="text-slate-300 text-sm">Forensic analysis of the UCDA coffee bill protests and Jinja PLU mobilization risks.</h3>
                   </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2"><ViolenceMap incidents={incidents} onUpdateIncidents={setIncidents} /></div>
              <div className="lg:col-span-1">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 h-full">
                  <h3 className="text-xl font-semibold text-white mb-6">2025 Security Feed</h3>
                  <div className="space-y-6">
                    {incidents.slice(0, 4).map(inc => (
                      <div key={inc.id} className="flex gap-4 pb-4 border-b border-slate-700/50 last:border-0">
                        <div className={`w-2.5 h-full min-h-[48px] rounded-full ${inc.type === 'Violence' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1">
                          <p className="text-base text-white font-medium">{inc.location}</p>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{inc.description}</p>
                          <span className="text-[10px] text-slate-500 uppercase mt-1 block font-bold">{inc.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <CandidateList candidates={presidentialCandidates} onUpdateCandidates={setPresidentialCandidates} />
          </div>
        );
      case ViewState.VIOLENCE_MAP: return <div className="h-full flex flex-col gap-8"><div className="bg-slate-800 p-8 rounded-xl border border-slate-700"><h2 className="text-3xl font-bold text-white mb-3">2025 Security Incident Log</h2><p className="text-slate-400">Strict 90-day monitoring window (No 2024 data).</p></div><ViolenceMap incidents={incidents} onUpdateIncidents={setIncidents} fullScreen /></div>;
      case ViewState.ELECTION_MAP: return <ConstituencyMap candidates={parliamentaryCandidates} onUpdateCandidates={setParliamentaryCandidates} />;
      case ViewState.CANDIDATES: return <CandidateList candidates={presidentialCandidates} onUpdateCandidates={setPresidentialCandidates} />;
      case ViewState.ANALYSIS: return <ReportAnalyzer />;
      case ViewState.PARLIAMENTARY: return <ParliamentaryAnalytics candidates={parliamentaryCandidates} onUpdateCandidates={setParliamentaryCandidates} />;
      case ViewState.DAILY_OPED: return <DailyOpEd incidents={incidents} candidates={presidentialCandidates} />;
      default: return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans selection:bg-blue-500/30 relative">
      {isSyncing && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex flex-col items-center justify-center text-center p-6">
              <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>
                  <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tighter">2025 OSINT Core Active</h2>
              <div className="space-y-2 max-w-md">
                <p className="text-blue-400 font-mono text-xs animate-pulse tracking-widest">CRAWLING FEB 2025 NEWS FEEDS...</p>
                <p className="text-purple-400 font-mono text-xs animate-pulse delay-75 tracking-widest">FILTERING OUT 2024 ARCHIVES...</p>
                <p className="text-green-400 font-mono text-xs animate-pulse delay-150 tracking-widest">MAPPING RECENT COFFEE BILL PROTESTS...</p>
              </div>
          </div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4"><span className="font-bold text-white text-lg">S</span></div>
          <span className="font-bold text-2xl tracking-tight text-white">SALUS</span>
        </div>
        <nav className="p-6 space-y-2">
          {[{v: ViewState.DASHBOARD, l: '2025 Dashboard', i: LayoutDashboard}, {v: ViewState.VIOLENCE_MAP, l: '2025 Incident Log', i: Table}, {v: ViewState.ELECTION_MAP, l: 'Constituency Data', i: Table}, {v: ViewState.CANDIDATES, l: 'Presidential', i: Users}, {v: ViewState.PARLIAMENTARY, l: 'Parliamentary', i: Landmark}, {v: ViewState.DAILY_OPED, l: '2025 SitRep', i: FileText}, {v: ViewState.ANALYSIS, l: 'Political Intel', i: BrainCircuit}].map(item => (
             <button key={item.v} onClick={() => { setCurrentView(item.v); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-colors ${currentView === item.v ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
                <item.i size={22} /> <span className="font-medium text-base">{item.l}</span>
             </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800">
           <button onClick={handleSyncOSINT} className="w-full mb-4 flex items-center justify-center gap-3 px-4 py-3 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-all font-bold text-xs uppercase tracking-widest">
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> Refresh 2025 Feed
           </button>
           <button onClick={onReturnToSite} className="w-full flex items-center gap-4 px-5 py-4 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><LogOut size={20} /><span className="font-medium text-base">Exit Dashboard</span></button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col lg:ml-72 transition-all duration-300 print:ml-0 print:w-full">
        <header className="h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-8 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-slate-400 hover:text-white"><Menu size={28} /></button>
            <h1 className="text-xl font-semibold text-white hidden sm:block">Political Intelligence Dashboard</h1>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
                <Globe size={12} /> 2025 FEED ACTIVE
             </div>
             <button className="relative text-slate-400 hover:text-white"><Bell size={24} /><span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span></button>
          </div>
        </header>
        <main className="p-8 flex-1 overflow-y-auto print:p-0"><div className="max-w-7xl mx-auto h-full print:max-w-none">{renderContent()}</div></main>
      </div>
      <Chatbot />
      {isMobileMenuOpen && (<div className="fixed inset-0 bg-black/50 z-40 lg:hidden print:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>)}
    </div>
  );
}