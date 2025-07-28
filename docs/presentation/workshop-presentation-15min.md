# Getting Started with Vonage API SDKs
## 15-Minute Workshop Presentation

---

## Slide 1: Welcome & Quick Overview
### Getting Started with Vonage API SDKs

**What We'll Cover in 15 Minutes:**
- Video API core concepts
- Project structure walkthrough
- Where to find key implementations
- Quick-start resources

**This Repository:** Complete video conferencing app with React
- Multi-participant video calls
- Screen sharing, chat, effects
- Production-ready patterns

**Let's explore the code together!**

---

## Slide 2: Three Core Concepts
### All you need to understand

**Session** = The video "room"
**Publisher** = Your outgoing stream  
**Subscriber** = Other participants' streams

**The Flow:**
```
Create Session → Connect → Publish → Subscribe
```

**Where to Find This:**
- `frontend/src/Context/SessionProvider.tsx` - Session management
- `frontend/src/Context/PublisherProvider.tsx` - Publisher control
- Look for `initializeSession()` and `handleStreamCreated()`

---

## Slide 3: How Video API Works
### Visual architecture diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        VONAGE VIDEO API                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                      SESSION                             │  │
│  │                  (The Video Room)                        │  │
│  │                                                          │  │
│  │  ┌──────────────┐        ┌──────────────┐              │  │
│  │  │  PUBLISHER   │        │  PUBLISHER   │              │  │
│  │  │   (You)      │        │  (Participant)│              │  │
│  │  │              │        │              │              │  │
│  │  │ 📹 Camera    │        │ 📹 Camera    │              │  │
│  │  │ 🎤 Mic       │        │ 🎤 Mic       │              │  │
│  │  └──────┬───────┘        └──────┬───────┘              │  │
│  │         │                        │                       │  │
│  │         ▼                        ▼                       │  │
│  │    Publishes to              Publishes to               │  │
│  │      Session                   Session                  │  │
│  │         │                        │                       │  │
│  │         └────────┬───────────────┘                      │  │
│  │                  ▼                                       │  │
│  │         Session distributes                             │  │
│  │         streams to all                                  │  │
│  │                  │                                       │  │
│  │     ┌───────────┴────────────┐                         │  │
│  │     ▼                        ▼                         │  │
│  │  ┌──────────────┐        ┌──────────────┐             │  │
│  │  │ SUBSCRIBER   │        │ SUBSCRIBER   │             │  │
│  │  │(Their video) │        │(Your video)  │             │  │
│  │  │              │        │              │             │  │
│  │  │ Shows:       │        │ Shows:       │             │  │
│  │  │ Participant  │        │ You          │             │  │
│  │  └──────────────┘        └──────────────┘             │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Where in Code:**
- **SESSION**: `SessionProvider.tsx` → `initializeSession()`
- **PUBLISHER**: `PublisherProvider.tsx` → `OT.initPublisher()`
- **SUBSCRIBER**: `SessionProvider.tsx` → `session.subscribe()`

---

## Slide 4: Quick Demo
### See it in action

**Live Demo (2 minutes):**
```bash
yarn dev  # Starts frontend (:5173) + backend (:3345)
```

**What to Notice:**
- Instant video connection
- Multiple participants
- Built-in controls
- Real-time features

**This is all open source - you can use it today!**

---

## Slide 4: Project Structure
### Where everything lives

```
vonage-video-react-app/
├── frontend/
│   ├── src/Context/        # ← Video state management
│   ├── src/pages/          # ← Main UI pages
│   ├── src/components/     # ← Reusable features
│   └── src/hooks/          # ← Business logic
├── backend/
│   ├── routes/session.ts   # ← Session creation
│   └── videoService/       # ← Vonage API integration
```

**Key Files to Explore:**
- `SessionProvider.tsx` - Core video logic
- `MeetingRoom.tsx` - Main video UI
- `session.ts` - Backend API

---

## Slide 5: Code Flow Diagram
### How the pieces connect

```
User Opens App
     │
     ▼
┌─────────────────────┐
│  MeetingRoom.tsx    │ ──uses──→ SessionProvider
│  (Page Component)   │           PublisherProvider
└─────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────┐
│         SessionProvider.tsx                     │
│                                                 │
│  1. Fetch credentials from backend              │
│     └─→ GET /api/session/:roomName              │
│                                                 │
│  2. Initialize Session                          │
│     └─→ OT.initSession(apiKey, sessionId)      │
│                                                 │
│  3. Connect with token                          │
│     └─→ session.connect(token, callback)       │
│                                                 │
│  4. Handle events                               │
│     ├─→ on('streamCreated') → Subscribe        │
│     ├─→ on('streamDestroyed') → Cleanup        │
│     └─→ on('signal:chat') → Show message       │
└─────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────┐
│         PublisherProvider.tsx                   │
│                                                 │
│  1. Create Publisher                            │
│     └─→ OT.initPublisher(element, options)     │
│                                                 │
│  2. Publish to Session                          │
│     └─→ session.publish(publisher)             │
│                                                 │
│  3. Control stream                              │
│     ├─→ publishAudio(true/false)               │
│     ├─→ publishVideo(true/false)               │
│     └─→ setVideoFilter(backgroundBlur)         │
└─────────────────────────────────────────────────┘
```

---

## Slide 6: Finding Session Management
### Where the magic happens

**File:** `frontend/src/Context/SessionProvider.tsx`

**Key Functions to Study:**
```typescript
// Line ~168: Session initialization
const initializeSession = useCallback((credentials) => {
  const newSession = OT.initSession(apiKey, sessionId);
  newSession.connect(token, handleConnect);
});

// Line ~218: New participant handling  
newSession.on('streamCreated', handleStreamCreated);

// Line ~112: Subscribe to participant
const subscriber = newSession.subscribe(stream, container);
```

**This file shows complete session lifecycle management**

---

## Slide 6: Finding Publisher Controls
### Your video stream

**File:** `frontend/src/Context/PublisherProvider.tsx`

**Audio/Video Controls:**
```typescript
// Line ~51: Mute/unmute
publisher.publishAudio(!audioEnabled);

// Line ~67: Camera on/off
publisher.publishVideo(!videoEnabled);

// Line ~145: Device switching
publisher.setAudioSource(deviceId);
publisher.setVideoSource(deviceId);
```

**Background Blur:**
```typescript
// Line ~89: AI effects
publisher.setVideoFilter({
  type: 'backgroundBlur',
  blurStrength: 'high'
});
```

---

## Slide 7: Finding Screen Sharing
### Collaboration features

**File:** `frontend/src/hooks/useScreenShare.tsx`

**Implementation Pattern:**
```typescript
// Line ~18: Start screen share
const publisher = OT.initPublisher(null, {
  videoSource: 'screen',
  publishAudio: true
});
session.publish(publisher);

// Line ~42: Stop screen share
session.unpublish(screenPublisher);
```

**Pro Tip:** Screen sharing is just a publisher with different video source!

---

## Slide 8: Finding Chat Implementation
### Real-time messaging

**File:** `frontend/src/Context/SessionProvider.tsx`

**Signal API for Chat:**
```typescript
// Line ~308: Send message
session.signal({
  type: 'chat',
  data: JSON.stringify({ message, sender })
});

// Line ~240: Receive messages
session.on('signal:chat', (event) => {
  const data = JSON.parse(event.data);
  setChatMessages(prev => [...prev, data]);
});
```

**Signals can handle any real-time data: reactions, polls, hand raising**

---

## Slide 9: Finding Backend Session Creation
### Server-side implementation

**File:** `backend/routes/session.ts`

**Session Creation Endpoint:**
```typescript
// Line ~45: GET /api/session/:roomName
const session = await videoService.createSession(roomName);
const token = videoService.generateToken(sessionId);

return { apiKey, sessionId, token };
```

**Security Note:** Tokens are always generated server-side!

**Related Files:**
- `backend/videoService/vonageVideoService.ts` - API wrapper
- `backend/storage/` - Session persistence options

---

## Slide 10: Quick Start Your Project
### From clone to video call in 5 minutes

**Step 1: Clone & Install**
```bash
git clone https://github.com/Vonage/vonage-video-react-app
cd vonage-video-react-app && yarn install
```

**Step 2: Get Vonage Credentials**
- Visit [dashboard.vonage.com](https://dashboard.vonage.com)
- Create Video API application
- Copy credentials to `backend/.env`

**Step 3: Run & Explore**
```bash
yarn dev
# Open http://localhost:5173
```

**You now have a complete video app to customize!**

---

## Slide 11: Key Patterns to Remember
### Production-ready practices

**State Management Pattern:**
- React Context for video state
- Custom hooks for features
- Event-driven updates

**Security Pattern:**
- Server-side token generation
- Room-based access control
- No credentials in frontend

**Feature Pattern:**
- Publisher options for variants
- Signal API for real-time data
- Event handlers for UI updates

**Find examples of each pattern in the codebase!**

---

## Slide 14: Resources & Next Steps
### Continue your journey

**Workshop Resources:**
- 📚 [Full Workshop Docs](../workshop/) - 5+ hours of content
- 🔧 [API Reference](../workshop/reference/api-reference.md)
- 🐛 [Troubleshooting Guide](../workshop/reference/troubleshooting.md)

**Key Files to Study Next:**
1. `SessionProvider.tsx` - Complete video lifecycle
2. `MeetingRoom.tsx` - UI integration
3. `useScreenShare.tsx` - Feature implementation
4. `session.ts` - Backend patterns

**Community:**
- [GitHub Repo](https://github.com/Vonage/vonage-video-react-app) ⭐
- [Developer Portal](https://developer.vonage.com)
- [Support](https://developer.vonage.com/support)

**Start building today!** 🚀

---

## Quick Reference: Where to Find Everything

### Video Features
| Feature | Location | Key Function |
|---------|----------|--------------|
| Session Management | `Context/SessionProvider.tsx` | `initializeSession()` |
| Publisher Control | `Context/PublisherProvider.tsx` | `toggleAudio/Video()` |
| Screen Sharing | `hooks/useScreenShare.tsx` | `startScreenShare()` |
| Chat | `Context/SessionProvider.tsx` | `session.signal()` |
| Background Blur | `Context/PublisherProvider.tsx` | `setVideoFilter()` |
| Device Selection | `hooks/useDevices.tsx` | `getDevices()` |

### Backend Implementation
| Feature | Location | Purpose |
|---------|----------|---------|
| Session Creation | `routes/session.ts` | Create rooms |
| Token Generation | `videoService/` | Security |
| Storage | `storage/` | Persistence |

---

## Speaker Notes

### Timing (15 minutes)
- **Intro & Concepts** (2 min) - Slides 1-2
- **Architecture Diagrams** (2 min) - Slides 3-5
- **Live Demo** (1 min) - Slide 4
- **Code Exploration** (7 min) - Slides 6-11
- **Getting Started** (2 min) - Slides 12-13
- **Wrap-up** (1 min) - Slide 14

### Key Messages
1. Video API is simple: 3 concepts, minimal code
2. This repository has everything you need
3. Each feature is self-contained and easy to find
4. You can start building immediately

### Demo Tips
- Have project already running
- Use two browser tabs for multi-participant demo
- Show the actual code files mentioned
- Point out line numbers when possible