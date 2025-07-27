# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the Vonage Video API Reference App for React - an open-source video conferencing application demonstrating best practices for integrating the Vonage Video API with React. The app supports features like multi-participant video calls, recording, screen sharing, chat, and more.

## Development Commands

### Starting the Application
- `yarn dev` - Start both frontend (port 5173) and backend (port 3345) in development mode
- `yarn start` - Build frontend and start backend in production mode
- `yarn start:frontend` - Start only the frontend dev server
- `yarn start:backend` - Start only the backend dev server

### Building
- `yarn build` - Build the frontend application
- `yarn run-server` - Start the backend server (used for VCR deployment)

### Testing
- `yarn test` - Run both frontend and backend test suites
- `yarn test:frontend` - Run frontend tests (vitest)
- `yarn test:frontend:watch` - Run frontend tests in watch mode
- `yarn test:backend` - Run backend tests (jest)
- `yarn test:backend:watch` - Run backend tests in watch mode
- `yarn test:integration` - Run Playwright integration tests (requires app to be running separately)

### Code Quality
- `yarn lint` - Check for linting issues across the project
- `yarn lint:fix` - Fix auto-fixable linting issues and format with prettier
- `yarn ts-check` - Run TypeScript type checking for both frontend and backend
- `yarn ts-check:frontend` - Run TypeScript type checking for frontend only
- `yarn ts-check:backend` - Run TypeScript type checking for backend only

### Documentation
- `yarn docs` - Generate TypeScript documentation from JSDoc comments
- `yarn docs:watch` - Generate docs in watch mode

## Project Architecture

This is a monorepo with three main workspaces:

### Frontend (`frontend/`)
- **Framework**: React 19 with TypeScript, Vite for build tooling
- **UI**: Material-UI (MUI Joy), Tailwind CSS for styling
- **Video SDK**: `@vonage/client-sdk-video` for video functionality
- **Key Directories**:
  - `src/Context/` - React context providers for session, publisher, audio output management
  - `src/pages/` - Main pages (LandingPage, WaitingRoom, MeetingRoom, GoodBye, UnsupportedBrowserPage)
  - `src/components/` - Reusable UI components organized by feature
  - `src/hooks/` - Custom React hooks for business logic
  - `src/utils/` - Utility functions and classes
  - `src/api/` - API communication with backend

### Backend (`backend/`)
- **Framework**: Express.js with TypeScript, using `tsx` for development
- **Video API**: `@vonage/server-sdk` and `@vonage/video` for server-side video operations
- **Key Directories**:
  - `routes/` - API endpoints for session management, feedback, health checks
  - `videoService/` - Abstraction layer for video service operations (OpenTok/Vonage)
  - `storage/` - Session storage implementations (in-memory, VCR)
  - `services/` - Business logic services (feedback handling)

### Integration Tests (`integration-tests/`)
- **Framework**: Playwright for cross-browser E2E testing
- **Coverage**: Visual regression tests, user workflows, multi-participant scenarios
- **Browsers**: Chrome, Firefox, Edge, Opera, Mobile Chrome, Electron

## Key Architectural Patterns

### Context-Based State Management
The app uses React Context extensively for managing video-related state:
- `SessionProvider` - Manages Vonage session, subscribers, chat, emojis
- `PublisherProvider` - Manages local video publisher and its settings
- `PreviewPublisherProvider` - Manages video preview in waiting room
- `AudioOutputProvider` - Manages audio output device selection

### Video Service Abstraction
The backend uses a factory pattern to abstract video service operations, supporting both legacy OpenTok and newer Vonage Video APIs through a common interface.

### Component Organization
Frontend components are organized by feature with co-located tests, following the pattern:
```
ComponentName/
  ├── ComponentName.tsx
  ├── ComponentName.spec.tsx
  └── index.tsx
```

### Session Management
- Backend creates and manages video sessions per room
- Thread-safe session creation using `blockCallsForArgs` utility
- Support for both in-memory and VCR (Vonage Cloud Runtime) session storage

## Environment Setup

Required environment variables:
- **Backend** (`backend/.env`):
  - `VONAGE_APP_ID` - Vonage application ID
  - `VONAGE_PRIVATE_KEY` - Vonage private key for authentication
- **Frontend** (`frontend/.env`):
  - `VITE_TUNNEL_DOMAIN` - For ngrok tunneling when testing on multiple devices

## File Naming Convention

All filenames use `camelCase` throughout the project.

## Browser Support

The app supports latest versions of Chrome, Firefox, Edge, Opera, Safari, and Electron. Mobile web support is limited with minimum device width of 360px.

## Deployment

The app can be deployed to Vonage Cloud Runtime (VCR) using the included scripts:
- `yarn deploy-vcr` - Deploy to VCR
- `vcrBuild.sh` - Build script for VCR deployment