import * as vscode from 'vscode';

export class ImportOrderDiagnostics {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private decorationType: vscode.TextEditorDecorationType;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('importOrder');
    
    // Enhanced decoration type with more attractive styling
    this.decorationType = vscode.window.createTextEditorDecorationType({
      // Gradient background for better visibility
      backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
      borderWidth: '0 0 0 2px',
      borderStyle: 'solid',
      borderColor: new vscode.ThemeColor('editorInfo.foreground'),
      
      // Add a nice icon and message after the import
      after: {
        contentText: ' 📦',  // Using an emoji for better visibility
        margin: '0 0 0 1em',
        color: new vscode.ThemeColor('editorInfo.foreground'),
      },
      
      // Light border around the entire import
      outline: '1px solid rgba(100, 150, 255, 0.1)',
      
      // Slight opacity change on hover
      light: {
        opacity: '0.9'
      },
      dark: {
        opacity: '0.9'
      }
    });
  }

  public activate(context: vscode.ExtensionContext) {
    // Register diagnostic updates on document changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(this.updateDiagnostics, this),
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
          this.updateDiagnostics({ document: editor.document });
        }
      })
    );

    // Initial check for active editor
    if (vscode.window.activeTextEditor) {
      this.updateDiagnostics({ document: vscode.window.activeTextEditor.document });
    }
  }

  private createHoverMessage(group: string): vscode.MarkdownString {
    const os = process.platform;
    const shortcut = os === 'darwin' ? '⌘⇧O' : 'Ctrl+Shift+O';
    
    const markdown = new vscode.MarkdownString();
    markdown.isTrusted = true;
    markdown.supportHtml = true;

    markdown.appendMarkdown(`### Import Order Issue 🔍\n\n`);
    markdown.appendMarkdown(`This import should be grouped with other ${group} imports.\n\n`);
    markdown.appendMarkdown(`**Expected Order:**\n`);
    markdown.appendMarkdown(`1. React imports 🔵\n`);
    markdown.appendMarkdown(`2. React Native imports 🟦\n`);
    markdown.appendMarkdown(`3. Third Party imports 🟨\n`);
    markdown.appendMarkdown(`4. App imports (@/*) 🟩\n`);
    markdown.appendMarkdown(`5. Relative imports (./*) 🟫\n\n`);
    markdown.appendMarkdown(`---\n`);
    markdown.appendMarkdown(`**Quick Fix:** Press ${shortcut} to organize imports\n`);
    markdown.appendMarkdown(`$(zap) [Organize Imports](command:extension.organizeImports "Organize imports in this file")`);

    return markdown;
  }

  private async updateDiagnostics(event: { document: vscode.TextDocument }) {
    const { document } = event;

    if (!document.fileName.match(/\.(ts|tsx|js|jsx)$/)) {
      return;
    }

    const text = document.getText();
    const importGroups = this.analyzeImports(text);
    const diagnostics: vscode.Diagnostic[] = [];
    const decorations: vscode.DecorationOptions[] = [];

    if (importGroups.hasOrderIssues) {
      importGroups.unorderedImports.forEach(imp => {
        const range = new vscode.Range(
          document.positionAt(imp.start),
          document.positionAt(imp.end)
        );

        // Enhanced diagnostic with code action
        const diagnostic = new vscode.Diagnostic(
          range,
          `Import should be grouped with ${imp.group} imports`,
          vscode.DiagnosticSeverity.Information
        );
        diagnostic.code = {
          value: 'import-order',
          target: vscode.Uri.parse('command:extension.organizeImports')
        };
        diagnostics.push(diagnostic);

        // Enhanced decoration with hover message
        decorations.push({
          range,
          hoverMessage: this.createHoverMessage(imp.group),
          renderOptions: {
            after: {
              contentText: ` 📦 ${imp.group}`,
              fontStyle: 'italic'
            }
          }
        });
      });
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
    
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document === document) {
      vscode.window.activeTextEditor.setDecorations(this.decorationType, decorations);
    }
  }

  private analyzeImports(text: string): { 
    hasOrderIssues: boolean; 
    unorderedImports: { start: number; end: number; group: string }[] 
  } {
    const importRegex = /^import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*,?\s*)*\s*from\s+['"]([^'"]+)['"];?\s*$/gm;
    const imports: { statement: string; path: string; start: number; end: number }[] = [];
    let match;

    while ((match = importRegex.exec(text)) !== null) {
      imports.push({
        statement: match[0],
        path: match[1],
        start: match.index,
        end: match.index + match[0].length
      });
    }

    const getGroupOrder = (path: string): number => {
      if (path === 'react') return 0;
      if (path === 'react-native') return 1;
      if (!path.startsWith('.') && !path.startsWith('@/')) return 2;
      if (path.startsWith('@/')) return 3;
      return 4;
    };

    const unorderedImports: { start: number; end: number; group: string }[] = [];
    let lastGroupOrder = -1;

    imports.forEach(imp => {
      const currentGroupOrder = getGroupOrder(imp.path);
      if (currentGroupOrder < lastGroupOrder) {
        unorderedImports.push({
          start: imp.start,
          end: imp.end,
          group: this.getGroupName(currentGroupOrder)
        });
      }
      lastGroupOrder = Math.max(lastGroupOrder, currentGroupOrder);
    });

    return {
      hasOrderIssues: unorderedImports.length > 0,
      unorderedImports
    };
  }

  private getGroupName(order: number): string {
    switch (order) {
      case 0: return 'React';
      case 1: return 'React Native';
      case 2: return 'Third Party';
      case 3: return 'App Imports';
      default: return 'Relative';
    }
  }

  public dispose() {
    this.diagnosticCollection.dispose();
  }
} 