import * as vscode from 'vscode';
import { StatsTracker } from '../features/fun/stats';

export function registerOrganizeImports(context: vscode.ExtensionContext) {
  const stats = StatsTracker.initialize(context);

  let disposable = vscode.commands.registerCommand('extension.organizeImports', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No editor open!');
      return;
    }

    try {
      await organizeImports(editor, context);
      vscode.window.showInformationMessage('Imports organized successfully!');
    } catch (error) {
      console.error('Error organizing imports:', error);
      vscode.window.showErrorMessage('Error organizing imports: ' + (error as Error).message);
    }
  });

  context.subscriptions.push(disposable);
}

async function organizeImports(editor: vscode.TextEditor, context: vscode.ExtensionContext) {
  const document = editor.document;
  const text = document.getText();
  
  // Get original imports text
  const originalImports = extractImports(text);
  
  // Regular expression to match import statements and empty lines
  const importRegex = /^(?:import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*,?\s*)*\s*from\s+['"][^'"]+['"];?\s*$|^\s*$)/gm;
  
  // Find all imports and their empty lines
  const imports = [...text.matchAll(importRegex)].map(match => ({
    statement: match[0].trim(),
    index: match.index!,
    length: match[0].length
  })).filter(imp => imp.statement !== ''); // Remove empty lines

  if (imports.length === 0) {return;}

  // Find the actual start of the file content (skipping leading empty lines)
  const fileStart = text.substring(0, imports[0].index).split('\n');
  const nonEmptyLineIndex = fileStart.findIndex(line => line.trim() !== '');
  const startPos = nonEmptyLineIndex === -1 ? 0 : nonEmptyLineIndex;

  // Group imports by type
  const groups = {
    react: [] as string[],
    reactNative: [] as string[],
    expoRouter: [] as string[],
    thirdParty: [] as string[],
    appAlias: [] as string[],
    relative: [] as string[]
  };

  imports.forEach(imp => {
    const statement = imp.statement;
    const modulePath = statement.match(/from\s+['"]([^'"]+)['"]/)?.[1] || '';

    if (modulePath === 'react') {
      groups.react.push(statement);
    } else if (modulePath === 'react-native') {
      groups.reactNative.push(statement);
    } else if (modulePath === 'expo-router') {
      groups.expoRouter.push(statement);
    } else if (modulePath.startsWith('@/')) {
      groups.appAlias.push(statement);
    } else if (modulePath.startsWith('.')) {
      groups.relative.push(statement);
    } else {
      groups.thirdParty.push(statement);
    }
  });

  // Sort imports within each group
  Object.values(groups).forEach(group => group.sort());

  // Combine imports with proper spacing
  const nonEmptyGroups = [
    groups.react,
    groups.reactNative,
    groups.expoRouter,
    groups.thirdParty,
    groups.appAlias,
    groups.relative
  ].filter(group => group.length > 0);

  const organizedImports = nonEmptyGroups
    .map(group => group.join('\n'))
    .join('\n\n');

  // Calculate lines reduced
  const linesReduced = calculateLinesReduced(
    originalImports.join('\n'),  // Convert original imports array to string
    organizedImports             // Your organized imports string
  );
  
  // Update stats with the calculated reduction
  StatsTracker.initialize(context).updateStats(linesReduced);
  
  // Find the range of all imports including empty lines
  const firstImport = imports[0];
  const lastImport = imports[imports.length - 1];
  const rangeStart = document.positionAt(startPos);
  const rangeEnd = document.positionAt(lastImport.index + lastImport.length);
  const importRange = new vscode.Range(rangeStart, rangeEnd);

  // Replace all imports with organized imports, starting from the true beginning
  await editor.edit(editBuilder => {
    editBuilder.replace(importRange, organizedImports + '\n');
  });
}

// Helper function to extract all imports from text
function extractImports(text: string): string[] {
  const importRegex = /^import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*,?\s*)*\s*from\s+['"][^'"]+['"];?\s*$/gm;
  return [...text.matchAll(importRegex)].map(match => match[0]);
}

function calculateLinesReduced(originalImports: string, organizedImports: string): number {
  // Count lines in original imports
  const originalLines = originalImports.split('\n').filter(line => line.trim().length > 0).length;
  
  // Count lines in organized imports
  const organizedLines = organizedImports.split('\n').filter(line => line.trim().length > 0).length;
  
  // Return the difference (if negative, it means we reduced lines)
  return Math.max(0, originalLines - organizedLines);
} 