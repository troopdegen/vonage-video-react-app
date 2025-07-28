# Getting Started with Vonage API SDKs
## Video API Workshop Presentation

---

## Slide 1: Welcome & Workshop Overview
### Getting Started with Vonage API SDKs

**Today's Learning Journey:**
- From zero knowledge to working video application
- Hands-on coding with real project structure
- Understanding Video API fundamentals
- Building production-ready features

**Workshop Format:**
- 3 hours hands-on learning
- Live coding exercises
- Real project exploration
- Q&A throughout

**Your Instructor:** [Your Name] - Developer Relations

---

## Slide 2: What We'll Build Today
### From This to This

**Starting Point:** Empty React project
**Ending Point:** Full-featured video conferencing app

**Features We'll Implement:**
- ✅ Multi-participant video calls
- ✅ Audio/video controls (mute, camera on/off)
- ✅ Screen sharing
- ✅ Real-time chat
- ✅ Background blur effects
- ✅ Device selection

**Visual:** Before/after screenshots of the application

---

## Slide 3: Workshop Prerequisites
### What you need to succeed

**Technical Requirements:**
- Node.js 18+ installed
- Code editor (VS Code recommended)
- Git for cloning repository
- Modern browser (Chrome/Firefox/Edge)

**Knowledge Assumptions:**
- Basic React/JavaScript experience
- Understanding of npm/yarn
- Familiarity with REST APIs
- Basic understanding of WebRTC concepts (helpful but not required)

**Account Setup:**
- Vonage Developer Account (free)
- Workshop repository cloned locally

---

## Slide 4: Vonage Platform Overview
### More than just video

**Vonage Communication APIs:**
- 📹 **Video API** - Real-time video/audio communication
- 💬 **Messages API** - SMS, WhatsApp, social messaging
- 📞 **Voice API** - PSTN calling and conferencing
- 🔐 **Verify API** - 2FA and identity verification
- 🤖 **AI APIs** - Conversational AI and automation

**Why This Matters:**
- Single platform for all communication needs
- Consistent developer experience across APIs
- Easy integration between services
- Global infrastructure and reliability

---

## Slide 5: Video API Core Concepts
### The foundation you need to understand

**Three Key Objects:**
1. **Session** - The "room" where participants meet
2. **Publisher** - Your outgoing video/audio stream
3. **Subscriber** - Incoming streams from other participants

**Basic Flow:**
```
Create Session → Connect to Session → Publish Stream → Subscribe to Others
```

**Event-Driven Architecture:**
- Connection events (connected, disconnected)
- Stream events (created, destroyed)
- Signal events (custom data transmission)

**Visual:** Architecture diagram showing Session containing Publishers and Subscribers

---

## Slide 6: Project Structure Walkthrough
### Understanding our codebase

**Repository Structure:**
```
vonage-video-react-app/
├── frontend/          # React application
├── backend/           # Express.js server
├── integration-tests/ # E2E testing
└── docs/             # Workshop documentation
```

**Frontend Key Directories:**
- `src/Context/` - React Context for state management
- `src/pages/` - Main page components
- `src/components/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/api/` - Backend communication

**We'll focus on understanding how video functionality is implemented**

---

## Slide 7: Environment Setup
### Getting your development environment ready

**Step 1: Clone and Install**
```bash
git clone https://github.com/Vonage/vonage-video-react-app
cd vonage-video-react-app
yarn install
```

**Step 2: Vonage Account Setup**
1. Visit [dashboard.vonage.com](https://dashboard.vonage.com)
2. Create free developer account
3. Create new Video API application
4. Copy API Key and Private Key

**Step 3: Environment Configuration**
```bash
# Create backend/.env file
VONAGE_APP_ID=your_app_id
VONAGE_PRIVATE_KEY=your_private_key
```

**Step 4: Test Installation**
```bash
yarn dev  # Starts both frontend and backend
```

---

## Slide 8: Live Demo - First Video Call
### Let's see it working

**What We'll Demonstrate:**
1. Start the development server
2. Open application in browser
3. Join a meeting room
4. See local video stream
5. Open second browser tab
6. Join same room
7. See multi-participant video call

**Key Observation Points:**
- How quickly the connection establishes
- Automatic audio/video quality adaptation
- Cross-browser compatibility
- No additional setup required

**This is what we're building toward in our hands-on exercises**

---

## Slide 9: Exercise 1 - Understanding Sessions
### Exploring the SessionProvider

**Learning Objective:** Understand how video sessions are managed

**File to Explore:** `frontend/src/Context/SessionProvider.tsx`

**Key Concepts We'll Discover:**
- How sessions are initialized
- Connection management
- Subscriber handling
- Event listeners setup

**Hands-On Activity:**
1. Open SessionProvider.tsx
2. Find the `initializeSession` function
3. Identify the three main steps: init → connect → publish
4. Understand event handling patterns

**Questions to Answer:**
- Where does the session configuration come from?
- How are new participants handled?
- What happens when someone leaves?

---

## Slide 10: Exercise 2 - Publisher Management
### Your outgoing video stream

**Learning Objective:** Control your local video/audio stream

**File to Explore:** `frontend/src/Context/PublisherProvider.tsx`

**Core Publisher Operations:**
```typescript
// Initialize publisher
const publisher = OT.initPublisher(elementRef.current, options);

// Control audio
publisher.publishAudio(false); // Mute
publisher.publishAudio(true);  // Unmute

// Control video
publisher.publishVideo(false); // Camera off
publisher.publishVideo(true);  // Camera on
```

**Hands-On Activity:**
1. Find publisher initialization code
2. Locate audio/video control functions
3. Test mute/unmute functionality
4. Experiment with publisher options

---

## Slide 11: Exercise 3 - Adding Screen Sharing
### Implementing collaboration features

**Learning Objective:** Add screen sharing capability

**Implementation Pattern:**
```typescript
const toggleScreenShare = useCallback(async () => {
  if (isScreenSharing) {
    // Stop screen sharing
    session?.unpublish(screenPublisher);
    setScreenPublisher(null);
  } else {
    // Start screen sharing
    const publisher = OT.initPublisher(null, {
      videoSource: 'screen',
      publishAudio: true,
      publishVideo: true
    });
    session?.publish(publisher);
    setScreenPublisher(publisher);
  }
}, [session, isScreenSharing, screenPublisher]);
```

**Hands-On Activity:**
1. Locate screen sharing implementation
2. Understand the difference between camera and screen publishers
3. Test screen sharing functionality
4. Observe how it appears to other participants

---

## Slide 12: Exercise 4 - Real-Time Chat
### Beyond video: text communication

**Learning Objective:** Implement real-time messaging using signals

**Signal API Pattern:**
```typescript
// Send message
const sendMessage = (text: string) => {
  session?.signal({
    type: 'chat',
    data: JSON.stringify({
      message: text,
      sender: 'User Name',
      timestamp: Date.now()
    })
  });
};

// Receive messages
session?.on('signal:chat', (event) => {
  const data = JSON.parse(event.data);
  setMessages(prev => [...prev, data]);
});
```

**Hands-On Activity:**
1. Find chat implementation in the codebase
2. Send test messages between browser tabs
3. Understand signal event patterns
4. Explore other signal use cases (reactions, polls)

---

## Slide 13: Exercise 5 - Device Management
### Handling cameras and microphones

**Learning Objective:** Allow users to select their preferred devices

**Device Selection Pattern:**
```typescript
// Get available devices
OT.getDevices((error, devices) => {
  const videoDevices = devices.filter(d => d.kind === 'videoInput');
  const audioDevices = devices.filter(d => d.kind === 'audioInput');
  setDevices({ video: videoDevices, audio: audioDevices });
});

// Change device
publisher.setVideoSource(newDeviceId);
publisher.setAudioSource(newDeviceId);
```

**Hands-On Activity:**
1. Explore device management implementation
2. Test switching between cameras (if available)
3. Test microphone selection
4. Handle device permission scenarios

---

## Slide 14: Exercise 6 - Background Effects
### AI-powered video enhancement

**Learning Objective:** Add professional video effects

**Background Blur Implementation:**
```typescript
const toggleBackgroundBlur = async () => {
  if (isBlurEnabled) {
    await publisher.clearVideoFilter();
    setIsBlurEnabled(false);
  } else {
    await publisher.setVideoFilter({
      type: 'backgroundBlur',
      blurStrength: 'high'
    });
    setIsBlurEnabled(true);
  }
};
```

**Available Effects:**
- Background blur (low, medium, high)
- Virtual backgrounds
- Noise suppression

**Hands-On Activity:**
1. Implement background blur toggle
2. Test different blur strength levels
3. Observe performance impact
4. Explore virtual background options

---

## Slide 15: Understanding the Backend
### Server-side session management

**Learning Objective:** Understand how sessions are created and managed

**Key Backend Files:**
- `backend/routes/session.ts` - Session creation endpoints
- `backend/videoService/` - Video service abstraction
- `backend/storage/` - Session storage implementations

**Session Creation Flow:**
```typescript
// Client requests session
GET /api/session/room-name

// Server creates session
const session = await videoService.createSession();
const token = await videoService.generateToken(sessionId);

// Return credentials to client
return { apiKey, sessionId, token };
```

**Hands-On Activity:**
1. Explore session creation endpoint
2. Understand token generation
3. Review security considerations
4. Test API endpoints directly

---

## Slide 16: Production Considerations
### Moving from development to production

**Security Best Practices:**
- Never expose private keys in frontend code
- Implement proper authentication
- Use server-side token generation
- Validate user permissions

**Performance Optimization:**
- Implement quality adaptation
- Handle network interruptions gracefully
- Optimize for mobile devices
- Monitor connection quality

**Scalability Planning:**
- Session storage strategy
- Load balancing considerations
- Global deployment options
- Monitoring and analytics

**Deployment Options:**
- Traditional cloud hosting
- Vonage Cloud Runtime (VCR)
- Containerized deployments

---

## Slide 17: Advanced Features Deep Dive
### Going beyond the basics

**Recording Capabilities:**
- Individual stream recording
- Composed session recording
- Cloud storage integration
- Playback and download options

**Advanced Signaling:**
- Custom data channels
- Moderator controls
- Participant management
- Real-time polling and Q&A

**Integration Opportunities:**
- SMS meeting invitations
- Phone verification for security
- Voice fallback options
- Multi-platform messaging

**AI and Analytics:**
- Sentiment analysis
- Speech-to-text transcription
- Real-time language translation
- Usage analytics and insights

---

## Slide 18: Troubleshooting Common Issues
### When things don't work as expected

**Connection Problems:**
- Firewall and NAT traversal
- Network quality adaptation
- Browser compatibility issues
- Device permission handling

**Audio/Video Issues:**
- Device detection problems
- Echo and feedback management
- Quality optimization
- Bandwidth management

**Debugging Tools:**
- Browser developer console
- Network inspection
- Vonage dashboard analytics
- Client-side logging strategies

**Getting Help:**
- Vonage developer documentation
- Community forums and support
- GitHub issues and examples
- Direct technical support channels

---

## Slide 19: Testing and Quality Assurance
### Ensuring reliable video experiences

**Testing Strategies:**
- Unit testing for business logic
- Integration testing with real video streams
- Cross-browser compatibility testing
- Network condition simulation

**Automated Testing:**
- Playwright for E2E scenarios
- Visual regression testing
- Performance monitoring
- Load testing for scale

**Manual Testing Checklist:**
- Multi-participant scenarios
- Device switching during calls
- Network interruption recovery
- Mobile and desktop compatibility

**Quality Metrics:**
- Connection success rates
- Audio/video quality scores
- User experience metrics
- Performance benchmarks

---

## Slide 20: Workshop Recap & Next Steps
### What we've accomplished

**Skills Developed Today:**
- ✅ Video API fundamental concepts
- ✅ React Context patterns for video state
- ✅ Publisher and Subscriber management
- ✅ Real-time communication with signals
- ✅ Device management and user controls
- ✅ Background effects and AI features
- ✅ Backend session management
- ✅ Production deployment considerations

**Your Next Learning Path:**
1. **Immediate:** Complete additional exercises in workshop docs
2. **Short-term:** Build your own video application
3. **Medium-term:** Explore multi-API integrations
4. **Long-term:** Contribute to open source projects

**Resources for Continued Learning:**
- [Complete Workshop Documentation](../workshop/)
- [Vonage Developer Portal](https://developer.vonage.com)
- [Community Forums](https://developer.vonage.com/community)
- [GitHub Examples](https://github.com/vonage-community)

---

## Slide 21: Q&A and Hands-On Help
### Let's solve problems together

**Common Questions:**
- How do I customize the UI?
- Can I integrate with my existing authentication?
- What are the scaling limits?
- How do I handle mobile browsers?
- What about data privacy and compliance?

**Hands-On Support:**
- Work through any setup issues
- Debug specific implementation problems
- Discuss architecture decisions
- Plan your next video project

**Stay Connected:**
- Workshop feedback and suggestions
- Follow-up resources and updates
- Community engagement opportunities
- Direct support channels

**Thank you for participating!**
**Now go build something amazing with video! 🚀**

---

## Speaker Notes & Delivery Tips

### Timing Guidelines
- **Slides 1-6:** Introduction and setup (30 minutes)
- **Slides 7-8:** Environment setup and demo (20 minutes)
- **Slides 9-16:** Hands-on exercises (90 minutes)
- **Slides 17-21:** Advanced topics and wrap-up (40 minutes)

### Interactive Elements
- Encourage questions throughout
- Have participants code along during exercises
- Use breakout sessions for complex exercises
- Share screens frequently for live coding

### Backup Plans
- Pre-recorded demos if live coding fails
- Prepared environment for quick recovery
- Alternative exercises if time runs short
- Additional resources for advanced participants

### Success Metrics
- All participants have working video call by end
- Understanding of core concepts demonstrated
- Confidence to continue learning independently
- Positive feedback on hands-on approach