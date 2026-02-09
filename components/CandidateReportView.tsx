
import React from 'react';
import { CandidateReport } from '../types';

// Helper function to determine score color, moved outside to follow best practices
const getScoreColor = (score: number, max: number) => {
  const percentage = (score / max) * 100;
  if (percentage >= 80) return 'bg-emerald-500';
  if (percentage >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
};

// Interface for ScoreBar props to ensure type safety
interface ScoreBarProps {
  label: string;
  score: number;
  max: number;
  note: string;
}

// Sub-component moved outside of main component to resolve TypeScript 'key' prop errors
// Fix: Added React.FC type to handle intrinsic attributes like 'key' correctly in JSX
const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, max, note }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <span className="font-semibold text-slate-700">{label}</span>
      <span className="text-sm font-bold text-slate-900">{score}/{max}</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(score, max)}`}
        style={{ width: `${(score / max) * 100}%` }}
      ></div>
    </div>
    <p className="text-sm text-slate-500 italic leading-relaxed">{note}</p>
  </div>
);

interface CandidateReportViewProps {
  report: CandidateReport;
}

const CandidateReportView: React.FC<CandidateReportViewProps> = ({ report }) => {
  return (
    <div className="p-4 md:p-8 space-y-10">
      {/* Verdict Section */}
      <section className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
             <i className="fa-solid fa-thumbtack text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Verdict: <span className="text-indigo-600">{report.verdict}</span>
            </h3>
            <p className="text-slate-600 italic mt-2 leading-relaxed">
              &quot;{report.verdictDescription}&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
             <i className="fa-solid fa-user-tie"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Candidate Profile</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 ml-2 pl-12 border-l-2 border-slate-100">
          <p><span className="font-bold text-slate-800">Name:</span> {report.name}</p>
          <p><span className="font-bold text-slate-800">Email:</span> <a href={`mailto:${report.email}`} className="text-indigo-600 hover:underline">{report.email}</a></p>
          <p><span className="font-bold text-slate-800">LinkedIn:</span> <a href={report.linkedin} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View Profile</a></p>
          <p><span className="font-bold text-slate-800">GitHub:</span> <span className={report.github === 'Not Available' ? 'text-slate-400' : 'text-indigo-600'}>{report.github}</span></p>
          <div className="md:col-span-2 mt-2">
            <p className="leading-relaxed"><span className="font-bold text-slate-800">Summary:</span> {report.summary}</p>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Overall Score with highlight */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
             <i className="fa-solid fa-star text-xl"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-900">Overall Score: <span className="text-indigo-600">{report.overallScore}/100</span></h3>
        </div>
        <div className="h-1 bg-slate-200 flex-1 mx-4 hidden md:block rounded-full"></div>
        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Candidate Performance Index</p>
      </section>

      <hr className="border-slate-100" />

      {/* Summary Analysis */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
             <i className="fa-solid fa-magnifying-glass-chart"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Summary Analysis</h3>
        </div>
        <div className="space-y-6 ml-2 pl-12 border-l-2 border-slate-100">
          <p><span className="font-bold text-slate-800">Overall Assessment:</span> {report.overallAssessment}</p>
          
          <div>
             <h4 className="flex items-center gap-2 font-bold text-emerald-700 mb-2">
               <i className="fa-solid fa-square-check"></i> Strengths:
             </h4>
             <ul className="list-disc list-outside ml-6 space-y-1 text-slate-600">
               {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
             </ul>
          </div>

          <div>
             <h4 className="flex items-center gap-2 font-bold text-amber-700 mb-2">
               <i className="fa-solid fa-triangle-exclamation"></i> Areas for Improvement:
             </h4>
             <ul className="list-disc list-outside ml-6 space-y-1 text-slate-600">
               {report.improvements.map((s, i) => <li key={i}>{s}</li>)}
             </ul>
          </div>
        </div>
      </section>

      {/* Skill Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
               <i className="fa-solid fa-laptop-code"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Technical Skills</h3>
          </div>
          {report.technicalSkills.map((skill, i) => (
            <ScoreBar key={i} label={skill.name} score={skill.score} max={skill.max} note={skill.note} />
          ))}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
               <i className="fa-solid fa-heart-pulse"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Soft Skills</h3>
          </div>
          {report.softSkills.map((skill, i) => (
            <ScoreBar key={i} label={skill.name} score={skill.score} max={skill.max} note={skill.note} />
          ))}
        </section>
      </div>

      <hr className="border-slate-100" />

      {/* Notes & Evaluation */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-4">Notes</h4>
          <ul className="list-disc list-outside ml-6 space-y-3 text-slate-600 text-sm leading-relaxed">
            {report.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-4">Final Evaluation</h4>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 leading-relaxed italic shadow-inner">
            &quot;{report.finalEvaluation}&quot;
          </div>
        </div>
      </section>
    </div>
  );
};

export default CandidateReportView;
