# Auto Import Extension for VSCode

Welcome to the **Auto Import Extension** for Visual Studio Code! This powerful tool is designed to streamline your development workflow by automatically detecting and importing missing modules, components, utilities, and more in your TypeScript and JavaScript projects.

## 🚀 Features

- **Automatic Import Detection**: Scans your open file for any missing imports and automatically adds them.
- **Supports All File Types**: Whether it's a React component, utility function, API module, or constant, this extension has you covered.
- **Smart Import Grouping**: Organizes imports into logical groups, such as React, third-party libraries, and local modules, following best practices.
- **Alias and Relative Path Support**: Handles both alias-based and relative imports seamlessly, respecting your project's configuration.
- **Customizable Import Order**: Ensures imports are ordered according to your preferred structure, enhancing code readability.

## 🛠️ How It Works

1. **Analyze**: The extension analyzes your current file to identify any used identifiers that are not yet imported.
2. **Search**: It searches through your project directories to find matching exports for these identifiers.
3. **Import**: Automatically adds the necessary import statements at the top of your file, organized and formatted.

## 📦 Installation

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or by pressing `Ctrl+Shift+X`.
3. Search for "Auto Import Extension" and click Install.

## 🖱️ Usage

- **Command Palette**: Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS), type "Auto Import", and select the command to run it.
- **Keyboard Shortcut**: Use the default shortcut `Ctrl+Shift+I` (or `Cmd+Shift+I` on macOS) to trigger the auto-import functionality.

## ⚙️ Configuration

The extension respects your project's `tsconfig.json` or `babel.config.js` for path aliases and base URL settings, ensuring imports are added correctly according to your project's structure.

## 📝 Example

Before running the extension:

```javascript
export default function MyComponent() {
  return <Button>Click me</Button>;
}
```

After running the extension:

```javascript
import { Button } from '@/components/Button';

export default function MyComponent() {
  return <Button>Click me</Button>;
}
```

## 🤝 Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request on our [GitHub repository](https://github.com/devsphere-apps/expo-autopilot).


Enhance your coding efficiency with the Auto Import Extension and never worry about missing imports again!
