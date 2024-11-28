import * as vscode from 'vscode';
import { registerAutoImport } from './commands/autoImport';
import { registerOrganizeImports } from './commands/organizeImports';
import { activate as activateNavigateToRoute } from './commands/navigateToRoute';
import { ImportOrderDiagnostics } from './diagnostics/importOrderDiagnostics';
import { AchievementSystem } from './features/fun/achievements';
import { calculateLinesReduced, StatsTracker } from './features/fun/stats';
import { ImportStatusBar } from './features/fun/statusBar';

export function activate(context: vscode.ExtensionContext) {
  try {
    // Register the auto-import command
    registerAutoImport(context);

    // Register the organize-imports command
    registerOrganizeImports(context);

    // Register the navigate-to-route command
    activateNavigateToRoute(context);

    // Initialize import order diagnostics
    const importDiagnostics = new ImportOrderDiagnostics();
    importDiagnostics.activate(context);
    context.subscriptions.push(importDiagnostics);

    // Initialize fun features
    const achievements = AchievementSystem.initialize(context);
    const stats = StatsTracker.initialize(context);
    ImportStatusBar.initialize();

    // Add to your existing organizeImports command
    let disposable = vscode.commands.registerCommand('extension.organizeImports', async () => {
      // Get original imports before changes
      const originalImports = getImportSection(vscode.window.activeTextEditor?.document.getText() || '');
      
      // Execute organize imports command
      await vscode.commands.executeCommand('editor.action.organizeImports');
      const updatedText = vscode.window.activeTextEditor?.document.getText() || '';
      
      // After successful organization:
      const updatedImports = getImportSection(updatedText);
      const linesReduced = calculateLinesReduced(originalImports, updatedImports);
      stats.updateStats(linesReduced);
      achievements.checkAchievements(stats.getStats());
      ImportStatusBar.updateStatus(stats.getStats());
    });

    context.subscriptions.push(disposable);

    // Show success message when extension is activated
    vscode.window.showInformationMessage('Expo Autopilot is now active!');
  } catch (error) {
    console.error('Error activating Expo Autopilot:', error);
    vscode.window.showErrorMessage('Failed to activate Expo Autopilot: ' + (error as Error).message);
  }
}

export function deactivate() {
  // Cleanup code if needed when extension is deactivated
}

function getImportSection(text: string): string {
  const importLines = text.split('\n')
    .filter(line => line.trim().startsWith('import'))
    .join('\n');
  return importLines;
}
