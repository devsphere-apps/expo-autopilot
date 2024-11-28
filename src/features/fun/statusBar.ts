import * as vscode from 'vscode';
import { ImportStats } from './types';

export class ImportStatusBar {
  private static statusBarItem: vscode.StatusBarItem;

  static initialize() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.updateStatus({ filesOrganized: 0 } as ImportStats);
    this.statusBarItem.command = 'extension.showImportStats';
    this.statusBarItem.show();
  }

  static updateStatus(stats: ImportStats) {
    const levels = [
      { threshold: 0, emoji: '🥉', title: 'Rookie' },
      { threshold: 25, emoji: '🥈', title: 'Pro' },
      { threshold: 50, emoji: '🥇', title: 'Expert' },
      { threshold: 100, emoji: '👑', title: 'Master' }
    ];

    const level = levels.reduce((acc, curr) => 
      stats.filesOrganized >= curr.threshold ? curr : acc
    );

    this.statusBarItem.text = `$(star) ${level.emoji} Import ${level.title}`;
    this.statusBarItem.tooltip = `Files Organized: ${stats.filesOrganized}\nCurrent Streak: ${stats.currentStreak} days`;
  }
} 