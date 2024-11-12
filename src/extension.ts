import * as vscode from 'vscode';
import { registerAutoImport } from './commands/autoImport';
import { activate as activateNavigateToRoute } from './commands/navigateToRoute';

export function activate(context: vscode.ExtensionContext) {
  // Register the auto-import command
  registerAutoImport(context);

  // Register the navigate-to-route command
  activateNavigateToRoute(context);
}

export function deactivate() {}
