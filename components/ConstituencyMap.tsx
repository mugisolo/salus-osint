
import React, { useMemo, useState, useRef } from 'react';
import { ParliamentaryCandidate, ConstituencyProfile } from '../types';
import { getConstituencyProfile } from '../data/parliamentaryData';
import { generatePoliticalStrategy } from '../services/geminiService';
import { Users, Search, MapPin, ArrowUpRight, X, BrainCircuit, Activity, FileText, AlertTriangle, Shield, Lock, Plus, Upload, Trash2, Zap, BookOpen, Briefcase, TrendingDown, Target } from 'lucide-react';

interface ConstituencyMapProps {
  candidates: ParliamentaryCandidate[];
  onUpdateCandidates?: (candidates: ParliamentaryCandidate[]) => void;
}

export const ConstituencyMap: React.FC<ConstituencyMapProps> = ({ candidates, onUpdateCandidates }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState<any | null>(null);
  const [constituencyProfile, setConstituencyProfile] = useState<ConstituencyProfile | null>(null);
  const [aiReport, setAiReport] = useState<{ grandStrategy: string; sitRep: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCandidate, setNewCandidate] = useState<Partial<ParliamentaryCandidate>>({
    name: '',
    constituency: '',
    party: 'Independent',
    category: 'Constituency'
  });

  // Group candidates by constituency and determine winner
  const constituencyData = useMemo(() => {
    const groups: Record<string, ParliamentaryCandidate[]> = {};
    candidates.forEach(c => {
      if (!groups[c.constituency]) {
        groups[c.constituency] = [];
      }
      groups[c.constituency].push(c);
    });

    return Object.entries(groups).map(([name, candidates]) => {
      // Sort by projected vote share descending
      const sorted = [...candidates].sort((a, b) => b.projectedVoteShare - a.projectedVoteShare);
      const winner = sorted[0];
      const runnerUp = sorted[1];
      const margin = runnerUp ? (winner.projectedVoteShare - runnerUp.projectedVoteShare).toFixed(1) : '100';
      
      return {
        name,
        region: 'National', 
        candidatesCount: candidates.length,
        winner,
        runnerUp,
        margin,
        totalCandidates: candidates
      };
    }).filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.winner.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [candidates, searchTerm]);

  const handleRowClick = async (data: any) => {
    setSelectedConstituency(data);
    setAiReport(null);
    setConstituencyProfile(null);
    setLoading(true);

    try {
      const profile = getConstituencyProfile(data.name, data.winner.name, data.winner.party);
      setConstituencyProfile(profile);

      const context = `
        Constituency: ${data.name}.
        Region: ${profile.region}.
        Demographics: ${profile.demographics.urbanizationRate > 50 ? 'Urban' : 'Rural'}, ${profile.demographics.youthPercentage}% Youth.
        Key Challenges: ${profile.campaignStrategy.keyChallenges.join(', ')}.
        Current Projected Winner: ${data.winner.name} (${data.winner.party}) with ${data.winner.projectedVoteShare}% vote share.
        Runner Up: ${data.runnerUp ? `${data.runnerUp.name} (${data.runnerUp.party})` : 'None'}.
        Margin: ${data.margin}%.
        Number of Candidates: ${data.candidatesCount}.
      `;

      const report = await generatePoliticalStrategy(
        data.winner.name,
        data.winner.party,
        data.name,
        context
      );
      setAiReport(report);
    } catch (error) {
      console.error("Failed to generate constituency sitrep", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePanel = () => {
    setSelectedConstituency(null);
    setConstituencyProfile(null);
    setAiReport(null);
  };

  const handleDelete = (id: string) => {
    if (onUpdateCandidates && window.confirm('Remove this candidate from the list?')) {
        const updated = candidates.filter(c => c.id !== id);
        onUpdateCandidates(updated);
        // Update local selected view if it's open
        if (selectedConstituency) {
            const updatedConstituencyCandidates = updated.filter(c => c.constituency === selectedConstituency.name);
            if (updatedConstituencyCandidates.length === 0) {
                handleClosePanel(); // Close if no candidates left
            } else {
               // Re-calculate local state would happen via effect or re-selection, 
               // but for simplicity we rely on re-render, though selectedConstituency object is stale.
               // We manually patch it for the UI until re-selection
               setSelectedConstituency({
                   ...selectedConstituency,
                   totalCandidates: updatedConstituencyCandidates
               });
            }
        }
    }
  };

  const handleAdd = () => {
    if (onUpdateCandidates && newCandidate.name && newCandidate.constituency) {
        const candidate: ParliamentaryCandidate = {
            id: `new-parl-${Date.now()}`,
            name: newCandidate.name,
            constituency: newCandidate.constituency,
            party: newCandidate.party || 'Independent',
            category: newCandidate.category as any || 'Constituency',
            sentimentScore: 50,
            projectedVoteShare: 10,
            mentions: 500
        };
        onUpdateCandidates([...candidates, candidate]);
        setIsAddModalOpen(false);
        setNewCandidate({ name: '', constituency: '', party: 'Independent', category: 'Constituency' });
    }
  };

  const handleBulkUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onUpdateCandidates) return;
      
      const reader = new FileReader();
      reader.onload = (ev) => {
          const text = ev.target?.result as string;
          try {
             // Name,Constituency,Party,Category
             const lines = text.split('\n');
             const newItems: ParliamentaryCandidate[] = [];
             lines.forEach((line, idx) => {
                 if (idx === 0) return;
                 const [name, constituency, party, cat] = line.split(',').map(s => s.trim());
                 if (name && constituency) {
                     newItems.push({
                         id: `bulk-parl-${Date.now()}-${idx}`,
                         name, constituency,
                         party: party || 'Independent',
                         category: (cat as any) || 'Constituency',
                         sentimentScore: 50, projectedVoteShare: 10, mentions: 500
                     });
                 }
             });
             if (newItems.length > 0) {
                 onUpdateCandidates([...candidates, ...newItems]);
                 alert(`Imported ${newItems.length} candidates.`);
             }
          } catch (err) { alert("CSV Parse Error."); }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const getPartyColorBadge = (party: string) => {
    let bg = 'bg-slate-700';
    let text = 'text-slate-300';
    let border = 'border-slate-600';

    if (party === 'NRM') { bg = 'bg-yellow-500/10'; text = 'text-yellow-500'; border = 'border-yellow-500/20'; }
    if (party === 'NUP') { bg = 'bg-red-500/10'; text = 'text-red-500'; border = 'border-red-500/20'; }
    if (party === 'FDC') { bg = 'bg-blue-500/10'; text = 'text-blue-500'; border = 'border-blue-500/20'; }
    if (party === 'DP')  { bg = 'bg-green-500/10'; text = 'text-green-500'; border = 'border-green-500/20'; }

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${bg} ${text} ${border}`}>
            {party}
        </span>
    );
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full relative">
      <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="text-purple-400" size={24} />
              Constituency Projection Report
           </h3>
           <p className="text-sm text-slate-400 mt-1">
             Aggregated data for {constituencyData.length} constituencies.
           </p>
        </div>
        
        <div className="flex items-center gap-3">
             {onUpdateCandidates && (
                <>
                    {isAdminMode && (
                        <div className="flex items-center gap-2 animate-fade-in mr-2">
                             <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-green-600 hover:bg-green-500 text-white px-2 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                            >
                                <Plus size={14} /> Add
                            </button>
                            <button 
                                onClick={handleBulkUploadClick}
                                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                            >
                                <Upload size={14} /> Import
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
                    <button
                        onClick={() => setIsAdminMode(!isAdminMode)}
                        className={`p-1.5 rounded transition-colors ${isAdminMode ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Toggle Admin Mode"
                    >
                        {isAdminMode ? <Shield size={16} /> : <Lock size={16} />}
                    </button>
                </>
             )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text"
                  placeholder="Filter Constituency..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 w-64"
                />
            </div>
        </div>
      </div>

      <div className="overflow-auto flex-grow">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="p-5 font-bold border-b border-slate-700">Constituency</th>
              <th className="p-5 font-bold border-b border-slate-700">Candidates</th>
              <th className="p-5 font-bold border-b border-slate-700">Projected Leader</th>
              <th className="p-5 font-bold border-b border-slate-700">Lead Party</th>
              <th className="p-5 font-bold border-b border-slate-700">Proj. Share</th>
              <th className="p-5 font-bold border-b border-slate-700 text-right">Margin</th>
              <th className="p-5 font-bold border-b border-slate-700">Intel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-sm">
            {constituencyData.map((data, idx) => (
              <tr 
                key={idx} 
                onClick={() => handleRowClick(data)}
                className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
              >
                <td className="p-5 font-medium text-white group-hover:text-blue-400">
                    {data.name}
                </td>
                <td className="p-5 text-slate-400">
                    <div className="flex items-center gap-1">
                        <Users size={14} /> {data.candidatesCount}
                    </div>
                </td>
                <td className="p-5">
                    <div className="font-bold text-slate-200">{data.winner.name}</div>
                    {data.runnerUp && (
                        <div className="text-xs text-slate-500 mt-1">
                            vs {data.runnerUp.name} ({getPartyColorBadge(data.runnerUp.party)})
                        </div>
                    )}
                </td>
                <td className="p-5">
                    {getPartyColorBadge(data.winner.party)}
                </td>
                <td className="p-5">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{data.winner.projectedVoteShare}%</span>
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${
                                    data.winner.projectedVoteShare > 50 ? 'bg-green-500' : 'bg-yellow-500'
                                }`} 
                                style={{width: `${data.winner.projectedVoteShare}%`}}
                            ></div>
                        </div>
                    </div>
                </td>
                <td className="p-5 text-right font-mono text-slate-300">
                    +{data.margin}%
                </td>
                <td className="p-5">
                    <button className="text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded hover:bg-purple-500/20 hover:text-purple-300 flex items-center gap-2 text-xs uppercase font-bold transition-all shadow-sm border border-purple-500/20">
                        Generate SitRep <ArrowUpRight size={14} />
                    </button>
                </td>
              </tr>
            ))}
             {constituencyData.length === 0 && (
                <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-500">
                        No constituencies found matching "{searchTerm}"
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

       {/* Add Candidate Modal */}
       {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Plus className="text-green-500" /> Add Candidate
                      </h3>
                      <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                          <X size={24} />
                      </button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                          <input 
                              type="text"
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
                              value={newCandidate.name}
                              onChange={e => setNewCandidate({...newCandidate, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Constituency</label>
                          <input 
                              type="text"
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
                              value={newCandidate.constituency}
                              onChange={e => setNewCandidate({...newCandidate, constituency: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Party</label>
                            <input 
                                type="text"
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
                                value={newCandidate.party}
                                onChange={e => setNewCandidate({...newCandidate, party: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                            <select 
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
                                value={newCandidate.category}
                                onChange={e => setNewCandidate({...newCandidate, category: e.target.value as any})}
                            >
                                <option value="Constituency">Constituency</option>
                                <option value="Woman MP">Woman MP</option>
                                <option value="Special Interest">Special Interest</option>
                            </select>
                        </div>
                      </div>
                      <button 
                          onClick={handleAdd}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors mt-2"
                      >
                          Add Candidate
                      </button>
                  </div>
              </div>
          </div>
      )}
      
      {/* Detail Slide-over Panel */}
      {selectedConstituency && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]" 
            onClick={handleClosePanel}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-[650px] bg-slate-900 border-l border-slate-700 shadow-2xl z-[51] overflow-y-auto animate-in slide-in-from-right">
             <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <h2 className="text-2xl font-bold text-white leading-tight">{selectedConstituency.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-slate-400">Projected Winner:</span>
                        <span className="text-white font-bold">{selectedConstituency.winner.name}</span>
                        {getPartyColorBadge(selectedConstituency.winner.party)}
                      </div>
                   </div>
                   <button onClick={handleClosePanel} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                      <X size={24} />
                   </button>
                </div>

                <div className="h-px bg-slate-800 w-full mb-8"></div>

                {/* Socio-Economic & Challenges Section */}
                {constituencyProfile && (
                  <div className="mb-8 space-y-6">
                    {/* Socio-Economic Terrain */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-blue-400" /> Socio-Economic Terrain
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-start gap-3">
                               <div className="p-2 bg-green-500/10 rounded text-green-400"><Briefcase size={18} /></div>
                               <div>
                                   <p className="text-xs text-slate-500 uppercase font-bold">Economy</p>
                                   <p className="text-sm font-medium text-white">{constituencyProfile.socioEconomic.primaryActivity}</p>
                               </div>
                           </div>
                           <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-start gap-3">
                               <div className="p-2 bg-red-500/10 rounded text-red-400"><TrendingDown size={18} /></div>
                               <div>
                                   <p className="text-xs text-slate-500 uppercase font-bold">Poverty</p>
                                   <p className="text-sm font-medium text-white">{constituencyProfile.socioEconomic.povertyIndex}</p>
                               </div>
                           </div>
                           <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-start gap-3">
                               <div className="p-2 bg-yellow-500/10 rounded text-yellow-400"><Zap size={18} /></div>
                               <div>
                                   <p className="text-xs text-slate-500 uppercase font-bold">Power Access</p>
                                   <p className="text-sm font-medium text-white">{constituencyProfile.socioEconomic.accessToElectricity}%</p>
                               </div>
                           </div>
                           <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-start gap-3">
                               <div className="p-2 bg-blue-500/10 rounded text-blue-400"><BookOpen size={18} /></div>
                               <div>
                                   <p className="text-xs text-slate-500 uppercase font-bold">Literacy</p>
                                   <p className="text-sm font-medium text-white">{constituencyProfile.socioEconomic.literacyRate}%</p>
                               </div>
                           </div>
                        </div>
                    </div>

                    {/* Key Tactical Challenges */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                           <Target size={16} className="text-red-400" /> Key Tactical Challenges
                        </h4>
                        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                             <div className="flex flex-wrap gap-2">
                                {constituencyProfile.campaignStrategy.keyChallenges.map((challenge, idx) => (
                                    <div key={idx} className="bg-slate-900 border border-slate-600 px-3 py-1.5 rounded text-sm text-slate-200 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        {challenge}
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* AI SitRep Section */}
                <div className="mb-8">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-purple-600/20 rounded-lg text-purple-400">
                         <BrainCircuit size={24} />
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-white">AI Strategic Intelligence</h3>
                         <p className="text-xs text-purple-400 uppercase tracking-widest font-bold">Deep Dive Analysis</p>
                      </div>
                   </div>

                   {loading ? (
                      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center flex flex-col items-center">
                          <BrainCircuit className="animate-pulse text-purple-500 mb-4" size={32} />
                          <h4 className="text-white font-bold mb-2">Consulting The Grand Strategist...</h4>
                          <p className="text-slate-500 text-sm">Synthesizing demographics, historical voting patterns, and strategic doctrine.</p>
                      </div>
                   ) : aiReport ? (
                      <div className="space-y-6 animate-fade-in">
                          {/* SitRep */}
                          <div className="bg-slate-800 rounded-xl border border-blue-500/30 overflow-hidden">
                              <div className="bg-blue-900/10 px-6 py-3 border-b border-blue-500/10 flex items-center justify-between">
                                 <span className="text-xs font-bold text-blue-400 uppercase flex items-center gap-2">
                                    <Activity size={14} /> Situation Report (SitRep)
                                 </span>
                                 <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                    CONFIDENTIAL
                                 </span>
                              </div>
                              <div className="p-6">
                                 <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                    {aiReport.sitRep}
                                 </p>
                              </div>
                          </div>

                          {/* Grand Strategy Preview */}
                          <div className="bg-slate-800 rounded-xl border border-purple-500/30 overflow-hidden relative">
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>
                              <div className="bg-purple-900/10 px-6 py-3 border-b border-purple-500/10">
                                 <span className="text-xs font-bold text-purple-400 uppercase flex items-center gap-2">
                                    <BrainCircuit size={14} /> The Grand Strategist
                                 </span>
                              </div>
                              <div className="p-6">
                                 <p className="text-slate-300 leading-relaxed italic text-sm font-serif border-l-2 border-purple-500 pl-4">
                                    "{aiReport.grandStrategy}"
                                 </p>
                              </div>
                          </div>
                      </div>
                   ) : (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-center gap-4 text-red-300">
                         <AlertTriangle size={24} />
                         <p>Unable to generate report. Please verify API connection.</p>
                      </div>
                   )}
                </div>

                {/* Candidate List Mini Table */}
                <div>
                   <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Contesting Candidates</h4>
                   <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                      <table className="w-full text-left text-sm">
                         <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase">
                            <tr>
                               <th className="p-3">Name</th>
                               <th className="p-3">Party</th>
                               <th className="p-3 text-right">Proj. %</th>
                               {isAdminMode && <th className="p-3 text-right">Action</th>}
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-700">
                            {selectedConstituency.totalCandidates.map((c: any) => (
                               <tr key={c.id} className="hover:bg-slate-700/50">
                                  <td className="p-3 text-white font-medium">{c.name}</td>
                                  <td className="p-3">{getPartyColorBadge(c.party)}</td>
                                  <td className="p-3 text-right text-slate-300 font-mono">{c.projectedVoteShare}%</td>
                                  {isAdminMode && (
                                     <td className="p-3 text-right">
                                        <button 
                                            onClick={() => handleDelete(c.id)}
                                            className="text-slate-500 hover:text-red-400"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                     </td>
                                  )}
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

             </div>
          </div>
        </>
      )}
    </div>
  );
};
