
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import JobHeader from './components/JobHeader';
import CandidateReportView from './components/CandidateReportView';
import { JobDetails, ResumeFile, CandidateReport } from './types';

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
    { name: "Stakeholder Management", score: 7, max: 8, note: "Regular interactions" }
  ],
  softSkills: [
    { name: "Communication", score: 9, max: 10, note: "Handled presentations" }
  ],
  notes: ["The resume aligns with the job title."],
  finalEvaluation: "Move forward with further interviews."
};

// Generate Initial Mock Resumes
const GENERATED_RESUMES: ResumeFile[] = Array.from({ length: 42 }).map((_, i) => {
  const id = (i + 1).toString();
  const day = Math.floor(i / 5) + 1;
  const score = i === 0 ? 83.4 : Math.floor(Math.random() * 30) + 65;
  const hasReport = i % 3 === 0 || i === 0;

  return {
    id,
    name: i === 0 ? 'Resume_Priya_Sharma.pdf' : `Resume_Candidate_${id}.pdf`,
    timestamp: `2025-10-${day.toString().padStart(2, '0')} ${String(10 + (i % 8)).padStart(2, '0')}:30:00`,
    report: hasReport ? { 
      ...MOCK_REPORT, 
      name: i === 0 ? "Priya Sharma" : `Candidate ${id}`,
      overallScore: score 
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

type SortOption = 'score-desc' | 'newest' | 'name-asc';

export default function App() {
  const [resumes, setResumes] = useState<ResumeFile[]>(GENERATED_RESUMES);
  const [activeReportId, setActiveReportId] = useState<string | null>('1');
  const [isScoring, setIsScoring] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const handleUpload = () => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    setTimeout(() => {
      const newId = (resumes.length + 1).toString();
      const newResume: ResumeFile = {
        id: newId,
        name: `Newly_Added_Resume_${newId}.pdf`,
        timestamp: new Date().toLocaleString(),
        // New items don't have reports yet until "Run AI" is clicked
      };
      
      setResumes(prev => [newResume, ...prev]);
      setIsUploading(false);
      setUploadProgress(0);
      setActiveReportId(newId);
      setSortBy('newest');
      setCurrentPage(1);
      
      // Auto-scroll to top of list
      if (listRef.current) listRef.current.scrollTop = 0;
    }, 2000);
  };

  const startScoring = () => {
    if (!activeReportId || isScoring) return;
    const activeFile = resumes.find(r => r.id === activeReportId);
    if (activeFile?.report) return; // Already scored

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
    let filtered = resumes.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'score-desc') {
        const scoreA = a.report?.overallScore || 0;
        const scoreB = b.report?.overallScore || 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [resumes, searchTerm, sortBy]);

  const paginatedResumes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedResumes.slice(startIndex, startIndex + itemsPerPage);
  }, [processedResumes, currentPage]);

  const totalPages = Math.ceil(processedResumes.length / itemsPerPage);
  const activeResume = resumes.find(r => r.id === activeReportId);

  const ScoringCriteriaContent = (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 leading-relaxed">Evaluation weights for this role:</p>
      <div className="space-y-3">
        {[
          { label: "Agile Methodology", val: "30%" },
          { label: "Roadmapping", val: "25%" },
          { label: "Communication", val: "20%" },
          { label: "Jira / Tools", val: "15%" },
          { label: "Experience", val: "10%" }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium">{item.label}</span>
            <span className="font-bold text-indigo-600">{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 transition-colors duration-300 ${isFullScreen ? 'overflow-hidden' : ''}`}>
      {!isFullScreen && <Navbar />}

      <main className={`flex-1 w-full max-w-[1600px] mx-auto px-4 ${isFullScreen ? 'py-0 max-w-none h-screen' : 'py-8 md:py-10'}`}>
        
        {!isFullScreen && <JobHeader details={INITIAL_JOB} />}

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${isFullScreen ? 'h-full mt-0' : 'mt-8'}`}>
          
          {!isFullScreen && (
            <div className="lg:col-span-3 space-y-8">
              <Card title="Scoring Criteria" icon="fa-solid fa-list-check" badge="Setup">
                <div className="p-6">{ScoringCriteriaContent}</div>
              </Card>
            </div>
          )}

          <div className={`${isFullScreen ? 'lg:col-span-12 h-full' : 'lg:col-span-9'} flex flex-col gap-8`}>
            
            {!isFullScreen && (
              <section 
                onClick={handleUpload}
                className={`bg-white rounded-3xl border-2 border-dashed ${isUploading ? 'border-indigo-500 bg-indigo-50/20' : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/30'} p-8 text-center transition-all cursor-pointer group relative overflow-hidden flex-shrink-0`}
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
                    <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-indigo-600 font-bold text-sm animate-pulse">UPLOADING RESUME... {uploadProgress}%</p>
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform duration-200">
                    <i className="fa-solid fa-cloud-arrow-up text-3xl"></i>
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload Candidate Resumes</h2>
                    <p className="text-slate-500">Drop PDF files here or <span className="text-indigo-600 font-bold underline">browse computer</span></p>
                  </div>
                </div>
              </section>
            )}

            <Card 
              title="Candidate Scoring Hub" 
              icon="fa-solid fa-microchip" 
              badge="Results" 
              className={`flex-1 ${isFullScreen ? '!rounded-none border-none shadow-none h-full' : 'h-[800px]'}`}
              headerAction={
                <div className="relative group/tooltip">
                  <button 
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all flex items-center justify-center shadow-sm"
                  >
                    <i className={`fa-solid ${isFullScreen ? 'fa-compress' : 'fa-expand'} text-lg`}></i>
                  </button>
                  <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-75 whitespace-nowrap z-[100] shadow-xl">
                    {isFullScreen ? "Exit Full Screen" : "Full Screen"}
                  </div>
                </div>
              }
            >
               <div className="flex flex-col xl:flex-row gap-0 h-full">
                 
                 <div className="w-full xl:w-96 border-r border-slate-100 bg-slate-50/50 flex flex-col h-full">
                   <div className="p-4 bg-white border-b border-slate-100 space-y-3 flex-shrink-0">
                     <div className="relative">
                       <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                       <input 
                        type="text" 
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                       />
                     </div>
                     <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 relative">
                          <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 uppercase tracking-wider appearance-none cursor-pointer"
                          >
                            <option value="score-desc">Top Scored</option>
                            <option value="newest">Recently Added</option>
                            <option value="name-asc">Alphabetical (A-Z)</option>
                          </select>
                          <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"></i>
                        </div>
                        <button 
                          onClick={startScoring}
                          disabled={isScoring || !activeReportId || !!activeResume?.report}
                          className="px-4 py-2 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center gap-2 shadow-md"
                        >
                            {isScoring ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                            {isScoring ? 'ANALYZING...' : (activeResume?.report ? 'SCORED' : 'RUN AI')}
                        </button>
                     </div>
                   </div>

                   <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                       {processedResumes.length} CANDIDATES
                     </span>
                   </div>

                   <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-slate-50/30">
                     {paginatedResumes.length > 0 ? (
                       paginatedResumes.map((file, idx) => (
                         <button
                          key={file.id}
                          onClick={() => setActiveReportId(file.id)}
                          className={`w-full p-4 rounded-2xl text-left transition-all relative group border ${activeReportId === file.id ? 'bg-white shadow-lg border-indigo-500 ring-4 ring-indigo-500/10' : 'bg-white/40 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-md'}`}
                         >
                           <div className="flex items-center gap-3">
                             <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-colors ${activeReportId === file.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                               <i className="fa-regular fa-file-pdf"></i>
                             </div>
                             <div className="overflow-hidden flex-1">
                               <div className="flex items-center gap-2">
                                 <h4 className={`font-bold truncate text-sm ${activeReportId === file.id ? 'text-slate-900' : 'text-slate-600'}`}>{file.name}</h4>
                                 {idx === 0 && currentPage === 1 && sortBy === 'score-desc' && file.report && (
                                   <span className="px-2 py-0.5 bg-amber-400 text-white text-[9px] font-black uppercase rounded shadow-sm">Best</span>
                                 )}
                                 {(!file.report && idx < 3 && currentPage === 1) && (
                                   <span className="px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-black uppercase rounded shadow-sm">New</span>
                                 )}
                               </div>
                               <p className="text-[10px] text-slate-400 mt-0.5">{file.timestamp}</p>
                             </div>
                           </div>
                           {file.report ? (
                             <div className="mt-4">
                               <div className="flex items-center justify-between mb-1.5">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Match Confidence</span>
                                 <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${file.report.overallScore > 80 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>{file.report.overallScore}%</span>
                               </div>
                               <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                 <div 
                                  className={`h-full transition-all duration-700 ease-out ${file.report.overallScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                  style={{ width: `${file.report.overallScore}%` }}
                                 ></div>
                               </div>
                             </div>
                           ) : (
                             <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 italic">Analysis pending...</span>
                                <i className="fa-solid fa-bolt-lightning text-indigo-200 text-xs"></i>
                             </div>
                           )}
                         </button>
                       ))
                     ) : (
                       <div className="py-20 px-6 text-center text-slate-400">
                         <i className="fa-solid fa-search text-3xl mb-4 block opacity-20"></i>
                         <p className="text-sm font-bold">No candidates match criteria.</p>
                       </div>
                     )}
                   </div>

                   {totalPages > 1 && (
                     <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                        <button 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
                        >
                          <i className="fa-solid fa-chevron-left text-xs"></i>
                        </button>
                        <span className="text-[10px] font-black text-slate-400">PAGE {currentPage} / {totalPages}</span>
                        <button 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
                        >
                          <i className="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                     </div>
                   )}
                 </div>

                 <div className="flex-1 overflow-y-auto custom-scrollbar bg-white h-full relative">
                    {activeResume?.report ? (
                      <CandidateReportView report={activeResume.report} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-300">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center mb-6">
                           <i className={`fa-solid ${isScoring ? 'fa-wand-magic-sparkles animate-spin text-indigo-400' : 'fa-clipboard-check opacity-20'} text-4xl`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-400 mb-2">{isScoring ? 'Generating Analysis...' : 'Report Pending'}</h3>
                        <p className="max-w-xs text-sm">
                          {isScoring ? 'AI is scanning the resume for key skills and experience. This usually takes a few seconds.' : 'Select a candidate or click "RUN AI" to evaluate their profile against job requirements.'}
                        </p>
                      </div>
                    )}
                 </div>
               </div>
            </Card>
          </div>
        </div>
      </main>

      {!isFullScreen && (
        <div className="fixed bottom-8 right-8 z-50">
          <button className="w-14 h-14 bg-[#0f172a] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-4 border-white">
            <i className="fa-regular fa-message text-xl"></i>
          </button>
        </div>
      )}
    </div>
  );
}
