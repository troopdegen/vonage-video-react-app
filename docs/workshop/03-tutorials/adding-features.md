# Tutorial: Adding Features to Your Video Call

## Learning Objectives

By the end of this tutorial, you will:
- Implement screen sharing functionality
- Add session recording capabilities
- Build real-time chat messaging
- Understand feature integration patterns
- Handle advanced user interactions

**Duration:** 45 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** Completed [Basic Video Call Tutorial](./basic-video-call.md)

## Overview

Now that you understand the basics of video calling, let's enhance your application with the three most commonly requested features: screen sharing, recording, and chat. These features demonstrate how the Video API extends beyond basic audio/video to enable rich collaborative experiences.

## Feature 1: Screen Sharing

Screen sharing allows participants to share their desktop, application windows, or browser tabs with others in the call.

### Step 1: Add Screen Share State

Update your `BasicVideoCall` component to track screen sharing:

```typescript
// Add these state variables to your existing component
const [isScreenSharing, setIsScreenSharing] = useState(false);
const [screenPublisher, setScreenPublisher] = useState<Publisher | null>(null);
const screenPublisherRef = useRef<HTMLDivElement>(null);
```

### Step 2: Implement Screen Share Functions

Add these functions to your component:

```typescript
// Start screen sharing
const startScreenShare = useCallback(async () => {
  if (!session || !screenPublisherRef.current) return;
  
  try {
    const OT = (window as any).OT;
    
    // Create screen share publisher
    const newScreenPublisher = OT.initPublisher(
      screenPublisherRef.current,
      {
        publishAudio: false, // Usually no audio from screen
        publishVideo: true,
        videoSource: 'screen', // This enables screen capture
        resolution: '1280x720',
        frameRate: 15, // Lower frame rate for better performance
        insertMode: 'append',
        width: '100%',
        height: '100%'
      },
      (publishError: any) => {
        if (publishError) {
          setError(`Screen share failed: ${publishError.message}`);
          // User likely denied screen share permission
          if (publishError.name === 'OT_USER_MEDIA_ACCESS_DENIED') {
            setError('Screen sharing permission denied. Please allow screen access and try again.');
          }
        } else {
          // Publish the screen to session
          session.publish(newScreenPublisher, (pubError: any) => {
            if (pubError) {
              setError(`Failed to share screen: ${pubError.message}`);
            } else {
              setScreenPublisher(newScreenPublisher);
              setIsScreenSharing(true);
              
              // Listen for when user stops sharing via browser UI
              newScreenPublisher.on('streamDestroyed', () => {
                stopScreenShare();
              });
            }
          });
        }
      }
    );
  } catch (err) {
    setError(`Screen share error: ${(err as Error).message}`);
  }
}, [session]);

// Stop screen sharing
const stopScreenShare = useCallback(() => {
  if (screenPublisher && session) {
    session.unpublish(screenPublisher);
    setScreenPublisher(null);
    setIsScreenSharing(false);
  }
}, [screenPublisher, session]);

// Toggle screen sharing
const toggleScreenShare = useCallback(() => {
  if (isScreenSharing) {
    stopScreenShare();
  } else {
    startScreenShare();
  }
}, [isScreenSharing, startScreenShare, stopScreenShare]);
```

### Step 3: Add Screen Share UI

Update your component's render section to include screen sharing controls and display:

```typescript
{/* Add this after the connection controls */}
{connected && (
  <Box sx={{ mb: 2 }}>
    <Button
      onClick={toggleScreenShare}
      color={isScreenSharing ? 'danger' : 'primary'}
      variant="outlined"
      disabled={!connected}
    >
      {isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
    </Button>
  </Box>
)}

{/* Add this in your video layout section, after the publisher */}
{isScreenSharing && (
  <Box sx={{ flex: '1 1 100%', minHeight: 360 }}>
    <Typography level="body-sm" sx={{ mb: 1 }}>
      Your Screen Share
    </Typography>
    <Box
      ref={screenPublisherRef}
      sx={{
        width: '100%',
        height: 360,
        bgcolor: 'neutral.100',
        borderRadius: 'sm',
        border: '2px solid',
        borderColor: 'warning.300'
      }}
    />
  </Box>
)}
```

## Feature 2: Session Recording

Recording allows you to capture the entire video session for later playback or compliance purposes.

### Step 1: Add Recording State

Add recording-related state to your component:

```typescript
const [isRecording, setIsRecording] = useState(false);
const [archiveId, setArchiveId] = useState<string | null>(null);
```

### Step 2: Implement Recording Functions

Add these recording functions:

```typescript
// Start recording
const startRecording = useCallback(async () => {
  try {
    const response = await fetch('/api/archive/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: session?.sessionId,
        name: `Recording ${new Date().toLocaleString()}`
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to start recording');
    }

    const data = await response.json();
    setArchiveId(data.archiveId);
    setIsRecording(true);
  } catch (err) {
    setError(`Recording failed: ${(err as Error).message}`);
  }
}, [session]);

// Stop recording
const stopRecording = useCallback(async () => {
  if (!archiveId) return;

  try {
    const response = await fetch(`/api/archive/${archiveId}/stop`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to stop recording');
    }

    setIsRecording(false);
    setArchiveId(null);
  } catch (err) {
    setError(`Stop recording failed: ${(err as Error).message}`);
  }
}, [archiveId]);

// Toggle recording
const toggleRecording = useCallback(() => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}, [isRecording, startRecording, stopRecording]);
```

### Step 3: Add Recording UI

Add recording controls to your interface:

```typescript
{/* Add this with your other controls */}
{connected && (
  <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
    <Button
      onClick={toggleScreenShare}
      color={isScreenSharing ? 'danger' : 'primary'}
      variant="outlined"
    >
      {isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
    </Button>
    
    <Button
      onClick={toggleRecording}
      color={isRecording ? 'danger' : 'success'}
      variant={isRecording ? 'solid' : 'outlined'}
    >
      {isRecording ? '⏹️ Stop Recording' : '🔴 Start Recording'}
    </Button>
  </Box>
)}

{/* Recording status indicator */}
{isRecording && (
  <Box sx={{ mb: 2, p: 1, bgcolor: 'danger.50', borderRadius: 'sm' }}>
    <Typography color="danger" level="body-sm">
      🔴 Recording in progress...
    </Typography>
  </Box>
)}
```

## Feature 3: Real-Time Chat

Chat enables text communication alongside video, essential for meetings and collaboration.

### Step 1: Add Chat State

Add chat-related state to your component:

```typescript
// Chat state
const [messages, setMessages] = useState<Array<{
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}>>([]);
const [newMessage, setNewMessage] = useState('');
const [showChat, setShowChat] = useState(false);
```

### Step 2: Set Up Chat Signaling

Add chat signal handling to your session setup:

```typescript
// Add this in your session event listeners setup
newSession.on('signal:chat', handleChatMessage);

// Add this function to handle incoming chat messages
const handleChatMessage = useCallback((event: any) => {
  const messageData = JSON.parse(event.data);
  const newChatMessage = {
    id: Date.now().toString(),
    text: messageData.text,
    sender: messageData.sender || 'Guest',
    timestamp: new Date(messageData.timestamp)
  };
  
  setMessages(prev => [...prev, newChatMessage]);
}, []);
```

### Step 3: Implement Chat Functions

Add chat messaging functions:

```typescript
// Send chat message
const sendMessage = useCallback(() => {
  if (!session || !newMessage.trim()) return;

  const messageData = {
    text: newMessage.trim(),
    sender: 'You', // In a real app, use actual user name
    timestamp: Date.now()
  };

  // Send signal to all participants
  session.signal({
    type: 'chat',
    data: JSON.stringify(messageData)
  }, (signalError: any) => {
    if (signalError) {
      setError(`Failed to send message: ${signalError.message}`);
    } else {
      // Add to local messages
      const localMessage = {
        id: Date.now().toString(),
        text: messageData.text,
        sender: messageData.sender,
        timestamp: new Date(messageData.timestamp)
      };
      setMessages(prev => [...prev, localMessage]);
      setNewMessage('');
    }
  });
}, [session, newMessage]);

// Handle enter key in chat input
const handleChatKeyPress = useCallback((e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}, [sendMessage]);
```

### Step 4: Create Chat UI

Add a comprehensive chat interface:

```typescript
// Add this to your component's return statement
{/* Chat Toggle Button */}
{connected && (
  <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
    {/* ... existing buttons ... */}
    
    <Button
      onClick={() => setShowChat(!showChat)}
      variant="outlined"
      color="neutral"
    >
      💬 Chat ({messages.length})
    </Button>
  </Box>
)}

{/* Chat Panel */}
{showChat && connected && (
  <Box sx={{ 
    mb: 3, 
    p: 2, 
    border: '1px solid', 
    borderColor: 'neutral.300',
    borderRadius: 'sm',
    maxHeight: 300
  }}>
    <Typography level="title-md" sx={{ mb: 2 }}>
      Chat Messages
    </Typography>
    
    {/* Messages Display */}
    <Box sx={{ 
      height: 200, 
      overflowY: 'auto', 
      mb: 2,
      p: 1,
      bgcolor: 'neutral.50',
      borderRadius: 'sm'
    }}>
      {messages.length === 0 ? (
        <Typography level="body-sm" color="neutral">
          No messages yet. Start the conversation!
        </Typography>
      ) : (
        messages.map(message => (
          <Box key={message.id} sx={{ mb: 1 }}>
            <Typography level="body-xs" color="neutral">
              {message.sender} • {message.timestamp.toLocaleTimeString()}
            </Typography>
            <Typography level="body-sm">
              {message.text}
            </Typography>
          </Box>
        ))
      )}
    </Box>
    
    {/* Message Input */}
    <Box sx={{ display: 'flex', gap: 1 }}>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={handleChatKeyPress}
        placeholder="Type a message..."
        style={{
          flex: 1,
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      />
      <Button
        onClick={sendMessage}
        disabled={!newMessage.trim()}
        size="sm"
      >
        Send
      </Button>
    </Box>
  </Box>
)}
```

## Step 5: Enhance the Backend API

Your frontend now needs backend endpoints for recording. Add these to your backend:

### Recording Endpoints

If not already present, you might need to add recording endpoints. Check if these exist in `backend/routes/`:

```typescript
// backend/routes/archive.ts (this might already exist)
import express from 'express';
import { videoService } from '../videoService/videoServiceFactory';

const router = express.Router();

// Start recording
router.post('/start', async (req, res) => {
  try {
    const { sessionId, name } = req.body;
    const archive = await videoService.startArchive(sessionId, name);
    res.json({ archiveId: archive.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop recording
router.post('/:archiveId/stop', async (req, res) => {
  try {
    const { archiveId } = req.params;
    await videoService.stopArchive(archiveId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

## Step 6: Testing Your Enhanced Features

### Test Screen Sharing

1. **Join the video call**
2. **Click "Share Screen"**
3. **Select a window/tab to share**
4. **Verify the screen content appears in the video layout**
5. **Test in another browser tab** - confirm remote participants see your screen
6. **Click "Stop Screen Share"** to end sharing

### Test Recording

1. **Start a video call with multiple participants**
2. **Click "Start Recording"** - verify recording indicator appears
3. **Have a brief conversation or demonstrate features**
4. **Click "Stop Recording"**
5. **Check your backend logs** for recording file paths
6. **Note:** Recordings are stored on Vonage servers and accessible via API

### Test Chat

1. **Open chat with the "Chat" button**
2. **Type a message and press Enter**
3. **Verify the message appears in the chat history**
4. **Open another browser tab** and join the same call
5. **Send messages from both tabs** 
6. **Confirm both participants see all messages**

## Step 7: Understanding the Implementation

### Screen Sharing Architecture

```typescript
// Screen sharing uses a second publisher
const screenPublisher = OT.initPublisher(element, {
  videoSource: 'screen' // This triggers screen capture
});

// Remote participants receive it as a regular subscriber
session.on('streamCreated', (event) => {
  if (event.stream.videoType === 'screen') {
    // Handle screen share stream differently
  }
});
```

### Recording Flow

```
Frontend Request → Backend API → Vonage API → Recording Infrastructure
     ↓                ↓              ↓              ↓
Start Recording → Create Archive → Begin Capture → Store Files
```

### Chat Signaling Pattern

```typescript
// Sender
session.signal({
  type: 'chat',
  data: JSON.stringify(messageData)
});

// Receiver
session.on('signal:chat', (event) => {
  const message = JSON.parse(event.data);
  displayMessage(message);
});
```

## Step 8: Advanced Enhancements

### Screen Share Improvements

```typescript
// Detect screen share streams from other participants
const handleStreamCreated = useCallback((event: any) => {
  const stream: Stream = event.stream;
  
  // Check if this is a screen share
  if (stream.videoType === 'screen') {
    // Handle screen share differently - maybe larger display
    subscribeToScreenShare(stream);
  } else {
    // Regular camera stream
    subscribeToCamera(stream);
  }
}, []);
```

### Recording with Custom Layout

```typescript
// Start recording with specific layout
const startRecording = useCallback(async () => {
  const response = await fetch('/api/archive/start', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: session?.sessionId,
      layout: {
        type: 'bestFit', // 'pip', 'verticalPresentation', 'horizontalPresentation'
        screenshareType: 'bestFit'
      }
    })
  });
}, []);
```

### Rich Chat Features

```typescript
// Add emoji reactions
const sendReaction = useCallback((emoji: string) => {
  session.signal({
    type: 'reaction',
    data: JSON.stringify({
      emoji,
      sender: 'You',
      timestamp: Date.now()
    })
  });
}, [session]);

// Add typing indicators
const handleTyping = useCallback(() => {
  session.signal({
    type: 'typing',
    data: JSON.stringify({ sender: 'You' })
  });
}, [session]);
```

## Common Issues and Solutions

### Screen Sharing Problems

**Issue:** Permission denied for screen sharing
```typescript
// Solution: Better error handling
if (publishError.name === 'OT_USER_MEDIA_ACCESS_DENIED') {
  setError('Please allow screen sharing and try again.');
}
```

**Issue:** Screen share not appearing for remote participants
```typescript
// Solution: Verify screen stream is published
screenPublisher.on('streamCreated', () => {
  console.log('Screen share stream created successfully');
});
```

### Recording Issues

**Issue:** Recording fails to start
- Verify your backend recording endpoints exist
- Check Vonage API credentials have recording permissions
- Ensure session is active before starting recording

### Chat Problems

**Issue:** Messages not appearing for all participants
```typescript
// Solution: Verify signal is sent to all
session.signal({
  type: 'chat',
  data: messageData,
  to: undefined // Send to all participants
});
```

## Next Steps

You now have a feature-rich video calling application! Consider exploring:

- **[UI Components Tutorial](./ui-components.md)**: Polish your interface
- **[Custom Layouts Tutorial](./custom-layouts.md)**: Advanced video layouts
- **[Advanced Features](../04-advanced-features.md)**: Background blur, reactions
- **Production Deployment**: Performance optimization and scaling

## Conclusion

You've successfully implemented three core video application features:

1. **Screen Sharing**: Enable content collaboration
2. **Recording**: Capture sessions for review or compliance
3. **Chat**: Provide text communication alongside video

These features demonstrate the Video API's flexibility and power. The patterns you've learned - using multiple publishers, leveraging signaling, and integrating backend APIs - form the foundation for building sophisticated collaborative applications.

**Ready for the next challenge?** Continue with [UI Components](./ui-components.md) to create a polished, professional interface for your video application.