# Tutorial: Build Your First Video Call

## Learning Objectives

By the end of this tutorial, you will:
- Create a minimal video calling application from scratch
- Understand the publisher/subscriber pattern
- Handle session connection and disconnection
- Implement basic error handling and user feedback

**Duration:** 30 minutes  
**Difficulty:** Beginner  
**Prerequisites:** Completed [Getting Started](../01-getting-started.md) and [Core Concepts](../02-core-concepts.md)

## Overview

While this repository provides a complete video conferencing application, this tutorial will guide you through building a simplified version to understand the core mechanics. You'll create a basic video call component that demonstrates the essential Video API patterns.

## Step 1: Understanding the Foundation

### Examine the Repository Structure

First, let's explore how the existing application handles video calls:

```typescript
// frontend/src/Context/SessionProvider/session.tsx
// This file manages the session state and connection logic

// Key imports for video functionality
import { Connection, Publisher, Stream } from '@vonage/client-sdk-video';
import VonageVideoClient from '../../utils/VonageVideoClient';
```

### Core Architecture Pattern

The repository uses this pattern:
1. **Context Provider**: Manages global session state
2. **Custom Hooks**: Abstract video operations 
3. **Components**: Render video elements and UI
4. **Backend API**: Handles authentication and session creation

## Step 2: Create a Minimal Video Component

Let's build a simplified video call component to understand the fundamentals:

### Create the Component File

Create a new file: `frontend/src/components/BasicVideoCall/BasicVideoCall.tsx`

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Box, Typography } from '@mui/joy';

// Import Video API types and client
import { Publisher, Session, Stream, Subscriber } from '@vonage/client-sdk-video';

interface Credentials {
  apiKey: string;
  sessionId: string;
  token: string;
}

export default function BasicVideoCall() {
  // State management
  const [session, setSession] = useState<Session | null>(null);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for video elements
  const publisherRef = useRef<HTMLDivElement>(null);
  const subscriberRefs = useRef<{ [streamId: string]: HTMLDivElement | null }>({});

  // Connect to a video session
  const connectToSession = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch credentials from your backend
      const response = await fetch('/api/session/demo-room');
      if (!response.ok) throw new Error('Failed to get session credentials');
      
      const credentials: Credentials = await response.json();
      
      // Initialize session
      const OT = (window as any).OT; // Video API is loaded globally
      const newSession = OT.initSession(credentials.apiKey, credentials.sessionId);
      
      // Set up event listeners before connecting
      newSession.on('streamCreated', handleStreamCreated);
      newSession.on('streamDestroyed', handleStreamDestroyed);
      newSession.on('sessionConnected', handleSessionConnected);
      newSession.on('sessionDisconnected', handleSessionDisconnected);
      
      // Connect to session
      newSession.connect(credentials.token, (connectError: any) => {
        if (connectError) {
          setError(`Connection failed: ${connectError.message}`);
        } else {
          setSession(newSession);
          setConnected(true);
        }
      });
      
    } catch (err) {
      setError(`Setup failed: ${(err as Error).message}`);
    }
  }, []);

  // Handle new participant joining
  const handleStreamCreated = useCallback((event: any) => {
    const stream: Stream = event.stream;
    
    if (session) {
      // Subscribe to the new participant's stream
      const subscriber = session.subscribe(
        stream,
        undefined, // We'll attach the element manually
        {
          subscribeToAudio: true,
          subscribeToVideo: true,
          preferredResolution: 'auto'
        },
        (subscribeError: any) => {
          if (subscribeError) {
            setError(`Subscribe failed: ${subscribeError.message}`);
          } else {
            setSubscribers(prev => [...prev, subscriber]);
          }
        }
      );
    }
  }, [session]);

  // Handle participant leaving
  const handleStreamDestroyed = useCallback((event: any) => {
    const stream: Stream = event.stream;
    setSubscribers(prev => 
      prev.filter(sub => sub.stream.streamId !== stream.streamId)
    );
  }, []);

  // Session connected successfully
  const handleSessionConnected = useCallback(() => {
    console.log('Session connected successfully');
    startPublishing();
  }, []);

  // Session disconnected
  const handleSessionDisconnected = useCallback(() => {
    setConnected(false);
    setPublisher(null);
    setSubscribers([]);
    setSession(null);
  }, []);

  // Start publishing your own video
  const startPublishing = useCallback(() => {
    if (session && publisherRef.current) {
      const OT = (window as any).OT;
      
      const newPublisher = OT.initPublisher(
        publisherRef.current,
        {
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'append',
          width: '100%',
          height: '100%'
        },
        (publishError: any) => {
          if (publishError) {
            setError(`Publishing failed: ${publishError.message}`);
          } else {
            // Publish to session
            session.publish(newPublisher, (pubError: any) => {
              if (pubError) {
                setError(`Publish to session failed: ${pubError.message}`);
              } else {
                setPublisher(newPublisher);
              }
            });
          }
        }
      );
    }
  }, [session]);

  // Disconnect from session
  const disconnect = useCallback(() => {
    if (session) {
      session.disconnect();
    }
  }, [session]);

  // Attach subscriber elements when subscribers change
  useEffect(() => {
    subscribers.forEach(subscriber => {
      const streamId = subscriber.stream.streamId;
      const element = subscriberRefs.current[streamId];
      
      if (element && !element.hasChildNodes()) {
        subscriber.addVideoElement(element);
      }
    });
  }, [subscribers]);

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography level="h2" sx={{ mb: 3 }}>
        Basic Video Call Demo
      </Typography>

      {/* Connection Controls */}
      <Box sx={{ mb: 3 }}>
        {!connected ? (
          <Button 
            onClick={connectToSession}
            disabled={!!error}
            color="primary"
            size="lg"
          >
            Join Video Call
          </Button>
        ) : (
          <Button 
            onClick={disconnect}
            color="danger"
            size="lg"
          >
            Leave Call
          </Button>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'danger.50', borderRadius: 'sm' }}>
          <Typography color="danger">
            Error: {error}
          </Typography>
        </Box>
      )}

      {/* Connection Status */}
      <Typography sx={{ mb: 3 }}>
        Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </Typography>

      {/* Video Layout */}
      {connected && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {/* Your Video (Publisher) */}
          <Box sx={{ flex: '1 1 300px', minHeight: 240 }}>
            <Typography level="body-sm" sx={{ mb: 1 }}>
              Your Video
            </Typography>
            <Box
              ref={publisherRef}
              sx={{
                width: '100%',
                height: 240,
                bgcolor: 'neutral.100',
                borderRadius: 'sm',
                border: '2px solid',
                borderColor: 'primary.300'
              }}
            />
          </Box>

          {/* Remote Participants (Subscribers) */}
          {subscribers.map(subscriber => (
            <Box key={subscriber.stream.streamId} sx={{ flex: '1 1 300px', minHeight: 240 }}>
              <Typography level="body-sm" sx={{ mb: 1 }}>
                Participant ({subscriber.stream.name || 'Guest'})
              </Typography>
              <Box
                ref={el => {
                  subscriberRefs.current[subscriber.stream.streamId] = el;
                }}
                sx={{
                  width: '100%',
                  height: 240,
                  bgcolor: 'neutral.100',
                  borderRadius: 'sm',
                  border: '2px solid',
                  borderColor: 'success.300'
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Instructions */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'neutral.50', borderRadius: 'sm' }}>
        <Typography level="body-sm">
          <strong>How to test:</strong>
          <br />
          1. Click "Join Video Call" to connect
          <br />
          2. Allow camera and microphone permissions
          <br />
          3. Open another browser tab and join the same call to see multiple participants
          <br />
          4. Click "Leave Call" to disconnect
        </Typography>
      </Box>
    </Box>
  );
}
```

### Create the Component Index

Create `frontend/src/components/BasicVideoCall/index.tsx`:

```typescript
export { default } from './BasicVideoCall';
```

## Step 3: Add the Demo Route

### Update the Router

Add the new component to your application by modifying `frontend/src/App.tsx`:

```typescript
// Add this import with the other imports
import BasicVideoCall from './components/BasicVideoCall';

// Add this route inside your Routes component
<Route path="/demo" element={<BasicVideoCall />} />
```

### Access Your Demo

Navigate to `http://localhost:5173/demo` to see your basic video call component.

## Step 4: Understand the Code Flow

### Connection Sequence

1. **User clicks "Join Video Call"**
   ```typescript
   connectToSession() // Triggered
   ```

2. **Fetch credentials from backend**
   ```typescript
   const credentials = await fetch('/api/session/demo-room');
   ```

3. **Initialize session**
   ```typescript
   const newSession = OT.initSession(apiKey, sessionId);
   ```

4. **Set up event listeners**
   ```typescript
   newSession.on('streamCreated', handleStreamCreated);
   // ... other events
   ```

5. **Connect with token**
   ```typescript
   newSession.connect(token, callback);
   ```

6. **Start publishing**
   ```typescript
   startPublishing() // Called after successful connection
   ```

### Event Handling Pattern

The Video API uses an event-driven architecture:

```typescript
// New participant joins
session.on('streamCreated', (event) => {
  const subscriber = session.subscribe(event.stream);
  // Add to UI
});

// Participant leaves
session.on('streamDestroyed', (event) => {
  // Remove from UI
});
```

## Step 5: Testing Your Implementation

### Basic Functionality Test

1. **Start your development server:**
   ```bash
   yarn dev
   ```

2. **Navigate to the demo:**
   Go to `http://localhost:5173/demo`

3. **Join the call:**
   - Click "Join Video Call"
   - Allow camera/microphone permissions
   - Verify your video appears

4. **Test multi-participant:**
   - Open an incognito window
   - Navigate to the same URL
   - Join the call
   - Verify both participants can see each other

### Verify Core Features

✅ **Session Connection**: Status shows "Connected"  
✅ **Video Publishing**: Your video stream appears  
✅ **Video Subscribing**: Remote participant videos appear  
✅ **Audio Communication**: You can hear other participants  
✅ **Clean Disconnection**: Leave call works properly

## Step 6: Understanding vs. Production Code

### What This Demo Shows

- **Core Video API concepts**: Sessions, publishers, subscribers
- **Event-driven architecture**: How video applications respond to changes
- **Basic error handling**: User feedback for common issues
- **Essential UI patterns**: Video display and connection controls

### How the Full Repository Differs

The production repository includes:

- **Context management**: Global state across components
- **Advanced UI**: Waiting rooms, device selectors, participant lists
- **Feature-rich**: Screen sharing, recording, chat, emojis
- **Error recovery**: Automatic reconnection and graceful degradation
- **Performance optimization**: Quality management and bandwidth adaptation
- **Accessibility**: WCAG compliance and keyboard navigation
- **Testing**: Comprehensive test coverage

### Key Differences in Architecture

**Your Demo (Simplified):**
```typescript
// Direct API usage in component
const session = OT.initSession(apiKey, sessionId);
session.connect(token);
```

**Production Repository (Abstracted):**
```typescript
// Abstracted through hooks and context
const { joinRoom, connected, subscribers } = useSession();
const { publisher, startPublishing } = usePublisher();
```

## Step 7: Next Steps and Improvements

### Immediate Enhancements

Try modifying your demo to add:

1. **Audio/Video Controls:**
   ```typescript
   // Add mute/unmute functionality
   publisher.publishAudio(false); // Mute
   publisher.publishVideo(false); // Turn off camera
   ```

2. **Display Participant Names:**
   ```typescript
   // Show participant information
   const participantName = subscriber.stream.name || 'Guest';
   ```

3. **Basic Error Recovery:**
   ```typescript
   // Handle connection errors
   session.on('connectionDestroyed', () => {
     // Attempt reconnection
   });
   ```

### Learning Path

Now that you understand the basics, explore:

- **[Adding Features Tutorial](./adding-features.md)**: Screen sharing, recording, chat
- **[UI Components Tutorial](./ui-components.md)**: Building polished interfaces
- **[Repository Deep Dive](../../../frontend/src/)**: Study the production patterns

## Troubleshooting

### Common Issues

**Video not appearing:**
- Check browser permissions for camera/microphone
- Verify the Video API script is loaded (`window.OT` exists)
- Confirm your `.env` configuration is correct

**Connection failures:**
- Verify your backend is running on port 3345
- Check the browser console for API errors
- Ensure your Vonage credentials are valid

**Subscriber elements empty:**
- Confirm subscribers array is populated
- Check that `addVideoElement()` is called after element is rendered
- Verify the subscriber's video element refs are properly set

### Debugging Tips

1. **Check browser console** for Video API errors
2. **Monitor network tab** for failed API requests
3. **Use Video API events** for detailed connection information:
   ```typescript
   session.on('exception', (event) => {
     console.error('Video API exception:', event);
   });
   ```

## Conclusion

Congratulations! You've built a functional video calling application and understand the core concepts of the Vonage Video API. You've seen how:

- Sessions manage participant connections
- Publishers handle your outgoing media
- Subscribers receive remote participant media
- Events drive the application flow

This foundation prepares you for building more sophisticated video features. The patterns you've learned here scale from simple one-to-one calls to complex multi-participant applications.

**Ready for more?** Continue with [Adding Features](./adding-features.md) to implement screen sharing, recording, and chat functionality.