import React, { useState, useCallback } from 'react';
import { KnowledgeGap, InterviewAnswer, AppState, UserContext } from './types';
import { generateGaps, generateFinalHandover } from './services/watsonx';
import WelcomeScreen from './components/WelcomeScreen';
import QuestionCard from './components/QuestionCard';
import ProgressBar from './components/ProgressBar';
import { ChevronLeft, ChevronRight, Check, FileText, LayoutDashboard, LogOut, User, Video } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [answers, setAnswers] = useState<Record<string, InterviewAnswer>>({});
  const [currentGapIndex, setCurrentGapIndex] = useState(0);
  const [finalDoc, setFinalDoc] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  // --- Handlers ---

  const handleStart = async (ctx: UserContext) => {
    setUserContext(ctx);
    setIsProcessing(true);
    setAppState(AppState.LOADING_GAPS);
    try {
      const generatedGaps = await generateGaps(ctx);
      if (generatedGaps.length > 0) {
        setGaps(generatedGaps);
        setAppState(AppState.INTERVIEW);
      } else {
        alert("Could not identify gaps. Please try again.");
        setAppState(AppState.WELCOME);
      }
    } catch (e) {
      console.error(e);
      alert("Error connecting to AI Orchestrator. Check API Key.");
      setAppState(AppState.WELCOME);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnswerUpdate = useCallback((data: Partial<InterviewAnswer>) => {
    setIsSavingAnswer(true);
    const gapId = gaps[currentGapIndex].id;
    
    setAnswers(prev => ({
      ...prev,
      [gapId]: {
        gapId,
        content: data.content || prev[gapId]?.content || "",
        videoUrl: data.videoUrl !== undefined ? data.videoUrl : prev[gapId]?.videoUrl,
        lastUpdated: Date.now()
      }
    }));

    setTimeout(() => setIsSavingAnswer(false), 600);
  }, [gaps, currentGapIndex]);

  const handleNext = () => {
    if (currentGapIndex < gaps.length - 1) {
      setCurrentGapIndex(prev => prev + 1);
    } else {
      finishInterview();
    }
  };

  const handlePrev = () => {
    if (currentGapIndex > 0) {
      setCurrentGapIndex(prev => prev - 1);
    }
  };

  const finishInterview = async () => {
    if (!userContext) return;
    setAppState(AppState.FINALIZING);
    setIsProcessing(true);
    try {
      const doc = await generateFinalHandover(userContext, gaps, answers);
      setFinalDoc(doc);
      setAppState(AppState.COMPLETED);
    } catch (e) {
      console.error(e);
      alert("Error generating summary.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Renders ---

  if (appState === AppState.WELCOME || appState === AppState.LOADING_GAPS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <WelcomeScreen onStart={handleStart} isLoading={appState === AppState.LOADING_GAPS} />
      </div>
    );
  }

  if (appState === AppState.COMPLETED) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                        <FileText size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Handover Document Ready</h1>
                        <p className="text-slate-600">Generated for {userContext?.name} • {userContext?.role}</p>
                    </div>
                </div>
                <div className="prose prose-slate max-w-none mb-8">
                    {/* Rudimentary Markdown render */}
                    {finalDoc.split('\n').map((line, i) => (
                        <p key={i} className={line.startsWith('#') ? "font-bold text-slate-900 mt-4" : "text-slate-700"}>
                            {line.replace(/^#+\s/, '')}
                        </p>
                    ))}
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={() => window.print()} 
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        Export to PDF / Print
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (appState === AppState.FINALIZING) {
     return (
         <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
             <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <p className="text-slate-600 font-medium">Finalizing Handover Document...</p>
         </div>
     )
  }

  // --- Interview View ---
  
  const currentGap = gaps[currentGapIndex];
  const currentAnswerData = answers[currentGap.id];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar (Navigation) */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen sticky top-0 z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
            <div className="p-1 bg-indigo-100 rounded">
                <Video size={18} />
            </div>
            <span>OffboardFlow <span className="text-xs font-normal text-indigo-400 uppercase">Video</span></span>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                Interview Topics
            </div>
            <div className="space-y-1">
                {gaps.map((g, idx) => {
                    const isActive = idx === currentGapIndex;
                    const hasVideo = !!answers[g.id]?.videoUrl;
                    return (
                        <button
                            key={g.id}
                            onClick={() => setCurrentGapIndex(idx)}
                            className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors flex items-center gap-3
                                ${isActive 
                                    ? 'bg-indigo-50 text-indigo-700 font-medium ring-1 ring-indigo-100' 
                                    : 'text-slate-600 hover:bg-slate-50'}
                            `}
                        >
                            <div className={`w-2 h-2 rounded-full shrink-0 transition-colors ${isActive ? 'bg-indigo-500' : (hasVideo ? 'bg-emerald-400' : 'bg-slate-300')}`} />
                            <span className="truncate">{g.title}</span>
                            {hasVideo && <Check size={14} className="ml-auto text-emerald-500" />}
                        </button>
                    )
                })}
            </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm">
                    <User size={16} />
                </div>
                <div className="overflow-hidden">
                    <div className="text-sm font-medium text-slate-900 truncate">{userContext?.name}</div>
                    <div className="text-xs text-slate-500 truncate">{userContext?.role}</div>
                </div>
            </div>
            <button onClick={() => setAppState(AppState.WELCOME)} className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-700 mt-2 p-1">
                <LogOut size={12} /> Exit Session
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full h-screen relative">
        
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12 flex flex-col min-h-full">
                <ProgressBar current={currentGapIndex + 1} total={gaps.length} />
                
                <div className="flex-1">
                    <QuestionCard 
                        gap={currentGap} 
                        answerData={currentAnswerData}
                        onAnswerUpdate={handleAnswerUpdate}
                        isSaving={isSavingAnswer}
                    />
                </div>

                {/* Navigation Footer */}
                <div className="mt-8 flex items-center justify-between bg-slate-50/80 backdrop-blur-sm sticky bottom-0 py-4">
                    <button
                        onClick={handlePrev}
                        disabled={currentGapIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg text-slate-600 font-medium hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={20} /> Previous
                    </button>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleNext}
                            className="px-6 py-3 rounded-lg text-slate-500 hover:text-slate-700 font-medium hover:bg-slate-100 transition-all"
                        >
                            Skip for now
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                        >
                            {currentGapIndex === gaps.length - 1 ? 'Complete Interview' : 'Next Question'} 
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}