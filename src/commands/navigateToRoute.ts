import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.navigateToRoute', async () => {
    // Get the active editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No open editor found!');
      return;
    }

    // Get the current file's path
    const currentFilePath = editor.document.uri.fsPath;
    const rootFolder = path.dirname(currentFilePath); // Current file's parent folder

    // Check if the project structure is 'src' or 'app' (for number 1 and number 2)
    const isSrcStructure = currentFilePath.includes('src/');
    const baseFolder = isSrcStructure ? path.join(rootFolder, 'src', 'app') : path.join(rootFolder, 'app');

    // Open the route based on the selected file
    const selectedRoute = await vscode.window.showInputBox({
      prompt: 'Enter the route you want to navigate to (e.g. /about)',
    });

    if (!selectedRoute) {
      vscode.window.showInformationMessage('No route entered!');
      return;
    }

    // Determine the path based on the Expo Router structure
    const routeFilePath = path.join(baseFolder, selectedRoute.replace('/', '') + '.tsx');

    // Open the target file
    try {
      const uri = vscode.Uri.file(routeFilePath);
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document);
    } catch (error) {
      vscode.window.showErrorMessage(`Route not found: ${selectedRoute}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
