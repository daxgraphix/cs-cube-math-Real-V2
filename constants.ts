import { Face, MathTask, Coord3, MathOperation, TutorialStep, Mission, Achievement, Challenge, DifficultyTier, PowerUp, LeaderboardEntry, Reward, DailyReward, SeasonInfo, Badge, PlayerProfile, GameStatistics } from './types';

export const CUBE_COLORS = {
  U: '#ffffff', // White
  D: '#ffd500', // Yellow
  R: '#b90000', // Red
  L: '#ff5900', // Orange
  F: '#009b48', // Green
  B: '#0045ad', // Blue
  CORE: '#2a2a2a' // Internal black plastic
};

export const FACE_LABELS = {
  U: 'Up',
  D: 'Down',
  L: 'Left',
  R: 'Right',
  F: 'Front',
  B: 'Back'
};

// Math operation symbols and educational info
export const OPERATION_INFO: Record<MathOperation | 'MIXED', { symbol: string; name: string; color: string; tip: string }> = {
  ADD: { symbol: '+', name: 'Addition', color: 'text-green-500', tip: 'Join numbers together!' },
  SUB: { symbol: '−', name: 'Subtraction', color: 'text-blue-500', tip: 'Take away from a number!' },
  MUL: { symbol: '×', name: 'Multiplication', color: 'text-purple-500', tip: 'Add groups together!' },
  DIV: { symbol: '÷', name: 'Division', color: 'text-orange-500', tip: 'Share into equal groups!' },
  MIXED: { symbol: '?', name: 'Mixed', color: 'text-yellow-500', tip: 'All operations!' }
};

export const LEVEL_OBJECTIVES: Record<number, { title: string; description: string; skills: string[] }> = {
  1: { title: 'Number Friends', description: 'Learn to add small numbers', skills: ['Counting', 'Basic addition'] },
  2: { title: 'Taking Away', description: 'Learn subtraction basics', skills: ['Counting back', 'Subtraction'] },
  3: { title: 'Double Trouble', description: 'Master doubling numbers', skills: ['Doubles', 'Near doubles'] },
  4: { title: 'Group Power', description: 'Introduction to multiplication', skills: ['Equal groups', 'Arrays'] },
  5: { title: 'Share Fair', description: 'Learn to divide equally', skills: ['Equal sharing', 'Division'] },
  6: { title: 'Math Detective', description: 'Mixed operations practice', skills: ['Problem solving', 'Logic'] },
  7: { title: 'Speed Star', description: 'Quick mental math', skills: ['Mental math', 'Speed'] },
  8: { title: 'Problem Solver', description: 'Complex word problems', skills: ['Critical thinking', 'Analysis'] },
  9: { title: 'Math Wizard', description: 'Advanced operations', skills: ['Multi-step problems', 'Strategy'] },
  10: { title: 'Master Cubist', description: 'Ultimate math challenge', skills: ['Expert level', 'Mastery'] }
};

export const INITIAL_POSITIONS: Coord3[] = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      INITIAL_POSITIONS.push([x, y, z]);
    }
  }
}

const getRandomFace = (): Face => {
  const faces = Object.values(Face);
  return faces[Math.floor(Math.random() * faces.length)] as Face;
};

const getColorName = (face: Face): string => {
  switch (face) {
    case Face.R: return "Red";
    case Face.L: return "Orange";
    case Face.U: return "White";
    case Face.D: return "Yellow";
    case Face.F: return "Green";
    case Face.B: return "Blue";
  }
};

// Real-world math problem contexts for educational value
export const MATH_CONTEXTS = {
  ADD: [
    "Apples in a basket: _ + _ = ?",
    "Books on shelves: _ + _ = ?",
    "Friends sharing stickers: _ + _ = ?",
    "Stars in the sky: _ + _ = ?",
    "Coins in a jar: _ + _ = ?"
  ],
  SUB: [
    "Candies eaten: _ - _ = ?",
    "Balloons popped: _ - _ = ?",
    "Pages read: _ - _ = ?",
    "Lemons used: _ - _ = ?",
    "Points scored: _ - _ = ?"
  ],
  MUL: [
    "Rows of desks: _ × _ = ?",
    "Packs of stickers: _ × _ = ?",
    "Groups of friends: _ × _ = ?",
    "Boxes of crayons: _ × _ = ?",
    "Array of tiles: _ × _ = ?"
  ],
  DIV: [
    "Cookies per friend: _ ÷ _ = ?",
    "Books per shelf: _ ÷ _ = ?",
    "Teams formed: _ ÷ _ = ?",
    "Pieces per pizza: _ ÷ _ = ?",
    "Candies each: _ ÷ _ = ?"
  ]
};

// Dynamic Difficulty Scaling with Educational Focus
export const generateMathTask = (id: number, operation: MathOperation | 'MIXED', level: number): MathTask => {
  let q = "";
  let target = 0;
  const face = getRandomFace();
  const color = getColorName(face);

  // Difficulty Tiers with Learning Objectives:
  // Level 1-3: Foundation (Single digit, positive results)
  // Level 4-6: Building (Larger numbers, intro to multiplication)
  // Level 7-8: Intermediate (Multi-step, mixed operations)
  // Level 9-10: Advanced (Complex problems, PEMDAS basics)

  const maxResult = level <= 3 ? 5 : (level <= 6 ? 9 : 12);
  const minResult = 1;
  
  let chosenOp = operation;
  if (chosenOp === 'MIXED') {
    const ops: MathOperation[] = level < 4 ? ['ADD', 'SUB'] : ['ADD', 'SUB', 'MUL', 'DIV'];
    chosenOp = ops[Math.floor(Math.random() * ops.length)];
  }

  // Get a random context for the problem
  const contexts = MATH_CONTEXTS[chosenOp] || MATH_CONTEXTS.ADD;
  const contextTemplate = contexts[Math.floor(Math.random() * contexts.length)];

  const makeExpression = () => {
    // Level 9-10: Advanced Mixed Operators (PEMDAS)
    if (level >= 9 && (operation === 'MIXED' || chosenOp === 'MUL')) {
        const a = Math.floor(Math.random() * 3) + 2;
        const b = Math.floor(Math.random() * 2) + 2;
        const product = a * b;
        const remainder = maxResult - product;
        
        if (remainder > 0) {
            const c = Math.floor(Math.random() * remainder) + 1;
            target = product + c;
            q = `(${a} × ${b}) + ${c}`;
        } else {
            const c = Math.floor(Math.random() * (product - 1)) + 1;
            target = product - c;
            q = `(${a} × ${b}) - ${c}`;
        }
        return;
    }

    // Level 7-8: 3-term expressions
    if (level >= 7 && (chosenOp === 'ADD' || chosenOp === 'SUB')) {
        const t = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
        const p1 = Math.floor(Math.random() * (t - 1)) + 1;
        const remainder = t - p1;
        const p2 = Math.floor(Math.random() * remainder);
        const p3 = remainder - p2;
        target = t;
        
        if (Math.random() > 0.5) {
             q = `${p1} + ${p2} + ${p3}`;
        } else {
             const c = Math.floor(Math.random() * 3) + 1;
             const sum = target + c;
             const a = Math.floor(Math.random() * sum);
             const b = sum - a;
             q = `(${a} + ${b}) - ${c}`;
        }
        return;
    }

    let num1 = 0, num2 = 0;
    switch (chosenOp) {
        case 'ADD':
          target = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
          num1 = Math.floor(Math.random() * target);
          num2 = target - num1;
          q = `${num1} + ${num2}`;
          break;
        case 'SUB':
          target = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
          num2 = Math.floor(Math.random() * (level <= 3 ? 3 : 8)) + 1;
          num1 = target + num2;
          q = `${num1} - ${num2}`;
          break;
        case 'MUL':
          const factors: [number, number][] = [];
          for(let i=1; i<=maxResult; i++) {
            for(let j=1; j<=maxResult; j++) {
               if (i*j <= maxResult && i*j >= minResult) factors.push([i,j]);
            }
          }
          const pair = factors[Math.floor(Math.random() * factors.length)] || [1, level];
          num1 = pair[0];
          num2 = pair[1];
          target = num1 * num2;
          q = `${num1} × ${num2}`;
          break;
        case 'DIV':
          target = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
          num2 = Math.floor(Math.random() * (level <= 5 ? 2 : 4)) + 2; 
          num1 = target * num2;
          q = `${num1} ÷ ${num2}`;
          break;
      }
  };

  makeExpression();

  // Educational hint with context
  const opInfo = OPERATION_INFO[chosenOp];
  return {
    id,
    question: `${contextTemplate.replace('_', q)}`,
    type: 'move_count',
    targetValue: target,
    requiredFace: face,
    isComplete: false,
    hint: `${opInfo.tip} Calculate ${q} = ${target}. Then rotate the ${color} face ${target} time${target > 1 ? 's' : ''}.`
  };
};

// Mission System
export const MISSIONS: Mission[] = [
  // Beginner Missions
  {
    id: 'first_solve',
    type: 'speed',
    title: 'First Steps',
    description: 'Solve your first 3 math problems',
    target: 3,
    progress: 0,
    reward: 50,
    completed: false,
    icon: '🌟',
    category: 'beginner'
  },
  {
    id: 'addition_master',
    type: 'master',
    title: 'Addition Master',
    description: 'Solve 10 addition problems correctly',
    target: 10,
    progress: 0,
    reward: 100,
    completed: false,
    icon: '➕',
    category: 'beginner'
  },
  {
    id: 'streak_starter',
    type: 'streak',
    title: 'On a Roll',
    description: 'Get a streak of 3 correct answers',
    target: 3,
    progress: 0,
    reward: 75,
    completed: false,
    icon: '🔥',
    category: 'beginner'
  },
  // Intermediate Missions
  {
    id: 'subtraction_pro',
    type: 'master',
    title: 'Subtraction Pro',
    description: 'Solve 15 subtraction problems correctly',
    target: 15,
    progress: 0,
    reward: 150,
    completed: false,
    icon: '➖',
    category: 'intermediate'
  },
  {
    id: 'combo_king',
    type: 'combo',
    title: 'Combo King',
    description: 'Achieve a combo of 5 in a single game',
    target: 5,
    progress: 0,
    reward: 200,
    completed: false,
    icon: '👑',
    category: 'intermediate'
  },
  {
    id: 'speed_demon',
    type: 'speed',
    title: 'Speed Demon',
    description: 'Solve 5 problems in under 30 seconds',
    target: 5,
    progress: 0,
    reward: 250,
    completed: false,
    icon: '⚡',
    category: 'intermediate'
  },
  // Advanced Missions
  {
    id: 'multiplication_wizard',
    type: 'master',
    title: 'Multiplication Wizard',
    description: 'Solve 20 multiplication problems correctly',
    target: 20,
    progress: 0,
    reward: 300,
    completed: false,
    icon: '✖️',
    category: 'advanced'
  },
  {
    id: 'division_expert',
    type: 'master',
    title: 'Division Expert',
    description: 'Solve 15 division problems correctly',
    target: 15,
    progress: 0,
    reward: 300,
    completed: false,
    icon: '➗',
    category: 'advanced'
  },
  {
    id: 'perfect_game',
    type: 'accuracy',
    title: 'Perfectionist',
    description: 'Complete a level with no hints used',
    target: 1,
    progress: 0,
    reward: 500,
    completed: false,
    icon: '💎',
    category: 'advanced'
  },
  // Master Missions
  {
    id: 'math_master',
    type: 'master',
    title: 'True Math Master',
    description: 'Complete 50 problems in any mode',
    target: 50,
    progress: 0,
    reward: 1000,
    completed: false,
    icon: '🏆',
    category: 'master'
  },
  {
    id: 'explorer',
    type: 'explorer',
    title: 'Explorer',
    description: 'Try all game modes at least once',
    target: 4,
    progress: 0,
    reward: 200,
    completed: false,
    icon: '🗺️',
    category: 'master'
  },
  {
    id: 'daily_warrior',
    type: 'daily',
    title: 'Daily Warrior',
    description: 'Complete 7 daily challenges',
    target: 7,
    progress: 0,
    reward: 750,
    completed: false,
    icon: '🗓️',
    category: 'master'
  }
];

// Achievement System
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_spin',
    title: 'First Spin',
    description: 'Make your first move',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'math_learner',
    title: 'Math Learner',
    description: 'Solve 10 problems',
    icon: '📚',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'streak_3',
    title: 'Heating Up',
    description: 'Get a 3-answer streak',
    icon: '🔥',
    unlocked: false
  },
  {
    id: 'streak_10',
    title: 'On Fire!',
    description: 'Get a 10-answer streak',
    icon: '💥',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'no_hint_hero',
    title: 'No Help Needed',
    description: 'Complete 5 levels without hints',
    icon: '🦸',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'speedster',
    title: 'Speedster',
    description: 'Solve 3 problems in under 10 seconds each',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'addition_master',
    title: 'Addition Master',
    description: 'Complete all addition levels',
    icon: '➕',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'subtraction_master',
    title: 'Subtraction Master',
    description: 'Complete all subtraction levels',
    icon: '➖',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'multiplication_master',
    title: 'Multiplication Master',
    description: 'Complete all multiplication levels',
    icon: '✖️',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'division_master',
    title: 'Division Master',
    description: 'Complete all division levels',
    icon: '➗',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Score 100 points in arcade',
    icon: '💯',
    unlocked: false
  },
  {
    id: 'cube_champion',
    title: 'Cube Champion',
    description: 'Complete the game',
    icon: '🏆',
    unlocked: false
  }
];

// Challenge System
export const CHALLENGES: Challenge[] = [
  {
    id: 'speed_run',
    name: 'Speed Run',
    description: 'Solve as many as you can in 60 seconds!',
    difficulty: 'EASY',
    targetScore: 10,
    timeLimit: 60,
    bonusMultiplier: 1.5,
    isDaily: false
  },
  {
    id: 'precision',
    name: 'Precision Mode',
    description: 'No mistakes allowed! 3 lives.',
    difficulty: 'MEDIUM',
    targetScore: 8,
    timeLimit: 90,
    bonusMultiplier: 2.0,
    isDaily: false
  },
  {
    id: 'addition_only',
    name: 'Addition Only',
    description: 'Focus on addition - no errors allowed!',
    difficulty: 'EASY',
    targetScore: 12,
    timeLimit: 60,
    operation: 'ADD',
    bonusMultiplier: 1.5,
    isDaily: false
  },
  {
    id: 'multiplication_blitz',
    name: 'Multiplication Blitz',
    description: 'Fast-paced multiplication challenges!',
    difficulty: 'HARD',
    targetScore: 15,
    timeLimit: 60,
    operation: 'MUL',
    bonusMultiplier: 2.5,
    isDaily: false
  },
  {
    id: 'ultimate_test',
    name: 'Ultimate Test',
    description: 'All operations, maximum difficulty!',
    difficulty: 'EXPERT',
    targetScore: 20,
    timeLimit: 120,
    bonusMultiplier: 3.0,
    isDaily: false
  },
  {
    id: 'daily_warmup',
    name: 'Daily Warmup',
    description: 'Start your day with math!',
    difficulty: 'EASY',
    targetScore: 8,
    timeLimit: 60,
    bonusMultiplier: 1.0,
    isDaily: true
  },
  {
    id: 'daily_power',
    name: 'Power Practice',
    description: 'Intermediate daily challenge',
    difficulty: 'MEDIUM',
    targetScore: 12,
    timeLimit: 90,
    bonusMultiplier: 1.5,
    isDaily: true
  },
  {
    id: 'daily_master',
    name: 'Master Challenge',
    description: 'Advanced daily brain workout',
    difficulty: 'HARD',
    targetScore: 15,
    timeLimit: 120,
    bonusMultiplier: 2.0,
    isDaily: true
  }
];

// Power-Ups System
export const POWER_UPS: PowerUp[] = [
  {
    type: 'time_freeze',
    name: 'Time Freeze',
    description: 'Pause the timer for 10 seconds!',
    icon: '❄️',
    cooldown: 30,
    maxUses: 2,
    currentUses: 2
  },
  {
    type: 'double_points',
    name: '2X Points',
    description: 'Double your score for the next problem!',
    icon: '⚡',
    cooldown: 20,
    maxUses: 3,
    currentUses: 3
  },
  {
    type: 'skip_problem',
    name: 'Skip',
    description: 'Skip the current problem with no penalty!',
    icon: '⏭️',
    cooldown: 15,
    maxUses: 2,
    currentUses: 2
  },
  {
    type: 'hint_free',
    name: 'Free Hint',
    description: 'Use a hint without any score penalty!',
    icon: '💡',
    cooldown: 10,
    maxUses: 3,
    currentUses: 3
  },
  {
    type: 'combo_boost',
    name: 'Combo Boost',
    description: '1.5x combo multiplier for 30 seconds!',
    icon: '🔥',
    cooldown: 45,
    maxUses: 2,
    currentUses: 2
  }
];

// Local Leaderboard
export const getLocalLeaderboard = (): LeaderboardEntry[] => {
  try {
    const stored = localStorage.getItem('cs-cube-leaderboard');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveScoreToLeaderboard = (entry: Omit<LeaderboardEntry, 'id' | 'rank'>) => {
  const leaderboard = getLocalLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: Date.now().toString(),
    rank: 0
  };
  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard.forEach((entry, index) => entry.rank = index + 1);
  const top10 = leaderboard.slice(0, 10);
  localStorage.setItem('cs-cube-leaderboard', JSON.stringify(top10));
  return top10;
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  { 
    id: 1, 
    text: "Hi! I'm Cuby!", 
    subText: "I'm a magic cube who loves math and spinning! Let's learn together!",
    actionRequired: 'NONE' 
  },
  { 
    id: 2, 
    text: "Let's Dance!", 
    subText: "Drag my faces to rotate them. Try spinning the RED face.", 
    actionRequired: 'ROTATE', 
    targetFace: Face.R 
  },
  { 
    id: 3, 
    text: "Whoa, dizzy!", 
    subText: "I'm getting mixed up! Let's go back in time. Click UNDO.", 
    actionRequired: 'UNDO' 
  },
  { 
    id: 4, 
    text: "Math Time!", 
    subText: "Here's a fun problem: 1 + 1 = ? That's 2! Rotate the GREEN face 2 times.", 
    actionRequired: 'ROTATE', 
    targetFace: Face.F 
  },
  { 
    id: 5, 
    text: "Need Help?", 
    subText: "If you forget the math, I can help! Click the HINT button.", 
    actionRequired: 'HINT' 
  },
  { 
    id: 6, 
    text: "One More!", 
    subText: "What is 5 - 2? That's 3! Rotate the BLUE face 3 times.", 
    actionRequired: 'ROTATE', 
    targetFace: Face.B 
  },
  { 
    id: 7, 
    text: "You're a Star!", 
    subText: "You are ready for the Math Campaign. Let's go on an adventure!", 
    actionRequired: 'NONE' 
  }
];

// ==================== COMPREHENSIVE REWARDS SYSTEM ====================

// XP Required per level (exponential growth)
export const XP_PER_LEVEL = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Level Titles
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice Solver',
  5: 'Apprentice',
  10: 'Math Cadet',
  15: 'Number Knight',
  20: 'Arithmetic Ace',
  25: 'Calculation Captain',
  30: 'Math Warrior',
  35: 'Number Ninja',
  40: 'Master Mind',
  45: 'Math Champion',
  50: 'Cube Conqueror',
  60: 'Legendary',
  70: 'Grandmaster',
  80: 'Ultimate',
  90: 'Mythic',
  100: 'Immortal'
};

// Get level title based on level
export const getLevelTitle = (level: number): string => {
  const titles = Object.entries(LEVEL_TITLES).sort((a, b) => Number(b[0]) - Number(a[0]));
  for (const [minLevel, title] of titles) {
    if (level >= Number(minLevel)) return title;
  }
  return 'Novice Solver';
};

// Daily Rewards for 7-day streak
export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, reward: { id: 'daily_1', type: 'coins', amount: 50, description: 'Day 1 Reward', icon: '🪙', rarity: 'common' }, claimed: false },
  { day: 2, reward: { id: 'daily_2', type: 'coins', amount: 75, description: 'Day 2 Reward', icon: '🪙', rarity: 'common' }, claimed: false },
  { day: 3, reward: { id: 'daily_3', type: 'gems', amount: 5, description: 'Day 3 Reward', icon: '💎', rarity: 'rare' }, claimed: false },
  { day: 4, reward: { id: 'daily_4', type: 'coins', amount: 100, description: 'Day 4 Reward', icon: '🪙', rarity: 'common' }, claimed: false },
  { day: 5, reward: { id: 'daily_5', type: 'coins', amount: 150, description: 'Day 5 Reward', icon: '🪙', rarity: 'rare' }, claimed: false },
  { day: 6, reward: { id: 'daily_6', type: 'gems', amount: 10, description: 'Day 6 Reward', icon: '💎', rarity: 'epic' }, claimed: false },
  { day: 7, reward: { id: 'daily_7', type: 'stars', amount: 1, description: 'Weekly Reward', icon: '⭐', rarity: 'legendary' }, claimed: false },
];

// Season Information
export const CURRENT_SEASON: SeasonInfo = {
  id: 'season_1',
  name: 'Math Master Season',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  theme: 'spring',
  rewards: [
    { id: 'season_bronze', type: 'badge', amount: 1, description: 'Bronze Season Badge', icon: '🥉', rarity: 'rare' },
    { id: 'season_silver', type: 'badge', amount: 1, description: 'Silver Season Badge', icon: '🥈', rarity: 'epic' },
    { id: 'season_gold', type: 'badge', amount: 1, description: 'Gold Season Badge', icon: '🥇', rarity: 'legendary' },
  ]
};

// Badges System
export const BADGES: Badge[] = [
  // Speed Badges
  { id: 'speed_bronze', name: 'Swift Starter', description: 'Solve 10 problems in under 5 seconds each', icon: '⚡', category: 'speed', requirement: 10, xpReward: 100, coinReward: 50 },
  { id: 'speed_silver', name: 'Lightning Fast', description: 'Solve 25 problems in under 5 seconds each', icon: '⚡⚡', category: 'speed', requirement: 25, xpReward: 250, coinReward: 100 },
  { id: 'speed_gold', name: 'Speed Demon', description: 'Solve 50 problems in under 5 seconds each', icon: '⚡⚡⚡', category: 'speed', requirement: 50, xpReward: 500, coinReward: 250 },
  
  // Accuracy Badges
  { id: 'accuracy_bronze', name: 'Sharp Eye', description: 'Complete 5 games with 100% accuracy', icon: '🎯', category: 'accuracy', requirement: 5, xpReward: 100, coinReward: 50 },
  { id: 'accuracy_silver', name: 'Perfect Mind', description: 'Complete 15 games with 100% accuracy', icon: '🎯🎯', category: 'accuracy', requirement: 15, xpReward: 300, coinReward: 150 },
  { id: 'accuracy_gold', name: 'Flawless', description: 'Complete 30 games with 100% accuracy', icon: '🎯🎯🎯', category: 'accuracy', requirement: 30, xpReward: 600, coinReward: 300 },
  
  // Streak Badges
  { id: 'streak_bronze', name: 'On Fire', description: 'Get a 5-answer streak', icon: '🔥', category: 'streak', requirement: 5, xpReward: 75, coinReward: 25 },
  { id: 'streak_silver', name: 'Blazing', description: 'Get a 10-answer streak', icon: '🔥🔥', category: 'streak', requirement: 10, xpReward: 150, coinReward: 75 },
  { id: 'streak_gold', name: 'Inferno', description: 'Get a 25-answer streak', icon: '🔥🔥🔥', category: 'streak', requirement: 25, xpReward: 400, coinReward: 200 },
  
  // Mastery Badges
  { id: 'master_add', name: 'Addition Master', description: 'Complete all addition levels', icon: '➕', category: 'mastery', requirement: 10, xpReward: 200, coinReward: 100 },
  { id: 'master_sub', name: 'Subtraction Master', description: 'Complete all subtraction levels', icon: '➖', category: 'mastery', requirement: 10, xpReward: 200, coinReward: 100 },
  { id: 'master_mul', name: 'Multiplication Master', description: 'Complete all multiplication levels', icon: '✖️', category: 'mastery', requirement: 10, xpReward: 250, coinReward: 125 },
  { id: 'master_div', name: 'Division Master', description: 'Complete all division levels', icon: '➗', category: 'mastery', requirement: 10, xpReward: 250, coinReward: 125 },
  
  // Explorer Badges
  { id: 'explorer_casual', name: 'Casual Player', description: 'Play all game modes', icon: '🗺️', category: 'explorer', requirement: 5, xpReward: 150, coinReward: 50 },
  { id: 'explorer_hardcore', name: 'Game Explorer', description: 'Play 100 games total', icon: '🧭', category: 'explorer', requirement: 100, xpReward: 500, coinReward: 250 },
  
  // Special Badges
  { id: 'special_early', name: 'Early Bird', description: 'Play 10 games before 8 AM', icon: '🌅', category: 'special', requirement: 10, xpReward: 200, coinReward: 100 },
  { id: 'special_night', name: 'Night Owl', description: 'Play 10 games after 10 PM', icon: '🦉', category: 'special', requirement: 10, xpReward: 200, coinReward: 100 },
  { id: 'special_weekend', name: 'Weekend Warrior', description: 'Play 20 games on weekends', icon: '🎮', category: 'special', requirement: 20, xpReward: 300, coinReward: 150 },
];

// Enhanced Achievement System with Ranks
export const ENHANCED_ACHIEVEMENTS: Achievement[] = [
  // Tutorial Achievements
  {
    id: 'first_spin',
    title: 'First Spin',
    description: 'Make your first move',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'tutorial_complete',
    title: 'Ready to Learn',
    description: 'Complete the tutorial',
    icon: '📖',
    unlocked: false
  },
  
  // Progress Achievements
  {
    id: 'math_learner',
    title: 'Math Learner',
    description: 'Solve 10 problems',
    icon: '📚',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'math_student',
    title: 'Math Student',
    description: 'Solve 50 problems',
    icon: '📝',
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 'math_scholar',
    title: 'Math Scholar',
    description: 'Solve 100 problems',
    icon: '🎓',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'math_expert',
    title: 'Math Expert',
    description: 'Solve 500 problems',
    icon: '🧠',
    unlocked: false,
    progress: 0,
    maxProgress: 500
  },
  {
    id: 'math_legend',
    title: 'Math Legend',
    description: 'Solve 1000 problems',
    icon: '👑',
    unlocked: false,
    progress: 0,
    maxProgress: 1000
  },
  
  // Streak Achievements
  {
    id: 'streak_3',
    title: 'Heating Up',
    description: 'Get a 3-answer streak',
    icon: '🔥',
    unlocked: false
  },
  {
    id: 'streak_5',
    title: 'On Fire!',
    description: 'Get a 5-answer streak',
    icon: '🔥🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'streak_10',
    title: 'Unstoppable',
    description: 'Get a 10-answer streak',
    icon: '💥',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'streak_25',
    title: 'Legendary Streak',
    description: 'Get a 25-answer streak',
    icon: '⭐',
    unlocked: false,
    progress: 0,
    maxProgress: 25
  },
  {
    id: 'streak_50',
    title: 'Impossible!',
    description: 'Get a 50-answer streak',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  
  // Speed Achievements
  {
    id: 'speedster',
    title: 'Speedster',
    description: 'Solve 3 problems in under 10 seconds each',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'quick_thinker',
    title: 'Quick Thinker',
    description: 'Solve 10 problems in under 8 seconds each',
    icon: '💨',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'lightning',
    title: 'Lightning Fast',
    description: 'Solve 25 problems in under 5 seconds each',
    icon: '🌩️',
    unlocked: false,
    progress: 0,
    maxProgress: 25
  },
  
  // No Hint Achievements
  {
    id: 'no_hint_hero',
    title: 'No Help Needed',
    description: 'Complete 5 levels without hints',
    icon: '🦸',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'independent',
    title: 'Independent Mind',
    description: 'Complete 25 levels without hints',
    icon: '🧠',
    unlocked: false,
    progress: 0,
    maxProgress: 25
  },
  {
    id: 'self_sufficient',
    title: 'Self Sufficient',
    description: 'Complete 50 levels without hints',
    icon: '🌟',
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  
  // Operation Mastery
  {
    id: 'addition_master',
    title: 'Addition Master',
    description: 'Complete all addition levels',
    icon: '➕',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'subtraction_master',
    title: 'Subtraction Master',
    description: 'Complete all subtraction levels',
    icon: '➖',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'multiplication_master',
    title: 'Multiplication Master',
    description: 'Complete all multiplication levels',
    icon: '✖️',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'division_master',
    title: 'Division Master',
    description: 'Complete all division levels',
    icon: '➗',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'arithmetic_grandmaster',
    title: 'Arithmetic Grandmaster',
    description: 'Complete all levels in all operations',
    icon: '🏆',
    unlocked: false
  },
  
  // Score Achievements
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Score 100 points in arcade',
    icon: '💯',
    unlocked: false
  },
  {
    id: 'high_scorer',
    title: 'High Scorer',
    description: 'Score 500 points in arcade',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    maxProgress: 500
  },
  {
    id: 'score_master',
    title: 'Score Master',
    description: 'Score 1000 points in arcade',
    icon: '👑',
    unlocked: false,
    progress: 0,
    maxProgress: 1000
  },
  
  // Game Completion
  {
    id: 'cube_champion',
    title: 'Cube Champion',
    description: 'Complete the game',
    icon: '🏆',
    unlocked: false
  },
  {
    id: 'dedicated',
    title: 'Dedicated Player',
    description: 'Play 100 games',
    icon: '🎮',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'devoted',
    title: 'Devoted Player',
    description: 'Play 500 games',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    maxProgress: 500
  },
  {
    id: 'addicted',
    title: 'Addicted Player',
    description: 'Play 1000 games',
    icon: '💎',
    unlocked: false,
    progress: 0,
    maxProgress: 1000
  },
  
  // Special Achievements
  {
    id: 'daily_player',
    title: 'Daily Player',
    description: 'Complete 7 daily challenges',
    icon: '📅',
    unlocked: false,
    progress: 0,
    maxProgress: 7
  },
  {
    id: 'weekly_warrior',
    title: 'Weekly Warrior',
    description: 'Complete 30 daily challenges',
    icon: '🗓️',
    unlocked: false,
    progress: 0,
    maxProgress: 30
  },
  {
    id: 'daily_devotee',
    title: 'Daily Devotee',
    description: 'Complete 100 daily challenges',
    icon: '⭐',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  }
];

// Enhanced Mission System with more variety
export const ENHANCED_MISSIONS: Mission[] = [
  // Quick Daily Missions (resets daily)
  {
    id: 'daily_quick_3',
    type: 'speed',
    title: 'Quick Solve',
    description: 'Solve 3 problems in under 5 seconds each',
    target: 3,
    progress: 0,
    reward: 25,
    completed: false,
    icon: '⚡',
    category: 'beginner'
  },
  {
    id: 'daily_perfect',
    type: 'accuracy',
    title: 'Perfect Day',
    description: 'Complete a game with no mistakes',
    target: 1,
    progress: 0,
    reward: 50,
    completed: false,
    icon: '💯',
    category: 'beginner'
  },
  {
    id: 'daily_streak_5',
    type: 'streak',
    title: 'On Fire',
    description: 'Get a 5-answer streak',
    target: 5,
    progress: 0,
    reward: 40,
    completed: false,
    icon: '🔥',
    category: 'beginner'
  },
  
  // Beginner Missions
  {
    id: 'first_solve',
    type: 'speed',
    title: 'First Steps',
    description: 'Solve your first 3 math problems',
    target: 3,
    progress: 0,
    reward: 50,
    completed: false,
    icon: '🌟',
    category: 'beginner'
  },
  {
    id: 'addition_master',
    type: 'master',
    title: 'Addition Master',
    description: 'Solve 10 addition problems correctly',
    target: 10,
    progress: 0,
    reward: 100,
    completed: false,
    icon: '➕',
    category: 'beginner'
  },
  {
    id: 'streak_starter',
    type: 'streak',
    title: 'On a Roll',
    description: 'Get a streak of 3 correct answers',
    target: 3,
    progress: 0,
    reward: 75,
    completed: false,
    icon: '🔥',
    category: 'beginner'
  },
  
  // Intermediate Missions
  {
    id: 'subtraction_pro',
    type: 'master',
    title: 'Subtraction Pro',
    description: 'Solve 15 subtraction problems correctly',
    target: 15,
    progress: 0,
    reward: 150,
    completed: false,
    icon: '➖',
    category: 'intermediate'
  },
  {
    id: 'combo_king',
    type: 'combo',
    title: 'Combo King',
    description: 'Achieve a combo of 5 in a single game',
    target: 5,
    progress: 0,
    reward: 200,
    completed: false,
    icon: '👑',
    category: 'intermediate'
  },
  {
    id: 'speed_demon',
    type: 'speed',
    title: 'Speed Demon',
    description: 'Solve 5 problems in under 30 seconds total',
    target: 5,
    progress: 0,
    reward: 250,
    completed: false,
    icon: '⚡',
    category: 'intermediate'
  },
  {
    id: 'arcade_star',
    type: 'challenge',
    title: 'Arcade Star',
    description: 'Score 50 points in arcade mode',
    target: 50,
    progress: 0,
    reward: 200,
    completed: false,
    icon: '🎮',
    category: 'intermediate'
  },
  
  // Advanced Missions
  {
    id: 'multiplication_wizard',
    type: 'master',
    title: 'Multiplication Wizard',
    description: 'Solve 20 multiplication problems correctly',
    target: 20,
    progress: 0,
    reward: 300,
    completed: false,
    icon: '✖️',
    category: 'advanced'
  },
  {
    id: 'division_expert',
    type: 'master',
    title: 'Division Expert',
    description: 'Solve 15 division problems correctly',
    target: 15,
    progress: 0,
    reward: 300,
    completed: false,
    icon: '➗',
    category: 'advanced'
  },
  {
    id: 'perfect_game',
    type: 'accuracy',
    title: 'Perfectionist',
    description: 'Complete a level with no hints used',
    target: 1,
    progress: 0,
    reward: 500,
    completed: false,
    icon: '💎',
    category: 'advanced'
  },
  {
    id: 'high_scorer',
    type: 'challenge',
    title: 'High Scorer',
    description: 'Score 100 points in a single game',
    target: 100,
    progress: 0,
    reward: 400,
    completed: false,
    icon: '🎯',
    category: 'advanced'
  },
  
  // Master Missions
  {
    id: 'math_master',
    type: 'master',
    title: 'True Math Master',
    description: 'Complete 50 problems in any mode',
    target: 50,
    progress: 0,
    reward: 1000,
    completed: false,
    icon: '🏆',
    category: 'master'
  },
  {
    id: 'explorer',
    type: 'explorer',
    title: 'Explorer',
    description: 'Try all game modes at least once',
    target: 4,
    progress: 0,
    reward: 200,
    completed: false,
    icon: '🗺️',
    category: 'master'
  },
  {
    id: 'daily_warrior',
    type: 'daily',
    title: 'Daily Warrior',
    description: 'Complete 7 daily challenges',
    target: 7,
    progress: 0,
    reward: 750,
    completed: false,
    icon: '🗓️',
    category: 'master'
  },
  {
    id: 'streak_legend',
    type: 'streak',
    title: 'Streak Legend',
    description: 'Achieve a 25-answer streak',
    target: 25,
    progress: 0,
    reward: 1000,
    completed: false,
    icon: '⭐',
    category: 'master'
  }
];

// Enhanced Challenge System
export const ENHANCED_CHALLENGES: Challenge[] = [
  // Easy Challenges
  {
    id: 'speed_run',
    name: 'Speed Run',
    description: 'Solve as many as you can in 60 seconds!',
    difficulty: 'EASY',
    targetScore: 10,
    timeLimit: 60,
    bonusMultiplier: 1.5,
    isDaily: false
  },
  {
    id: 'addition_only',
    name: 'Addition Only',
    description: 'Focus on addition - no errors allowed!',
    difficulty: 'EASY',
    targetScore: 12,
    timeLimit: 60,
    operation: 'ADD',
    bonusMultiplier: 1.5,
    isDaily: false
  },
  {
    id: 'daily_warmup',
    name: 'Daily Warmup',
    description: 'Start your day with math!',
    difficulty: 'EASY',
    targetScore: 8,
    timeLimit: 60,
    bonusMultiplier: 1.0,
    isDaily: true
  },
  
  // Medium Challenges
  {
    id: 'precision',
    name: 'Precision Mode',
    description: 'No mistakes allowed! 3 lives.',
    difficulty: 'MEDIUM',
    targetScore: 8,
    timeLimit: 90,
    bonusMultiplier: 2.0,
    isDaily: false
  },
  {
    id: 'daily_power',
    name: 'Power Practice',
    description: 'Intermediate daily challenge',
    difficulty: 'MEDIUM',
    targetScore: 12,
    timeLimit: 90,
    bonusMultiplier: 1.5,
    isDaily: true
  },
  {
    id: 'subtraction_sprint',
    name: 'Subtraction Sprint',
    description: 'Fast-paced subtraction challenges!',
    difficulty: 'MEDIUM',
    targetScore: 15,
    timeLimit: 60,
    operation: 'SUB',
    bonusMultiplier: 2.0,
    isDaily: false
  },
  
  // Hard Challenges
  {
    id: 'multiplication_blitz',
    name: 'Multiplication Blitz',
    description: 'Fast-paced multiplication challenges!',
    difficulty: 'HARD',
    targetScore: 15,
    timeLimit: 60,
    operation: 'MUL',
    bonusMultiplier: 2.5,
    isDaily: false
  },
  {
    id: 'daily_master',
    name: 'Master Challenge',
    description: 'Advanced daily brain workout',
    difficulty: 'HARD',
    targetScore: 15,
    timeLimit: 120,
    bonusMultiplier: 2.0,
    isDaily: true
  },
  {
    id: 'math_marathon',
    name: 'Math Marathon',
    description: 'Endless mode - how far can you go?',
    difficulty: 'HARD',
    targetScore: 30,
    timeLimit: 180,
    bonusMultiplier: 2.5,
    isDaily: false
  },
  
  // Expert Challenges
  {
    id: 'ultimate_test',
    name: 'Ultimate Test',
    description: 'All operations, maximum difficulty!',
    difficulty: 'EXPERT',
    targetScore: 20,
    timeLimit: 120,
    bonusMultiplier: 3.0,
    isDaily: false
  },
  {
    id: 'division_crusher',
    name: 'Division Crusher',
    description: 'Master division under pressure!',
    difficulty: 'EXPERT',
    targetScore: 12,
    timeLimit: 45,
    operation: 'DIV',
    bonusMultiplier: 3.0,
    isDaily: false
  },
  {
    id: 'mixed_master',
    name: 'Mixed Operations Master',
    description: 'All four operations in one challenge!',
    difficulty: 'EXPERT',
    targetScore: 25,
    timeLimit: 120,
    bonusMultiplier: 3.5,
    isDaily: false
  }
];

// Player Profile helpers
export const createDefaultProfile = (): PlayerProfile => ({
  id: Date.now().toString(),
  username: 'Player',
  avatar: '😊',
  level: 1,
  xp: 0,
  xpToNextLevel: XP_PER_LEVEL(1),
  coins: 0,
  gems: 0,
  totalStars: 0,
  gamesPlayed: 0,
  totalCorrectAnswers: 0,
  totalProblemsAttempted: 0,
  longestStreak: 0,
  fastestSolve: 999,
  createdAt: new Date().toISOString(),
  lastPlayedAt: new Date().toISOString()
});

// Save/Load player profile
export const savePlayerProfile = (profile: PlayerProfile): void => {
  localStorage.setItem('cs-cube-profile', JSON.stringify(profile));
};

export const loadPlayerProfile = (): PlayerProfile => {
  try {
    const stored = localStorage.getItem('cs-cube-profile');
    return stored ? JSON.parse(stored) : createDefaultProfile();
  } catch {
    return createDefaultProfile();
  }
};

// Calculate XP reward based on performance
export const calculateXpReward = (
  correctAnswers: number,
  streak: number,
  timeBonus: number,
  difficulty: DifficultyTier
): number => {
  const baseXp = correctAnswers * 10;
  const streakBonus = Math.floor(streak * 2);
  const difficultyMultiplier = {
    'EASY': 1,
    'MEDIUM': 1.5,
    'HARD': 2,
    'EXPERT': 3
  }[difficulty];
  
  return Math.floor((baseXp + streakBonus + timeBonus) * difficultyMultiplier);
};

// Calculate coin reward
export const calculateCoinReward = (
  score: number,
  streak: number,
  difficulty: DifficultyTier
): number => {
  const baseCoins = Math.floor(score / 10);
  const streakBonus = Math.floor(streak * 5);
  const difficultyBonus = {
    'EASY': 1,
    'MEDIUM': 1.5,
    'HARD': 2,
    'EXPERT': 3
  }[difficulty];
  
  return Math.floor((baseCoins + streakBonus) * difficultyBonus);
};