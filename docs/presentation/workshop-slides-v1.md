# Getting Started with Vonage API SDKs
## 15-Minute Workshop

---

## Slide 1: Title
# Getting Started with Vonage API SDKs
### Build video apps in minutes, not months

Workshop Repository: github.com/Vonage/vonage-video-react-app

---

## Slide 2: What You'll Learn
### 15 minutes to video mastery

• Video API core concepts
• Where to find implementations
• Real code walkthrough
• Quick-start resources

**This repository = Complete video app**
• Multi-participant calls
• Screen sharing & chat
• Production patterns

---

## Slide 3: Three Simple Concepts
### Everything you need

**Session** = The video room
**Publisher** = Your outgoing stream
**Subscriber** = Incoming streams

```
Create Session → Connect → Publish → Subscribe
```

**Find in code:**
• SessionProvider.tsx → Sessions
• PublisherProvider.tsx → Publishers
• session.subscribe() → Subscribers

---

## Slide 4: How It Works
### Visual Architecture

```
┌─────────────────────────────────────┐
│           SESSION (Room)            │
│                                     │
│  ┌─────────┐      ┌─────────┐     │
│  │PUBLISHER│      │PUBLISHER│     │
│  │  (You)  │      │ (Them)  │     │
│  └────┬────┘      └────┬────┘     │
│       │                 │          │
│       ▼                 ▼          │
│     Publish           Publish      │
│       │                 │          │
│       └────────┬────────┘          │
│                ▼                   │
│        Session Routes              │
│                │                   │
│     ┌──────────┴──────────┐       │
│     ▼                     ▼       │
│  ┌──────────┐      ┌──────────┐  │
│  │SUBSCRIBER│      │SUBSCRIBER│  │
│  │ (Them)   │      │  (You)   │  │
│  └──────────┘      └──────────┘  │
└─────────────────────────────────────┘
```

---

## Slide 5: Code Flow
### Implementation path

```
MeetingRoom.tsx
    ↓
SessionProvider.tsx
    1. GET /api/session/:room
    2. OT.initSession()
    3. session.connect()
    4. Handle events
    
PublisherProvider.tsx
    1. OT.initPublisher()
    2. session.publish()
    3. Control stream
```

---

## Slide 6: Quick Demo
### See it working

```bash
yarn dev
```

**Observe:**
• Instant connection
• Multiple participants
• Real-time features

Open localhost:5173 in two tabs

---

## Slide 7: Project Map
### Where to find everything

```
frontend/
├── Context/
│   ├── SessionProvider.tsx    ← Core
│   └── PublisherProvider.tsx  ← Controls
├── pages/
│   └── MeetingRoom.tsx       ← Main UI
└── hooks/
    └── useScreenShare.tsx    ← Features

backend/
└── routes/session.ts         ← API
```

---

## Slide 8: Session Code
### SessionProvider.tsx

**Initialize (line ~168):**
```typescript
const newSession = OT.initSession(
  apiKey, sessionId
);
newSession.connect(token);
```

**Subscribe (line ~112):**
```typescript
session.on('streamCreated', (event) => {
  session.subscribe(event.stream);
});
```

---

## Slide 9: Publisher Code
### PublisherProvider.tsx

**Controls (lines 51-89):**
```typescript
// Audio
publisher.publishAudio(!audioEnabled);

// Video
publisher.publishVideo(!videoEnabled);

// Background blur
publisher.setVideoFilter({
  type: 'backgroundBlur',
  blurStrength: 'high'
});
```

---

## Slide 10: Screen Sharing
### useScreenShare.tsx

**Implementation (line ~18):**
```typescript
// Start
const publisher = OT.initPublisher(null, {
  videoSource: 'screen'
});
session.publish(publisher);

// Stop
session.unpublish(screenPublisher);
```

One parameter change!

---

## Slide 11: Real-time Chat
### Signal API

**Send (SessionProvider ~308):**
```typescript
session.signal({
  type: 'chat',
  data: JSON.stringify({
    message: text,
    sender: name
  })
});
```

**Receive (line ~240):**
```typescript
session.on('signal:chat', (event) => {
  const data = JSON.parse(event.data);
  addMessage(data);
});
```

---

## Slide 12: Backend
### Server-side magic

**routes/session.ts (~45):**
```typescript
GET /api/session/:roomName

// Creates session
const session = await 
  videoService.createSession();
  
// Generates token
const token = 
  videoService.generateToken();
  
return { apiKey, sessionId, token };
```

Tokens = Server-side only!

---

## Slide 13: Get Started Now
### 5 minutes to video

**1. Clone & Install**
```bash
git clone https://github.com/
  Vonage/vonage-video-react-app
cd vonage-video-react-app
yarn install
```

**2. Get Credentials**
dashboard.vonage.com → Video API

**3. Configure**
```bash
# backend/.env
VONAGE_APP_ID=xxx
VONAGE_PRIVATE_KEY=xxx
```

**4. Run**
```bash
yarn dev
```

---

## Slide 14: Key Takeaways
### Remember this

**Patterns:**
• React Context for state
• Server-side tokens
• Event-driven updates

**Key Files:**
• SessionProvider.tsx
• PublisherProvider.tsx
• routes/session.ts

**Next Steps:**
• Explore the codebase
• Build your feature
• Join the community

---

## Slide 15: Common Troubleshooting
### Quick fixes

**Proxy/Corporate Network Fix:**
```javascript
// MeetingRoom.tsx line 35
if (window.OT) {
  window.OT.setProxyUrl(
    'https://turn.vonage.com/webrtc-proxy'
  );
}
```

**Environment Variables Fix:**
```javascript
// backend/server.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ 
  path: path.join(__dirname, '.env') 
});
```
Ensures .env loads from correct path

**Quick Checks:**
• Browser permissions allowed?
• Credentials in backend/.env?
• Using Chrome/Firefox?

---

## Slide 16: Resources
### Continue learning

**Documentation:**
developer.vonage.com

**This Workshop:**
github.com/Vonage/
vonage-video-react-app

**Support:**
• GitHub Issues
• Developer Forums
• Discord Community

**Start building today!** 🚀