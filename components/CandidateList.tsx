
import React, { useRef, useState } from 'react';
import { Candidate, PresidentialProfile } from '../types';
import { analyzePresidentialCandidate } from '../services/geminiService';
import { 
  TrendingUp, TrendingDown, MessageCircle, X, Globe, 
  FileText, ExternalLink, Newspaper, BrainCircuit, 
  Lock, Target, Crosshair, Heart, GraduationCap, 
  AlertTriangle, Activity, History, Plus, Upload, Trash2, Shield, Search, User, Fingerprint, CreditCard, Star, Eye
} from 'lucide-react';

interface CandidateListProps {
  candidates: Candidate[];
  onUpdateCandidates?: (candidates: Candidate[]) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({ candidates, onUpdateCandidates }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [profile, setProfile] = useState<PresidentialProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCandidate, setNewCandidate] = useState<Partial<Candidate>>({
    name: '',
    party: '',
    district: 'National',
    imageUrl: '',
    notes: ''
  });

  const filteredCandidates = candidates.filter(candidate => {
    const term = searchTerm.toLowerCase();
    return candidate.name.toLowerCase().includes(term) || 
           candidate.party.toLowerCase().includes(term);
  });

  const handleRowClick = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setProfile(null);
    setLoading(true);

    try {
      const result = await analyzePresidentialCandidate(candidate.name, candidate.party);
      setProfile(result);
    } catch (error) {
      console.error("Failed to analyze candidate", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onUpdateCandidates && window.confirm('Delete this presidential candidate?')) {
        onUpdateCandidates(candidates.filter(c => c.id !== id));
        if (selectedCandidate?.id === id) setSelectedCandidate(null);
    }
  };

  const handleAdd = () => {
    if (onUpdateCandidates && newCandidate.name && newCandidate.party) {
        const candidate: Candidate = {
            id: `pres-${Date.now()}`,
            name: newCandidate.name,
            party: newCandidate.party,
            district: newCandidate.district || 'National',
            sentimentScore: Math.floor(Math.random() * 60) + 20,
            mentions: Math.floor(Math.random() * 10000) + 500,
            projectedVoteShare: Math.floor(Math.random() * 20),
            imageUrl: '',
            notes: newCandidate.notes
        };
        onUpdateCandidates([...candidates, candidate]);
        setIsAddModalOpen(false);
        setNewCandidate({ name: '', party: '', district: 'National', imageUrl: '', notes: '' });
    }
  };

  const handleBulkUploadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onUpdateCandidates) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const text = event.target?.result as string;
          try {
              // CSV: Name,Party,Notes
              const lines = text.split('\n');
              const newItems: Candidate[] = [];
              lines.forEach((line, index) => {
                  if (index === 0) return;
                  const [name, party, notes] = line.split(',').map(s => s.trim());
                  if (name && party) {
                      newItems.push({
                          id: `bulk-pres-${Date.now()}-${index}`,
                          name,
                          party,
                          district: 'National',
                          sentimentScore: 50,
                          mentions: 1000,
                          projectedVoteShare: 1,
                          imageUrl: '',
                          notes: notes || ''
                      });
                  }
              });
              if (newItems.length > 0) {
                  onUpdateCandidates([...candidates, ...newItems]);
                  alert(`Imported ${newItems.length} candidates.`);
              }
          } catch (e) {
              alert("CSV Error. Format: Name,Party,Notes");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden relative">
      <div className="p-8 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h3 className="text-xl font-semibold text-white">Presidential Performance Tracker</h3>
           <p className="text-slate-400 text-base mt-1">Sentiment analysis and projection models. Click a candidate for deep OSINT analysis.</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
             {/* Search Input */}
             <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search candidate..." 
                    className="bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-64 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             {onUpdateCandidates && (
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {isAdminMode && (
                        <div className="flex items-center gap-2 animate-fade-in mr-2">
                             <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Plus size={16} /> Add
                            </button>
                            <button 
                                onClick={handleBulkUploadClick}
                                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Upload size={16} /> Import
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
                        className={`p-2 rounded-lg transition-colors ${isAdminMode ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Toggle Admin Mode"
                    >
                        {isAdminMode ? <Shield size={20} /> : <Lock size={20} />}
                    </button>
                </div>
             )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-base uppercase tracking-wider">
              <th className="p-6 font-medium">Candidate</th>
              <th className="p-6 font-medium">Party & District</th>
              <th className="p-6 font-medium">Sentiment</th>
              <th className="p-6 font-medium">Vote Proj.</th>
              <th className="p-6 font-medium">Mentions (24h)</th>
              <th className="p-6 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredCandidates.map((candidate) => (
              <tr 
                key={candidate.id} 
                className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
                onClick={() => handleRowClick(candidate)}
              >
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-slate-400">
                         <User size={20} />
                    </div>
                    <span className="font-medium text-lg text-slate-200 group-hover:text-blue-400 transition-colors">{candidate.name}</span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="text-slate-200 font-semibold text-lg">{candidate.party}</div>
                  <div className="text-sm text-slate-500">{candidate.district}</div>
                  {candidate.notes && (
                    <div className="text-sm text-slate-400 italic mt-1 max-w-[240px]">{candidate.notes}</div>
                  )}
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-slate-700 rounded-full w-28 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          candidate.sentimentScore > 60 ? 'bg-green-500' : 
                          candidate.sentimentScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${candidate.sentimentScore}%` }}
                      ></div>
                    </div>
                    <span className="text-base font-mono text-slate-400">{candidate.sentimentScore}%</span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center text-slate-200 font-medium text-lg">
                    {candidate.projectedVoteShare}%
                    {candidate.projectedVoteShare > 50 ? (
                      <TrendingUp size={20} className="ml-2 text-green-500" />
                    ) : (
                      <TrendingDown size={20} className="ml-2 text-red-500" />
                    )}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 text-slate-400 text-base">
                    <MessageCircle size={18} />
                    {candidate.mentions.toLocaleString()}
                  </div>
                </td>
                <td className="p-6">
                    {isAdminMode ? (
                        <button 
                            onClick={(e) => handleDelete(e, candidate.id)}
                            className="text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    ) : (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRowClick(candidate); }}
                            className="text-blue-500 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            Deep Analysis <BrainCircuit size={14} />
                        </button>
                    )}
                </td>
              </tr>
            ))}
            {filteredCandidates.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                        No candidates found matching "{searchTerm}"
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
                          <Plus className="text-green-500" /> Add Presidential Candidate
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
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Party</label>
                          <input 
                              type="text"
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
                              value={newCandidate.party}
                              onChange={e => setNewCandidate({...newCandidate, party: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label>
                          <input 
                              type="text"
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
                              value={newCandidate.notes}
                              onChange={e => setNewCandidate({...newCandidate, notes: e.target.value})}
                          />
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

      {/* Presidential Detail Panel */}
      {selectedCandidate && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
            onClick={() => setSelectedCandidate(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-[850px] bg-slate-900 border-l border-slate-700 shadow-2xl z-[101] overflow-y-auto animate-in slide-in-from-right">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                         <User size={40} className="text-slate-400" />
                    </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white leading-tight">{selectedCandidate.name}</h2>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-500/30 rounded text-sm font-bold">
                         {selectedCandidate.party}
                       </span>
                       <div className="flex items-center gap-2 text-slate-400">
                          <TrendingUp size={16} className={selectedCandidate.projectedVoteShare > 50 ? "text-green-500" : "text-yellow-500"} />
                          <span className="font-bold text-white">{selectedCandidate.projectedVoteShare}%</span> 
                          <span className="text-xs uppercase">Proj. Vote Share</span>
                       </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                  <X size={28} />
                </button>
              </div>

              {loading ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="relative">
                       <div className="w-20 h-20 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                       <BrainCircuit className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold text-white mb-2">Mugi-Solo is consulting The Grand Strategist...</h3>
                       <p className="text-slate-400">Synthesizing Sun Tzu, Napoleon, Boyd, and live OSINT data.</p>
                       <div className="flex justify-center gap-4 mt-6">
                          <span className="text-xs bg-slate-800 px-3 py-1 rounded text-slate-500 animate-pulse">Deep Reasoning</span>
                          <span className="text-xs bg-slate-800 px-3 py-1 rounded text-slate-500 animate-pulse delay-75">Web Crawl</span>
                          <span className="text-xs bg-slate-800 px-3 py-1 rounded text-slate-500 animate-pulse delay-150">Strategic Synthesis</span>
                       </div>
                    </div>
                 </div>
              ) : profile ? (
                <div className="animate-fade-in space-y-10">
                   
                   {/* --- AI GRAND STRATEGIST SECTION --- */}
                  <div className="bg-gradient-to-br from-slate-900 to-purple-900/20 rounded-xl border border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.1)] overflow-hidden relative">
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-amber-400 to-purple-500 animate-pulse"></div>
                     <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                     
                     <div className="p-8 relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-300 border border-purple-500/30 shadow-inner">
                                <BrainCircuit size={28} />
                                </div>
                                <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    The Grand Strategist Core
                                    <Star size={16} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                                </h3>
                                <div className="flex gap-2 mt-1">
                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded font-bold border border-purple-500/30">
                                        AI GENERATED
                                    </span>
                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-[10px] rounded font-bold border border-yellow-500/30 flex items-center gap-1">
                                        <Eye size={10} /> STRATEGIC PRIORITY
                                    </span>
                                </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/30 rounded-xl p-8 border border-purple-500/20 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                            <div className="prose prose-invert prose-lg max-w-none">
                                <div className="text-slate-200 leading-relaxed whitespace-pre-line font-serif italic pl-4">
                                   "{profile.campaignStrategy.grandStrategy}"
                                </div>
                            </div>
                        </div>
                     </div>
                  </div>

                   {/* --- National Overview & Demographics --- */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                          <p className="text-sm text-slate-400 uppercase font-bold mb-2">Electorate</p>
                          <p className="text-2xl font-bold text-white">{profile.nationalOverview.totalRegisteredVoters}</p>
                          <p className="text-sm text-slate-500 mt-1">{profile.nationalOverview.youthDemographic}</p>
                      </div>
                      <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                          <p className="text-sm text-slate-400 uppercase font-bold mb-2">Key Battlegrounds</p>
                          <div className="flex flex-wrap gap-2">
                             {profile.nationalOverview.keySwingRegions.map((r, i) => (
                                <span key={i} className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">{r}</span>
                             ))}
                          </div>
                      </div>
                      <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                          <p className="text-sm text-slate-400 uppercase font-bold mb-2">Economic Mood</p>
                          <p className="text-sm text-slate-200 leading-snug">{profile.nationalOverview.economicMood}</p>
                      </div>
                   </div>

                   {/* --- Campaign Feed & Strategy --- */}
                   <div>
                      <h3 className="text-base font-bold text-white uppercase mb-4 flex items-center gap-3">
                         <Newspaper size={20} className="text-green-400" /> 
                         Campaign Intelligence Feed
                      </h3>
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-6">
                         {/* News Items */}
                         <div className="grid grid-cols-1 gap-4">
                            {profile.campaignStrategy.latestNews.map((news, i) => (
                               <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex gap-4">
                                  <div className="flex-shrink-0 mt-1">
                                     <Globe size={18} className="text-blue-500" />
                                  </div>
                                  <div>
                                     <div className="flex justify-between items-start mb-1">
                                        <p className="text-base font-bold text-slate-200 hover:text-blue-400 transition-colors cursor-pointer">{news.headline}</p>
                                        <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{news.date}</span>
                                     </div>
                                     <p className="text-sm text-slate-400 mb-2">{news.snippet}</p>
                                     <p className="text-xs text-blue-500/80 uppercase font-bold">{news.source}</p>
                                  </div>
                               </div>
                            ))}
                         </div>

                         {/* Challenges & Strategy */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700">
                            <div>
                               <p className="text-sm text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                                  <Target size={14} /> Tactical Challenges
                               </p>
                               <ul className="space-y-2">
                                  {profile.campaignStrategy.keyChallenges.map((c, i) => (
                                     <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                        {c}
                                     </li>
                                  ))}
                                </ul>
                            </div>
                            <div>
                               <p className="text-sm text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                                  <Crosshair size={14} /> Winning Strategy
                               </p>
                               <p className="text-sm text-slate-300 italic leading-relaxed border-l-2 border-blue-500 pl-3">
                                  {profile.campaignStrategy.winningStrategy}
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* --- OSINT Dossier --- */}
                   <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                      <div className="bg-slate-900/50 px-6 py-5 border-b border-slate-700 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded text-blue-400">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white uppercase tracking-wide">Forensic OSINT Dossier</h3>
                                <p className="text-xs text-slate-500">Deep Web & Public Records Scan</p>
                            </div>
                         </div>
                      </div>
                      
                      <div className="p-6 space-y-8">
                         {/* Basic Info */}
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900/30 p-4 rounded-lg border border-slate-700/30">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-slate-500"><Heart size={20} /></div>
                                <div>
                                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Marital Status</p>
                                  <p className="text-base text-slate-200 font-medium">{profile.osintBackground.maritalStatus}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-slate-500"><GraduationCap size={20} /></div>
                                <div>
                                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Education</p>
                                  <p className="text-base text-slate-200 font-medium">{profile.osintBackground.education}</p>
                                </div>
                            </div>
                         </div>

                         <div>
                            <p className="text-sm text-slate-400 uppercase font-bold mb-2 ml-1">Lifestyle Analysis</p>
                            <div className="text-base text-slate-300 bg-slate-900 p-5 rounded-lg border border-slate-700 italic relative">
                               <span className="absolute top-3 left-3 text-slate-600 text-4xl opacity-20">"</span>
                               <span className="relative z-10">{profile.osintBackground.lifestyle}</span>
                            </div>
                         </div>

                         {/* Digital & Financial Intel Cards */}
                         {(profile.osintBackground.digitalFootprint || profile.osintBackground.financialIntel) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Digital Footprint Card */}
                                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-md relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                    <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                            <Fingerprint size={24} />
                                        </div>
                                        <h4 className="font-bold text-lg text-blue-200">Digital Footprint</h4>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed font-light">
                                        {profile.osintBackground.digitalFootprint || "Data unavailable."}
                                    </p>
                                </div>
                                
                                {/* Financial Intelligence Card */}
                                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-md relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                    <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                            <CreditCard size={24} />
                                        </div>
                                        <h4 className="font-bold text-lg text-green-200">Financial Intelligence</h4>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed font-light">
                                        {profile.osintBackground.financialIntel || "Data unavailable."}
                                    </p>
                                </div>
                            </div>
                         )}

                         {/* Network Map */}
                         {profile.osintBackground.networkMap && profile.osintBackground.networkMap.length > 0 && (
                            <div className="border-t border-slate-700/50 pt-6">
                                <p className="text-sm text-slate-400 uppercase font-bold mb-3 ml-1">Key Network & Allies</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.osintBackground.networkMap.map((ally, i) => (
                                        <span key={i} className="bg-slate-900 text-slate-300 px-3 py-1.5 rounded-full text-xs border border-slate-700 font-medium hover:border-slate-500 transition-colors cursor-default">
                                            {ally}
                                        </span>
                                    ))}
                                </div>
                            </div>
                         )}

                         <div className="border-t border-slate-700/50 pt-6">
                           <p className="text-sm text-red-400 uppercase font-bold mb-3 flex items-center gap-2 ml-1">
                              <AlertTriangle size={16} /> Reported Controversies
                           </p>
                           <ul className="space-y-3 bg-red-900/5 p-4 rounded-lg border border-red-900/20">
                              {profile.osintBackground.controversies.map((item, idx) => (
                                 <li key={idx} className="text-sm text-slate-300 flex items-start gap-3">
                                    <span className="text-red-500 mt-1.5 text-[8px]">●</span>
                                    {item}
                                 </li>
                              ))}
                           </ul>
                        </div>
                      </div>
                   </div>

                   {/* --- Social Pulse & History Grid --- */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Social Pulse */}
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                          <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                              <MessageCircle size={18} className="text-pink-500" /> Social Pulse
                          </h3>
                          <div className="flex justify-between items-end mb-4">
                              <div>
                                  <p className="text-xs text-slate-400 uppercase">Total Mentions</p>
                                  <p className="text-2xl font-bold text-white">{profile.socialPulse.totalMentions.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-xs text-slate-400 uppercase">Net Sentiment</p>
                                  <p className={`text-xl font-bold ${profile.socialPulse.sentiment.positive > profile.socialPulse.sentiment.negative ? 'text-green-400' : 'text-red-400'}`}>
                                      {profile.socialPulse.sentiment.positive > profile.socialPulse.sentiment.negative ? '+ Positive' : '- Negative'}
                                  </p>
                              </div>
                          </div>
                          <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden flex mb-4">
                              <div className="bg-green-500 h-full" style={{width: `${profile.socialPulse.sentiment.positive}%`}}></div>
                              <div className="bg-slate-500 h-full" style={{width: `${profile.socialPulse.sentiment.neutral}%`}}></div>
                              <div className="bg-red-500 h-full" style={{width: `${profile.socialPulse.sentiment.negative}%`}}></div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {profile.socialPulse.trendingTopics.map((t, i) => (
                                  <span key={i} className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">{t}</span>
                              ))}
                          </div>
                      </div>

                      {/* Political History */}
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                          <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                              <History size={18} className="text-orange-500" /> Political History
                          </h3>
                          <ul className="space-y-4">
                             {profile.politicalHistory.map((h, i) => (
                                <li key={i} className="flex justify-between items-center border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
                                   <div>
                                      <p className="text-sm font-bold text-white">{h.year} Election</p>
                                      <p className="text-xs text-slate-400">{h.position} • {h.party}</p>
                                   </div>
                                   <div className="text-right">
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${h.outcome === 'Won' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                         {h.outcome}
                                      </span>
                                      {h.votes && <p className="text-xs text-slate-500 mt-0.5">{h.votes.toLocaleString()} votes</p>}
                                   </div>
                                </li>
                             ))}
                          </ul>
                      </div>
                   </div>

                   {/* --- Sources Footer --- */}
                   {profile.sources && profile.sources.length > 0 && (
                     <div className="pt-6 border-t border-slate-700">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                           <ExternalLink size={14} /> Verified OSINT Sources (Web Crawl)
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                           {profile.sources.map((source, idx) => (
                              <a 
                                key={idx} 
                                href={source.web?.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-3 p-2 bg-slate-900 rounded border border-slate-800 hover:border-blue-500 transition-colors group"
                              >
                                 <div className="bg-slate-800 p-1.5 rounded text-slate-500 group-hover:text-blue-400">
                                    <Globe size={14} />
                                 </div>
                                 <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-blue-400 truncate group-hover:text-blue-300">
                                       {source.web?.title}
                                    </p>
                                    <p className="text-xs text-slate-600 truncate">
                                       {source.web?.uri}
                                    </p>
                                 </div>
                              </a>
                           ))}
                        </div>
                     </div>
                   )}

                </div>
              ) : (
                <div className="text-center py-20 text-slate-500">
                   <Lock size={48} className="mx-auto mb-4 opacity-50" />
                   <p>Select a candidate to initialize deep forensic scan.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
