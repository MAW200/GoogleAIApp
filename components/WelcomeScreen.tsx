import React, { useState } from 'react';
import { UserContext } from '../types';
import { ArrowRight, Briefcase, Building, User } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (ctx: UserContext) => void;
  isLoading: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isLoading }) => {
  const [ctx, setCtx] = useState<UserContext>({
    name: 'Alex Chen',
    role: 'Senior Backend Engineer',
    department: 'Platform Infrastructure'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(ctx);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Functional Offboarding</h1>
        <p className="text-slate-600 leading-relaxed">
          Welcome. To ensure a smooth transition for your team, our AI Orchestrator will scan current documentation and identify potential knowledge gaps.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative group">
             <User className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
             <input
              required
              type="text"
              value={ctx.name}
              onChange={e => setCtx({...ctx, name: e.target.value})}
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
             />
          </div>
          
          <div className="relative group">
             <Briefcase className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
             <input
              required
              type="text"
              value={ctx.role}
              onChange={e => setCtx({...ctx, role: e.target.value})}
              placeholder="Job Title / Role"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
             />
          </div>

          <div className="relative group">
             <Building className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
             <input
              required
              type="text"
              value={ctx.department}
              onChange={e => setCtx({...ctx, department: e.target.value})}
              placeholder="Department / Team"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
             />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>Generating Gaps...</>
          ) : (
            <>Start Knowledge Scan <ArrowRight size={18} /></>
          )}
        </button>
      </form>
      
      <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
        Secure & Private • AI-Assisted Documentation
      </div>
    </div>
  );
};

export default WelcomeScreen;
