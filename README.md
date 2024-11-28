# 🚀 Expo Autopilot - Smart Import Management for Expo Router Projects

A powerful VSCode extension designed specifically for Expo Router projects, offering intelligent import management, real-time diagnostics, and automated organization features.

## 📑 Table of Contents
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Import Order Rules](#-import-order-rules)
- [Commands & Shortcuts](#-commands--shortcuts)
- [Configuration](#-configuration)
- [Examples](#-examples)
- [Contributing](#-contributing)
- [Support Expo Autopilot](#-support-expo-autopilot)

## ✨ Features

### 🎯 Auto Import Detection
- Real-time detection of missing imports
- Support for components, utilities, APIs, and constants
- Smart path resolution with alias support
- TypeScript and JavaScript compatibility

### 📦 Import Organization
- Automatic import grouping and ordering
- Real-time diagnostics for import order issues
- Visual indicators for unorganized imports
- One-click import organization

### 🎨 Visual Diagnostics
- Interactive hover messages with quick fixes
- Color-coded import groups
- Clear visual indicators for import order issues
- OS-specific keyboard shortcut hints

## 📥 Installation

1. Open Visual Studio Code
2. Access Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Expo Autopilot"
4. Click Install

## 🎮 Usage

### Auto Import
- Command Palette: `Auto Import`
- Shortcut: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (macOS)

### Organize Imports
- Command Palette: `Organize Imports`
- Shortcut: `Ctrl+Shift+O` (Windows/Linux) or `Cmd+Shift+O` (macOS)

## 📐 Import Order Rules

The extension enforces a standardized import order:

1. **React Imports** 🔵
   ```typescript
   import React from 'react';
   ```

2. **React Native Imports** 🟦
   ```typescript
   import { View, Text } from 'react-native';
   ```

3. **Third Party Imports** 🟨
   ```typescript
   import { Tabs } from 'expo-router';
   ```

4. **App Imports (@/*)** 🟩
   ```typescript
   import { Button } from '@/components/Button';
   ```

5. **Relative Imports (./)** 🟫
   ```typescript
   import { utils } from './utils';
   ```

## ⌨️ Commands & Shortcuts

| Command | Windows/Linux | macOS | Description |
|---------|--------------|-------|-------------|
| Auto Import | `Ctrl+Shift+I` | `Cmd+Shift+I` | Detect and add missing imports |
| Organize Imports | `Ctrl+Shift+O` | `Cmd+Shift+O` | Organize imports according to rules |

## ⚙️ Configuration

The extension automatically respects your project's configuration:
- `tsconfig.json` for TypeScript path aliases
- `babel.config.js` for Babel module resolver
- Expo Router project structure

## 💡 Examples

### Auto Import Feature
Before:
```typescript
export default function MyComponent() {
  return <Button>Click me</Button>;
}
```

After:
```typescript
import { Button } from '@/components/Button';

export default function MyComponent() {
  return <Button>Click me</Button>;
}
```

### Import Organization
Before:
```typescript
import { Button } from '@/components/Button';
import React from 'react';
import { View } from 'react-native';
```

After:
```typescript
import React from 'react';

import { View } from 'react-native';

import { Button } from '@/components/Button';
```

## 🤝 Contributing

We welcome contributions! Feel free to:
- Report issues
- Suggest features
- Submit pull requests

Visit our [GitHub repository](https://github.com/devsphere-apps/expo-autopilot) to get started.

## 📝 License

MIT License - feel free to use in your projects!

## 👨‍💻 About the Author

Hi! I'm Abdul Mateen, a passionate developer focused on creating tools that make development workflows smoother and more efficient.

- 🔭 Currently working on improving Expo Router developer experience
- 🌱 Specialized in React Native and Expo ecosystem
- 💬 Let's connect and discuss ideas!
  - 🐦 [Twitter](https://x.com/mateenchitrali)
  - 💼 [LinkedIn](https://www.linkedin.com/in/abdulmateenchitrali/)

## 💖 Support Expo Autopilot

Expo Autopilot is **100% free and open source**! If you find it valuable:

- ⭐ Star the project on GitHub
- 🐦 Follow me on [X / Twitter](https://x.com/mateenchitrali)
- 💼 Connect on [LinkedIn](https://www.linkedin.com/in/abdulmateenchitrali/)
- 📢 Share your experience with others
- 🐛 Report bugs and suggest features

Your support helps keep this project active and continuously improving!

---

Made with ❤️ for the Expo Router community. Happy coding! 🚀
