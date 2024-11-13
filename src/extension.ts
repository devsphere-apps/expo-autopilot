import * as vscode from 'vscode';
import { registerAutoImport } from './commands/autoImport';
import { registerOrganizeImports } from './commands/organizeImports';
import { activate as activateNavigateToRoute } from './commands/navigateToRoute';
import { ImportOrderDiagnostics } from './diagnostics/importOrderDiagnostics';

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
