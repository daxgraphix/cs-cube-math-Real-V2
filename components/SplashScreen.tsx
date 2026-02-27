import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

// --- Splash Screen Helpers ---
const FloatingShapes = () => {
    const shapes = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${12 + Math.random() * 15}s`,
        symbol: ['+', '-', '×', '÷', '=', '∑', 'π', '∞', 'Δ', '■', '●', '▲'][Math.floor(Math.random() * 12)],
        size: `${0.8 + Math.random() * 2.5}rem`,
        color: [
            'text-blue-300/30', 'text-green-300/30', 'text-yellow-300/30', 
            'text-purple-300/30', 'text-pink-300/30', 'text-cyan-300/30',
            'text-orange-300/30', 'text-red-300/30'
        ][Math.floor(Math.random() * 8)],
        opacity: 0.3 + Math.random() * 0.4
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {shapes.map(s => (
                <div 
                    key={s.id}
                    className={`floating-shape absolute font-black ${s.color}`}
                    style={{
                        left: s.left,
                        animationDelay: s.delay,
                        animationDuration: s.duration,
                        fontSize: s.size,
                        opacity: s.opacity
                    }}
                >
                    {s.symbol}
                </div>
            ))}
        </div>
    );
};

// Professional 3D Cube Component for Splash
const SplashCube3D = () => {
    const faceColors = [
        { name: 'front', color: '#ef4444', gradient: 'from-red-500 to-red-600' },
        { name: 'back', color: '#f97316', gradient: 'from-orange-500 to-orange-600' },
        { name: 'right', color: '#22c55e', gradient: 'from-green-500 to-green-600' },
        { name: 'left', color: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
        { name: 'top', color: '#ffffff', gradient: 'from-white to-gray-100' },
        { name: 'bottom', color: '#eab308', gradient: 'from-yellow-500 to-yellow-600' }
    ];

    const renderStickers = (faceIndex: number) => {
        return Array.from({ length: 9 }).map((_, i) => (
            <div
                key={i}
                className={`w-[30%] h-[30%] rounded-sm bg-gradient-to-br ${faceColors[faceIndex].gradient}`}
                style={{
                    margin: '3.33%',
                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.3)'
                }}
            />
        ));
    };

    const faceTransforms = [
        'translateZ(52px)',
        'rotateY(180deg) translateZ(52px)',
        'rotateY(90deg) translateZ(52px)',
        'rotateY(-90deg) translateZ(52px)',
        'rotateX(90deg) translateZ(52px)',
        'rotateX(-90deg) translateZ(52px)'
    ];

    return (
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 animate-float-3d" style={{ perspective: '1200px' }}>
            <div 
                className="w-full h-full animate-cube-rotate"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(-25deg) rotateY(-35deg)'
                }}
            >
                <div 
                    className="absolute inset-0 rounded-lg"
                    style={{
                        transform: 'translateZ(0px)',
                        background: '#0a0a0a',
                        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
                    }}
                />
                
                {faceColors.map((face, i) => (
                    <div
                        key={i}
                        className="absolute w-full h-full rounded-lg"
                        style={{
                            background: '#1a1a1a',
                            transform: faceTransforms[i],
                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                            border: '2px solid #333'
                        }}
                    >
                        <div className="w-full h-full p-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}>
                            {renderStickers(i)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="absolute -inset-12 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-24 h-4 bg-gradient-to-t from-black/30 to-transparent rounded-full blur-sm" />
        </div>
    );
};

const ParticleField = () => {
    const particles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 4,
        size: 2 + Math.random() * 4,
        tx: (Math.random() - 0.5) * 200,
        ty: -100 - Math.random() * 100
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute rounded-full particle"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        background: `hsl(${Math.random() * 60 + 30}, 100%, 70%)`
                    }}
                />
            ))}
        </div>
    );
};

interface SplashScreenProps {
    onFinish: () => void;
    theme: 'light' | 'dark';
}

// Phase messages for cinematic intro
const PHASE_MESSAGES = ['Initializing...', 'Loading Resources...', 'Preparing Game...', 'Ready!'];

export const SplashScreen = ({ onFinish, theme }: SplashScreenProps) => {
    const [phase, setPhase] = useState(1);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const phaseTimer1 = setTimeout(() => setPhase(2), 3500);
        const phaseTimer2 = setTimeout(() => setPhase(3), 7000);
        const phaseTimer3 = setTimeout(() => setPhase(4), 10000);
        const autoHideTimer = setTimeout(() => setShowSplash(false), 18000);
        
        return () => {
            clearTimeout(phaseTimer1);
            clearTimeout(phaseTimer2);
            clearTimeout(phaseTimer3);
            clearTimeout(autoHideTimer);
        };
    }, []);

    if (!showSplash) return null;

    return (
        <div 
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-black' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600'}`}
        >
            <FloatingShapes />
            <ParticleField />
            
            <div className="relative z-10 flex flex-col items-center">
                {/* Phase 1: Just loading indicator */}
                {phase >= 1 && (
                    <div className="transition-all duration-1000">
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                            <span>{PHASE_MESSAGES[0]}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{animationDelay: '0.1s'}} />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{animationDelay: '0.2s'}} />
                        </div>
                    </div>
                )}

                {/* Phase 2: Cube appears with spotlight */}
                {phase >= 2 && (
                    <div className="transition-all duration-1000 opacity-100 translate-y-0">
                        <div className="absolute -top-20 w-80 h-80 bg-white/20 blur-[80px] rounded-full animate-pulse"></div>
                        <div className="relative mb-8 mt-4">
                            <SplashCube3D />
                        </div>
                        <div className="text-white/50 text-xs mb-8">{PHASE_MESSAGES[1]}</div>
                    </div>
                )}

                {/* Phase 3: Title appears */}
                {phase >= 3 && (
                    <div className="transition-all duration-1000 opacity-100 translate-y-0">
                        <div className="mb-8 text-center px-4">
                            <h1 
                                className="text-7xl sm:text-9xl font-black tracking-tight"
                                style={{ 
                                    textShadow: '0 4px 30px rgba(255,255,255,0.3)',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 50%, #fcd34d 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                CS CUBE
                            </h1>
                            <div className="text-5xl sm:text-7xl font-black text-white tracking-[0.4em] mt-2">
                                MATH
                            </div>
                        </div>
                        <div className="text-white/50 text-xs mb-4">{PHASE_MESSAGES[2]}</div>
                    </div>
                )}

                {/* Phase 4: Full reveal with button */}
                {phase >= 4 && (
                    <div className="transition-all duration-1000 animate-scale-in">
                        <button 
                            onClick={onFinish}
                            className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-b from-green-400 to-green-600 text-white text-2xl sm:text-3xl font-black py-5 px-14 rounded-full shadow-[0_8px_0_#166534] active:shadow-none active:translate-y-2 transition-all transform hover:scale-105 hover:brightness-110 animate-button-glow"
                        >
                            <Play fill="currentColor" size={32} className="drop-shadow-sm" />
                            <span className="drop-shadow-sm tracking-wide">TAP TO START</span>
                        </button>
                        
                        <div className="mt-10 text-white/80 font-semibold text-base uppercase tracking-[0.2em] animate-pulse">
                            ✨ Challenge Your Mind ✨
                        </div>
                    </div>
                )}
                
                {/* Loading indicator at bottom */}
                <div className="absolute bottom-8 flex items-center gap-2 text-white/40 text-xs">
                    <span>{PHASE_MESSAGES[phase - 1]}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{animationDelay: '0.2s'}} />
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
