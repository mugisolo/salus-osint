
import React, { useRef, useState } from 'react';
import { Incident } from '../types';
import { AlertTriangle, CheckCircle, Clock, MapPin, FileText, ArrowUpRight, Plus, Upload, Trash2, Shield, Lock, X, Search, Calendar, Database } from 'lucide-react';
import { searchIncidents } from '../services/firestoreService';

interface ViolenceMapProps {
  incidents: Incident[];
  onUpdateIncidents?: (incidents: Incident[]) => void;
  fullScreen?: boolean;
}

export const ViolenceMap: React.FC<ViolenceMapProps> = ({ incidents, onUpdateIncidents, fullScreen = false }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Search State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isHistoricalView, setIsHistoricalView] = useState(false);
  
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    date: new Date().toISOString().split('T')[0],
    location: '',
    type: 'Violence',
    fatalities: 0,
    injuries: 0,
    description: '',
    verified: false
  });

  const handleDelete = (id: string) => {
    if (onUpdateIncidents && window.confirm('Delete this incident report?')) {
        onUpdateIncidents(incidents.filter(i => i.id !== id));
    }
  };

  const handleSearch = async () => {
      setIsSearching(true);
      try {
          const results = await searchIncidents(startDate, endDate, searchLocation);
          if (onUpdateIncidents) {
              onUpdateIncidents(results);
              setIsHistoricalView(true);
          }
      } catch (error) {
          console.error("Search failed", error);
      } finally {
          setIsSearching(false);
      }
  };

  const clearSearch = () => {
      setStartDate('');
      setEndDate('');
      setSearchLocation('');
      setIsHistoricalView(false);
      // Note: Ideally we would trigger a re-fetch of live data here, 
      // but the parent component subscription handles the "live" state if we just reset. 
      // However, onUpdateIncidents replaces the whole list. 
      // To properly reset to live, we might need a "reset" prop or method, 
      // but for now, the user can refresh or we just leave the historical data until new live data arrives.
      alert("Please refresh the dashboard to return to the Live Feed.");
  };

  const handleAdd = () => {
    if (onUpdateIncidents && newIncident.location && newIncident.description) {
        const incident: Incident = {
            id: `new-${Date.now()}`,
            latitude: 0, // Mock lat/lng
            longitude: 0,
            date: newIncident.date || new Date().toISOString().split('T')[0],
            location: newIncident.location || 'Unknown',
            type: newIncident.type as any || 'Violence',
            fatalities: Number(newIncident.fatalities) || 0,
            injuries: Number(newIncident.injuries) || 0,
            description: newIncident.description || '',
            verified: false
        };
        onUpdateIncidents([incident, ...incidents]);
        setIsAddModalOpen(false);
        setNewIncident({
            date: new Date().toISOString().split('T')[0],
            location: '',
            type: 'Violence',
            fatalities: 0,
            injuries: 0,
            description: '',
            verified: false
        });
    }
  };

  const handleBulkUploadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onUpdateIncidents) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const text = event.target?.result as string;
          try {
              // CSV Format: Date,Location,Type,Description,Fatalities,Injuries
              const lines = text.split('\n');
              const newItems: Incident[] = [];
              
              lines.forEach((line, index) => {
                  if (index === 0) return; // Skip header
                  const [date, location, type, desc, deaths, inj] = line.split(',').map(s => s.trim());
                  if (date && location) {
                      newItems.push({
                          id: `bulk-${Date.now()}-${index}`,
                          date,
                          location,
                          type: (type as any) || 'Violence',
                          description: desc || 'Imported incident',
                          fatalities: Number(deaths) || 0,
                          injuries: Number(inj) || 0,
                          latitude: 0,
                          longitude: 0,
                          verified: false
                      });
                  }
              });

              if (newItems.length > 0) {
                  onUpdateIncidents([...newItems, ...incidents]);
                  alert(`Successfully imported ${newItems.length} incidents.`);
              }
          } catch (err) {
              alert("Failed to parse CSV. Format: Date,Location,Type,Description,Fatalities,Injuries");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col ${fullScreen ? 'h-full' : 'h-[600px]'}`}>
      <div className="p-6 border-b border-slate-700 flex flex-col gap-4 bg-slate-900/50">
        <div className="flex justify-between items-center">
            <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="text-blue-400" size={20} />
                Security Incident Log
            </h3>
            <p className="text-sm text-slate-400 mt-1">
                Documented political violence and unrest events.
            </p>
            </div>
            
            <div className="flex items-center gap-3">
                {fullScreen && onUpdateIncidents && (
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
                <div className={`text-xs font-mono px-3 py-1 rounded border ${isHistoricalView ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                    {isHistoricalView ? 'HISTORICAL ARCHIVE' : 'LIVE FEED'}
                </div>
            </div>
        </div>

        {/* Historical Search Bar */}
        {fullScreen && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-500" />
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                    />
                    <span className="text-slate-500 text-xs">to</span>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Search size={14} className="text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search location or keywords..." 
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none w-full"
                    />
                </div>
                <button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                    {isSearching ? 'Searching...' : <><Database size={12} /> Search DB</>}
                </button>
                {isHistoricalView && (
                    <button 
                        onClick={clearSearch}
                        className="text-slate-400 hover:text-white px-2 py-1 text-xs underline"
                    >
                        Reset to Live
                    </button>
                )}
            </div>
        )}
      </div>

      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="p-4 font-bold border-b border-slate-700">Date / Time</th>
              <th className="p-4 font-bold border-b border-slate-700">Location</th>
              <th className="p-4 font-bold border-b border-slate-700">Type</th>
              <th className="p-4 font-bold border-b border-slate-700">Impact</th>
              <th className="p-4 font-bold border-b border-slate-700">Verification</th>
              <th className="p-4 font-bold border-b border-slate-700 w-1/3">Description</th>
              {isAdminMode && <th className="p-4 font-bold border-b border-slate-700">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-sm">
            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="p-4 text-slate-300 whitespace-nowrap">
                   <div className="font-medium text-white">{incident.date}</div>
                   <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock size={12} /> {incident.osintReport?.timeline?.[0]?.time || '00:00'}
                   </div>
                </td>
                <td className="p-4">
                   <div className="flex items-center gap-2 text-white font-medium">
                      <MapPin size={14} className="text-slate-500" />
                      {incident.location}
                   </div>
                   <div className="text-xs text-slate-500 pl-6 mt-0.5">
                      Lat: {incident.latitude.toFixed(3)}, Lng: {incident.longitude.toFixed(3)}
                   </div>
                </td>
                <td className="p-4">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${
                      incident.type === 'Violence' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      incident.type === 'Protest' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      incident.type === 'Arrest' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-slate-700 text-slate-300 border-slate-600'
                   }`}>
                      {incident.type}
                   </span>
                </td>
                <td className="p-4">
                   <div className="flex gap-3">
                      <div className="text-center">
                         <span className={`block font-bold text-lg ${incident.fatalities > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                            {incident.fatalities}
                         </span>
                         <span className="text-[10px] uppercase text-slate-500">Deaths</span>
                      </div>
                      <div className="w-px bg-slate-700 h-8"></div>
                      <div className="text-center">
                         <span className={`block font-bold text-lg ${incident.injuries > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                            {incident.injuries}
                         </span>
                         <span className="text-[10px] uppercase text-slate-500">Injured</span>
                      </div>
                   </div>
                </td>
                <td className="p-4">
                   {incident.verified ? (
                      <div className="flex items-center gap-2 text-green-400 bg-green-900/10 px-2 py-1 rounded border border-green-500/20 w-fit">
                         <CheckCircle size={14} />
                         <span className="text-xs font-bold">Verified</span>
                      </div>
                   ) : (
                      <div className="flex items-center gap-2 text-amber-400 bg-amber-900/10 px-2 py-1 rounded border border-amber-500/20 w-fit">
                         <AlertTriangle size={14} />
                         <span className="text-xs font-bold">Unverified</span>
                      </div>
                   )}
                   {incident.osintReport && (
                      <div className="mt-2 text-xs text-slate-500">
                         Src: {incident.osintReport.sourceReliability.split(' - ')[0]}
                      </div>
                   )}
                </td>
                <td className="p-4 text-slate-300 leading-relaxed">
                   <p className="line-clamp-2 group-hover:line-clamp-none transition-all">
                      {incident.description}
                   </p>
                   {incident.osintReport?.aiAnalysis && (
                      <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs text-blue-300/80 italic">
                         AI Note: {incident.osintReport.aiAnalysis.substring(0, 80)}...
                      </div>
                   )}
                </td>
                {isAdminMode && (
                    <td className="p-4">
                        <button 
                            onClick={() => handleDelete(incident.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-2"
                        >
                            <Trash2 size={16} />
                        </button>
                    </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-700 bg-slate-900/30 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing {incidents.length} records • {isHistoricalView ? 'Archive Mode' : 'Live Mode'}</span>
          <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors">
             Export Log <ArrowUpRight size={14} />
          </button>
      </div>

      {/* Add Incident Modal */}
      {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Plus className="text-green-500" /> Log New Incident
                      </h3>
                      <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                          <X size={24} />
                      </button>
                  </div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                              <input 
                                  type="date"
                                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
                                  value={newIncident.date}
                                  onChange={e => setNewIncident({...newIncident, date: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                              <select 
                                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
                                  value={newIncident.type}
                                  onChange={e => setNewIncident({...newIncident, type: e.target.value as any})}
                              >
                                  <option value="Violence">Violence</option>
                                  <option value="Protest">Protest</option>
                                  <option value="Arrest">Arrest</option>
                                  <option value="Intimidation">Intimidation</option>
                                  <option value="Rally">Rally</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
                          <input 
                              type="text"
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
                              placeholder="District, Town, or Landmark"
                              value={newIncident.location}
                              onChange={e => setNewIncident({...newIncident, location: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fatalities</label>
                              <input 
                                  type="number"
                                  min="0"
                                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
                                  value={newIncident.fatalities}
                                  onChange={e => setNewIncident({...newIncident, fatalities: parseInt(e.target.value) || 0})}
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Injuries</label>
                              <input 
                                  type="number"
                                  min="0"
                                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none text-sm"
                                  value={newIncident.injuries}
                                  onChange={e => setNewIncident({...newIncident, injuries: parseInt(e.target.value) || 0})}
                              />
                           </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                          <textarea 
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none text-sm h-24 resize-none"
                              placeholder="Details of the event..."
                              value={newIncident.description}
                              onChange={e => setNewIncident({...newIncident, description: e.target.value})}
                          />
                      </div>
                      <button 
                          onClick={handleAdd}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors mt-2"
                      >
                          Log Incident
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
