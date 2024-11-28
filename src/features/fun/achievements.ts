import * as vscode from 'vscode';
import { Achievement, ImportStats } from './types';

export class AchievementSystem {
  private static instance: AchievementSystem;
  private context: vscode.ExtensionContext;
  private achievements: Achievement[] = [
    {
      id: 'first_clean',
      title: '🧹 Clean Freak',
      description: 'First time organizing imports!',
      icon: '✨',
      earned: false
    },
    {
      id: 'import_master',
      title: '🎓 Import Sensei',
      description: 'Organized 100 files!',
      icon: '🥷',
      earned: false
    },
    {
      id: 'speed_demon',
      title: '⚡ Speed Demon',
      description: 'Organized 10 files in under a minute!',
      icon: '🏃',
      earned: false
    },
    // Add more achievements as needed
  ];

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadAchievements();
  }

  static initialize(context: vscode.ExtensionContext) {
    if (!AchievementSystem.instance) {
      AchievementSystem.instance = new AchievementSystem(context);
    }
    return AchievementSystem.instance;
  }

  private loadAchievements() {
    const saved = this.context.globalState.get<Achievement[]>('achievements');
    if (saved) {
      this.achievements = saved;
    }
  }

  private saveAchievements() {
    this.context.globalState.update('achievements', this.achievements);
  }

  async checkAchievements(stats: ImportStats) {
    const newAchievements: Achievement[] = [];

    this.achievements.forEach(achievement => {
      if (!achievement.earned) {
        switch (achievement.id) {
          case 'first_clean':
            if (stats.filesOrganized === 1) {
              achievement.earned = true;
              achievement.earnedDate = new Date();
              newAchievements.push(achievement);
            }
            break;
          case 'import_master':
            if (stats.filesOrganized >= 100) {
              achievement.earned = true;
              achievement.earnedDate = new Date();
              newAchievements.push(achievement);
            }
            break;
          // Add more achievement checks
        }
      }
    });

    this.saveAchievements();

    // Show notifications for new achievements
    newAchievements.forEach(achievement => {
      this.showAchievementNotification(achievement);
    });
  }

  private showAchievementNotification(achievement: Achievement) {
    vscode.window.showInformationMessage(
      `🎉 Achievement Unlocked: ${achievement.title}\n${achievement.description}`,
      'View All Achievements'
    ).then(selection => {
      if (selection === 'View All Achievements') {
        this.showAchievementsPanel();
      }
    });
  }

  private showAchievementsPanel() {
    // Create and show WebView panel with all achievements
    const panel = vscode.window.createWebviewPanel(
      'importAchievements',
      'Import Master Achievements',
      vscode.ViewColumn.One,
      {}
    );

    panel.webview.html = this.getAchievementsHtml();
  }

  private getAchievementsHtml() {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { padding: 20px; }
            .achievement {
              padding: 10px;
              margin: 10px 0;
              border-radius: 5px;
              background: var(--vscode-editor-background);
            }
            .earned { border: 1px solid gold; }
            .locked { opacity: 0.7; }
          </style>
        </head>
        <body>
          <h1>🏆 Your Achievements</h1>
          ${this.achievements.map(a => `
            <div class="achievement ${a.earned ? 'earned' : 'locked'}">
              <h3>${a.icon} ${a.title}</h3>
              <p>${a.description}</p>
              ${a.earned ? `<small>Earned: ${new Date(a.earnedDate!).toLocaleDateString()}</small>` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `;
  }
} 