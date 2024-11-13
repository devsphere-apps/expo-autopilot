import * as vscode from 'vscode';

export function registerOrganizeImports(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.organizeImports', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No editor open!');
      return;
    }

    try {
      await organizeImports(editor);
      vscode.window.showInformationMessage('Imports organized successfully!');
    } catch (error) {
      console.error('Error organizing imports:', error);
      vscode.window.showErrorMessage('Error organizing imports: ' + error.message);
    }
  });

  context.subscriptions.push(disposable);
}

async function organizeImports(editor: vscode.TextEditor) {
  const document = editor.document;
  const text = document.getText();
  
  // Regular expression to match import statements and empty lines
  const importRegex = /^(?:import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*,?\s*)*\s*from\s+['"][^'"]+['"];?\s*$|^\s*$)/gm;
  
  // Find all imports and their empty lines
  const imports = [...text.matchAll(importRegex)].map(match => ({
    statement: match[0].trim(),
    index: match.index!,
    length: match[0].length
  })).filter(imp => imp.statement !== ''); // Remove empty lines

  if (imports.length === 0) return;

  // Group imports by type
  const groups = {
    react: [] as string[],
    reactNative: [] as string[],
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
    groups.thirdParty,
    groups.appAlias,
    groups.relative
  ].filter(group => group.length > 0);

  const organizedImports = nonEmptyGroups
    .map(group => group.join('\n'))
    .join('\n\n');

  // Find the range of all imports including empty lines
  const firstImport = imports[0];
  const lastImport = imports[imports.length - 1];
  const startPos = document.positionAt(firstImport.index);
  const endPos = document.positionAt(lastImport.index + lastImport.length);
  const importRange = new vscode.Range(startPos, endPos);

  // Replace all imports with organized imports
  await editor.edit(editBuilder => {
    editBuilder.replace(importRange, organizedImports + '\n');
  });
} 