import React, { useState, useEffect } from 'react';
import { GameMode, Face, MathTask, GameConfig, MathOperation, ArcadeType, GameResult, TutorialStep } from '../types';
import { 
  RotateCcw, Play, BookOpen, Clock, Move, Trophy, 
  RefreshCw, Shuffle, Undo2, Redo2, Lightbulb, 
  Menu, X, Home, HelpCircle, Gamepad2, Layers,
  Plus, Minus, X as XIcon, Divide, Infinity as InfinityIcon, Timer,
  Star, ChevronRight, Lock, CheckCircle, Brain, Sparkles, Smile, LogOut, Pause, Settings, ArrowLeft,
  Moon, Sun, Box
} from 'lucide-react';

interface Props {
  mode: GameMode;
  config: GameConfig;
  score: number;
  moves: number;
  timer: number;
  isPaused: boolean;
  theme: 'light' | 'dark';
  currentTask?: MathTask | null;
  taskProgress: number;
  showConfetti: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onModeSelect: (mode: GameMode) => void;
  onExit: () => void;
  onBack: () => void;
  onPause: () => void;
  onResume: () => void;
  onRotate: (face: Face, clockwise: boolean) => void;
  onReset: () => void;
  onScramble: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onToggleTheme: () => void;
  onStartCampaign: (op: MathOperation) => void;
  onStartLevel: (level: number) => void;
  onStartArcade: (type: ArcadeType) => void;
  onStartFreePlay: () => void;
  onStartTutorial: () => void;
  gameResult: GameResult | null;
  tutorialStep: TutorialStep | null;
  onTutorialNext: () => void;
  onTutorialSkipStep: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const CubyMascot = ({ mood = 'happy' }: { mood?: 'happy' | 'excited' | 'confused' | 'proud' | 'neutral' }) => {
    const isHappy = mood === 'happy';
    const isExcited = mood === 'excited';
    const isProud = mood === 'proud';
    const isConfused = mood === 'confused';

    return (
        <div className={`relative w-24 h-24 sm:w-28 sm:h-28 transform transition-transform duration-500 hover:rotate-6 ${isExcited ? 'animate-bounce' : 'animate-bounce-slow'}`}>
            {/* Body */}
            <div className={`absolute inset-2 bg-gradient-to-br ${isConfused ? 'from-purple-400 to-purple-600' : 'from-blue-400 to-blue-600'} rounded-2xl shadow-xl border-4 border-white overflow-hidden`}>
                {/* Face Shine */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/20 rounded-full -mr-4 -mt-4 blur-sm"></div>
                
                {/* Eyes */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-3">
                    {/* Left Eye */}
                    <div className="w-4 h-6 bg-white rounded-full flex items-center justify-center overflow-hidden">
                        {isConfused ? (
                             <div className="w-2 h-2 bg-black rounded-full translate-y-1 translate-x-1"></div>
                        ) : (
                             <div className={`w-2 h-3 bg-black rounded-full ${isExcited ? 'animate-ping' : 'animate-blink'}`}></div>
                        )}
                    </div>
                    {/* Right Eye */}
                    <div className="w-4 h-6 bg-white rounded-full flex items-center justify-center overflow-hidden">
                         {isProud ? (
                            <div className="w-4 h-1 bg-black translate-y-1"></div> // squint (sunglasses vibe)
                         ) : (
                             <div className={`w-2 h-3 bg-black rounded-full ${isExcited ? 'animate-ping' : 'animate-blink'}`}></div>
                         )}
                    </div>
                </div>
                
                {/* Mouth */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    {isHappy || isExcited || isProud ? (
                        <div className={`border-b-4 border-white rounded-full ${isExcited ? 'w-8 h-4' : 'w-6 h-3'}`}></div>
                    ) : isConfused ? (
                        <div className="w-4 h-4 border-4 border-white rounded-full"></div> // O face
                    ) : (
                        <div className="w-4 h-2 bg-white rounded-full"></div>
                    )}
                </div>
            </div>
            {/* Antennas (Decor) */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-blue-700"></div>
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full shadow-md border-2 border-white ${isExcited ? 'bg-yellow-400 animate-pulse' : 'bg-red-500'}`}></div>
            
            {/* Proud accessories (Star glasses implied or a badge) */}
            {isProud && (
                <div className="absolute -bottom-2 -right-2 text-2xl animate-bounce">⭐</div>
            )}
        </div>
    );
};

const TutorialOverlay = ({ step, onNext, onSkipStep, onExit, theme }: { step: TutorialStep, onNext: () => void, onSkipStep: () => void, onExit: () => void, theme: 'light' | 'dark' }) => {
    return (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 sm:right-8 sm:left-auto sm:translate-x-0 w-full max-w-sm px-4 z-40 pointer-events-none transition-all duration-500 ease-in-out">
             <div className="flex items-start gap-2 sm:gap-4 animate-slide-down">
                 <div className="hidden sm:block">
                    <CubyMascot mood={step.actionRequired === 'NONE' ? 'happy' : 'neutral'} />
                 </div>
                 
                 <div className={`relative pointer-events-auto flex-1 p-5 sm:p-6 rounded-3xl sm:rounded-tl-none shadow-2xl border-4 max-h-[50vh] overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-gray-800 border-blue-500 text-white' : 'bg-white border-blue-500 text-gray-800'}`}>
                    {/* Mobile Mascot Avatar Floating */}
                     <div className="absolute -top-12 -left-2 sm:hidden scale-75">
                         <CubyMascot mood={step.actionRequired === 'NONE' ? 'happy' : 'neutral'} />
                     </div>

                     {/* Skip Tutorial Button (X) */}
                     <button 
                        onClick={onExit}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-colors z-10 ${theme === 'dark' ? 'text-gray-500 hover:text-red-400 hover:bg-gray-700' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'}`}
                        title="Exit Tutorial"
                     >
                        <X size={20} />
                     </button>

                     <h3 className="font-black text-2xl text-blue-500 mb-2 pr-8">{step.text}</h3>
                     <p className={`text-lg font-medium leading-snug mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{step.subText}</p>
                     
                     {step.actionRequired === 'NONE' ? (
                         <button onClick={onNext} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95">
                             OK, Got it! <ChevronRight size={20} />
                         </button>
                     ) : (
                        <div className="flex flex-col gap-3">
                            <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wide border-2 animate-pulse ${theme === 'dark' ? 'bg-blue-900/30 border-blue-500 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Task: {step.actionRequired}
                            </div>
                            <button onClick={onSkipStep} className={`text-sm font-bold text-center underline decoration-2 underline-offset-4 transition-colors py-1 ${theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'}`}>
                                Skip this step
                            </button>
                        </div>
                     )}
                 </div>
             </div>
        </div>
    );
};

const TooltipButton = ({ onClick, disabled, className, tooltip, children, active }: any) => {
  return (
    <div className="group relative flex flex-col items-center">
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`${className} transform transition-all duration-100 ${active ? 'scale-95 brightness-90' : 'active:scale-95'}`}
      >
        {children}
      </button>
      {tooltip && (
        <div className="absolute -top-10 hidden group-hover:flex px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 animate-fade-in pointer-events-none shadow-xl">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// --- Splash Screen Helpers ---
const PauseMenu = ({ onResume, onRestart, onExit, onScramble, onToggleTheme, mode, theme }: any) => (
  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
    <div className={`rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border-4 animate-slide-down ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-white/50'}`}>
      <div className="flex justify-center mb-6">
        <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
          <Pause size={48} fill="currentColor" />
        </div>
      </div>
      <h2 className={`text-3xl font-black text-center mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Paused</h2>
      
      <div className="flex flex-col gap-3">
        <button onClick={onResume} className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3">
          <Play size={24} fill="currentColor" /> Resume
        </button>
        <button onClick={onRestart} className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold rounded-2xl shadow-lg shadow-yellow-200 transition-all active:scale-95 flex items-center justify-center gap-3">
          <RefreshCw size={24} /> Restart
        </button>
        {mode === GameMode.FREE_PLAY && (
            <button onClick={onScramble} className="w-full py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center justify-center gap-3">
            <Shuffle size={24} /> Scramble
            </button>
        )}
        <button onClick={onToggleTheme} className={`w-full py-4 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={onExit} className={`w-full py-4 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-2 ${theme === 'dark' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
          <LogOut size={24} /> Exit
        </button>
      </div>
    </div>
  </div>
);

const GameUI: React.FC<Props> = ({
  mode,
  config,
  score,
  moves,
  timer,
  isPaused,
  theme,
  currentTask,
  taskProgress,
  showConfetti,
  canUndo,
  canRedo,
  onModeSelect,
  onExit,
  onBack,
  onPause,
  onResume,
  onRotate,
  onReset,
  onScramble,
  onUndo,
  onRedo,
  onHint,
  onToggleTheme,
  onStartCampaign,
  onStartLevel,
  onStartArcade,
  onStartFreePlay,
  onStartTutorial,
  gameResult,
  tutorialStep,
  onTutorialNext,
  onTutorialSkipStep
}) => {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setShowHint(false);
  }, [currentTask?.id]);

  const toggleHint = () => {
      setShowHint(!showHint);
      onHint();
  };

  const bgClass = theme === 'dark' ? 'bg-gray-900/90 text-white' : 'bg-white/80 text-gray-800';
  const panelClass = theme === 'dark' ? 'bg-gray-800/95 text-white border-gray-700' : 'bg-white/95 text-gray-800 border-white/50';
  const textClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-600';

  // --- Screens ---
  if (mode === GameMode.SPLASH) {
  }

  if (mode === GameMode.REPORT && gameResult) {
      return (
         <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
            <div className={`${panelClass} rounded-[2rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl transform scale-100 animate-slide-down relative my-8 border-4 overflow-hidden`}>
                
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
                
                <div className="relative flex flex-col items-center mb-6">
                    <div className="mb-4">
                        <CubyMascot mood={gameResult.mascotMood} />
                    </div>
                    
                    <div className="flex justify-center gap-2 mb-2">
                        {[1, 2, 3].map(star => (
                            <Star 
                                key={star} 
                                size={40} 
                                className={`${star <= gameResult.rating ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg' : 'text-gray-300'} transition-all transform hover:scale-110`} 
                            />
                        ))}
                    </div>

                    <h2 className={`text-4xl font-black text-center tracking-tight mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {gameResult.title}
                    </h2>
                    
                    {/* Educational Tip Bubble */}
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 p-4 rounded-2xl text-sm font-medium relative max-w-xs text-center border-2 border-blue-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">💡</span>
                            <span className="font-bold text-blue-600">Math Tip:</span>
                        </div>
                        "{gameResult.tips[gameResult.tips.length - 1]}"
                        <div className="absolute -bottom-2 right-4 w-4 h-4 bg-blue-50 border-b-2 border-r-2 border-blue-100 transform rotate-45"></div>
                    </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className={`p-4 rounded-2xl text-center border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Trophy size={16} className="text-blue-500" />
                            <div className="text-blue-500 font-bold text-xs uppercase tracking-wider">Score</div>
                        </div>
                        <div className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>{gameResult.score}</div>
                    </div>
                    <div className={`p-4 rounded-2xl text-center border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-100'}`}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <CheckCircle size={16} className="text-green-500" />
                            <div className="text-green-500 font-bold text-xs uppercase tracking-wider">Correct</div>
                        </div>
                        <div className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}>{gameResult.correctAnswers}</div>
                    </div>
                     <div className={`p-3 rounded-2xl text-center border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-100'}`}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Timer size={14} className="text-orange-500" />
                            <div className="text-orange-500 font-bold text-[10px] uppercase tracking-wider">Time</div>
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-orange-900'}`}>{gameResult.timeTaken}s</div>
                    </div>
                    <div className={`p-3 rounded-2xl text-center border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-100'}`}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Lightbulb size={14} className="text-purple-500" />
                            <div className="text-purple-500 font-bold text-[10px] uppercase tracking-wider">Hints</div>
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-purple-900'}`}>{gameResult.hintsUsed}</div>
                    </div>
                </div>

                {/* Performance Feedback */}
                <div className={`mb-6 p-4 rounded-2xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`font-bold text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>📊 Performance Summary</h3>
                    <div className="flex justify-between text-xs">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Accuracy:</span>
                        <span className="font-bold text-green-500">{gameResult.totalQuestionsAttempted > 0 ? Math.round((gameResult.correctAnswers / gameResult.totalQuestionsAttempted) * 100) : 0}%</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Avg per problem:</span>
                        <span className="font-bold text-blue-500">{gameResult.averageTimePerPuzzle.toFixed(1)}s</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Best streak:</span>
                        <span className="font-bold text-orange-500">🔥 {gameResult.maxCombo}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => onModeSelect(GameMode.MENU)} className={`flex-1 py-4 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                        <Home size={20} /> Menu
                    </button>
                    <button onClick={() => {
                        if (config.mode === 'CAMPAIGN' && config.selectedLevel) onStartLevel(config.selectedLevel);
                        else if (config.mode === 'ARCADE' && config.arcadeType) onStartArcade(config.arcadeType);
                        else if (config.mode === 'TUTORIAL') onStartTutorial();
                        else onStartFreePlay();
                    }} className="flex-[2] py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-transform active:scale-95 flex items-center justify-center gap-2">
                        <RefreshCw size={20} /> Play Again
                    </button>
                </div>
            </div>
        </div>
      );
  }

  if (mode === GameMode.MENU) {
    return (
      <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm p-4 text-center animate-fade-in ${bgClass}`}>
        <div className="mb-8 sm:mb-12 relative w-full max-w-xl">
           <div className="flex justify-center mb-6">
                <CubyMascot mood="happy" />
           </div>
           <h1 className="relative text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-600 perspective-text drop-shadow-sm tracking-tight px-2 leading-tight">
             CS Cube Math
           </h1>
        </div>
        
        <div className="grid gap-4 w-full max-w-sm relative">
          <div className="absolute -right-16 top-0 hidden sm:block">
              <button 
                onClick={onToggleTheme} 
                className={`p-3 rounded-full shadow-lg transition-transform hover:scale-110 ${theme === 'dark' ? 'bg-gray-800 text-yellow-400' : 'bg-white text-blue-600'}`}
              >
                  {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
          </div>
          <div className="flex justify-center sm:hidden mb-2">
               <button 
                onClick={onToggleTheme} 
                className={`p-3 rounded-full shadow-lg transition-transform hover:scale-110 ${theme === 'dark' ? 'bg-gray-800 text-yellow-400' : 'bg-white text-blue-600'}`}
              >
                  {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
          </div>

          <MenuButton 
            onClick={onStartTutorial} 
            color="bg-teal-500 hover:bg-teal-400" 
            icon={<HelpCircle size={32} className="text-white" />} 
            title="Tutorial" 
            desc="Start here!"
            theme={theme}
            compact
          />
          <MenuButton 
            onClick={onStartFreePlay} 
            color="bg-green-500 hover:bg-green-400" 
            icon={<Play size={32} className="text-white" />} 
            title="Free Play" 
            desc="Explore freely"
            theme={theme}
            compact
          />
          <MenuButton 
            onClick={() => onModeSelect(GameMode.MATH_HUB)} 
            color="bg-yellow-400 hover:bg-yellow-300" 
            textColor="text-yellow-900"
            icon={<BookOpen size={36} className="text-yellow-900" />} 
            title="Math Puzzles" 
            desc="Campaign & Arcade"
            theme={theme}
          />
        </div>
      </div>
    );
  }

  // Generic Layout for Selection Screens
  if ([GameMode.MATH_HUB, GameMode.CAMPAIGN_SELECT, GameMode.LEVEL_SELECT, GameMode.ARCADE_SELECT].includes(mode)) {
    return (
      <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm p-4 text-center animate-fade-in ${bgClass}`}>
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
            <button onClick={onBack} className={`p-3 rounded-full shadow-lg transition-all hover:scale-110 ${theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                <ArrowLeft size={32} strokeWidth={3} />
            </button>
        </div>

        <div className="w-full max-w-2xl animate-slide-down mt-16 sm:mt-0 max-h-full overflow-y-auto hide-scrollbar">
          {mode === GameMode.MATH_HUB && (
              <>
                <h2 className={`text-4xl sm:text-5xl font-black mb-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Math Hub</h2>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mb-10 text-xl`}>Select a game mode</p>
                <div className="grid md:grid-cols-2 gap-6 pb-4">
                    <MenuButton 
                    onClick={() => onModeSelect(GameMode.CAMPAIGN_SELECT)} 
                    color="bg-blue-500 hover:bg-blue-400" 
                    icon={<Layers size={48} className="text-white" />} 
                    title="Campaign" 
                    desc="Master operations by level"
                    theme={theme}
                    />
                    <MenuButton 
                    onClick={() => onModeSelect(GameMode.ARCADE_SELECT)} 
                    color="bg-purple-500 hover:bg-purple-400" 
                    icon={<Gamepad2 size={48} className="text-white" />} 
                    title="Arcade" 
                    desc="Endless & Score Attack"
                    theme={theme}
                    />
                </div>
              </>
          )}

          {mode === GameMode.CAMPAIGN_SELECT && (
              <>
                <h2 className={`text-3xl sm:text-4xl font-black mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Select Operation</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                    <MenuButton onClick={() => onStartCampaign('ADD')} color="bg-green-500" icon={<Plus size={32}/>} title="Addition" desc="10 Levels" theme={theme} compact />
                    <MenuButton onClick={() => onStartCampaign('SUB')} color="bg-red-500" icon={<Minus size={32}/>} title="Subtraction" desc="10 Levels" theme={theme} compact />
                    <MenuButton onClick={() => onStartCampaign('MUL')} color="bg-blue-500" icon={<XIcon size={32}/>} title="Multiply" desc="10 Levels" theme={theme} compact />
                    <MenuButton onClick={() => onStartCampaign('DIV')} color="bg-yellow-400" textColor="text-yellow-900" icon={<Divide size={32} className="text-yellow-900"/>} title="Division" desc="10 Levels" theme={theme} compact />
                </div>
              </>
          )}

          {mode === GameMode.ARCADE_SELECT && (
              <>
                <h2 className={`text-3xl sm:text-4xl font-black mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Arcade Mode</h2>
                <div className="grid gap-4 pb-4">
                    <MenuButton onClick={() => onStartArcade('SCORE_ATTACK')} color="bg-orange-500" icon={<Timer size={32}/>} title="Score Attack" desc="60 Seconds Blitz!" theme={theme} />
                    <MenuButton onClick={() => onStartArcade('ENDLESS')} color="bg-indigo-500" icon={<InfinityIcon size={32}/>} title="Endless" desc="Relaxed play" theme={theme} />
                </div>
              </>
          )}

          {mode === GameMode.LEVEL_SELECT && (
              <>
                <h2 className={`text-3xl sm:text-4xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Select Level</h2>
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Choose your challenge level</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pb-8 px-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
                        <button
                            key={level}
                            onClick={() => onStartLevel(level)}
                            className={`aspect-square flex flex-col items-center justify-center border-b-[6px] active:border-b-0 active:translate-y-1 rounded-2xl shadow-xl transition-all group relative overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-blue-50'}`}
                        >
                            {/* Level number */}
                            <div className={`text-2xl sm:text-3xl font-black transition-colors ${theme === 'dark' ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-600'}`}>{level}</div>
                            
                            {/* Difficulty indicator */}
                            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                                level <= 3 ? 'bg-green-400' :
                                level <= 6 ? 'bg-yellow-400' :
                                level <= 8 ? 'bg-orange-400' :
                                'bg-red-400'
                            }`}></div>
                            
                            {/* Level tier label */}
                            <div className={`text-[10px] font-medium mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                {level <= 3 ? 'Easy' : level <= 6 ? 'Medium' : level <= 8 ? 'Hard' : 'Expert'}
                            </div>
                        </button>
                    ))}
                </div>
              </>
          )}
        </div>
      </div>
    );
  }

  // --- Main HUD (Gameplay) ---
  return (
    <>
      {isPaused && <PauseMenu onResume={onResume} onRestart={onReset} onExit={onExit} onScramble={onScramble} onToggleTheme={onToggleTheme} mode={config.mode} theme={theme} />}
      
      {/* Top HUD */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-2 sm:p-4">
        <div className="flex justify-between items-start pointer-events-auto">
             {/* Pause Button */}
             <TooltipButton 
               onClick={onPause}
               className={`p-3 rounded-xl shadow-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200 hover:text-blue-400' : 'bg-white border-gray-200 text-gray-700 hover:text-blue-600'}`}
            >
               <Pause size={28} fill="currentColor" />
            </TooltipButton>

            {/* Task Card */}
            {(mode === GameMode.PLAYING || mode === GameMode.TUTORIAL) && currentTask && !tutorialStep && (
                <div className={`flex-1 max-w-md mx-2 sm:mx-4 rounded-3xl shadow-2xl border-b-8 overflow-hidden relative animate-slide-down ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className={`p-2 flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 ${theme === 'dark' ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-400'}`}>
                         <span className="flex items-center gap-2">
                            {config.mode === 'CAMPAIGN' && config.selectedLevel && <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">Lv.{config.selectedLevel}</span>}
                            {config.mode === 'ARCADE' && <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full">Arcade</span>}
                            {config.mode === 'FREE' && <span className="bg-green-500 text-white px-2 py-0.5 rounded-full">Free Play</span>}
                         </span>
                         <span className="flex items-center gap-1">
                            <span className="text-orange-400">🎯</span>
                            {currentTask.type === 'move_count' ? `Rotate ${currentTask.targetValue}x` : currentTask.type}
                         </span>
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col items-center">
                        <h3 className={`text-xl sm:text-2xl font-black text-center leading-none mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{currentTask.question}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <span>Rotate the</span>
                            <span className={`font-bold px-2 py-0.5 rounded ${
                                currentTask.requiredFace === 'R' ? 'bg-red-500 text-white' :
                                currentTask.requiredFace === 'L' ? 'bg-orange-500 text-white' :
                                currentTask.requiredFace === 'U' ? 'bg-white text-gray-800 border' :
                                currentTask.requiredFace === 'D' ? 'bg-yellow-400 text-yellow-900' :
                                currentTask.requiredFace === 'F' ? 'bg-green-500 text-white' :
                                'bg-blue-600 text-white'
                            }`}>{currentTask.requiredFace}</span>
                            <span>face</span>
                        </div>
                        <button onClick={toggleHint} className="text-xs font-bold text-blue-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                            <Lightbulb size={12} /> {showHint ? currentTask.hint : "Need a Hint?"}
                        </button>
                    </div>
                     {/* Progress Bar */}
                    <div className={`h-2 w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div 
                            className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500 transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(100, (taskProgress / (currentTask.targetValue as number || 1)) * 100)}%` }}
                        />
                    </div>
                    
                    {/* Confetti / Success Overlay */}
                    {showConfetti && (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 animate-fade-in ${theme === 'dark' ? 'bg-gray-800/95' : 'bg-white/95'}`}>
                            <span className="text-5xl animate-bounce mb-1">⭐</span>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">Excellent Work!</span>
                            <span className="text-sm text-gray-500 mt-2">+{100 * (config.selectedLevel || 1)} points</span>
                        </div>
                    )}
                </div>
            )}

            {/* Undo/Redo Group */}
            <div className={`flex gap-2 p-1.5 rounded-xl shadow-lg border-b-4 backdrop-blur-sm ${theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'}`}>
                <TooltipButton onClick={onUndo} disabled={!canUndo} className={`p-2 rounded-lg transition-colors ${canUndo ? (theme === 'dark' ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50') : 'text-gray-400'}`}>
                  <Undo2 size={24} />
                </TooltipButton>
                <TooltipButton onClick={onRedo} disabled={!canRedo} className={`p-2 rounded-lg transition-colors ${canRedo ? (theme === 'dark' ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50') : 'text-gray-400'}`}>
                  <Redo2 size={24} />
                </TooltipButton>
            </div>
        </div>

        {/* Timer/Score/Streak Floating Badges */}
        {(mode === GameMode.PLAYING) && (
            <div className="absolute top-24 left-4 pointer-events-none flex flex-col gap-2">
                 {/* Timer */}
                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md ${timer < 10 && config.mode !== 'FREE' ? 'bg-red-500/90 text-white animate-timer-warning' : 'bg-black/50 text-white'}`}>
                    <Clock size={14} /> 
                    <span className="font-mono">{formatTime(timer)}</span>
                    {timer < 10 && timer > 0 && <span className="text-xs animate-pulse">⚡</span>}
                 </div>
                 
                 {/* Score */}
                 <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-bold">
                    <Trophy size={14} className="text-yellow-400" /> 
                    <span className="font-mono">{score}</span>
                 </div>
                 
                 {/* Level Progress */}
                 {config.mode === 'CAMPAIGN' && config.selectedLevel && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold">
                        <Star size={12} className="text-yellow-300" />
                        <span>Level {config.selectedLevel}/10</span>
                    </div>
                 )}
            </div>
        )}

        {/* Bottom Controls */}
        <div className="flex flex-col items-center gap-2 pointer-events-auto mb-2 animate-slide-up">
          <div className={`flex flex-wrap justify-center gap-3 sm:gap-6 items-center backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] shadow-2xl border-t ${theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-white/50'}`}>
            <FaceControlGroup color="bg-orange-500" onRotate={onRotate} face={Face.L} tooltipPrefix="Orange" theme={theme} />
            <FaceControlGroup color="bg-green-500" onRotate={onRotate} face={Face.F} tooltipPrefix="Green" theme={theme} />
            <FaceControlGroup color="bg-red-500" onRotate={onRotate} face={Face.R} tooltipPrefix="Red" theme={theme} />
            <div className={`w-px h-12 mx-2 hidden sm:block ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            <div className="flex flex-col gap-2">
              <FaceControlGroup color={theme === 'dark' ? "bg-gray-700 border-2 border-gray-600" : "bg-gray-100 border-2 border-gray-300"} text={theme === 'dark' ? "text-white" : "text-gray-800"} onRotate={onRotate} face={Face.U} horizontal tooltipPrefix="White" theme={theme} />
              <FaceControlGroup color="bg-yellow-400" text="text-yellow-900" onRotate={onRotate} face={Face.D} horizontal tooltipPrefix="Yellow" theme={theme} />
            </div>
            <div className={`w-px h-12 mx-2 hidden sm:block ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            <FaceControlGroup color="bg-blue-600" onRotate={onRotate} face={Face.B} tooltipPrefix="Blue" theme={theme} />
          </div>
        </div>

      </div>

       {/* Tutorial Overlay */}
       {tutorialStep && (
            <TutorialOverlay 
                step={tutorialStep} 
                onNext={onTutorialNext} 
                onSkipStep={onTutorialSkipStep} 
                onExit={onExit} 
                theme={theme} 
            />
       )}
    </>
  );
};

const MenuButton = ({ onClick, color, icon, title, desc, textColor = 'text-white', compact = false, theme }: any) => (
  <button 
    onClick={onClick}
    className={`${color} ${textColor} ${compact ? 'p-3' : 'p-5'} rounded-3xl shadow-lg border-b-[6px] border-black/10 active:border-b-0 active:translate-y-1 transition-all flex items-center ${compact ? 'gap-3' : 'gap-5'} text-left w-full group overflow-hidden relative`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
    <div className={`bg-white/20 ${compact ? 'p-2' : 'p-3'} rounded-2xl group-hover:scale-110 transition-transform`}>{icon}</div>
    <div>
      <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-black leading-none tracking-tight`}>{title}</h3>
      <p className="opacity-90 text-sm mt-1 font-medium">{desc}</p>
    </div>
  </button>
);

const FaceControlGroup = ({ color, text = 'text-white', onRotate, face, horizontal = false, tooltipPrefix, theme }: any) => (
  <div className={`flex flex-col items-center gap-1 ${horizontal ? 'flex-row' : ''}`}>
    <div className="flex gap-1.5">
      <TooltipButton 
        onClick={() => onRotate(face, false)}
        tooltip={`${tooltipPrefix} Left`}
        className={`${color} ${text} w-11 h-11 sm:w-14 sm:h-14 rounded-2xl shadow-md border-b-[4px] border-black/20 active:border-b-0 active:translate-y-1 flex items-center justify-center font-bold hover:brightness-110`}
      >
        <RotateCcw size={20} strokeWidth={3} />
      </TooltipButton>
      <TooltipButton 
        onClick={() => onRotate(face, true)}
        tooltip={`${tooltipPrefix} Right`}
        className={`${color} ${text} w-11 h-11 sm:w-14 sm:h-14 rounded-2xl shadow-md border-b-[4px] border-black/20 active:border-b-0 active:translate-y-1 flex items-center justify-center font-bold hover:brightness-110`}
      >
        <RotateCcw size={20} className="scale-x-[-1]" strokeWidth={3} />
      </TooltipButton>
    </div>
  </div>
);

export default GameUI;
