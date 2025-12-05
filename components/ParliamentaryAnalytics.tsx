
import React, { useState, useMemo, useRef } from 'react';
import { ParliamentaryCandidate, ConstituencyProfile } from '../types';
import { getConstituencyProfile } from '../data/parliamentaryData';
import { generatePoliticalStrategy } from '../services/geminiService';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Search, Users, Filter, Briefcase, UserCheck, X, TrendingUp, Activity, 
  BookOpen, History, Award, MessageCircle, Zap, FileText, AlertTriangle, 
  GraduationCap, Heart, Newspaper, Target, Crosshair, TrendingDown, 
  BrainCircuit, Sparkles, Lock, Plus, Upload, Trash2, Shield
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
  
  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    constituency: '',
    party: 'Independent',
    category: 'Constituency' as 'Constituency' | 'Woman MP' | 'Special Interest'
  });
  
  // AI Strategy State
  const [aiReport, setAiReport] = useState<{ grandStrategy: string; sitRep: string; osintBackground?: any } | null>(null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.constituency.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty = filterParty === 'All' || c.party === filterParty;
      return matchesSearch && matchesParty;
    });
  }, [candidates, searchTerm, filterParty]);

  const handleRowClick = async (candidate: ParliamentaryCandidate) => {
    setSelectedCandidate(candidate);
    const profile = getConstituencyProfile(candidate.constituency, candidate.name, candidate.party);
    setConstituencyProfile(profile);
    
    // Reset and Trigger AI Strategy
    setAiReport(null);
    setIsGeneratingStrategy(true);
    
    try {
      const context = `
        Region: ${profile.region}. 
        Key Challenges: ${profile.campaignStrategy.keyChallenges.join(', ')}. 
        Socio-Econ: ${profile.socioEconomic.primaryActivity}, Poverty: ${profile.socioEconomic.povertyIndex}.
        Opponent History: Previous winner was ${profile.historical.previousWinner}.
      `;
      
      const report = await generatePoliticalStrategy(
        candidate.name,
        candidate.party,
        candidate.constituency,
        context
      );
      setAiReport(report);
    } catch (e) {
      // Error handling is implicit (stays null)
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const handleClosePanel = () => {
    setSelectedCandidate(null);
    setConstituencyProfile(null);
    setAiReport(null);
  };

  // --- Admin Functions ---

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this candidate?')) {
        const updated = candidates.filter(c => c.id !== id);
        onUpdateCandidates(updated);
        if (selectedCandidate?.id === id) {
            handleClosePanel();
        }
    }
  };

  const handleAddCandidate = () => {
    // Generate mock stats for the new candidate so the UI doesn't break
    const sentimentScore = Math.floor(Math.random() * 60) + 20;
    const projectedVoteShare = Math.floor(Math.random() * 40) + 5;
    const mentions = Math.floor(Math.random() * 5000) + 500;
    
    const candidate: ParliamentaryCandidate = {
        id: `nc-${Date.now()}`,
        name: newCandidate.name,
        constituency: newCandidate.constituency,
        party: newCandidate.party,
        category: newCandidate.category,
        sentimentScore,
        projectedVoteShare,
        mentions
    };

    onUpdateCandidates([candidate, ...candidates]);
    setIsAddModalOpen(false);
    setNewCandidate({ name: '', constituency: '', party: 'Independent', category: 'Constituency' });
  };

  const handleBulkUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
            // Simple CSV parser: Name,Constituency,Party,Category
            const lines = text.split('\n');
            const newCandidates: ParliamentaryCandidate[] = [];
            
            lines.forEach((line, index) => {
                if (index === 0) return; // Skip header
                const [name, constituency, party, category] = line.split(',').map(s => s.trim());
                if (name && constituency) {
                    newCandidates.push({
                        id: `bulk-${Date.now()}-${index}`,
                        name,
                        constituency,
                        party: party || 'Independent',
                        category: (category as any) || 'Constituency',
                        sentimentScore: Math.floor(Math.random() * 60) + 20,
                        projectedVoteShare: Math.floor(Math.random() * 40) + 5,
                        mentions: Math.floor(Math.random() * 5000) + 500
                    });
                }
            });

            if (newCandidates.length > 0) {
                onUpdateCandidates([...newCandidates, ...candidates]);
                alert(`Successfully imported ${newCandidates.length} candidates.`);
            } else {
                alert("No valid data found in CSV. Format: Name,Constituency,Party,Category");
            }
        } catch (err) {
            console.error("CSV Parse Error", err);
            alert("Failed to parse CSV file.");
        }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // -- Statistics Calculation --
  const totalCandidates = candidates.length;
  
  const partyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach(c => {
      counts[c.party] = (counts[c.party] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [candidates]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [candidates]);

  // Colors for charts
  const COLORS = {
    'NRM': '#FACC15', // Yellow
    'NUP': '#EF4444', // Red
    'FDC': '#3B82F6', // Blue
    'Independent': '#94A3B8', // Slate
    'DP': '#22C55E', // Green
    'UPC': '#F97316', // Orange
    'ANT': '#A855F7', // Purple
    'Other': '#64748B'
  };

  const getPartyColor = (party: string) => {
    if (party === 'NRM') return COLORS.NRM;
    if (party === 'NUP') return COLORS.NUP;
    if (party === 'FDC') return COLORS.FDC;
    if (party === 'Independent') return COLORS.Independent;
    if (party === 'DP') return COLORS.DP;
    if (party === 'UPC') return COLORS.UPC;
    if (party === 'ANT') return COLORS.ANT;
    return COLORS.Other;
  };

  // Prepare Stacked Bar Chart Data for Historical Results
  const stackedBarData = useMemo(() => {
    if (!constituencyProfile) return [];
    return constituencyProfile.electionTrend.map(trend => {
        const dataPoint: any = { year: trend.year };
        if (trend.results) {
            trend.results.forEach(r => {
                dataPoint[r.party] = r.percentage;
            });
        }
        return dataPoint;
    });
  }, [constituencyProfile]);

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-base font-medium mb-2">Total Nominations</p>
              <h3 className="text-4xl font-bold text-white">{totalCandidates}</h3>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg text-blue-400">
              <Users size={28} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">For 2026 Parliamentary Election</p>
        </div>

        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-base font-medium mb-2">Leading Party</p>
              <h3 className="text-4xl font-bold text-yellow-400">{partyCounts[0]?.name || 'N/A'}</h3>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg text-yellow-400">
              <Briefcase size={28} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">{partyCounts[0]?.value} candidates nominated</p>
        </div>

        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-base font-medium mb-2">Gender Representation</p>
              <h3 className="text-4xl font-bold text-pink-400">
                {totalCandidates > 0 ? Math.round(((categoryCounts.find(c => c.name === 'Woman MP')?.value || 0) / totalCandidates) * 100) : 0}%
              </h3>
            </div>
            <div className="p-4 bg-pink-500/10 rounded-lg text-pink-400">
              <UserCheck size={28} />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">Designated Woman MP seats</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Party Distribution Chart */}
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-8">Nomination Distribution by Party</h3>
          <div className="flex-grow min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={partyCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {partyCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPartyColor(entry.name)} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '14px'}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-8">Seat Category Breakdown</h3>
          <div className="flex-grow min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryCounts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#e2e8f0" width={120} tick={{fontSize: 14}} />
                <RechartsTooltip 
                   cursor={{fill: '#1e293b'}}
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={50}>
                  {categoryCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Woman MP' ? '#F472B6' : '#60A5FA'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-700 flex flex-col xl:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-semibold text-white">Nominated MPs List</h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
             
             {/* Admin Controls */}
             {isAdminMode && (
                <div className="flex items-center gap-2 animate-fade-in">
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus size={16} /> Add New
                    </button>
                    <button 
                        onClick={handleBulkUploadClick}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <Upload size={16} /> Bulk Upload
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".csv" 
                            className="hidden" 
                        />
                    </button>
                </div>
             )}

             <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>

             {/* Search */}
             <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search name or constituency..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-900 border border-slate-600 text-base rounded-lg pl-12 pr-5 py-2 text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-64"
                />
             </div>
             
             {/* Filter */}
             <div className="relative w-full sm:w-auto">
                <select 
                  value={filterParty}
                  onChange={(e) => setFilterParty(e.target.value)}
                  className="bg-slate-900 border border-slate-600 text-base rounded-lg pl-4 pr-10 py-2 text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer w-full sm:w-auto"
                >
                  <option value="All">All Parties</option>
                  {partyCounts.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
             </div>

             {/* Admin Toggle */}
             <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`p-2 rounded-lg transition-colors ${isAdminMode ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-slate-500 hover:text-slate-300'}`}
                title="Toggle Admin Mode"
             >
                {isAdminMode ? <Shield size={20} /> : <Lock size={20} />}
             </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="p-5 font-medium border-b border-slate-700">Candidate Name</th>
                <th className="p-5 font-medium border-b border-slate-700">Constituency</th>
                <th className="p-5 font-medium border-b border-slate-700">Party</th>
                <th className="p-5 font-medium border-b border-slate-700 w-32">Sentiment</th>
                <th className="p-5 font-medium border-b border-slate-700">Vote Proj.</th>
                <th className="p-5 font-medium border-b border-slate-700">Mentions</th>
                <th className="p-5 font-medium border-b border-slate-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-base">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <tr 
                    key={candidate.id} 
                    onClick={() => handleRowClick(candidate)}
                    className="hover:bg-slate-700/30 transition-colors group cursor-pointer"
                  >
                    <td className="p-5 text-slate-200 font-medium">
                       <div>{candidate.name}</div>
                       <div className="text-sm text-slate-500 mt-1">{candidate.category}</div>
                    </td>
                    <td className="p-5 text-slate-400">{candidate.constituency}</td>
                    <td className="p-5">
                      <span 
                        className="px-3 py-1 rounded text-sm font-medium border"
                        style={{
                           borderColor: `${getPartyColor(candidate.party)}40`,
                           backgroundColor: `${getPartyColor(candidate.party)}20`,
                           color: getPartyColor(candidate.party)
                        }}
                      >
                        {candidate.party}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full w-20 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              candidate.sentimentScore > 60 ? 'bg-green-500' : 
                              candidate.sentimentScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${candidate.sentimentScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-mono text-slate-500">{Math.round(candidate.sentimentScore)}%</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center text-slate-300 font-medium text-sm">
                        {Math.round(candidate.projectedVoteShare)}%
                        {candidate.projectedVoteShare > 50 ? (
                          <TrendingUp size={16} className="ml-2 text-green-500" />
                        ) : (
                          <TrendingDown size={16} className="ml-2 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <MessageCircle size={14} />
                        {candidate.mentions.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      {isAdminMode ? (
                        <button 
                            onClick={(e) => handleDelete(e, candidate.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                      ) : (
                        <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                          View Analysis &rarr;
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    No candidates found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-5 border-t border-slate-700 bg-slate-900/30 text-sm text-slate-500 text-center">
          Showing {filteredCandidates.length} of {candidates.length} nominated candidates
        </div>
      </div>

      {/* Add Candidate Modal */}
      {isAddModalOpen && (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Plus className="text-green-500" /> Add New Candidate
                        </h3>
                        <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Candidate Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                value={newCandidate.name}
                                onChange={e => setNewCandidate({...newCandidate, name: e.target.value})}
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Constituency</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                value={newCandidate.constituency}
                                onChange={e => setNewCandidate({...newCandidate, constituency: e.target.value})}
                                placeholder="e.g. Kampala Central"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Party</label>
                                <select 
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    value={newCandidate.party}
                                    onChange={e => setNewCandidate({...newCandidate, party: e.target.value})}
                                >
                                    {Object.keys(COLORS).filter(k => k !== 'Other').map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                <select 
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    value={newCandidate.category}
                                    onChange={e => setNewCandidate({...newCandidate, category: e.target.value as any})}
                                >
                                    <option value="Constituency">Constituency</option>
                                    <option value="Woman MP">Woman MP</option>
                                    <option value="Special Interest">Special Interest</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                onClick={handleAddCandidate}
                                disabled={!newCandidate.name || !newCandidate.constituency}
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Candidate
                            </button>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
      )}

      {/* Constituency Detail Side Panel */}
      {selectedCandidate && constituencyProfile && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
            onClick={handleClosePanel}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-[650px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                   <h2 className="text-2xl font-bold text-white leading-tight">{selectedCandidate.constituency}</h2>
                   <p className="text-blue-400 font-medium mt-2 text-lg">{selectedCandidate.name}</p>
                </div>
                <button onClick={handleClosePanel} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                  <X size={28} />
                </button>
              </div>

              {/* Party Badge */}
              <div className="mb-8">
                 <span 
                    className="px-4 py-2 rounded-md text-base font-medium border inline-block"
                    style={{
                       borderColor: `${getPartyColor(selectedCandidate.party)}40`,
                       backgroundColor: `${getPartyColor(selectedCandidate.party)}10`,
                       color: getPartyColor(selectedCandidate.party)
                    }}
                  >
                    Running on {selectedCandidate.party} Ticket
                  </span>
              </div>

              {/* --- AI GRAND STRATEGIST & SITREP SECTION --- */}
              <div className="mb-10 bg-slate-900 rounded-xl border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)] overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>
                 <div className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-300">
                          <BrainCircuit size={24} />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-white uppercase tracking-wide">AI Analysis Core</h3>
                           <p className="text-xs text-purple-300/70 font-medium">SitRep & Grand Strategy</p>
                        </div>
                    </div>

                    {isGeneratingStrategy ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <Sparkles className="animate-spin text-purple-400" size={32} />
                            <p className="text-sm text-purple-200/80 animate-pulse">Consulting the Council of History & Assessing Ground Truth...</p>
                        </div>
                    ) : aiReport ? (
                        <div className="space-y-6">
                            {/* Grand Strategy */}
                            <div className="bg-purple-900/10 rounded-lg p-5 border border-purple-500/20">
                                <h4 className="text-xs text-purple-400 uppercase font-bold mb-2">The Grand Strategist</h4>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="text-slate-200 text-base leading-relaxed whitespace-pre-line font-serif italic">
                                       {aiReport.grandStrategy}
                                    </div>
                                </div>
                            </div>
                            
                            {/* SitRep */}
                            <div className="bg-blue-900/10 rounded-lg p-5 border border-blue-500/20">
                                <h4 className="text-xs text-blue-400 uppercase font-bold mb-2 flex items-center gap-2">
                                  <Activity size={14} /> Constituency Situation Report (SitRep)
                                </h4>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="text-slate-200 text-base leading-relaxed whitespace-pre-line">
                                       {aiReport.sitRep}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                       <div className="text-center py-8 text-slate-500">
                          <Lock size={28} className="mx-auto mb-3 opacity-50" />
                          <p className="text-sm">Strategy module initialization failed.</p>
                       </div>
                    )}
                 </div>
              </div>

              {/* --- OSINT Personal Dossier Subsection --- */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 mb-10 overflow-hidden">
                    <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                        <FileText size={18} className="text-blue-400" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wide">Forensic OSINT Dossier</h4>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Quick Facts Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-slate-500"><Heart size={20} /></div>
                                <div>
                                    <p className="text-sm text-slate-400 uppercase font-bold">Marital Status</p>
                                    <p className="text-base text-slate-200">{constituencyProfile.osintBackground.maritalStatus}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-slate-500"><GraduationCap size={20} /></div>
                                <div>
                                    <p className="text-sm text-slate-400 uppercase font-bold">Education</p>
                                    <p className="text-base text-slate-200 leading-snug">{constituencyProfile.osintBackground.education}</p>
                                </div>
                            </div>
                        </div>

                        {/* Lifestyle Analysis */}
                        <div>
                            <p className="text-sm text-slate-400 uppercase font-bold mb-3">Lifestyle & Profile Analysis</p>
                            <p className="text-base text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded border border-slate-700/50 italic">
                                "{constituencyProfile.osintBackground.lifestyle}"
                            </p>
                        </div>

                        {/* Deep Forensic Data from Gemini */}
                        {aiReport && aiReport.osintBackground && (
                            <div className="grid grid-cols-1 gap-6 border-t border-slate-700/50 pt-6">
                                {aiReport.osintBackground.financialIntel && (
                                    <div>
                                        <p className="text-sm text-green-400 uppercase font-bold mb-2">Financial Intelligence</p>
                                        <p className="text-sm text-slate-300 leading-relaxed">{aiReport.osintBackground.financialIntel}</p>
                                    </div>
                                )}
                                {aiReport.osintBackground.digitalFootprint && (
                                    <div>
                                        <p className="text-sm text-blue-400 uppercase font-bold mb-2">Digital Footprint</p>
                                        <p className="text-sm text-slate-300 leading-relaxed">{aiReport.osintBackground.digitalFootprint}</p>
                                    </div>
                                )}
                                {aiReport.osintBackground.networkMap && aiReport.osintBackground.networkMap.length > 0 && (
                                    <div>
                                        <p className="text-sm text-purple-400 uppercase font-bold mb-3">Network Map & Allies</p>
                                        <div className="flex flex-wrap gap-2">
                                            {aiReport.osintBackground.networkMap.map((ally: string, i: number) => (
                                                <span key={i} className="bg-slate-900 px-3 py-1 rounded-full text-xs text-slate-300 border border-slate-700">
                                                    {ally}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Controversies / Bad Press */}
                        <div className="border-t border-slate-700/50 pt-6">
                            <p className="text-sm text-red-400 uppercase font-bold mb-4 flex items-center gap-2">
                                <AlertTriangle size={16} /> Reported Controversies (Verified & Unverified)
                            </p>
                            <ul className="space-y-3">
                                {constituencyProfile.osintBackground.controversies.map((item, idx) => (
                                    <li key={idx} className="text-base text-slate-300 flex items-start gap-3">
                                        <span className="text-red-500 mt-2 text-[10px]">●</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
               </div>

              {/* --- Campaign Strategy & News Feed --- */}
              <div className="mb-10">
                 <h3 className="text-base font-bold text-white uppercase mb-4 flex items-center gap-3">
                     <Newspaper size={20} className="text-green-400" /> 
                     Campaign Feed & Strategy
                 </h3>
                 <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-8">
                    
                    {/* News Feed */}
                    <div className="space-y-5">
                       <p className="text-sm text-slate-500 uppercase font-bold">Latest Intelligence / News</p>
                       {constituencyProfile.campaignStrategy.latestNews.map((news, i) => (
                         <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-start mb-2">
                               <p className="text-base font-bold text-slate-200">{news.headline}</p>
                               <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{news.date}</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{news.snippet}</p>
                            <p className="text-xs text-blue-500/80">Source: {news.source}</p>
                         </div>
                       ))}
                    </div>

                    {/* Key Challenges */}
                    <div>
                       <p className="text-sm text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                          <Target size={14} /> Key Challenges
                       </p>
                       <div className="flex flex-wrap gap-2.5">
                          {constituencyProfile.campaignStrategy.keyChallenges.map((challenge, i) => (
                             <span key={i} className="text-sm px-3 py-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-300">
                                {challenge}
                             </span>
                          ))}
                       </div>
                    </div>

                    {/* Winning Strategy */}
                    <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-500/20">
                        <p className="text-sm text-blue-400 uppercase font-bold mb-3 flex items-center gap-2">
                           <Crosshair size={14} /> Analyst Opinion
                        </p>
                        <p className="text-base text-slate-300 leading-relaxed italic">
                           "{constituencyProfile.campaignStrategy.winningStrategy}"
                        </p>
                    </div>

                 </div>
              </div>

              {/* Social Media Poll */}
              <div className="mb-10">
                  <h3 className="text-base font-bold text-white uppercase mb-4 flex items-center gap-3">
                      <MessageCircle size={20} className="text-pink-500" /> 
                      Candidate Social Pulse
                  </h3>
                  <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                      <div className="flex justify-between items-center mb-6">
                          <div>
                              <p className="text-sm text-slate-400 font-medium">Total Mentions (7d)</p>
                              <p className="text-3xl font-bold text-white">{constituencyProfile.socialMediaPoll.totalMentions.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-sm text-slate-400 font-medium">Dominant Sentiment</p>
                              <p className={`text-2xl font-bold ${constituencyProfile.socialMediaPoll.sentiment.positive > constituencyProfile.socialMediaPoll.sentiment.negative ? 'text-green-400' : 'text-red-400'}`}>
                                  {constituencyProfile.socialMediaPoll.sentiment.positive > constituencyProfile.socialMediaPoll.sentiment.negative ? 'Positive' : 'Negative'}
                              </p>
                          </div>
                      </div>

                      {/* Sentiment Bar */}
                      <div className="w-full h-6 bg-slate-700 rounded-full overflow-hidden flex mb-3">
                          <div className="bg-green-500 h-full" style={{width: `${constituencyProfile.socialMediaPoll.sentiment.positive}%`}}></div>
                          <div className="bg-slate-400 h-full" style={{width: `${constituencyProfile.socialMediaPoll.sentiment.neutral}%`}}></div>
                          <div className="bg-red-500 h-full" style={{width: `${constituencyProfile.socialMediaPoll.sentiment.negative}%`}}></div>
                      </div>
                      <div className="flex justify-between text-sm text-slate-400 mb-8">
                          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> {constituencyProfile.socialMediaPoll.sentiment.positive}% Pos</div>
                          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-400 rounded-full"></div> {constituencyProfile.socialMediaPoll.sentiment.neutral}% Neu</div>
                          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> {constituencyProfile.socialMediaPoll.sentiment.negative}% Neg</div>
                      </div>

                      {/* Trending Topics */}
                      <div>
                          <p className="text-sm text-slate-500 uppercase font-bold mb-3">Trending Topics</p>
                          <div className="flex flex-wrap gap-3">
                              {constituencyProfile.socialMediaPoll.trendingTopics.map((topic, idx) => (
                                  <span key={idx} className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-sm text-slate-300">
                                      #{topic}
                                  </span>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Demographics & Constituency Overview */}
              <div className="mb-10">
                  <h3 className="text-base font-bold text-white uppercase mb-4 flex items-center gap-3">
                      <Users size={20} className="text-blue-400" /> 
                      Constituency Overview
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                          <p className="text-sm text-slate-400 uppercase font-bold mb-2">Population</p>
                          <p className="text-2xl font-bold text-white">{constituencyProfile.demographics.totalPopulation}</p>
                          <p className="text-sm text-slate-500 mt-2">{constituencyProfile.demographics.youthPercentage}% Youth</p>
                      </div>
                      <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                          <p className="text-sm text-slate-400 uppercase font-bold mb-2">Electorate</p>
                          <p className="text-2xl font-bold text-white">{constituencyProfile.demographics.registeredVoters}</p>
                          <p className="text-sm text-slate-500 mt-2">{constituencyProfile.historical.voterTurnout} Turnout</p>
                      </div>
                      <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                          <p className="text-sm text-slate-400 uppercase font-bold mb-2">Urbanization</p>
                          <p className="text-2xl font-bold text-white">{constituencyProfile.demographics.urbanizationRate}%</p>
                          <p className="text-sm text-slate-500 mt-2">{constituencyProfile.demographics.urbanizationRate > 50 ? 'Urban/Peri-Urban' : 'Rural Settlement'}</p>
                      </div>
                  </div>

                  {/* Socio-Economic Indicators */}
                   <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                       <p className="text-sm text-slate-500 uppercase font-bold mb-4 flex items-center gap-2">
                           <Activity size={16} /> Socio-Economic Indicators
                       </p>
                       <div className="grid grid-cols-2 gap-y-6 gap-x-6">
                           <div className="flex items-center gap-4">
                               <div className="p-3 bg-red-500/10 rounded text-red-400"><TrendingDown size={20} /></div>
                               <div>
                                   <p className="text-xs text-slate-400 uppercase font-bold">Poverty Index</p>
                                   <p className="text-base font-bold text-white">{constituencyProfile.socioEconomic.povertyIndex}</p>
                               </div>
                           </div>
                           <div className="flex items-center gap-4">
                               <div className="p-3 bg-blue-500/10 rounded text-blue-400"><BookOpen size={20} /></div>
                               <div>
                                   <p className="text-xs text-slate-400 uppercase font-bold">Literacy Rate</p>
                                   <p className="text-base font-bold text-white">{constituencyProfile.socioEconomic.literacyRate}%</p>
                               </div>
                           </div>
                           <div className="flex items-center gap-4">
                               <div className="p-3 bg-yellow-500/10 rounded text-yellow-400"><Zap size={20} /></div>
                               <div>
                                   <p className="text-xs text-slate-400 uppercase font-bold">Electricity</p>
                                   <p className="text-base font-bold text-white">{constituencyProfile.socioEconomic.accessToElectricity}% Access</p>
                               </div>
                           </div>
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-green-500/10 rounded text-green-400"><Briefcase size={20} /></div>
                               <div>
                                   <p className="text-xs text-slate-400 uppercase font-bold">Economy</p>
                                   <p className="text-base font-bold text-white truncate w-32" title={constituencyProfile.socioEconomic.primaryActivity}>{constituencyProfile.socioEconomic.primaryActivity}</p>
                               </div>
                           </div>
                       </div>
                   </div>
              </div>

              {/* Historical Party Performance Chart (Stacked Bar) */}
              <div className="mb-10">
                <h3 className="text-base font-bold text-white uppercase mb-4 flex items-center gap-3">
                   <History size={20} className="text-orange-500" /> 
                   Historical Party Performance
                </h3>
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                   <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stackedBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="year" stroke="#94a3b8" fontSize={14} />
                            <YAxis stroke="#94a3b8" fontSize={14} unit="%" />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: '14px' }}
                                cursor={{fill: '#1e293b'}}
                            />
                            <Legend wrapperStyle={{fontSize: '14px', paddingTop: '10px'}} />
                            <Bar dataKey="NRM" stackId="a" fill={COLORS.NRM} />
                            <Bar dataKey="NUP" stackId="a" fill={COLORS.NUP} />
                            <Bar dataKey="FDC" stackId="a" fill={COLORS.FDC} />
                            <Bar dataKey="DP" stackId="a" fill={COLORS.DP} />
                            <Bar dataKey="Independent" stackId="a" fill={COLORS.Independent} />
                            <Bar dataKey="Others" stackId="a" fill={COLORS.Other} />
                        </BarChart>
                     </ResponsiveContainer>
                   </div>
                   <p className="text-xs text-slate-500 text-center mt-3">Vote share breakdown for previous general elections</p>
                </div>
              </div>
              
              {/* Candidate Political History */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-white uppercase mb-4 flex items-center gap-3">
                   <Award size={20} className="text-purple-500" /> 
                   Candidate Political History
                </h3>
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                   {constituencyProfile.candidateHistory.length > 0 ? (
                      <ul className="space-y-5">
                         {constituencyProfile.candidateHistory.map((hist, idx) => (
                           <li key={idx} className="relative pl-6 border-l-2 border-slate-700 last:border-0">
                              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-slate-800"></div>
                              <div>
                                 <p className="text-base font-bold text-white">{hist.year} General Election</p>
                                 <p className="text-base text-slate-300">Ran for {hist.position}</p>
                                 <div className="flex items-center gap-3 mt-2">
                                    <span className={`text-sm px-2.5 py-0.5 rounded ${hist.outcome === 'Won' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                       {hist.outcome}
                                    </span>
                                    <span className="text-sm text-slate-500">via {hist.party}</span>
                                    {hist.votes && <span className="text-sm text-slate-500">• {hist.votes.toLocaleString()} votes</span>}
                                 </div>
                              </div>
                           </li>
                         ))}
                      </ul>
                   ) : (
                     <p className="text-base text-slate-500 italic">No prior election history records found for this candidate.</p>
                   )}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};
