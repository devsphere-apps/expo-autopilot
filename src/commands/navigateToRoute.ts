import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface RouteInfo {
  path: string;
  relativePath: string;
  name: string;
  type: 'screen' | 'group' | 'modal' | 'tab';
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.navigateToRoute', async () => {
    try {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      if (!workspaceRoot) {
        throw new Error('No workspace folder found');
      }

      // Find the app directory (either app/ or src/app/)
      const appDir = findAppDirectory(workspaceRoot);
      if (!appDir) {
        throw new Error('No app directory found. Make sure you have an "app" directory in your project.');
      }

      // Get all routes
      const routes = await findRoutes(appDir);
      if (routes.length === 0) {
        throw new Error('No routes found in the app directory');
      }

      // Show quick pick with routes
      const selectedRoute = await showRouteQuickPick(routes);
      if (selectedRoute) {
        await openRoute(selectedRoute);
      }
    } catch (error) {
      console.error('Error navigating to route:', error);
      vscode.window.showErrorMessage('Failed to navigate: ' + (error as Error).message);
    }
  });

  context.subscriptions.push(disposable);
}

function findAppDirectory(workspaceRoot: string): string | null {
  const possiblePaths = [
    path.join(workspaceRoot, 'app'),
    path.join(workspaceRoot, 'src', 'app')
  ];

  for (const dir of possiblePaths) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }

  return null;
}

async function findRoutes(appDir: string): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = [];

  function processDirectory(dir: string, parentPath: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(appDir, fullPath);

      if (entry.isDirectory()) {
        // Handle directory routes
        const routeName = entry.name;
        let routeType: RouteInfo['type'] = 'screen';

        // Determine route type based on directory name
        if (routeName.startsWith('(')) routeType = 'group';
        if (routeName.startsWith('[')) routeType = 'modal';
        if (routeName === '(tabs)') routeType = 'tab';

        routes.push({
          path: fullPath,
          relativePath,
          name: routeName,
          type: routeType
        });

        // Recursively process subdirectories
        processDirectory(fullPath, path.join(parentPath, routeName));
      } else if (entry.isFile() && isRouteFile(entry.name)) {
        // Handle route files
        const routeName = entry.name.replace(/\.(tsx|ts|js|jsx)$/, '');
        
        // Skip layout and other special files
        if (!isSpecialFile(routeName)) {
          routes.push({
            path: fullPath,
            relativePath,
            name: routeName,
            type: 'screen'
          });
        }
      }
    }
  }

  processDirectory(appDir);
  return routes;
}

function isRouteFile(filename: string): boolean {
  return /\.(tsx|ts|js|jsx)$/.test(filename);
}

function isSpecialFile(filename: string): boolean {
  return ['_layout', 'layout', 'error', 'loading', 'not-found'].includes(filename);
}

async function showRouteQuickPick(routes: RouteInfo[]): Promise<RouteInfo | undefined> {
  const items = routes.map(route => ({
    label: getRouteLabel(route),
    description: route.relativePath,
    detail: getRouteDetail(route),
    route
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a route to navigate to',
    matchOnDescription: true,
    matchOnDetail: true
  });

  return selected?.route;
}

function getRouteLabel(route: RouteInfo): string {
  const icons: Record<RouteInfo['type'], string> = {
    screen: '📱',
    group: '📁',
    modal: '🔲',
    tab: '📑'
  };

  return `${icons[route.type]} ${route.name}`;
}

function getRouteDetail(route: RouteInfo): string {
  const typeLabels: Record<RouteInfo['type'], string> = {
    screen: 'Screen',
    group: 'Group',
    modal: 'Modal',
    tab: 'Tab'
  };

  return `${typeLabels[route.type]} - ${route.relativePath}`;
}

async function openRoute(route: RouteInfo): Promise<void> {
  const document = await vscode.workspace.openTextDocument(route.path);
  await vscode.window.showTextDocument(document);
}

// Add command to package.json
export const command = {
  command: 'extension.navigateToRoute',
  title: 'Navigate to Route',
  keybinding: {
    command: 'extension.navigateToRoute',
    key: 'ctrl+shift+r',
    mac: 'cmd+shift+r',
    when: 'editorTextFocus'
  }
};
