export type Coord3 = [number, number, number];

export enum Face {
  U = 'U', // Up (White)
  D = 'D', // Down (Yellow)
  L = 'L', // Left (Orange)
  R = 'R', // Right (Red)
  F = 'F', // Front (Green)
  B = 'B', // Back (Blue)
}

export type Cubie = {
  id: number;
  position: Coord3; // Current logical position (x, y, z)
  rotation: Coord3; // Current visual rotation
  initialPosition: Coord3; // To track solved state
};

export enum GameMode {
  SPLASH = 'SPLASH',
  MENU = 'MENU',
  TUTORIAL = 'TUTORIAL',
  FREE_PLAY = 'FREE_PLAY',
  MATH_HUB = 'MATH_HUB',
  CAMPAIGN_SELECT = 'CAMPAIGN_SELECT',
  LEVEL_SELECT = 'LEVEL_SELECT',
  ARCADE_SELECT = 'ARCADE_SELECT',
  PLAYING = 'PLAYING',
  REPORT = 'REPORT',
  DAILY_CHALLENGE = 'DAILY_CHALLENGE',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  MISSIONS = 'MISSIONS'
}

export type MathOperation = 'ADD' | 'SUB' | 'MUL' | 'DIV';
export type ArcadeType = 'SCORE_ATTACK' | 'ENDLESS';

export type DifficultyTier = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type MissionType = 
  | 'speed'           // Solve quickly
  | 'accuracy'        // No mistakes
  | 'combo'           // Chain correct answers
  | 'streak'          // Maintain streak
  | 'master'          // Master specific operation
  | 'explorer'        // Try different modes
  | 'challenge'       // Complete specific challenges
  | 'daily';          // Daily challenge

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number; // Points
  completed: boolean;
  icon: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'master';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  difficulty: DifficultyTier;
  targetScore: number;
  timeLimit: number; // seconds
  operation?: MathOperation;
  bonusMultiplier: number;
  isDaily: boolean;
}

export interface DailyChallenge {
  date: string;
  challenge: Challenge;
  completed: boolean;
  highScore: number;
}

export type PowerUpType = 
  | 'time_freeze'    // Pause timer for 10 seconds
  | 'double_points'  // 2x points for next problem
  | 'skip_problem'   // Skip current problem
  | 'hint_free'      // Free hint
  | 'extra_life'     // Extra attempt in precision mode
  | 'combo_boost';   // 1.5x combo multiplier

export interface PowerUp {
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  cooldown: number; // seconds between uses
  maxUses: number;
  currentUses: number;
  active?: boolean;
  activeDuration?: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  mode: string;
  operation?: string;
  date: string;
  rank: number;
}

export interface GameConfig {
  mode: 'CAMPAIGN' | 'ARCADE' | 'FREE' | 'TUTORIAL' | 'DAILY' | 'MISSION';
  operation?: MathOperation | 'MIXED';
  arcadeType?: ArcadeType;
  selectedLevel?: number;
  missionId?: string;
}

export type MathTask = {
  id: number;
  question: string;
  type: 'move_count' | 'pattern' | 'logic';
  targetValue?: number | string;
  isComplete: boolean;
  hint?: string;
  requiredFace?: Face;
};

export type MoveHistoryItem = {
  face: Face;
  clockwise: boolean;
};

export interface GameResult {
  score: number;
  correctAnswers: number;
  totalQuestionsAttempted: number;
  maxCombo: number;
  timeTaken: number; // in seconds
  averageTimePerPuzzle: number;
  hintsUsed: number;
  tips: string[];
  rating: 1 | 2 | 3; // Stars
  title: string;
  mascotMood: 'happy' | 'excited' | 'confused' | 'proud' | 'neutral';
}

export interface TutorialStep {
  id: number;
  text: string;
  subText?: string;
  actionRequired?: 'ROTATE' | 'UNDO' | 'HINT' | 'NONE';
  targetFace?: Face;
}

// ==================== ENHANCED REWARDS & PLAYER SYSTEM ====================

export type RewardType = 'coins' | 'gems' | 'stars' | 'xp' | 'badge';

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  gems: number;
  totalStars: number;
  gamesPlayed: number;
  totalCorrectAnswers: number;
  totalProblemsAttempted: number;
  longestStreak: number;
  fastestSolve: number; // in seconds
  favoriteOperation?: MathOperation;
  createdAt: string;
  lastPlayedAt: string;
}

export interface Reward {
  id: string;
  type: RewardType;
  amount: number;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface DailyReward {
  day: number;
  reward: Reward;
  claimed: boolean;
}

export interface SeasonInfo {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  theme: string;
  rewards: Reward[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'streak' | 'mastery' | 'explorer' | 'special';
  requirement: number;
  xpReward: number;
  coinReward: number;
}

export interface GameStatistics {
  mode: string;
  operation?: string;
  totalGames: number;
  wins: number;
  losses: number;
  highScore: number;
  averageScore: number;
  averageTime: number;
  bestTime: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
}