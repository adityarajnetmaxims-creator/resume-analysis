
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import JobHeader from './components/JobHeader';
import CandidateReportView from './components/CandidateReportView';
import { JobDetails, ResumeFile, CandidateReport } from './types';
import { GoogleGenAI, Type } from "@google/genai";

const INITIAL_JOB: JobDetails = {
  title: "Product Owner",
  location: "H-141, H BLOCK, SECTOR -10 DLF, GURUGRAM",
  postDate: "5 Feb 2026",
  university: "New University",
  startDate: "17 Jun 2025",
  duration: "8hr",
  schedule: "Full Time",
  type: "Location",
  isPaid: "Paid",
  stipend: "$89.00 / Per Month",
  applyBy: "27 Jun 2025"
};

const MOCK_REPORT: CandidateReport = {
  name: "Priya Sharma",
  email: "priyasharma@email.com",
  linkedin: "https://linkedin.com/in/priyasharma",
  github: "Not Available",
  summary: "Motivated Product Owner with over 4 years of experience supporting agile software teams in delivering B2B solutions. Skilled in backlog management, cross-functional collaboration, and facilitating sprint meetings.",
  verdict: "Strong Candidate",
  verdictDescription: "Demonstrates relevant experience and skills, aligning well with the job role as a Product Owner.",
  overallScore: 83.4,
  overallAssessment: "Good fit for the role with strengths in Agile methodologies and stakeholder communication.",
  strengths: ["Proficient in Agile Practices", "Strong communication skills"],
  improvements: ["Could benefit from advanced certifications"],
  technicalSkills: [
    { name: "Agile Methodology", score: 8, max: 10, note: "Extensive use of Jira" },
    { name: "Roadmapping", score: 7, max: 8, note: "Regular interactions" }
  ],
  softSkills: [
    { name: "Communication", score: 9, max: 10, note: "Handled presentations" },
    { name: "Stakeholder Management", score: 7, max: 8, note: "Regular interactions" }
  ],
  notes: ["The resume aligns with the job title."],
  finalEvaluation: "Move forward with further interviews."
};

// Generate Initial Mock Resumes
const GENERATED_RESUMES: ResumeFile[] = Array.from({ length: 42 }).map((_, i) => {
  const id = (i + 1).toString();
  const day = Math.floor(i / 5) + 1;
  const score = i === 0 ? 83.4 : Math.floor(Math.random() * 35) + 60;
  const hasReport = i % 2 === 0 || i === 0;

  return {
    id,
    name: i === 0 ? 'Resume_Priya_Sharma.pdf' : `Resume_Candidate_${id}.pdf`,
    timestamp: `2025-10-${day.toString().padStart(2, '0')} ${String(10 + (i % 8)).padStart(2, '0')}:30:00`,
    report: hasReport ? { 
      ...MOCK_REPORT, 
      name: i === 0 ? "Priya Sharma" : `Candidate ${id}`,
      overallScore: score,
      verdict: score > 85 ? "Strong Candidate" : score > 75 ? "Recommended" : "Needs Review"
    } : undefined
  };
});

const Card: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  icon?: string; 
  badge?: string; 
  className?: string; 
  headerAction?: React.ReactNode 
}> = ({ title, children, icon, badge, className = "", headerAction }) => (
  <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${className}`}>
    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
      <div className="flex items-center gap-3">
        {icon && <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm"><i className={icon}></i></div>}
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        {badge && <span className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">{badge}</span>}
        {headerAction}
      </div>
    </div>
    <div className="flex-1 overflow-hidden relative">
      {children}
    </div>
  </div>
);

type SortOption = 'score-desc' | 'newest' | 'name-asc' | 'weighted';

export default function App() {
  const [resumes, setResumes] = useState<ResumeFile[]>(GENERATED_RESUMES);
  const [activeReportId, setActiveReportId] = useState<string | null>('1');
  const [isScoring, setIsScoring] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Advanced Features State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [verdictFilter, setVerdictFilter] = useState<string[]>([]);
  const [technicalWeight, setTechnicalWeight] = useState(50); // 0-100
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAISearchLoading, setIsAISearchLoading] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, minScore, verdictFilter, aiFilteredIds]);

  const handleUpload = () => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 100));
    }, 150);
    setTimeout(() => {
      const newId = (resumes.length + 1).toString();
      const newResume: ResumeFile = {
        id: newId,
        name: `Newly_Added_Resume_${newId}.pdf`,
        timestamp: new Date().toLocaleString(),
      };
      setResumes(prev => [newResume, ...prev]);
      setIsUploading(false);
      setUploadProgress(0);
      setActiveReportId(newId);
      setSortBy('newest');
      setCurrentPage(1);
      clearInterval(interval);
    }, 2000);
  };

  const handleAISearch = async () => {
    if (!searchTerm.trim() || isAISearchLoading) return;
    setIsAISearchLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const promptData = resumes.filter(r => r.report).map(r => ({
        id: r.id,
        name: r.name,
        score: r.report?.overallScore,
        verdict: r.report?.verdict,
        summary: r.report?.summary
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given these candidates: ${JSON.stringify(promptData)}. Filter and return only the IDs of candidates that match this query: "${searchTerm}". If it's a simple name search, return all matches. If it's descriptive (e.g. "high scores", "strong candidates"), act as an HR expert.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchIds: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["matchIds"]
          }
        }
      });
      
      const result = JSON.parse(response.text);
      setAiFilteredIds(result.matchIds);
    } catch (error) {
      console.error("AI Search failed", error);
    } finally {
      setIsAISearchLoading(false);
    }
  };

  const startScoring = () => {
    if (!activeReportId || isScoring) return;
    const activeFile = resumes.find(r => r.id === activeReportId);
    if (activeFile?.report) return;
    setIsScoring(true);
    setTimeout(() => {
      setResumes(prev => prev.map(r => 
        r.id === activeReportId 
          ? { ...r, report: { ...MOCK_REPORT, name: r.name.replace('.pdf', ''), overallScore: Math.floor(Math.random() * 20) + 75 } } 
          : r
      ));
      setIsScoring(false);
    }, 1500);
  };

  const processedResumes = useMemo(() => {
    let filtered = resumes.filter(r => {
      // Basic Search
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
      // AI Search Filter
      const matchesAI = aiFilteredIds ? aiFilteredIds.includes(r.id) : true;
      // Advanced Filters
      const matchesScore = r.report ? r.report.overallScore >= minScore : true;
      const matchesVerdict = verdictFilter.length > 0 ? (r.report ? verdictFilter.includes(r.report.verdict) : false) : true;
      
      return matchesSearch && matchesAI && matchesScore && matchesVerdict;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'weighted' && a.report && b.report) {
        const softWeight = 100 - technicalWeight;
        const avgTech = (r: CandidateReport) => r.technicalSkills.reduce((acc, s) => acc + s.score, 0) / r.technicalSkills.length;
        const avgSoft = (r: CandidateReport) => r.softSkills.reduce((acc, s) => acc + s.score, 0) / r.softSkills.length;
        const scoreA = (avgTech(a.report) * technicalWeight) + (avgSoft(a.report) * softWeight);
        const scoreB = (avgTech(b.report) * technicalWeight) + (avgSoft(b.report) * softWeight);
        return scoreB - scoreA;
      }
      if (sortBy === 'score-desc') {
        return (b.report?.overallScore || 0) - (a.report?.overallScore || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [resumes, searchTerm, sortBy, minScore, verdictFilter, aiFilteredIds, technicalWeight]);

  const paginatedResumes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedResumes.slice(startIndex, startIndex + itemsPerPage);
  }, [processedResumes, currentPage]);

  const totalPages = Math.ceil(processedResumes.length / itemsPerPage);
  const activeResume = resumes.find(r => r.id === activeReportId);

  const toggleCompare = (id: string) => {
    setSelectedForComparison(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const ComparisonModal = () => {
    const compareData = resumes.filter(r => selectedForComparison.includes(r.id) && r.report);
    if (compareData.length === 0) return null;

    return (
      <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Candidate Comparison Matrix</h2>
            <button onClick={() => setIsCompareOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors">
              <i className="fa-solid fa-xmark text-xl text-slate-400"></i>
            </button>
          </div>
          <div className="flex-1 overflow-x-auto p-8 custom-scrollbar">
            <div className="flex gap-8 min-w-max h-full">
              {compareData.map(c => (
                <div key={c.id} className="w-80 flex flex-col gap-6 border border-slate-100 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                      {c.report!.name.charAt(0)}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{c.report!.name}</h3>
                    <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full mt-2 inline-block">
                      {c.report!.verdict}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Overall Score</p>
                      <p className="text-3xl font-black text-indigo-600">{c.report!.overallScore}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Technical Core</p>
                      {c.report!.technicalSkills.map(s => (
                        <div key={s.name} className="mb-2">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-bold text-slate-600">{s.name}</span>
                            <span className="text-indigo-600 font-bold">{s.score}/10</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${(s.score/10)*100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 transition-colors duration-300 ${isFullScreen ? 'overflow-hidden' : ''}`}>
      {!isFullScreen && <Navbar />}

      {isCompareOpen && <ComparisonModal />}

      <main className={`flex-1 w-full max-w-[1600px] mx-auto px-4 ${isFullScreen ? 'py-0 max-w-none h-screen' : 'py-8 md:py-10'}`}>
        {!isFullScreen && <JobHeader details={INITIAL_JOB} />}

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${isFullScreen ? 'h-full mt-0' : 'mt-8'}`}>
          {!isFullScreen && (
            <div className="lg:col-span-3 space-y-8">
              <Card title="Candidate Power Filters" icon="fa-solid fa-sliders" badge="Advanced">
                <div className="p-6 space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Minimum Match Confidence</label>
                    <input 
                      type="range" min="0" max="100" value={minScore} 
                      onChange={(e) => setMinScore(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer" 
                    />
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 mt-2">
                      <span>0%</span>
                      <span className="text-indigo-600">{minScore}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Verdict Category</label>
                    <div className="space-y-2">
                      {["Strong Candidate", "Recommended", "Needs Review"].map(v => (
                        <label key={v} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors group">
                          <input 
                            type="checkbox" 
                            checked={verdictFilter.includes(v)}
                            onChange={() => setVerdictFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" 
                          />
                          <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-700">{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {sortBy === 'weighted' && (
                    <div className="pt-4 border-t border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Sorting Weight (Tech vs Soft)</label>
                      <input 
                        type="range" min="0" max="100" value={technicalWeight} 
                        onChange={(e) => setTechnicalWeight(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer" 
                      />
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 mt-2">
                        <span className="text-emerald-600">Technical ({technicalWeight}%)</span>
                        <span className="text-amber-600">Soft ({100-technicalWeight}%)</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          <div className={`${isFullScreen ? 'lg:col-span-12 h-full' : 'lg:col-span-9'} flex flex-col gap-8`}>
            {!isFullScreen && (
              <section 
                onClick={handleUpload}
                className={`bg-white rounded-3xl border-2 border-dashed ${isUploading ? 'border-indigo-500 bg-indigo-50/20' : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/30'} p-8 text-center transition-all cursor-pointer group relative overflow-hidden flex-shrink-0`}
              >
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
                    <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-indigo-600 font-bold text-sm">UPLOADING... {uploadProgress}%</p>
                  </div>
                )}
                <div className="flex items-center justify-center gap-8">
                  <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-cloud-arrow-up text-3xl"></i>
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload Candidate Resumes</h2>
                    <p className="text-slate-500">Drop PDF files or <span className="text-indigo-600 font-bold underline">browse computer</span></p>
                  </div>
                </div>
              </section>
            )}

            <Card 
              title="Candidate Hub" icon="fa-solid fa-microchip" badge="Live AI" 
              className={`flex-1 ${isFullScreen ? '!rounded-none border-none h-full' : 'h-[800px]'}`}
              headerAction={
                <div className="flex items-center gap-4">
                  {selectedForComparison.length > 0 && (
                    <button 
                      onClick={() => setIsCompareOpen(true)}
                      className="px-4 py-2 bg-emerald-500 text-white text-[11px] font-black rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 animate-in zoom-in-95 duration-200 uppercase tracking-widest"
                    >
                      Compare {selectedForComparison.length} Candidates
                    </button>
                  )}
                  <button onClick={() => setIsFullScreen(!isFullScreen)} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                    <i className={`fa-solid ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i>
                  </button>
                </div>
              }
            >
               <div className="flex flex-col xl:flex-row gap-0 h-full">
                 <div className="w-full xl:w-96 border-r border-slate-100 bg-slate-50/50 flex flex-col h-full">
                   <div className="p-4 bg-white border-b border-slate-100 space-y-3">
                     <div className="relative group">
                       <i className={`fa-solid ${isAISearchLoading ? 'fa-spinner animate-spin text-indigo-500' : 'fa-magnifying-glass text-slate-400'} absolute left-3 top-1/2 -translate-y-1/2 text-sm`}></i>
                       <input 
                        type="text" placeholder="AI Smart Search..." value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value); if(!e.target.value) setAiFilteredIds(null);}}
                        className="w-full pl-9 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                       />
                       <button 
                        onClick={handleAISearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center"
                       >
                         <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                       </button>
                     </div>
                     <div className="flex gap-2">
                        <select 
                          value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="flex-1 pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 uppercase tracking-wider appearance-none"
                        >
                          <option value="newest">Recently Added</option>
                          <option value="score-desc">Top Scored</option>
                          <option value="weighted">Skill-Weighted</option>
                          <option value="name-asc">Alphabetical</option>
                        </select>
                        <button 
                          onClick={startScoring} disabled={isScoring || !!activeResume?.report}
                          className="px-4 py-2 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center gap-2"
                        >
                            {isScoring ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                            {activeResume?.report ? 'SCORED' : 'RUN AI'}
                        </button>
                     </div>
                   </div>

                   <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                     {paginatedResumes.map((file, idx) => (
                       <div key={file.id} className="relative group">
                         <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <input 
                              type="checkbox" 
                              checked={selectedForComparison.includes(file.id)}
                              onChange={() => toggleCompare(file.id)}
                              className="w-5 h-5 rounded border-slate-300 text-indigo-600 cursor-pointer shadow-sm"
                            />
                         </div>
                         <button
                          onClick={() => setActiveReportId(file.id)}
                          className={`w-full p-4 pl-10 rounded-2xl text-left transition-all relative border ${activeReportId === file.id ? 'bg-white shadow-lg border-indigo-500 ring-4 ring-indigo-500/10' : 'bg-white/40 border-slate-100 hover:bg-white hover:border-slate-200'}`}
                         >
                           <div className="flex items-center gap-3">
                             <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${activeReportId === file.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                               <i className="fa-regular fa-file-pdf"></i>
                             </div>
                             <div className="overflow-hidden flex-1">
                               <h4 className={`font-bold truncate text-sm ${activeReportId === file.id ? 'text-slate-900' : 'text-slate-600'}`}>{file.name}</h4>
                               <div className="flex items-center gap-2 mt-0.5">
                                 <p className="text-[10px] text-slate-400">{file.timestamp}</p>
                                 {file.report && (
                                   <div className="flex gap-1 ml-auto">
                                      <div className={`w-1.5 h-1.5 rounded-full ${file.report.overallScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                      <div className={`w-1.5 h-1.5 rounded-full ${file.report.overallScore > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                      <div className={`w-1.5 h-1.5 rounded-full ${file.report.overallScore > 60 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                   </div>
                                 )}
                               </div>
                             </div>
                           </div>
                           {file.report && (
                             <div className="mt-4 flex items-center justify-between bg-slate-50/80 px-3 py-2 rounded-xl">
                               <span className="text-[10px] font-black text-slate-500 uppercase">{file.report.verdict}</span>
                               <span className="text-[11px] font-black text-indigo-600">{file.report.overallScore}%</span>
                             </div>
                           )}
                         </button>
                       </div>
                     ))}
                   </div>

                   {totalPages > 1 && (
                     <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all">
                          <i className="fa-solid fa-chevron-left text-xs"></i>
                        </button>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all">
                          <i className="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                     </div>
                   )}
                 </div>

                 <div className="flex-1 overflow-y-auto custom-scrollbar bg-white h-full relative">
                    {activeResume?.report ? <CandidateReportView report={activeResume.report} /> : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-300">
                        <i className={