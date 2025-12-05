
import React, { useEffect, useState, useRef } from 'react';
import { generateDailyOpEd } from '../services/geminiService';
import { RefreshCw, Calendar, Share2, Printer, Feather, Quote, Bookmark, Download, Mail, Twitter, Archive, Save } from 'lucide-react';
import { Incident, Candidate, SitRep } from '../types';
import { saveSitRep, getSitRepHistory } from '../services/firestoreService';
import { db } from '../firebaseConfig';

declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
    }
}

interface DailyOpEdProps {
  incidents: Incident[];
  candidates: Candidate[];
}

export const DailyOpEd: React.FC<DailyOpEdProps> = ({ incidents, candidates }) => {
  const [report, setReport] = useState<{ title: string; content: string; keyTakeaways: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const [history, setHistory] = useState<SitRep[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial date string
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    setDateStr(today);
    
    // Load history if DB connected
    if (db) {
        loadHistory();
    }
    
    handleGenerate();
  }, []);

  const loadHistory = async () => {
      const data = await getSitRepHistory();
      setHistory(data);
  };

  const handleGenerate = async () => {
    setLoading(true);
    
    // Prepare summary context for AI
    const incidentsSummary = incidents.slice(0, 5).map(i => `${i.type} in ${i.location} (${i.date})`).join('; ');
    const candidatesSummary = candidates.map(c => `${c.name} (${c.party}): ${c.projectedVoteShare}% vote share`).join('; ');

    try {
      const result = await generateDailyOpEd(incidentsSummary, candidatesSummary);
      setReport(result);
      setSelectedHistoryId(''); // Reset history selection since this is new
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToArchive = async () => {
      if (!report || !db) return;
      setSaving(true);
      try {
          const sitRepData: SitRep = {
              date: new Date().toISOString().split('T')[0],
              title: report.title,
              content: report.content,
              keyTakeaways: report.keyTakeaways,
              timestamp: Date.now()
          };
          await saveSitRep(sitRepData);
          alert("Report archived successfully.");
          loadHistory(); // Refresh list
      } catch (e) {
          console.error(e);
          alert("Failed to save report.");
      } finally {
          setSaving(false);
      }
  };

  const handleHistorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedHistoryId(id);
      if (!id) {
          // If cleared, maybe regenerate or just keep current? keeping current for now
          return;
      }
      const selected = history.find(h => h.id === id);
      if (selected) {
          setReport({
              title: selected.title,
              content: selected.content,
              keyTakeaways: selected.keyTakeaways
          });
          // Update display date to match the historical report
          const reportDate = new Date(selected.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          setDateStr(reportDate);
      }
  };

  const handlePrint = () => {
      window.print();
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current || !window.html2canvas || !window.jspdf) {
        alert("PDF generation libraries not loaded. Please use the Print button to Save as PDF.");
        return;
    }

    try {
        const originalElement = contentRef.current;
        
        // Clone the element to ensure we capture the full height without scrollbars
        const clonedElement = originalElement.cloneNode(true) as HTMLElement;
        
        // Apply temporary styles to the clone for capture to ensure full width/height is rendered
        Object.assign(clonedElement.style, {
            position: 'fixed',
            top: '-10000px',
            left: '-10000px',
            width: '1000px', // Fixed width for consistent rendering
            height: 'auto',
            maxHeight: 'none',
            overflow: 'visible',
            zIndex: '-1000'
        });
        
        document.body.appendChild(clonedElement);

        const canvas = await window.html2canvas(clonedElement, { 
            scale: 2,
            useCORS: true,
            backgroundColor: '#fdfbf7'
        });
        
        // Clean up
        document.body.removeChild(clonedElement);
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const { jsPDF } = window.jspdf;
        
        // Create PDF with custom dimensions matching the image to ensure 1 page
        const pdf = new jsPDF({
            orientation: imgWidth > imgHeight ? 'l' : 'p',
            unit: 'px',
            format: [imgWidth, imgHeight]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        pdf.save(`Salus_SitRep_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error("PDF generation failed:", error);
        alert("Failed to generate PDF. Please try the Print button.");
    }
  };

  const handleEmailReport = () => {
    if (!report) return;
    const subject = encodeURIComponent(`Salus Daily SitRep: ${report.title}`);
    const body = encodeURIComponent(
        `DAILY SITUATION REPORT\nDate: ${dateStr}\n\n` +
        `TITLE: ${report.title}\n\n` +
        `KEY TAKEAWAYS:\n${report.keyTakeaways.map(t => `- ${t}`).join('\n')}\n\n` +
        `Access full dashboard: ${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleTwitterShare = () => {
    if (!report) return;
    const text = encodeURIComponent(`Salus Daily SitRep: ${report.title.substring(0, 200)}...`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: report?.title || 'Salus Daily SitRep',
                text: 'Daily Strategic Analysis: ' + (report?.title || ''),
                url: window.location.href
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert("URL copied to clipboard.");
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-fade-in print:h-auto print:block">
      {/* Header Section */}
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3 font-playfair tracking-wide">
            <Feather className="text-purple-400" size={32} />
            Daily Situation Report
          </h2>
          <p className="text-lg text-slate-400 font-merriweather italic">AI-Generated Strategic Analysis</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
            {/* History Selector */}
            {db && (
                <div className="flex items-center gap-2 mb-2">
                    <Archive size={16} className="text-slate-500" />
                    <select 
                        value={selectedHistoryId} 
                        onChange={handleHistorySelect}
                        className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:border-blue-500 focus:outline-none"
                    >
                        <option value="">-- Select Archived Report --</option>
                        {history.map(h => (
                            <option key={h.id} value={h.id}>{h.date} - {h.title.substring(0, 30)}...</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex items-center gap-3 flex-wrap justify-end">
            <button 
                onClick={handleGenerate} 
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 font-sans shadow-md"
            >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                {loading ? 'Consulting AI...' : 'Refresh'}
            </button>

            {db && report && !selectedHistoryId && (
                 <button 
                    onClick={handleSaveToArchive}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-md"
                    title="Save current report to database"
                 >
                    <Save size={18} /> {saving ? 'Saving...' : 'Archive'}
                 </button>
            )}
            
            <button 
                onClick={handleDownloadPDF}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors shadow-md"
                title="Download Full PDF"
            >
                <Download size={20} />
            </button>
            <button 
                onClick={handlePrint}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors shadow-md"
                title="Print"
            >
                <Printer size={20} />
            </button>
            <button 
                onClick={handleEmailReport}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors shadow-md"
                title="Email Report"
            >
                <Mail size={20} />
            </button>
            <button 
                onClick={handleTwitterShare}
                className="p-2.5 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] border border-[#1DA1F2]/50 rounded-lg transition-colors shadow-md"
                title="Share on Twitter"
            >
                <Twitter size={20} />
            </button>
            <button 
                onClick={handleShare}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors shadow-md"
                title="System Share"
            >
                <Share2 size={20} />
            </button>
            </div>
        </div>
      </div>

      {/* Content Paper */}
      <div ref={contentRef} id="sitrep-content" className="flex-grow bg-[#fdfbf7] text-slate-900 rounded-xl shadow-2xl overflow-hidden print:overflow-visible print:shadow-none print:rounded-none relative max-w-5xl mx-auto w-full border border-slate-200 print:border-0 h-full print:h-auto">
        
        {loading ? (
          <div className="h-[800px] flex flex-col items-center justify-center p-12 print:hidden">
             <div className="w-20 h-20 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mb-8"></div>
             <h3 className="text-3xl font-playfair text-slate-600 animate-pulse mb-3">Synthesizing Intelligence...</h3>
             <p className="text-slate-500 font-merriweather italic text-lg">Analyzing {incidents.length} incidents and cross-referencing candidate trends.</p>
          </div>
        ) : report ? (
          <div className="flex flex-col lg:flex-row h-full print:h-auto relative z-10">
            
            {/* Sidebar (Desktop) / Top (Mobile) for Key Takeaways */}
            <div className="lg:w-80 bg-[#f4f1ea] border-r border-slate-200 p-8 lg:p-10 flex-shrink-0 print:border-r print:w-1/3 print:bg-white">
                <div className="sticky top-10 print:static">
                    <h4 className="font-sans font-bold text-red-700 text-xs uppercase tracking-[0.2em] mb-6 border-b border-red-200 pb-3">
                        Executive Summary
                    </h4>
                    <div className="space-y-8">
                        {report.keyTakeaways.map((point, idx) => (
                            <div key={idx} className="group">
                                <Quote size={20} className="text-slate-300 mb-2 group-hover:text-purple-400 transition-colors print:text-slate-800" />
                                <p className="font-merriweather text-slate-700 text-sm leading-relaxed italic">
                                    {point}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-slate-300">
                         <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-playfair font-bold text-xl print:bg-black print:text-white">S</div>
                             <div>
                                 <p className="font-sans font-bold text-slate-900 text-sm">Salus AI Desk</p>
                                 <p className="font-sans text-xs text-slate-500">Kampala HQ</p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Main Article */}
            <article className="flex-grow p-10 md:p-16 lg:p-20 print:p-8 print:w-2/3">
                <div className="max-w-3xl mx-auto print:max-w-none">
                    {/* Meta Header */}
                    <div className="flex items-center justify-center md:justify-start gap-3 text-slate-500 font-sans text-xs font-bold tracking-widest uppercase mb-8">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {dateStr}</span>
                        <span className="text-slate-300">|</span>
                        <span>Released: 04:30 EAT</span>
                        <span className="text-slate-300">|</span>
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded print:border print:border-purple-200">Confidential</span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-10 leading-[1.1] tracking-tight">
                        {report.title}
                    </h1>

                    {/* Dropcap & Content */}
                    <div 
                        className="prose prose-lg prose-slate font-merriweather text-slate-800 max-w-none
                            prose-p:leading-8 prose-p:mb-6 prose-p:text-[1.1rem]
                            prose-headings:font-playfair prose-headings:font-bold prose-headings:text-slate-900
                            prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline
                            prose-strong:font-bold prose-strong:text-slate-900
                            first-letter:float-left first-letter:text-7xl first-letter:font-bold first-letter:text-slate-900 first-letter:mr-3 first-letter:mt-[-2px] first-letter:font-playfair
                        "
                        dangerouslySetInnerHTML={{ __html: report.content }}
                    />
                    
                    {/* Article Footer */}
                    <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
                       <div className="flex items-center gap-2 text-slate-400 text-sm font-sans italic">
                          <Bookmark size={16} />
                          <span>Archived in Immutable Ledger</span>
                       </div>
                       <p className="text-xs text-slate-400 font-sans uppercase tracking-wider">
                          End of Report
                       </p>
                    </div>
                </div>
            </article>

          </div>
        ) : (
           <div className="h-[600px] flex items-center justify-center text-slate-400 print:hidden">
              <p>Failed to load content.</p>
           </div>
        )}
      </div>
    </div>
  );
};
