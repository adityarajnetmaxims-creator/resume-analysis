
import React from 'react';
import { JobDetails } from '../types';

interface JobHeaderProps {
  details: JobDetails;
}

const JobHeader: React.FC<JobHeaderProps> = ({ details }) => {
  const metaItem = (icon: string, label: string, value: string) => (
    <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-100">
      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
        <i className={`${icon} text-xs`}></i>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
        <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button className="flex items-center text-indigo-600 text-xs font-bold mb-4 uppercase tracking-widest hover:translate-x-1 transition-transform">
            <i className="fa-solid fa-arrow-left mr-2"></i> Back to listings
          </button>
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black">
                P
             </div>
             <div>
               <h1 className="text-2xl font-black text-slate-900">{details.title}</h1>
               <div className="flex items-center gap-4 mt-1">
                 <span className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                   <i className="fa-solid fa-location-dot"></i> {details.location}
                 </span>
                 <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-md border border-emerald-100">
                    Active
                 </span>
               </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 flex-1 xl:max-w-5xl">
          {metaItem('fa-regular fa-calendar-days', 'Posted', details.postDate)}
          {metaItem('fa-regular fa-clock', 'Duration', details.duration)}
          {metaItem('fa-solid fa-calendar-check', 'Schedule', details.schedule)}
          {metaItem('fa-solid fa-money-bill-transfer', 'Status', details.isPaid)}
          {metaItem('fa-solid fa-hourglass-half', 'Deadline', details.applyBy)}
        </div>
      </div>
    </div>
  );
};

export default JobHeader;
