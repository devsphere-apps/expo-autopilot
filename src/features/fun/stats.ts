import * as vscode from 'vscode';
import { ImportStats } from './types';

export class StatsTracker {
  private static instance: StatsTracker;
  private context: vscode.ExtensionContext;
  private stats: ImportStats = {
    filesOrganized: 0,
    timesSaved: 0,
    linesReduced: 0,
    currentStreak: 0,
    longestStreak: 0
  };

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadStats();
  }

  static initialize(context: vscode.ExtensionContext) {
    if (!StatsTracker.instance) {
      StatsTracker.instance = new StatsTracker(context);
    }
    return StatsTracker.instance;
  }

  private loadStats() {
    const saved = this.context.globalState.get<ImportStats>('importStats');
    if (saved) {
      this.stats = saved;
    }
  }

  private saveStats() {
    this.context.globalState.update('importStats', this.stats);
  }

  updateStats(linesReduced: number) {
    const now = new Date();
    const lastOrganized = this.stats.lastOrganized ? new Date(this.stats.lastOrganized) : null;

    // Update streak
    if (lastOrganized) {
      const daysSinceLastOrganized = Math.floor(
        (now.getTime() - lastOrganized.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastOrganized <= 1) {
        this.stats.currentStreak++;
        this.stats.longestStreak = Math.max(this.stats.currentStreak, this.stats.longestStreak);
      } else {
        this.stats.currentStreak = 1;
      }
    } else {
      this.stats.currentStreak = 1;
    }

    // Update other stats
    this.stats.filesOrganized++;
    this.stats.linesReduced += linesReduced;
    this.stats.timesSaved += 2; // Assuming 2 minutes saved per organization
    this.stats.lastOrganized = now;

    this.saveStats();
    this.showFunMessage();
  }

  private showFunMessage() {
    const messages = [
      "🧙‍♂️ Your code is now cleaner than a wizard's spellbook!",
      "🚀 Houston, we have organization!",
      "🎯 Bullseye! These imports are perfectly aligned!",
      "🎨 You're like the Picasso of import organization!",
      "🦸 Another file saved from import chaos!"
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    vscode.window.showInformationMessage(
      `${randomMessage}\nYou've organized ${this.stats.filesOrganized} files and saved approximately ${this.stats.timesSaved} minutes!`
    );
  }

  getStats(): ImportStats {
    return {
      filesOrganized: this.stats.filesOrganized,
      linesReduced: this.stats.linesReduced,
      timesSaved: this.stats.timesSaved,
      currentStreak: this.stats.currentStreak,
      longestStreak: this.stats.longestStreak,
      lastOrganized: this.stats.lastOrganized
    };
  }
}

export function calculateLinesReduced(originalImports: string, organizedImports: string): number {
  // Count lines in original imports
  const originalLines = originalImports.split('\n').filter(line => line.trim().length > 0).length;
  
  // Count lines in organized imports
  const organizedLines = organizedImports.split('\n').filter(line => line.trim().length > 0).length;
  
  // Return the difference (if negative, it means we reduced lines)
  return Math.max(0, originalLines - organizedLines);
} 