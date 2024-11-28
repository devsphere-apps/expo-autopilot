export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
}

export interface ImportStats {
  filesOrganized: number;
  timesSaved: number;
  linesReduced: number;
  currentStreak: number;
  longestStreak: number;
  lastOrganized?: Date;
} 