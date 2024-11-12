import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

export function registerAutoImport(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.autoImport', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No editor open!');
      return;
    }

    // Detect project structure
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    const projectStructure = detectProjectStructure(workspaceRoot!);

    // Get all possible import locations based on structure
    const importPaths = getImportPaths(workspaceRoot!, projectStructure);

    // Analyze current file for missing imports
    const missingImports = await analyzeMissingImports(editor.document);

    // Search for exports in project files
    const availableExports = await findExportsInProject(importPaths, missingImports);

    // Add imports based on what's found
    await addImports(editor, availableExports);
  });

  context.subscriptions.push(disposable);
}

interface ExportInfo {
  name: string;
  path: string;
  isDefault: boolean;
}

async function analyzeMissingImports(document: vscode.TextDocument): Promise<string[]> {
  const sourceFile = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    true
  );

  const usedIdentifiers = new Set<string>();

  // Walk through the AST to find JSX elements and identifiers
  function visit(node: ts.Node) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = ts.isJsxElement(node)
        ? node.openingElement.tagName.getText()
        : node.tagName.getText();
      if (isPascalCase(tagName)) { // Components are PascalCase
        usedIdentifiers.add(tagName);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // Get existing imports
  const existingImports = new Set<string>();
  sourceFile.statements.forEach(statement => {
    if (ts.isImportDeclaration(statement)) {
      // Add imported names to existingImports set
      const importClause = statement.importClause;
      if (importClause?.name) {
        existingImports.add(importClause.name.text);
      }
      // Handle named imports
      importClause?.namedBindings?.forEachChild(binding => {
        if (ts.isImportSpecifier(binding)) {
          existingImports.add(binding.name.text);
        }
      });
    }
  });

  const missingImports = Array.from(usedIdentifiers).filter(id => !existingImports.has(id));
  console.log('Missing imports:', missingImports); // Debug log
  return missingImports;
}

// Helper function to check if string is PascalCase
function isPascalCase(str: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

async function findExportsInProject(paths: string[], identifiers: string[]): Promise<ExportInfo[]> {
  const exports: Map<string, ExportInfo> = new Map(); // Use Map to avoid duplicates

  for (const folderPath of paths) {
    const files = await vscode.workspace.findFiles(
      new vscode.RelativePattern(folderPath, '**/*.{ts,tsx}')
    );

    for (const file of files) {
      const content = await vscode.workspace.fs.readFile(file);
      const sourceText = content.toString();
      const sourceFile = ts.createSourceFile(
        file.fsPath,
        sourceText,
        ts.ScriptTarget.Latest,
        true
      );

      // Check if file exports any of our identifiers
      for (const identifier of identifiers) {
        if (exports.has(identifier)) continue; // Skip if we already found this export

        let isDefault = false;
        let isNamed = false;

        // Check for different export patterns
        sourceFile.statements.forEach(statement => {
          if (ts.isExportDeclaration(statement)) {
            const namedExports = sourceText.slice(statement.pos, statement.end)
              .match(/export\s*{\s*([^}]+)\s*}/)?.[1];
            
            if (namedExports?.includes(identifier)) {
              isNamed = true;
            }
          } else if (ts.isExportAssignment(statement)) {
            const defaultExport = statement.getText()
              .match(/export\s+default\s+(\w+)/)?.[1];
            
            if (defaultExport === identifier) {
              isDefault = true;
            }
          } else if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
            const name = statement.name?.getText();
            const isExported = statement.modifiers?.some(m => 
              m.kind === ts.SyntaxKind.ExportKeyword
            );
            const isDefaultExport = statement.modifiers?.some(m => 
              m.kind === ts.SyntaxKind.DefaultKeyword
            );

            if (name === identifier && isExported) {
              if (isDefaultExport) {
                isDefault = true;
              } else {
                isNamed = true;
              }
            }
          }
        });

        if (isDefault || isNamed) {
          // Calculate relative path from current file to the export file
          const currentDir = path.dirname(vscode.window.activeTextEditor!.document.uri.fsPath);
          let relativePath = path.relative(currentDir, file.fsPath)
            .replace(/\.[^/.]+$/, ''); // Remove extension
          
          // Ensure path starts with ./ or ../
          if (!relativePath.startsWith('.')) {
            relativePath = `./${relativePath}`;
          }

          exports.set(identifier, {
            name: identifier,
            path: relativePath,
            isDefault: isDefault
          });
        }
      }
    }
  }

  return Array.from(exports.values());
}

function detectProjectStructure(workspaceRoot: string): 'src' | 'root' {
  // Check for src/app structure
  if (fs.existsSync(path.join(workspaceRoot, 'src', 'app'))) {
    return 'src';
  }
  // Check for root/app structure
  if (fs.existsSync(path.join(workspaceRoot, 'app'))) {
    return 'root';
  }
  // Default to root if neither is found
  return 'root';
}

function getImportPaths(root: string, structure: 'src' | 'root'): string[] {
  const baseDir = structure === 'src' ? path.join(root, 'src') : root;
  const paths: string[] = [];

  try {
    // Read all directories in the base directory
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    
    // Filter for directories only and exclude certain folders
    const excludedDirs = new Set(['node_modules', '.git','dist', 'build']);
    
    entries.forEach(entry => {
      if (entry.isDirectory() && !excludedDirs.has(entry.name)) {
        const fullPath = path.join(baseDir, entry.name);
        paths.push(fullPath);
        
        // Also check one level deeper for component libraries, etc.
        try {
          const subEntries = fs.readdirSync(fullPath, { withFileTypes: true });
          subEntries.forEach(subEntry => {
            if (subEntry.isDirectory() && !excludedDirs.has(subEntry.name)) {
              paths.push(path.join(fullPath, subEntry.name));
            }
          });
        } catch (error) {
          // Silently handle permission errors for subdirectories
        }
      }
    });
  } catch (error) {
    console.error('Error reading project directories:', error);
  }

  return paths.filter(p => fs.existsSync(p));
}

async function addImports(editor: vscode.TextEditor, exports: ExportInfo[]): Promise<void> {
  if (!exports.length) return;

  // Group imports by file path
  const importGroups = new Map<string, { default: string[], named: string[] }>();
  
  exports.forEach(exp => {
    const group = importGroups.get(exp.path) || { default: [], named: [] };
    if (exp.isDefault) {
      group.default.push(exp.name);
    } else {
      group.named.push(exp.name);
    }
    importGroups.set(exp.path, group);
  });

  await editor.edit(editBuilder => {
    const firstLine = editor.document.lineAt(0);
    
    // Add imports grouped by file
    importGroups.forEach((group, filePath) => {
      let importStatement = '';
      
      if (group.default.length && group.named.length) {
        importStatement = `import ${group.default[0]}, { ${group.named.join(', ')} } from '${filePath}';\n`;
      } else if (group.default.length) {
        importStatement = `import ${group.default[0]} from '${filePath}';\n`;
      } else {
        importStatement = `import { ${group.named.join(', ')} } from '${filePath}';\n`;
      }
      
      editBuilder.insert(firstLine.range.start, importStatement);
    });
  });
}
