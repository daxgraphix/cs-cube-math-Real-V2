import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Stars } from '@react-three/drei';
import { GameMode, Cubie, Face, MathTask, MoveHistoryItem, GameConfig, MathOperation, ArcadeType, GameResult, TutorialStep } from './types';
import { INITIAL_POSITIONS, generateMathTask, TUTORIAL_STEPS } from './constants';
import RubiksCube from './components/RubiksCube';
import GameUI from './components/GameUI';
import { SplashScreen } from './components/SplashScreen';

const TIME_LIMIT = 60; // 60 Seconds for Campaign/Score Attack

const App: React.FC = () => {
  // --- Game State ---
  const [mode, setMode] = useState<GameMode>(GameMode.SPLASH);
  const [config, setConfig] = useState<GameConfig>({ mode: 'FREE' });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0); 
  const [gameActive, setGameActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // New Pause State
  const [gameResetKey, setGameResetKey] = useState(0);
  
  // Undo/Redo History
  const [history, setHistory] = useState<MoveHistoryItem[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1); 
  
  // Math Mode State
  const [currentTask, setCurrentTask] = useState<MathTask | null>(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [level, setLevel] = useState(1); // Difficulty Level
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Statistics for Report
  const [correctCount, setCorrectCount] = useState(0);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Tutorial State
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const currentTutorialStep = mode === GameMode.TUTORIAL ? TUTORIAL_STEPS[tutorialStepIndex] : null;

  // Cube State
  const [cubies, setCubies] = useState<Cubie[]>(() => 
    INITIAL_POSITIONS.map((pos, i) => ({
      id: i,
      position: pos,
      rotation: [0, 0, 0],
      initialPosition: pos
    }))
  );

  // Animation & Queue State
  const isAnimatingRef = useRef(false);
  const moveQueue = useRef<{ face: Face; clockwise: boolean; isUndoRedo: boolean }[]>([]);
  const currentMoveRef = useRef<{ face: Face; clockwise: boolean; isUndoRedo: boolean } | null>(null);

  // --- Logic ---

  // Splash Screen - use SplashScreen component
  const handleSplashFinish = () => {
    setMode(GameMode.MENU);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const selectCampaignOperation = (op: MathOperation) => {
    setConfig({ mode: 'CAMPAIGN', operation: op });
    setMode(GameMode.LEVEL_SELECT);
  };

  const startLevel = (selectedLevel: number) => {
    setConfig(prev => ({ ...prev, selectedLevel }));
    setMode(GameMode.PLAYING);
    resetGameData();
    setTimer(TIME_LIMIT);
    setGameActive(true);
    setCurrentTask(generateMathTask(1, config.operation || 'ADD', selectedLevel));
  };

  const startArcade = (type: ArcadeType) => {
    setConfig({ mode: 'ARCADE', arcadeType: type, operation: 'MIXED' });
    setMode(GameMode.PLAYING);
    resetGameData();
    if (type === 'SCORE_ATTACK') {
      setTimer(TIME_LIMIT);
    }
    setGameActive(true);
    setCurrentTask(generateMathTask(1, 'MIXED', 1));
  };

  const startTutorial = () => {
    setConfig({ mode: 'TUTORIAL' });
    setMode(GameMode.TUTORIAL);
    resetGameData();
    setTutorialStepIndex(0);
    setGameActive(true);
    setCurrentTask({
        id: 0, question: "Tutorial Mode", type: 'move_count', targetValue: 99, isComplete: false
    });
  };

  const startFreePlay = () => {
    setConfig({ mode: 'FREE' });
    setMode(GameMode.FREE_PLAY);
    resetGameData();
    setGameActive(true);
    setCurrentTask(null);
  };

  const resetGameData = () => {
    setMoves(0);
    setTimer(0);
    setScore(0);
    setCorrectCount(0);
    setHintsUsedCount(0);
    setTaskProgress(0);
    setLevel(1);
    setIsPaused(false);
    setHistory([]);
    setHistoryPointer(-1);
    setGameResetKey(prev => prev + 1);
    moveQueue.current = [];
    isAnimatingRef.current = false;
    setGameResult(null);
    setCubies(INITIAL_POSITIONS.map((pos, i) => ({
      id: i,
      position: pos,
      rotation: [0, 0, 0],
      initialPosition: pos
    })));
  };

  // The pause function toggles state
  const togglePause = () => {
    if (mode === GameMode.PLAYING || mode === GameMode.TUTORIAL || mode === GameMode.FREE_PLAY) {
      setIsPaused(!isPaused);
    }
  };

  const handleExitGame = () => {
    setGameActive(false);
    setIsPaused(false);
    
    // Logic to determine where "Back" goes
    if (mode === GameMode.PLAYING) {
       if (config.mode === 'CAMPAIGN') setMode(GameMode.LEVEL_SELECT);
       else if (config.mode === 'ARCADE') setMode(GameMode.ARCADE_SELECT);
       else setMode(GameMode.MENU);
    } else {
        setMode(GameMode.MENU);
    }
  };

  const handleBackNavigation = () => {
    switch (mode) {
      case GameMode.LEVEL_SELECT: setMode(GameMode.CAMPAIGN_SELECT); break;
      case GameMode.CAMPAIGN_SELECT: setMode(GameMode.MATH_HUB); break;
      case GameMode.ARCADE_SELECT: setMode(GameMode.MATH_HUB); break;
      case GameMode.MATH_HUB: setMode(GameMode.MENU); break;
      case GameMode.REPORT: setMode(GameMode.MENU); break;
      default: setMode(GameMode.MENU); break;
    }
  }

  const finishGame = () => {
    setGameActive(false);
    
    let timeTaken = 0;
    if (config.mode === 'ARCADE' && config.arcadeType === 'ENDLESS') {
        timeTaken = timer;
    } else {
        timeTaken = TIME_LIMIT - timer;
        if (timer <= 0) timeTaken = TIME_LIMIT;
    }

    const avgTime = correctCount > 0 ? (timeTaken / correctCount) : 0;

    // --- Generate Fun Report ---
    let title = "Cube Beginner";
    let mood: 'happy' | 'excited' | 'confused' | 'proud' | 'neutral' = 'happy';
    const tips: string[] = [];

    // Title & Mood Logic
    if (config.mode === 'TUTORIAL') {
        title = "Cube Graduate";
        mood = 'proud';
        tips.push("You're officially ready to rock!");
    } else if (correctCount === 0) {
        title = "Button Masher";
        mood = 'confused';
        tips.push("Hey, at least you looked cool doing it!");
        tips.push("Don't give up! Try a lower level to warm up.");
    } else if (hintsUsedCount > correctCount) {
        title = "Hint Hunter";
        mood = 'neutral';
        tips.push("You love those hints, huh? Try going solo next time!");
    } else if (avgTime < 4 && correctCount > 5) {
        title = "Speed Demon";
        mood = 'excited';
        tips.push("Are your fingers made of lightning?");
        tips.push("Slow down! You're making the cube dizzy!");
    } else if (correctCount >= 10) {
        title = "Math Wizard";
        mood = 'proud';
        tips.push("Your brain is absolutely massive right now.");
    } else if (correctCount >= 5) {
        title = "Puzzle Pro";
        mood = 'happy';
        tips.push("Solid work! You're getting better every day.");
    } else {
        title = "The Thinker";
        mood = 'happy';
        tips.push("Slow and steady wins the race!");
    }

    // Random Fun Messages
    const FUN_PHRASES = [
      "I'm dizzy just watching you!",
      "Is it a bird? A plane? No, it's you solving cubes!",
      "High five! (If I had hands...)",
      "Zero to Hero in 60 seconds!",
      "You spin me right round, baby, right round!",
      "Absolute legend status achieved."
    ];
    
    // Add a random fun phrase if not tutorial and has some score
    if (config.mode !== 'TUTORIAL' && correctCount > 0) {
        tips.push(FUN_PHRASES[Math.floor(Math.random() * FUN_PHRASES.length)]);
    }

    let rating: 1 | 2 | 3 = 1;
    if (correctCount >= 3) rating = 2;
    if (correctCount >= 8) rating = 3; 
    if (config.mode === 'TUTORIAL') rating = 3;

    setGameResult({
      score,
      correctAnswers: correctCount,
      totalQuestionsAttempted: correctCount,
      maxCombo: correctCount,
      timeTaken,
      averageTimePerPuzzle: avgTime,
      hintsUsed: hintsUsedCount,
      tips,
      rating,
      title,
      mascotMood: mood
    });
    setMode(GameMode.REPORT);
  };

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameActive && !isPaused && mode === GameMode.PLAYING) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (config.mode === 'CAMPAIGN' || (config.mode === 'ARCADE' && config.arcadeType === 'SCORE_ATTACK')) {
            if (prev <= 1) {
              clearInterval(interval);
              finishGame();
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameActive, isPaused, mode, config, score]);

  // Math Logic Checker
  useEffect(() => {
    if (mode === GameMode.PLAYING && gameActive && !isPaused && currentTask) {
      if (currentTask.type === 'move_count') {
         const target = currentTask.targetValue as number;
         if (taskProgress >= target) {
           completeTask();
         }
      } 
    }
  }, [taskProgress, mode, gameActive, isPaused, currentTask]);

  const completeTask = () => {
    if (showConfetti) return; 
    
    const points = 10 + (Math.max(0, 10 - taskProgress));
    setScore(s => s + points);
    setCorrectCount(prev => prev + 1);

    setShowConfetti(true);
    setIsCelebrating(true); 
    
    setTimeout(() => {
      setShowConfetti(false);
      setIsCelebrating(false);
      setTaskProgress(0);
      
      const taskLevel = config.mode === 'CAMPAIGN' ? (config.selectedLevel || 1) : (level + 1);
      
      if (config.mode === 'ARCADE') {
        setLevel(l => l + 1);
      }

      const nextOp = config.mode === 'CAMPAIGN' ? (config.operation || 'ADD') : 'MIXED';
      const nextId = currentTask ? currentTask.id + 1 : 1;
      
      setCurrentTask(generateMathTask(nextId, nextOp, taskLevel));

    }, 2500); 
  };

  const handleTutorialStep = (action: 'ROTATE' | 'UNDO' | 'HINT' | 'NEXT' | 'SKIP_STEP', face?: Face) => {
    if (!currentTutorialStep) return;

    let advance = false;

    if (action === 'SKIP_STEP') advance = true;

    if (currentTutorialStep.actionRequired === 'NONE' && action === 'NEXT') advance = true;
    if (currentTutorialStep.actionRequired === 'ROTATE' && action === 'ROTATE') {
        if (currentTutorialStep.targetFace && face === currentTutorialStep.targetFace) advance = true;
        if (currentTutorialStep.id === 4) { 
             if (taskProgress + 1 < 2) advance = false; 
             else advance = true;
        } 
        else if (currentTutorialStep.id === 6) { 
             if (taskProgress + 1 < 3) advance = false; 
             else advance = true;
        }
    }
    if (currentTutorialStep.actionRequired === 'UNDO' && action === 'UNDO') advance = true;
    if (currentTutorialStep.actionRequired === 'HINT' && action === 'HINT') advance = true;

    if (advance) {
        if (tutorialStepIndex < TUTORIAL_STEPS.length - 1) {
           setTimeout(() => {
               setTutorialStepIndex(prev => prev + 1);
               setTaskProgress(0); 
           }, 500);
        } else {
            finishGame();
        }
    }
  };

  const rotateFaceLogic = useCallback((face: Face, clockwise: boolean, isUndoRedo: boolean = false) => {
    if (!isUndoRedo) {
      setMoves(prev => prev + 1);
      
      if (mode === GameMode.TUTORIAL) {
          if (currentTutorialStep?.id === 4 && face === Face.F) {
             setTaskProgress(prev => prev + 1);
          }
          if (currentTutorialStep?.id === 6 && face === Face.B) {
             setTaskProgress(prev => prev + 1);
          }
          handleTutorialStep('ROTATE', face);
      }
      else if (mode === GameMode.PLAYING && currentTask) {
        if (currentTask.requiredFace) {
            if (face === currentTask.requiredFace) {
                setTaskProgress(prev => prev + 1);
            }
        } else {
            setTaskProgress(prev => prev + 1);
        }
      }
    }

    setCubies(prevCubies => {
      return prevCubies.map(cubie => {
        const [x, y, z] = cubie.position;
        let shouldRotate = false;
        switch (face) {
          case Face.R: shouldRotate = x > 0.5; break;
          case Face.L: shouldRotate = x < -0.5; break;
          case Face.U: shouldRotate = y > 0.5; break;
          case Face.D: shouldRotate = y < -0.5; break;
          case Face.F: shouldRotate = z > 0.5; break;
          case Face.B: shouldRotate = z < -0.5; break;
        }

        if (!shouldRotate) return cubie;

        let [nx, ny, nz] = [x, y, z];

        if (face === Face.R) { if (clockwise) { ny = z; nz = -y; } else { ny = -z; nz = y; } }
        if (face === Face.L) { if (clockwise) { ny = -z; nz = y; } else { ny = z; nz = -y; } }
        if (face === Face.U) { if (clockwise) { nx = -z; nz = x; } else { nx = z; nz = -x; } }
        if (face === Face.D) { if (clockwise) { nx = z; nz = -x; } else { nx = -z; nz = x; } }
        if (face === Face.F) { if (clockwise) { nx = y; ny = -x; } else { nx = -y; ny = x; } }
        if (face === Face.B) { if (clockwise) { nx = -y; ny = x; } else { nx = y; ny = -x; } }

        return {
          ...cubie,
          position: [Math.round(nx), Math.round(ny), Math.round(nz)],
          rotation: [...cubie.rotation] 
        };
      });
    });
  }, [mode, currentTask, currentTutorialStep]);

  const processQueue = useCallback(() => {
    if (isAnimatingRef.current || moveQueue.current.length === 0) return;

    const move = moveQueue.current.shift();
    if (move) {
      isAnimatingRef.current = true;
      currentMoveRef.current = move;
      
      if (!move.isUndoRedo) {
        setHistory(prev => {
           const newHistory = prev.slice(0, historyPointer + 1);
           newHistory.push({ face: move.face, clockwise: move.clockwise });
           return newHistory;
        });
        setHistoryPointer(prev => prev + 1);
      }

      const event = new CustomEvent('rotate-face', { detail: { face: move.face, clockwise: move.clockwise } });
      window.dispatchEvent(event);
    }
  }, [historyPointer]);

  const handleAnimationComplete = useCallback(() => {
    if (currentMoveRef.current) {
      const { face, clockwise, isUndoRedo } = currentMoveRef.current;
      rotateFaceLogic(face, clockwise, isUndoRedo);
    } else {
      isAnimatingRef.current = false;
    }
  }, [rotateFaceLogic]);

  useEffect(() => {
    if (isAnimatingRef.current) {
      isAnimatingRef.current = false;
      currentMoveRef.current = null;
      setTimeout(processQueue, 10);
    }
  }, [cubies, processQueue]);

  const triggerRotation = (face: Face, clockwise: boolean, isUndoRedo: boolean = false) => {
    if (isPaused) return; // Prevent moves when paused
    moveQueue.current.push({ face, clockwise, isUndoRedo });
    processQueue();
  };

  const handleUndo = () => {
    if (isPaused) return;
    if (mode === GameMode.TUTORIAL) handleTutorialStep('UNDO');
    if (historyPointer < 0) return;
    const move = history[historyPointer];
    triggerRotation(move.face, !move.clockwise, true);
    setHistoryPointer(prev => prev - 1);
  };

  const handleRedo = () => {
    if (isPaused) return;
    if (historyPointer >= history.length - 1) return;
    const move = history[historyPointer + 1];
    triggerRotation(move.face, move.clockwise, true);
    setHistoryPointer(prev => prev + 1);
  };

  const handleHint = () => {
      if (isPaused) return;
      setHintsUsedCount(p => p + 1);
      if (mode === GameMode.TUTORIAL) handleTutorialStep('HINT');
  }

  const handleScramble = () => {
    if (isPaused) return;
    const faces = [Face.U, Face.D, Face.L, Face.R, Face.F, Face.B];
    const max = 20; 
    setHistory([]);
    setHistoryPointer(-1);
    moveQueue.current = []; 
    for (let i = 0; i < max; i++) {
      const randomFace = faces[Math.floor(Math.random() * faces.length)];
      const randomDir = Math.random() > 0.5;
      moveQueue.current.push({ face: randomFace, clockwise: randomDir, isUndoRedo: false });
    }
    processQueue();
  };

  return (
    <>
      {mode === GameMode.SPLASH && (
        <SplashScreen onFinish={handleSplashFinish} theme={theme} />
      )}
      <div className={`w-full h-screen flex flex-col relative overflow-hidden select-none font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-black' : 'bg-gradient-to-br from-sky-100 to-indigo-100'}`}>
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [6, 4, 6], fov: 45 }} shadows dpr={[1, 2]}>
          <ambientLight intensity={theme === 'dark' ? 0.8 : 0.5} />
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.15} 
            penumbra={1} 
            intensity={theme === 'dark' ? 1.5 : 1} 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
          />
          <Environment preset={theme === 'dark' ? 'studio' : 'city'} />
          {theme === 'dark' && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
          
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
             <RubiksCube 
                key={gameResetKey} 
                cubies={cubies} 
                onAnimationComplete={handleAnimationComplete}
                isCelebrating={isCelebrating}
                theme={theme}
              />
          </Float>

          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={theme === 'dark' ? 0.3 : 0.4} 
            scale={15} 
            blur={2} 
            far={4.5} 
            color={theme === 'dark' ? '#000000' : '#333333'}
          />

          <OrbitControls 
            enablePan={false} 
            minDistance={4} 
            maxDistance={12} 
            maxPolarAngle={Math.PI / 1.5} 
            enabled={!isPaused && mode !== GameMode.SPLASH} 
          />
        </Canvas>
      </div>

      <GameUI 
        mode={mode}
        config={config}
        score={score}
        moves={moves}
        timer={timer}
        isPaused={isPaused}
        theme={theme}
        onModeSelect={setMode}
        onExit={handleExitGame}
        onBack={handleBackNavigation}
        onPause={togglePause}
        onResume={() => setIsPaused(false)}
        onRotate={(face, cw) => triggerRotation(face, cw)}
        onReset={resetGameData}
        onScramble={handleScramble}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onHint={handleHint}
        onToggleTheme={toggleTheme}
        canUndo={historyPointer >= 0}
        canRedo={historyPointer < history.length - 1}
        currentTask={currentTask}
        taskProgress={taskProgress}
        showConfetti={showConfetti}
        onStartCampaign={selectCampaignOperation}
        onStartLevel={startLevel}
        onStartArcade={startArcade}
        onStartFreePlay={startFreePlay}
        onStartTutorial={startTutorial}
        gameResult={gameResult}
        tutorialStep={currentTutorialStep}
        onTutorialNext={() => handleTutorialStep('NEXT')}
        onTutorialSkipStep={() => handleTutorialStep('SKIP_STEP')}
      />
    </div>
    </>
  );
};

export default App;