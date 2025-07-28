# Workshop Assets

This directory contains supporting materials for the Vonage Video API Workshop including code snippets, presentation materials, and interactive exercises.

## Directory Structure

```
assets/
├── code-snippets/          # Reusable code examples
├── presentations/          # Slide decks and visual materials
├── exercises/              # Interactive coding exercises
├── sample-data/           # Test data and fixtures
├── templates/             # Project templates and boilerplates
└── resources/             # Additional learning resources
```

## Code Snippets

### Quick Implementation Examples

**Basic Video Call Setup:**
```typescript
// Minimal video call implementation
import { useEffect, useRef, useState } from 'react';

const VideoCall = ({ sessionId, token, apiKey }) => {
  const [session, setSession] = useState(null);
  const publisherRef = useRef(null);

  useEffect(() => {
    const OT = window.OT;
    const newSession = OT.initSession(apiKey, sessionId);
    
    newSession.connect(token, (error) => {
      if (!error) {
        const publisher = OT.initPublisher(publisherRef.current);
        newSession.publish(publisher);
        setSession(newSession);
      }
    });
  }, []);

  return <div ref={publisherRef} style={{ width: 400, height: 300 }} />;
};
```

**Screen Sharing Toggle:**
```typescript
const useScreenShare = (session) => {
  const [isSharing, setIsSharing] = useState(false);
  const [screenPublisher, setScreenPublisher] = useState(null);

  const toggleScreenShare = useCallback(() => {
    if (isSharing) {
      session.unpublish(screenPublisher);
      setScreenPublisher(null);
      setIsSharing(false);
    } else {
      const publisher = OT.initPublisher(null, { videoSource: 'screen' });
      session.publish(publisher);
      setScreenPublisher(publisher);
      setIsSharing(true);
    }
  }, [session, isSharing, screenPublisher]);

  return { isSharing, toggleScreenShare };
};
```

**Chat Integration:**
```typescript
const useChat = (session) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!session) return;

    const handleSignal = (event) => {
      if (event.type === 'signal:chat') {
        const message = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
      }
    };

    session.on('signal:chat', handleSignal);
    return () => session.off('signal:chat', handleSignal);
  }, [session]);

  const sendMessage = useCallback((text) => {
    const message = {
      text,
      sender: 'User',
      timestamp: Date.now()
    };

    session.signal({
      type: 'chat',
      data: JSON.stringify(message)
    });
  }, [session]);

  return { messages, sendMessage };
};
```

## Presentation Materials

### Slide Decks Available

1. **Workshop Introduction** (15 slides)
   - Vonage platform overview
   - Video API capabilities
   - Workshop agenda and objectives

2. **Technical Deep Dive** (25 slides)
   - WebRTC fundamentals
   - Video API architecture
   - Best practices and patterns

3. **Integration Showcase** (20 slides)
   - Multi-API solutions
   - Real-world use cases
   - Success stories and metrics

4. **Production Deployment** (15 slides)
   - Scaling strategies
   - Security considerations
   - Monitoring and analytics

### Visual Diagrams

**Session Architecture:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Participant │◄──►│   Session   │◄──►│ Participant │
│      A      │    │  (Room/Hub) │    │      B      │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                    ┌─────────────┐
                    │ Participant │
                    │      C      │
                    └─────────────┘
```

**Token Flow:**
```
Frontend ──┐
           │ 1. Request credentials
           ▼
    Backend Server ──┐
                     │ 2. Generate token
                     ▼
             Vonage Video API ──┐
                                │ 3. Validate & connect
                                ▼
                        Video Session
```

## Interactive Exercises

### Exercise 1: Basic Connection
**Objective:** Establish your first video connection
**Time:** 15 minutes
**Steps:**
1. Set up environment variables
2. Create session credentials
3. Connect and display video
4. Test with multiple browser tabs

### Exercise 2: Feature Integration
**Objective:** Add screen sharing and chat
**Time:** 30 minutes
**Steps:**
1. Implement screen share toggle
2. Add real-time chat messaging
3. Handle participant events
4. Test feature interactions

### Exercise 3: UI Polish
**Objective:** Create professional interface
**Time:** 45 minutes
**Steps:**
1. Design responsive layout
2. Add device selectors
3. Implement participant list
4. Create loading states

### Exercise 4: Advanced Features
**Objective:** Implement premium capabilities
**Time:** 60 minutes
**Steps:**
1. Add background blur
2. Implement emoji reactions
3. Create recording functionality
4. Optimize for performance

## Sample Data and Fixtures

### Test Scenarios

**Multi-Participant Meeting:**
```json
{
  "meetingId": "workshop-demo-001",
  "participants": [
    {
      "name": "Workshop Host",
      "role": "moderator",
      "hasVideo": true,
      "hasAudio": true
    },
    {
      "name": "Participant 1",
      "role": "publisher",
      "hasVideo": true,
      "hasAudio": true
    },
    {
      "name": "Participant 2",
      "role": "publisher",
      "hasVideo": false,
      "hasAudio": true
    }
  ],
  "features": {
    "chat": true,
    "screenShare": true,
    "recording": false
  }
}
```

**Chat Message History:**
```json
[
  {
    "id": "msg_001",
    "sender": "Workshop Host",
    "text": "Welcome to the video workshop!",
    "timestamp": "2024-01-15T10:00:00Z",
    "type": "message"
  },
  {
    "id": "msg_002",
    "sender": "Participant 1",
    "text": "Thanks! Excited to learn.",
    "timestamp": "2024-01-15T10:00:15Z",
    "type": "message"
  },
  {
    "id": "reaction_001",
    "sender": "Participant 2",
    "emoji": "👍",
    "timestamp": "2024-01-15T10:00:30Z",
    "type": "reaction"
  }
]
```

### Mock API Responses

**Session Creation Response:**
```json
{
  "sessionId": "2_MX4xMDB-fjE1NzY5NDIxMjE4NjF-UzZPSWF6UU93Nk9vSXRKTGN2VG1aaFA",
  "apiKey": "46942131",
  "token": "T1==cGFydG5lcl9pZD00Njk0MjEzMSZzaWc9...",
  "expires": 1576944218
}
```

**Archive (Recording) Response:**
```json
{
  "id": "b0a5a8c7-1b31-4b71-9a77-e19c5d7e7e7e",
  "sessionId": "2_MX4xMDB-fjE1NzY5NDIxMjE4NjF-UzZPSWF6UU93Nk9vSXRKTGN2VG1aaFA",
  "status": "started",
  "name": "Workshop Recording 001",
  "createdAt": "2024-01-15T10:00:00Z",
  "size": 0,
  "duration": 0,
  "url": null
}
```

## Project Templates

### Minimal Starter Template

```typescript
// App.tsx - Minimal video app structure
import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [credentials, setCredentials] = useState(null);
  const [session, setSession] = useState(null);
  const [connected, setConnected] = useState(false);
  const publisherRef = useRef(null);

  // Fetch credentials from backend
  useEffect(() => {
    fetch('/api/session/workshop-room')
      .then(res => res.json())
      .then(setCredentials);
  }, []);

  // Initialize session when credentials are available
  useEffect(() => {
    if (!credentials) return;

    const OT = window.OT;
    const newSession = OT.initSession(credentials.apiKey, credentials.sessionId);
    
    newSession.connect(credentials.token, (error) => {
      if (!error) {
        setConnected(true);
        const publisher = OT.initPublisher(publisherRef.current);
        newSession.publish(publisher);
      }
    });

    setSession(newSession);
  }, [credentials]);

  if (!credentials) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Video Workshop App</h1>
      <p>Status: {connected ? 'Connected' : 'Connecting...'}</p>
      <div ref={publisherRef} style={{ width: 400, height: 300, background: '#f0f0f0' }} />
    </div>
  );
}
```

### Feature-Rich Template

```typescript
// Enhanced template with hooks and components
import React from 'react';
import { SessionProvider } from './context/SessionProvider';
import { PublisherProvider } from './context/PublisherProvider';
import VideoRoom from './components/VideoRoom';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <SessionProvider>
        <PublisherProvider>
          <VideoRoom />
        </PublisherProvider>
      </SessionProvider>
    </div>
  );
}

// Context and components follow patterns from main repository
```

## Additional Resources

### Learning Materials

1. **Cheat Sheets**
   - Video API method reference
   - Event handler quick guide
   - Error code lookup table
   - Best practices checklist

2. **Tutorial Videos** (Links to external resources)
   - "Getting Started with Video API" (10 min)
   - "Building Advanced Features" (20 min)
   - "Production Deployment Tips" (15 min)

3. **Community Examples**
   - Healthcare video platform implementation
   - Educational streaming application
   - Customer support video chat
   - Social video networking app

### Development Tools

**Useful Browser Extensions:**
- React Developer Tools
- Redux DevTools (if using Redux)
- Web Vitals extension for performance monitoring

**Recommended VS Code Extensions:**
- ES7+ React/Redux/React-Native snippets
- TypeScript Hero
- Prettier - Code formatter
- Auto Rename Tag

**Testing Tools:**
- Browser stack for cross-browser testing
- Network throttling for connection testing
- Device emulation for responsive testing

## Usage Instructions

### For Self-Paced Learning

1. **Start with code snippets** to understand basic patterns
2. **Use sample data** to test without real participants
3. **Follow templates** for structured project setup
4. **Reference exercises** for hands-on practice

### For Instructor-Led Sessions

1. **Use presentations** for explanation phases
2. **Demonstrate with code snippets** during live coding
3. **Assign exercises** for interactive participation
4. **Provide templates** for workshop follow-up

### For Production Development

1. **Adapt templates** for your specific use case
2. **Extend code snippets** with your business logic
3. **Reference presentations** for stakeholder communication
4. **Use sample data** for development and testing

---

These workshop assets are designed to support effective learning and rapid development with the Vonage Video API. All code examples are tested and production-ready, providing a solid foundation for your video applications.