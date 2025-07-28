# Getting Started with Vonage Video API Workshop

## Welcome to Video Development Made Simple

This workshop will guide you through building production-ready video conferencing applications using the Vonage Video API and this React reference implementation. By the end of this session, you'll have a complete understanding of how to integrate video calling into your applications with just a few lines of code.

## What You'll Build

- A fully functional video conferencing application
- Multi-participant video calls (up to 25 participants)
- Screen sharing capabilities
- Real-time chat functionality
- Recording and playback features
- Custom UI components and layouts

## Prerequisites

Before we begin, ensure you have:

- **Node.js 22+** installed ([Download here](https://nodejs.org/))
- **Yarn package manager** ([Installation guide](https://yarnpkg.com/getting-started/install))
- **Git** for version control
- A **Vonage Developer Account** (free at [dashboard.vonage.com](https://dashboard.vonage.com/))
- Basic knowledge of **React** and **TypeScript**

## Workshop Repository Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Vonage/vonage-video-react-app.git
cd vonage-video-react-app
```

### 2. Install Dependencies

```bash
yarn install
```

This will install all dependencies for both frontend and backend components of the application.

## Vonage Account Configuration

### 1. Create Your Vonage Application

1. Visit the [Vonage API Dashboard](https://dashboard.vonage.com/applications)
2. Click **"Create New Application"**
3. Configure your application:
   - **Name**: Choose a descriptive name (e.g., "Video Workshop App")
   - **Capabilities**: Enable **Video** capabilities
   - **Generate Key Pair**: Download the private key file
   - **Note your Application ID**: You'll need this for configuration

### 2. Environment Configuration

Create your environment files:

```bash
# Copy the example environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your Vonage credentials:

```ini
# Vonage Video API Configuration
VONAGE_APP_ID=your_application_id_here
VONAGE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key_content_here
-----END PRIVATE KEY-----"

# Optional: If using legacy OpenTok
# VIDEO_SERVICE_PROVIDER=opentok
# OT_API_KEY=your_opentok_api_key
# OT_API_SECRET=your_opentok_secret
```

## Your First Video Call in 30 Seconds

### Start the Development Server

```bash
yarn dev
```

This command starts both the backend server (port 3345) and frontend development server (port 5173).

### Access Your Application

Open your browser to [http://localhost:5173](http://localhost:5173)

### Create Your First Meeting

1. **Enter a Room Name**: Type any room name (e.g., "workshop-room")
2. **Click "Create Room"**: This generates a new video session
3. **Set Your Display Name**: Enter your name in the waiting room
4. **Test Your Devices**: Preview your camera and microphone
5. **Join the Meeting**: Click "Join Meeting"

🎉 **Congratulations!** You now have a working video conferencing application.

### Test Multi-Participant Features

Open a second browser tab (or incognito window) and join the same room name to simulate multiple participants.

## Understanding What Just Happened

### Architecture Overview

Your application consists of three main components:

1. **Frontend (React + TypeScript)**: User interface and video handling
2. **Backend (Express.js)**: Session management and API authentication  
3. **Vonage Video API**: Global video infrastructure

### Key Code Components

#### Session Creation (Backend)
```typescript
// backend/routes/session.ts
const session = await videoService.createSession();
const token = videoService.generateToken(session.id);
```

#### Video Integration (Frontend)
```typescript
// frontend/src/Context/SessionProvider/session.tsx
import { Publisher, Session } from '@vonage/client-sdk-video';

// Connect to video session
const session = OT.initSession(apiKey, sessionId);
session.connect(token);
```

#### React Hooks Pattern
```typescript
// Custom hooks make video integration simple
const { connected, subscriberWrappers } = useSession();
const { publisher, startPublishing } = usePublisher();
```

## Development Workflow

### Key Commands

```bash
# Start full development environment
yarn dev

# Run tests
yarn test

# Build for production
yarn build

# Start production server
yarn start

# Code quality checks
yarn lint
yarn ts-check
```

### Project Structure

```
vonage-video-react-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── Context/         # React context providers
│   │   ├── components/      # Reusable UI components  
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Main application pages
│   │   └── utils/          # Utility functions
├── backend/                 # Express.js server
│   ├── routes/             # API endpoints
│   ├── videoService/       # Video service abstraction
│   └── storage/            # Session storage
└── integration-tests/       # End-to-end tests
```

## Testing Your Setup

### Device Testing

The application includes built-in device testing:

1. **Camera Preview**: View your video feed before joining
2. **Microphone Test**: Check audio input levels
3. **Speaker Test**: Verify audio output
4. **Network Quality**: Monitor connection status

### Feature Verification

Test these core features:

- ✅ **Video Publishing**: Your video appears to other participants
- ✅ **Video Subscribing**: You can see other participants
- ✅ **Audio Communication**: Clear two-way audio
- ✅ **Screen Sharing**: Share your screen content
- ✅ **Chat Messages**: Send and receive text messages
- ✅ **Recording**: Start and stop session recording

## Multi-Device Testing (Optional)

To test across multiple devices on your local network:

### 1. Install ngrok

```bash
# Install ngrok for public tunneling
npm install -g ngrok

# Or visit https://ngrok.com/ for installation
```

### 2. Create Public Tunnel

```bash
yarn forward:frontend
```

### 3. Configure Mobile Access

Add the ngrok domain to `frontend/.env`:

```ini
VITE_TUNNEL_DOMAIN=your-ngrok-domain.ngrok.io
```

### 4. Test Across Devices

Use the ngrok URL to access your application from mobile devices, tablets, or other computers on different networks.

## What's Next?

Now that you have a working video application, you're ready to explore:

- 📚 **[Core Concepts](./02-core-concepts.md)**: Understanding the Video API fundamentals
- 🛠️ **[Hands-On Tutorials](./03-tutorials/)**: Building specific features step-by-step
- ⚡ **[Advanced Features](./04-advanced-features.md)**: Background blur, reactions, and more
- 🔗 **[Integration Patterns](./05-integration-patterns.md)**: Combining with other Vonage APIs

## Troubleshooting Quick Fixes

### Common Issues

**No Video Appearing:**
- Check browser permissions for camera/microphone
- Verify your `.env` file configuration
- Ensure you're using HTTPS in production

**Connection Failures:**
- Confirm your Vonage Application ID and private key
- Check firewall settings for WebRTC ports
- Verify your network allows UDP traffic

**Build Errors:**
- Clear node modules: `rm -rf node_modules && yarn install`
- Check Node.js version: `node --version` (should be 22+)
- Verify all environment variables are set

### Getting Help

- 📖 **Documentation**: [developer.vonage.com/video](https://developer.vonage.com/en/video/overview)
- 💬 **Community**: [Vonage Developer Community](https://developer.vonage.com/community)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Vonage/vonage-video-react-app/issues)
- 📧 **Support**: [support@api.vonage.com](mailto:support@api.vonage.com)

---

**Ready to dive deeper?** Continue to [Core Concepts](./02-core-concepts.md) to understand the fundamental building blocks of video applications.