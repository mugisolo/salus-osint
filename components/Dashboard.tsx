import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Users, 
  BrainCircuit, 
  Bell, 
  Search, 
  Menu,
  ShieldAlert,
  TrendingUp,
  Radio,
  Landmark,
  LogOut,
  FileText,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Table,
  Database,
  Lock
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
// Import Firebase Services
import { db } from '../firebaseConfig';
import { 
  subscribeToIncidents, 
  subscribeToPresidential, 
  subscribeToParliamentary,
  addIncidentToDb,
  deleteIncidentFromDb,
  addPresidentialToDb,
  deletePresidentialFromDb,
  addParliamentaryToDb,
  deleteParliamentaryFromDb,
  seedDatabase
} from '../services/firestoreService';

interface DashboardProps {
  onReturnToSite: () => void;
}

// Helper to generate dynamic dates relative to today
const getRelativeDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// --- MOCK DATA (Kept for fallback and seeding) ---
const MOCK_INCIDENTS: Incident[] = [
  { 
    id: '1', 
    date: getRelativeDate(0), // Today
    location: 'Kampala Central', 
    latitude: 0.3476, 
    longitude: 32.5825, 
    type: 'Protest', 
    fatalities: 0, 
    injuries: 5, 
    description: 'Opposition rally dispersed near City Square.', 
    verified: true,
    osintReport: {
      sourceReliability: 'B - Usually Reliable',
      credibilityScore: 85,
      verifiedSources: ['Daily Monitor Live Feed', 'Kampala Metro Police Twitter'],
      aiAnalysis: 'Video analysis confirms use of teargas. Crowd density approx 300-400. Geolocation matches City Square landmarks. Sentiment in local WhatsApp groups highly agitated.',
      timeline: [
        { time: '10:00', event: 'Crowd begins gathering at City Square' },
        { time: '10:30', event: 'Police deployment observed on Jinja Road' },
        { time: '11:15', event: 'Tear gas deployed to disperse crowd' }
      ]
    }
  },
  { 
    id: '2', 
    date: getRelativeDate(1), // Yesterday
    location: 'Gulu', 
    latitude: 2.7724, 
    longitude: 32.2881, 
    type: 'Violence', 
    fatalities: 1, 
    injuries: 3, 
    description: 'Clash between youth groups in market area.', 
    verified: true,
    osintReport: {
      sourceReliability: 'C - Fairly Reliable',
      credibilityScore: 60,
      verifiedSources: ['Local Radio FM Call-in', 'Civil Society Observer'],
      aiAnalysis: 'Reports indicate factional infighting. One fatality confirmed by hospital admission records cross-referenced with social media obituaries.',
      timeline: [
        { time: '14:00', event: 'Heated argument reported at main market' },
        { time: '14:45', event: 'Physical altercation involving crude weapons' },
        { time: '15:30', event: 'Police restore order' }
      ]
    }
  },
  { 
    id: '3', 
    date: getRelativeDate(2), 
    location: 'Mbarara', 
    latitude: -0.6072, 
    longitude: 30.6545, 
    type: 'Intimidation', 
    fatalities: 0, 
    injuries: 0, 
    description: 'Threats reported at polling station registration center.', 
    verified: false,
    osintReport: {
      sourceReliability: 'D - Not Usually Reliable',
      credibilityScore: 45,
      verifiedSources: ['Anonymous Twitter Report'],
      aiAnalysis: 'Unverified user report. No corroborating visual evidence found in public feeds. Pattern matches historical intimidation tactics in the region.',
      timeline: [
        { time: '09:00', event: 'Registration center opens' },
        { time: '11:20', event: 'Unidentified men reportedly threaten staff' }
      ]
    }
  },
  { 
    id: '4', 
    date: getRelativeDate(0), // Today
    location: 'Jinja', 
    latitude: 0.4479, 
    longitude: 33.2026, 
    type: 'Arrest', 
    fatalities: 0, 
    injuries: 0, 
    description: 'Local councilor detained during town hall.', 
    verified: true,
    osintReport: {
      sourceReliability: 'A - Completely Reliable',
      credibilityScore: 95,
      verifiedSources: ['Official Police Statement', 'NTV Uganda'],
      aiAnalysis: 'Arrest confirmed. Charges relate to "Inciting Violence". Body cam footage (leaked) suggests peaceful arrest contrary to initial social media rumors of brutality.',
      timeline: [
        { time: '16:00', event: 'Councilor addresses gathering' },
        { time: '16:25', event: 'Police vehicle arrives' },
        { time: '16:40', event: 'Suspect taken into custody' }
      ]
    }
  },
  { 
    id: '5', 
    date: getRelativeDate(3), 
    location: 'Arua', 
    latitude: 3.0303, 
    longitude: 30.9073, 
    type: 'Rally', 
    fatalities: 0, 
    injuries: 0, 
    description: 'Peaceful procession by opposition supporters.', 
    verified: true,
    osintReport: {
      sourceReliability: 'B - Usually Reliable',
      credibilityScore: 80,
      verifiedSources: ['Local Blogger Stream', 'Observer Network'],
      aiAnalysis: 'Crowd size estimated 2,000+. No security incidents. Sentiment positive. Geotags confirm route along Arua Avenue.',
      timeline: [
        { time: '13:00', event: 'Procession starts' },
        { time: '15:00', event: 'Speeches at Boma Grounds' }
      ]
    }
  },
  { 
    id: '6', 
    date: getRelativeDate(1), // Yesterday
    location: 'Masaka', 
    latitude: -0.3411, 
    longitude: 31.7361, 
    type: 'Violence', 
    fatalities: 0, 
    injuries: 12, 
    description: 'Market disruption and tear gas use.', 
    verified: true,
    osintReport: {
      sourceReliability: 'B - Usually Reliable',
      credibilityScore: 75,
      verifiedSources: ['Red Cross Incident Log', 'Market Vendor Union'],
      aiAnalysis: 'High number of injuries due to stampede after tear gas deployment. Hospital intake records match casualty reports.',
      timeline: [
        { time: '08:00', event: 'Market opens' },
        { time: '10:15', event: 'Enforcement officers clash with vendors' },
        { time: '10:30', event: 'Tear gas deployed' }
      ]
    }
  },
];

const MOCK_CANDIDATES: Candidate[] = [
  { 
    id: 'c1', 
    name: 'Yoweri Kaguta Museveni', 
    party: 'NRM', 
    district: 'National', 
    sentimentScore: 65, 
    mentions: 25400, 
    projectedVoteShare: 52.1, 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Yoweri_Museveni_2015.jpg/440px-Yoweri_Museveni_2015.jpg',
    notes: 'Incumbent president, seeking 7th term'
  },
  { 
    id: 'c2', 
    name: 'Robert Kyagulanyi Ssentamu (Bobi Wine)', 
    party: 'NUP', 
    district: 'National', 
    sentimentScore: 78, 
    mentions: 31200, 
    projectedVoteShare: 39.4, 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Bobi_Wine_at_voice_of_America_in_2018.png/440px-Bobi_Wine_at_voice_of_America_in_2018.png',
    notes: 'Main opposition candidate'
  },
  { 
    id: 'c3', 
    name: 'James Nathan Nandala Mafabi', 
    party: 'FDC', 
    district: 'National', 
    sentimentScore: 48, 
    mentions: 4200, 
    projectedVoteShare: 3.8, 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/User_icon-cp.png', 
    notes: 'Forum for Democratic Change'
  },
  { 
    id: 'c4', 
    name: 'Gregory Mugisha Muntu Oyera', 
    party: 'ANT', 
    district: 'National', 
    sentimentScore: 58, 
    mentions: 3100, 
    projectedVoteShare: 2.5, 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Mugisha_Muntu.jpg/440px-Mugisha_Muntu.jpg',
    notes: 'Alliance for National Transformation'
  },
];

export const Dashboard: React.FC<DashboardProps> = ({ onReturnToSite }) => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for Data
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [presidentialCandidates, setPresidentialCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [parliamentaryCandidates, setParliamentaryCandidates] = useState<ParliamentaryCandidate[]>(PARLIAMENTARY_DATA);

  // Connection State
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(!!db);
  const [dbError, setDbError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    violenceIndex: '0.0',
    activeIncidents: 0,
    daysToElection: 0,
    sentiment: 'Analyzing...',
    sentimentColor: 'text-slate-200'
  });

  // --- 1. Firestore Subscriptions (Real-Time Data) ---
  useEffect(() => {
    if (!db) {
        console.warn("Firestore not connected. Using local mock data.");
        return;
    }

    const handleDbError = (error: any) => {
        if (error.code === 'permission-denied') {
            console.warn("Firestore permission denied. Switching to local mock data.");
            setIsFirestoreConnected(false); // Switch to local mode
            setDbError(null); // Do not show banner, just degrade gracefully
        } else {
            setDbError(`Database Error: ${error.message}`);
        }
    };

    // Subscribe to Incidents
    const unsubIncidents = subscribeToIncidents((data) => {
        if (data.length > 0) {
            setIncidents(data);
            setIsFirestoreConnected(true);
            setDbError(null);
        }
    }, handleDbError);

    // Subscribe to Presidential
    const unsubPresidential = subscribeToPresidential((data) => {
        if (data.length > 0) setPresidentialCandidates(data);
    }, handleDbError);

    // Subscribe to Parliamentary
    const unsubParliamentary = subscribeToParliamentary((data) => {
        if (data.length > 0) setParliamentaryCandidates(data);
    }, handleDbError);

    return () => {
        unsubIncidents();
        unsubPresidential();
        unsubParliamentary();
    };
  }, []);

  // --- 2. Live WebSocket Feed (Augmentation) ---
  useEffect(() => {
    const handleRealTimeIncident = (incident: Incident) => {
      console.log("Salus Stream: New Incident Received", incident);
      if (db && isFirestoreConnected) {
          // If we have DB, try save it there
          addIncidentToDb(incident).catch(() => {
              // Fallback if write fails
              setIncidents(currentIncidents => [incident, ...currentIncidents]);
          });
      } else {
          // Fallback to local state if offline/permission denied
          setIncidents(currentIncidents => [incident, ...currentIncidents]);
      }
    };
    liveDataService.connect(handleRealTimeIncident);
    return () => { liveDataService.disconnect(handleRealTimeIncident); };
  }, [isFirestoreConnected]);
  
  // --- 3. Stats Calculation (Runs whenever data changes) ---
  useEffect(() => {
    // 1. Calculate Election Countdown (Targeting approx Jan 14, 2026)
    const targetDate = new Date('2026-01-14T00:00:00');
    const today = new Date();
    const diffTime = Math.abs(targetDate.getTime() - today.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 2. Calculate Active Incidents (Last 48 Hours)
    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 2);
    
    const recentIncidents = incidents.filter(inc => new Date(inc.date) >= recentCutoff);
    const activeCount = recentIncidents.length;

    // 3. Calculate Violence Index
    let totalSeverity = 0;
    incidents.forEach(inc => {
        let baseScore = 1;
        if (inc.type === 'Violence') baseScore = 8;
        if (inc.type === 'Protest') baseScore = 5;
        if (inc.type === 'Arrest') baseScore = 4;
        if (inc.type === 'Intimidation') baseScore = 3;
        totalSeverity += baseScore + (inc.fatalities * 5) + (inc.injuries * 0.5);
    });
    const rawIndex = (totalSeverity / Math.max(1, incidents.length)) * 1.5;
    const vIndex = Math.min(10, Math.max(0, rawIndex)).toFixed(1);

    // 4. Calculate Sentiment
    const totalVoteShare = presidentialCandidates.reduce((acc, c) => acc + c.projectedVoteShare, 0);
    const weightedSentiment = presidentialCandidates.reduce((acc, c) => acc + (c.sentimentScore * c.projectedVoteShare), 0) / (totalVoteShare || 1);
    
    let sentLabel = 'Neutral';
    let sentColor = 'purple';
    if (weightedSentiment < 40) { sentLabel = 'Volatile'; sentColor = 'red'; }
    else if (weightedSentiment < 55) { sentLabel = 'Tense'; sentColor = 'orange'; }
    else if (weightedSentiment < 65) { sentLabel = 'Cautious'; sentColor = 'blue'; }
    else { sentLabel = 'Optimistic'; sentColor = 'green'; }

    setStats({
        violenceIndex: vIndex,
        activeIncidents: activeCount,
        daysToElection: days,
        sentiment: sentLabel,
        sentimentColor: sentColor
    });

  }, [incidents, presidentialCandidates]);

  // --- Handlers for Child Components (Updating DB instead of State) ---

  const handleUpdateIncidents = (updatedList: Incident[]) => {
      // Find the difference to determine add or delete (simple heuristic for Admin Mode)
      if (db && isFirestoreConnected) {
          if (updatedList.length > incidents.length) {
              // Added
              const newItems = updatedList.filter(x => !incidents.includes(x));
              newItems.forEach(i => addIncidentToDb(i));
          } else if (updatedList.length < incidents.length) {
              // Deleted
              const deletedIds = incidents.filter(x => !updatedList.find(u => u.id === x.id)).map(x => x.id);
              deletedIds.forEach(id => deleteIncidentFromDb(id));
          }
      } else {
          setIncidents(updatedList);
      }
  };

  const handleUpdatePresCandidates = (updatedList: Candidate[]) => {
      if (db && isFirestoreConnected) {
          if (updatedList.length > presidentialCandidates.length) {
             const newItems = updatedList.filter(x => !presidentialCandidates.includes(x));
             newItems.forEach(i => addPresidentialToDb(i));
          } else if (updatedList.length < presidentialCandidates.length) {
             const deletedIds = presidentialCandidates.filter(x => !updatedList.find(u => u.id === x.id)).map(x => x.id);
             deletedIds.forEach(id => deletePresidentialFromDb(id));
          }
      } else {
          setPresidentialCandidates(updatedList);
      }
  };

  const handleUpdateParlCandidates = (updatedList: ParliamentaryCandidate[]) => {
      if (db && isFirestoreConnected) {
         if (updatedList.length > parliamentaryCandidates.length) {
             const newItems = updatedList.filter(x => !parliamentaryCandidates.includes(x));
             newItems.forEach(i => addParliamentaryToDb(i));
         } else if (updatedList.length < parliamentaryCandidates.length) {
             const deletedIds = parliamentaryCandidates.filter(x => !updatedList.find(u => u.id === x.id)).map(x => x.id);
             deletedIds.forEach(id => deleteParliamentaryFromDb(id));
         }
      } else {
          setParliamentaryCandidates(updatedList);
      }
  };

  const handleSeed = () => {
      seedDatabase(MOCK_INCIDENTS, MOCK_CANDIDATES, PARLIAMENTARY_DATA);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Violence Intensity Index" 
                value={stats.violenceIndex} 
                change={Number(stats.violenceIndex) > 5 ? "High Alert" : "Stable"} 
                changeType={Number(stats.violenceIndex) > 5 ? "negative" : "positive"} 
                icon={ShieldAlert} 
                color="red" 
              />
              <StatCard 
                title="Active Incidents (48h)" 
                value={stats.activeIncidents} 
                change={stats.activeIncidents > 3 ? "Surge Detected" : "Normal Activity"} 
                changeType={stats.activeIncidents > 3 ? "negative" : "neutral"} 
                icon={Bell} 
                color="orange" 
              />
              <StatCard 
                title="Election Countdown" 
                value={`${stats.daysToElection} Days`} 
                icon={Radio} 
                color="blue" 
              />
              <StatCard 
                title="Voter Sentiment" 
                value={stats.sentiment} 
                change="AI Analyzed" 
                changeType="neutral" 
                icon={TrendingUp} 
                color={stats.sentimentColor} 
              />
            </div>

            {/* AI Op-Ed Teaser */}
            <div 
              onClick={() => setCurrentView(ViewState.DAILY_OPED)}
              className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-6 cursor-pointer hover:border-purple-400 transition-all group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-3">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                    </span>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                   <div className="p-3 bg-purple-500/20 rounded-full text-purple-300">
                      <FileText size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                         Daily Situation Report <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 group-hover:translate-x-1" />
                      </h3>
                      <p className="text-slate-300 text-sm">AI-Generated strategic analysis of today's election trends and stability risks.</p>
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ViolenceMap incidents={incidents} onUpdateIncidents={handleUpdateIncidents} />
              </div>
              <div className="lg:col-span-1">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">Live Feed</h3>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        WS CONNECTED
                    </div>
                  </div>
                  <div className="space-y-6">
                    {incidents.slice(0, 4).map(inc => (
                      <div key={inc.id} className="flex gap-4 pb-4 border-b border-slate-700/50 last:border-0">
                        <div className={`w-2.5 h-full min-h-[48px] rounded-full ${inc.type === 'Violence' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <p className="text-base text-white font-medium">{inc.location}</p>
                             {inc.verified ? (
                               <div className="flex items-center gap-1 text-green-400" title="Verified Incident">
                                  <CheckCircle size={14} />
                               </div>
                             ) : (
                               <div className="flex items-center gap-1 text-orange-400" title="Unverified Report">
                                  <AlertTriangle size={14} />
                               </div>
                             )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{inc.description}</p>
                          <span className="text-xs text-slate-500 uppercase mt-1.5 block font-medium">{inc.date} • {inc.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <CandidateList candidates={presidentialCandidates} onUpdateCandidates={handleUpdatePresCandidates} />
          </div>
        );
      case ViewState.VIOLENCE_MAP:
        return (
            <div className="h-full flex flex-col gap-8">
               <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 print:hidden">
                 <h2 className="text-3xl font-bold text-white mb-3">Security Incident Log</h2>
                 <p className="text-lg text-slate-400">Detailed register of verified and unverified security reports from the field.</p>
               </div>
               <div className="flex-grow min-h-[600px]">
                  <ViolenceMap incidents={incidents} onUpdateIncidents={handleUpdateIncidents} fullScreen />
               </div>
            </div>
        );
      case ViewState.ELECTION_MAP:
        return (
            <div className="h-full flex flex-col gap-8">
               <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 print:hidden">
                 <h2 className="text-3xl font-bold text-white mb-3">Constituency Projection Report</h2>
                 <p className="text-lg text-slate-400">Aggregated tabular data of projected winners and vote shares by constituency.</p>
               </div>
               <div className="flex-grow min-h-[600px]">
                  <ConstituencyMap candidates={parliamentaryCandidates} onUpdateCandidates={handleUpdateParlCandidates} />
               </div>
            </div>
        );
      case ViewState.CANDIDATES:
        return (
           <div className="space-y-8">
             <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 flex justify-between items-center print:hidden">
                 <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Presidential Performance</h2>
                    <p className="text-lg text-slate-400">Sentiment tracking and projection models for 2026 General Election.</p>
                 </div>
                 <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-base">Export Report</button>
             </div>
             <CandidateList candidates={presidentialCandidates} onUpdateCandidates={handleUpdatePresCandidates} />
           </div>
        );
      case ViewState.ANALYSIS:
        return <ReportAnalyzer />;
      case ViewState.PARLIAMENTARY:
        return (
          <div className="space-y-8">
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 print:hidden">
              <h2 className="text-3xl font-bold text-white mb-2">Parliamentary Analytics</h2>
              <p className="text-lg text-slate-400">Comprehensive analysis of 2026 Parliamentary Nominations, including party distribution and gender metrics.</p>
            </div>
            <ParliamentaryAnalytics 
              candidates={parliamentaryCandidates} 
              onUpdateCandidates={handleUpdateParlCandidates}
            />
          </div>
        );
      case ViewState.DAILY_OPED:
        return <DailyOpEd incidents={incidents} candidates={presidentialCandidates} />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans selection:bg-blue-500/30 relative">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
            <span className="font-bold text-white text-lg">S</span>
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">SALUS</span>
        </div>

        <nav className="p-6 space-y-2">
          <button 
            onClick={() => { setCurrentView(ViewState.DASHBOARD); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-colors ${currentView === ViewState.DASHBOARD ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <LayoutDashboard size={22} />
            <span className="font-medium text-base">Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setCurrentView(ViewState.VIOLENCE_MAP); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-colors ${currentView === ViewState.VIOLENCE_MAP ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Table size={22} />
            <span className="font-medium text-base">Violence Logs</span>
          </button>

          <button 
            onClick={() => { setCurrentView(ViewState.ELECTION_MAP); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-colors ${currentView === ViewState.ELECTION_MAP ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Table size={22} />
            <span className="font-medium text-base">Constituency Data</span>
          </button>

          <button 
            onClick={() => { setCurrentView(ViewState.CANDIDATES); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-colors ${currentView === ViewState.CANDIDATES ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Users size={22} />
            <span className="font-medium text-base">Presidential</span>
          </button>

          <button 
            onClick={() => { setCurrentView(ViewState.PARLIAMENTARY); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-colors ${currentView === ViewState.PARLIAMENTARY ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Landmark size={22} />
            <span className="font-medium text-base">Parliamentary</span>
          </button>

          <button 
            onClick={() => { setCurrentView(ViewState.DAILY_OPED); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-colors ${currentView === ViewState.DAILY_OPED ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <FileText size={22} />
            <span className="font-medium text-base">Daily SitRep</span>
          </button>

          <button 
            onClick={() => { setCurrentView(ViewState.ANALYSIS); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-colors ${currentView === ViewState.ANALYSIS ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <BrainCircuit size={22} />
            <span className="font-medium text-base">SALUS Political Intel</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800">
          {/* Cloud Connection Status & Seed Button */}
          <div className="mb-4">
              <div className={`flex items-center gap-2 text-xs font-bold uppercase mb-2 ${dbError ? 'text-red-400' : isFirestoreConnected ? 'text-green-400' : 'text-orange-400'}`}>
                 <Database size={12} /> 
                 {dbError ? 'Connection Error' : isFirestoreConnected ? 'Connected to Cloud' : 'Local Storage Mode'}
              </div>
              
              {/* Always show seed button if DB is configured, to allow initialization */}
              {db && (
                  <button 
                    onClick={handleSeed}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-400 py-2 rounded hover:text-white hover:border-slate-500 transition-colors"
                  >
                     {isFirestoreConnected ? 'Re-Upload Mock Data' : 'Initialize Cloud Database'}
                  </button>
              )}
          </div>

           <button 
            onClick={onReturnToSite}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white mb-4 transition-colors"
           >
             <LogOut size={20} />
             <span className="font-medium text-base">Exit Dashboard</span>
           </button>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
            <div className="overflow-hidden">
              <p className="text-base font-medium text-white truncate">Analyst Unit 04</p>
              <p className="text-sm text-slate-500 truncate">Kampala HQ</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72 transition-all duration-300 print:ml-0 print:w-full">
        {/* Header */}
        <header className="h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-8 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu size={28} />
            </button>
            <h1 className="text-xl font-semibold text-white hidden sm:block">
              {currentView === ViewState.DASHBOARD && 'Political Intelligence Dashboard'}
              {currentView === ViewState.VIOLENCE_MAP && 'Security Reports'}
              {currentView === ViewState.ELECTION_MAP && 'Election Constituency Data'}
              {currentView === ViewState.CANDIDATES && 'Presidential Performance'}
              {currentView === ViewState.PARLIAMENTARY && 'Parliamentary Intelligence'}
              {currentView === ViewState.ANALYSIS && 'SALUS Political Intelligence Processor'}
              {currentView === ViewState.DAILY_OPED && 'Daily Strategic Analysis'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search incidents, districts..." 
                className="bg-slate-800 border border-slate-700 text-base rounded-full pl-12 pr-6 py-2 text-slate-200 focus:outline-none focus:border-blue-500 w-72"
              />
            </div>
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {dbError && (
            <div className="bg-red-500/10 border-b border-red-500/20 p-4 flex items-center justify-center gap-3 animate-in slide-in-from-top text-center print:hidden">
                <Lock className="text-red-400" size={20} />
                <span className="text-red-300 text-sm font-medium">{dbError}</span>
            </div>
        )}

        {/* Page Content */}
        <main className="p-8 flex-1 overflow-y-auto print:p-0">
          <div className="max-w-7xl mx-auto h-full print:max-w-none">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Chatbot Interface */}
      <div className="print:hidden chatbot-container">
        <Chatbot />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden print:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}