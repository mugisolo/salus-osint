import React, { useState, useMemo, useRef } from 'react';
import { ParliamentaryCandidate, ConstituencyProfile } from '../types';
import { getConstituencyProfile } from '../data/parliamentaryData';
import { generatePoliticalStrategy } from '../services/geminiService';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Search, Users, Filter, Briefcase, UserCheck, X, TrendingUp, Activity, 
  BookOpen, History, MessageCircle, Zap, FileText, AlertTriangle, 
  Target, Crosshair, TrendingDown, BrainCircuit, Lock, Plus, Upload, Trash2, Shield, Info
} from 'lucide-react';

interface ParliamentaryAnalyticsProps {
  candidates: ParliamentaryCandidate[];
  onUpdateCandidates: (candidates: ParliamentaryCandidate[]) => void;
}

export const ParliamentaryAnalytics: React.FC<ParliamentaryAnalyticsProps> = ({ candidates, onUpdateCandidates }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParty, setFilterParty] = useState<string>('All');
  const [selectedCandidate, setSelectedCandidate] = useState<ParliamentaryCandidate | null>(null);
  const [constituencyProfile, setConstituencyProfile] = useState<ConstituencyProfile | null>(null);
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCandidate, setNewCandidate] = useState({ name: '', constituency: '', party: 'Independent', category: 'Constituency' as any });
  const [aiReport, setAiReport] = useState<any>(null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  const filteredCandidates = useMemo(() => {
    if (!Array.isArray(candidates)) return [];
    return candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.constituency.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty = filterParty === 'All' || c.party === filterParty;
      return matchesSearch && matchesParty;
    });
  }, [candidates, searchTerm, filterParty]);

  const partyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates?.forEach(c => { counts[c.party] = (counts[c.party] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [candidates]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates?.forEach(c => { counts[c.category] = (counts[c.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [candidates]);

  const handleRowClick = async (candidate: ParliamentaryCandidate) => {
    setSelectedCandidate(candidate);
    const profile = getConstituencyProfile(candidate.constituency, candidate.name, candidate.party);
    setConstituencyProfile(profile);
    setIsGeneratingStrategy(true);
    try {
      const report = await generatePoliticalStrategy(candidate.name, candidate.party, candidate.constituency, "General analysis");
      setAiReport(report);
    } finally { setIsGeneratingStrategy(false); }
  };

  const getPartyColor = (party: string) => {
    const colors: any = { 'NRM': '#FACC15', 'NUP': '#EF4444', 'FDC': '#3B82F6', 'DP': '#22C55E' };
    return colors[party] || '#94A3B8';
  };

  const getPartyColorBadge = (party: string) => {
    let style = "bg-slate-700 text-slate-300 border-slate-600";
    if (party === 'NRM') style = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    if (party === 'NUP') style = "bg-red-500/10 text-red-500 border-red-500/20";
    return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${style}`}>{party}</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start"><div><p className="text-slate-400 text-base font-medium mb-2">Total Nominations</p><h3 className="text-4xl font-bold text-white">{candidates?.length || 0}</h3></div><div className="p-4 bg-blue-500/10 rounded-lg text-blue-400"><Users size={28} /></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 h-[400px]">
          <h3 className="text-xl font-semibold text-white mb-8">Party Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={partyCounts} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">{partyCounts.map((e, i) => (<Cell key={i} fill={getPartyColor(e.name)} />))}</Pie><RechartsTooltip /><Legend /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Nominated MPs List</h3>
          <div className="flex gap-4">
             <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-lg pl-12 pr-5 py-2 text-slate-200" /></div>
             <button onClick={() => setIsAdminMode(!isAdminMode)} className={`p-2 rounded-lg ${isAdminMode ? 'bg-red-500/20 text-red-400' : 'text-slate-500'}`}>{isAdminMode ? <Shield size={20} /> : <Lock size={20} />}</button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 text-sm uppercase"><tr><th className="p-5">Name</th><th className="p-5">Constituency</th><th className="p-5">Party</th><th className="p-5">Sentiment</th></tr></thead>
            <tbody className="divide-y divide-slate-700">
              {filteredCandidates?.map((c) => (
                <tr key={c.id} onClick={() => handleRowClick(c)} className="hover:bg-slate-700/30 cursor-pointer transition-colors">
                  <td className="p-5 text-slate-200 font-medium">{c.name}</td>
                  <td className="p-5 text-slate-400">{c.constituency}</td>
                  <td className="p-5">{getPartyColorBadge(c.party)}</td>
                  <td className="p-5"><div className="flex items-center gap-2"><div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{width: `${c.sentimentScore}%`}}></div></div><span className="text-xs text-slate-500">{c.sentimentScore}%</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedCandidate && constituencyProfile && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]" onClick={() => setSelectedCandidate(null)} />
          <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-900 border-l border-slate-700 shadow-2xl z-[51] p-8 overflow-y-auto animate-in slide-in-from-right">
             <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-bold text-white">{selectedCandidate.name}</h2><p className="text-slate-400">{selectedCandidate.constituency}</p></div>
                <button onClick={() => setSelectedCandidate(null)} className="text-slate-400"><X size={24} /></button>
             </div>
             {isGeneratingStrategy ? <div className="text-center py-20"><BrainCircuit className="animate-pulse text-purple-500 mx-auto mb-4" size={32} /><p className="text-white">Consulting Strategy Core...</p></div> : aiReport && (
                <div className="space-y-6">
                   <div className="bg-slate-800 p-6 rounded-xl border border-slate-700"><h4 className="text-sm font-bold text-blue-400 uppercase mb-4">Strategic Briefing</h4><p className="text-slate-300 text-sm leading-relaxed">{aiReport.sitRep}</p></div>
                   <div className="bg-slate-800 p-6 rounded-xl border border-purple-500/30"><h4 className="text-sm font-bold text-purple-400 uppercase mb-4">The Grand Strategy</h4><p className="text-slate-300 text-sm italic">"{aiReport.grandStrategy}"</p></div>
                </div>
             )}
          </div>
        </>
      )}
    </div>
  );
};