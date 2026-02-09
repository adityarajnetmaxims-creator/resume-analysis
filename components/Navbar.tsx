
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[#0f172a] text-white px-4 py-3 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
             <i className="fa-solid fa-microchip text-white"></i>
          </div>
          <span className="text-xl font-bold tracking-tight">NetMaxims<span className="text-xs align-top ml-0.5">™</span></span>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center bg-slate-800/50 rounded-lg p-1">
          <button className="px-6 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-slate-700">
             <i className="fa-solid fa-house-chimney mr-2 opacity-70"></i>
             Overview
          </button>
          <button className="px-6 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white shadow-sm">
             <i className="fa-solid fa-briefcase mr-2"></i>
             Job
          </button>
        </div>

        {/* Icons & Profile */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-800 rounded-full transition-colors hidden sm:block">
            <i className="fa-solid fa-magnifying-glass text-slate-400"></i>
          </button>
          <div className="relative">
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <i className="fa-regular fa-bell text-slate-400"></i>
            </button>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
          </div>
          <button className="p-2 hover:bg-slate-800 rounded-full transition-colors hidden sm:block">
            <i className="fa-solid fa-gear text-slate-400"></i>
          </button>
          <div className="h-8 w-[1px] bg-slate-700 mx-1 hidden sm:block"></div>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/user/100/100" 
                alt="Profile" 
                className="w-9 h-9 rounded-full object-cover border-2 border-slate-700 group-hover:border-indigo-400 transition-colors"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f172a]"></span>
            </div>
            <i className="fa-solid fa-chevron-down text-xs text-slate-400 group-hover:text-white transition-colors hidden md:block"></i>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
