# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

isoCare is a React Native mobile application built with Expo SDK 54, using file-based routing via expo-router.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (opens options for iOS/Android/web)
npx expo start

# Platform-specific development
npm run ios       # Start iOS simulator
npm run android   # Start Android emulator
npm run web       # Start web browser

# Linting
npm run lint      # Run ESLint with Expo config
```

## Architecture

- **Framework**: Expo SDK 54 with React Native 0.81
- **Routing**: File-based routing using `expo-router` - routes are defined by files in `app/` directory
- **Entry Point**: `app/_layout.tsx` defines the root Stack navigator
- **Path Aliases**: `@/*` maps to project root (configured in tsconfig.json)

### Key Configurations

- **New Architecture**: Enabled (`newArchEnabled: true`)
- **React Compiler**: Enabled as experiment
- **Typed Routes**: Enabled for type-safe navigation
- **TypeScript**: Strict mode enabled
- **UI Style**: Automatic light/dark mode support

### Project Structure

```
app/           # File-based routes (expo-router)
assets/images/ # App icons, splash screens, images
```
