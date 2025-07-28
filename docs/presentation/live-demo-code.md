# Live Demo Code Snippets
## For 15-Minute Presentation

This file contains all the code snippets needed for the live demonstration portion of the presentation, organized for easy copy-paste during the demo.

---

## Demo 1: 60-Second Video Call (Slide 3)

### Step 1: Create React App (10 seconds)
```bash
npx create-react-app video-demo
cd video-demo
yarn add @vonage/client-sdk-video
```

### Step 2: Basic Video Component (30 seconds)
```typescript
// src/VideoCall.js
import React, { useEffect, useRef, useState } from 'react';

const VideoCall = () => {
  const [connected, setConnected] = useState(false);
  const publisherRef = useRef(null);

  useEffect(() => {
    // Mock credentials for demo
    const credentials = {
      apiKey: "46942131",
      sessionId: "2_MX4xMDB-fjE1NzY5NDIxMjE4NjF-UzZPSWF6UU93Nk9vSXRKTGN2VG1aaFA",
      token: "T1==cGFydG5lcl9pZD00Njk0MjEzMSZzaWc9..."
    };

    const OT = window.OT;
    const session = OT.initSession(credentials.apiKey, credentials.sessionId);
    
    session.connect(credentials.token, (error) => {
      if (!error) {
        setConnected(true);
        const publisher = OT.initPublisher(publisherRef.current, {
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480'
        });
        session.publish(publisher);
      }
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Video Demo</h1>
      <p>Status: {connected ? '🟢 Connected' : '🔴 Connecting...'}</p>
      <div 
        ref={publisherRef}
        style={{
          width: 400,
          height: 300,
          backgroundColor: '#f0f0f0',
          border: '2px solid #ccc'
        }}
      />
    </div>
  );
};

export default VideoCall;
```

### Step 3: Update App.js (10 seconds)
```typescript
// src/App.js
import VideoCall from './VideoCall';

function App() {
  return <VideoCall />;
}

export default App;
```

### Step 4: Add Video API Script (10 seconds)
```html
<!-- public/index.html - Add to head -->
<script src="https://static.opentok.com/v2/js/opentok.min.js"></script>
```

---

## Demo 2: Background Blur (Slide 6)

### Enhanced Video Component with Background Blur
```typescript
// Add to existing VideoCall component
import React, { useEffect, useRef, useState } from 'react';

const VideoCall = () => {
  const [connected, setConnected] = useState(false);
  const [publisher, setPublisher] = useState(null);
  const [backgroundBlur, setBackgroundBlur] = useState(false);
  const publisherRef = useRef(null);

  // ... existing useEffect code ...

  const toggleBackgroundBlur = async () => {
    if (!publisher) return;

    try {
      if (backgroundBlur) {
        await publisher.setVideoFilter({ type: 'none' });
        setBackgroundBlur(false);
      } else {
        await publisher.setVideoFilter({
          type: 'backgroundBlur',
          blurStrength: 'high'
        });
        setBackgroundBlur(true);
      }
    } catch (error) {
      console.error('Background blur failed:', error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Video Demo</h1>
      <p>Status: {connected ? '🟢 Connected' : '🔴 Connecting...'}</p>
      
      <button
        onClick={toggleBackgroundBlur}
        disabled={!publisher}
        style={{
          padding: '10px 20px',
          margin: '10px 0',
          backgroundColor: backgroundBlur ? '#ff4444' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {backgroundBlur ? '✨ Blur ON' : '✨ Add Blur'}
      </button>

      <div 
        ref={publisherRef}
        style={{
          width: 400,
          height: 300,
          backgroundColor: '#f0f0f0',
          border: '2px solid #ccc'
        }}
      />
    </div>
  );
};
```

---

## Demo 3: Screen Sharing (Slide 7)

### Add Screen Sharing Functionality
```typescript
// Add to VideoCall component
const VideoCall = () => {
  const [connected, setConnected] = useState(false);
  const [publisher, setPublisher] = useState(null);
  const [session, setSession] = useState(null);
  const [screenPublisher, setScreenPublisher] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const publisherRef = useRef(null);
  const screenRef = useRef(null);

  // ... existing code ...

  const toggleScreenShare = () => {
    if (!session) return;

    if (isScreenSharing) {
      // Stop screen sharing
      session.unpublish(screenPublisher);
      setScreenPublisher(null);
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      const OT = window.OT;
      const newScreenPublisher = OT.initPublisher(
        screenRef.current,
        {
          publishAudio: false,
          publishVideo: true,
          videoSource: 'screen',
          resolution: '1280x720'
        },
        (error) => {
          if (error) {
            console.error('Screen share error:', error);
          } else {
            session.publish(newScreenPublisher);
            setScreenPublisher(newScreenPublisher);
            setIsScreenSharing(true);
          }
        }
      );
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Video Demo</h1>
      <p>Status: {connected ? '🟢 Connected' : '🔴 Connecting...'}</p>
      
      <div style={{ marginBottom: 10 }}>
        <button onClick={toggleBackgroundBlur} /* ... existing blur button ... */>
          {backgroundBlur ? '✨ Blur ON' : '✨ Add Blur'}
        </button>
        
        <button
          onClick={toggleScreenShare}
          disabled={!session}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: isScreenSharing ? '#ff4444' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isScreenSharing ? '🖥️ Stop Share' : '🖥️ Share Screen'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div>
          <h3>Your Camera</h3>
          <div ref={publisherRef} style={{ width: 300, height: 225, backgroundColor: '#f0f0f0' }} />
        </div>
        
        {isScreenSharing && (
          <div>
            <h3>Your Screen</h3>
            <div ref={screenRef} style={{ width: 400, height: 225, backgroundColor: '#f0f0f0' }} />
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## Demo 4: Real-Time Chat (Slide 8)

### Add Chat Functionality
```typescript
// Add to VideoCall component
const VideoCall = () => {
  // ... existing state ...
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // ... existing session setup ...
    
    // Add chat signal handler
    session.on('signal:chat', (event) => {
      const messageData = JSON.parse(event.data);
      setMessages(prev => [...prev, messageData]);
    });
  }, []);

  const sendMessage = () => {
    if (!session || !newMessage.trim()) return;

    const messageData = {
      text: newMessage.trim(),
      sender: 'You',
      timestamp: new Date().toLocaleTimeString()
    };

    session.signal({
      type: 'chat',
      data: JSON.stringify(messageData)
    });

    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  return (
    <div style={{ padding: 20, display: 'flex', gap: 20 }}>
      <div>
        <h1>Video Demo</h1>
        {/* ... existing video elements ... */}
      </div>

      {/* Chat Panel */}
      <div style={{ width: 300, border: '1px solid #ccc', borderRadius: 4 }}>
        <h3 style={{ padding: 10, margin: 0, backgroundColor: '#f5f5f5' }}>
          Chat Messages
        </h3>
        
        <div style={{ 
          height: 200, 
          overflowY: 'auto', 
          padding: 10,
          backgroundColor: '#fafafa'
        }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: 10 }}>
              <strong>{msg.sender}</strong> <small>{msg.timestamp}</small>
              <div>{msg.text}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: 10, display: 'flex' }}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type message..."
            style={{ flex: 1, padding: 5, marginRight: 5 }}
          />
          <button 
            onClick={sendMessage}
            style={{ padding: 5, backgroundColor: '#4CAF50', color: 'white', border: 'none' }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## Demo 5: Multi-API Integration (Slide 9)

### Backend API Integration Examples
```typescript
// Backend endpoint for SMS invitation
app.post('/api/invite', async (req, res) => {
  const { phoneNumber, meetingId } = req.body;
  
  try {
    // Send SMS invitation
    const smsResponse = await vonage.sms.send({
      to: phoneNumber,
      from: 'VideoDemo',
      text: `Join video call: ${process.env.BASE_URL}/meeting/${meetingId}`
    });

    res.json({ success: true, messageId: smsResponse.messages[0]['message-id'] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verification before video access
app.post('/api/verify', async (req, res) => {
  const { phoneNumber } = req.body;
  
  try {
    const verifyResponse = await vonage.verify.start({
      number: phoneNumber,
      brand: 'VideoDemo',
      codeLength: 6
    });

    res.json({ requestId: verifyResponse.requestId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete verification and create video session
app.post('/api/verify/complete', async (req, res) => {
  const { requestId, code } = req.body;
  
  try {
    const verifyResult = await vonage.verify.check(requestId, code);
    
    if (verifyResult.status === '0') {
      // Create video session
      const session = await videoService.createSession();
      const token = videoService.generateToken(session.sessionId);
      
      res.json({
        verified: true,
        credentials: {
          apiKey: process.env.VONAGE_API_KEY,
          sessionId: session.sessionId,
          token: token
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Frontend Integration
```typescript
// Secure video access component
const SecureVideoAccess = () => {
  const [step, setStep] = useState('phone'); // 'phone', 'verify', 'video'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [requestId, setRequestId] = useState('');
  const [credentials, setCredentials] = useState(null);

  const requestVerification = async () => {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    
    const data = await response.json();
    setRequestId(data.requestId);
    setStep('verify');
  };

  const completeVerification = async () => {
    const response = await fetch('/api/verify/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, code: verificationCode })
    });
    
    const data = await response.json();
    if (data.verified) {
      setCredentials(data.credentials);
      setStep('video');
    }
  };

  if (step === 'video' && credentials) {
    return <VideoCall credentials={credentials} />;
  }

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: '0 auto' }}>
      {step === 'phone' && (
        <div>
          <h2>🔒 Secure Video Access</h2>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone number"
            style={{ width: '100%', padding: 10, marginBottom: 10 }}
          />
          <button onClick={requestVerification} style={{ width: '100%', padding: 10 }}>
            Send Verification Code
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div>
          <h2>📱 Enter Verification Code</h2>
          <p>Code sent to {phoneNumber}</p>
          <input
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="6-digit code"
            style={{ width: '100%', padding: 10, marginBottom: 10 }}
          />
          <button onClick={completeVerification} style={{ width: '100%', padding: 10 }}>
            Verify & Join Video
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## Demo Setup Instructions

### Pre-Demo Checklist
1. **Environment Variables Set:**
   ```bash
   VONAGE_API_KEY=your_key
   VONAGE_API_SECRET=your_secret
   VONAGE_APP_ID=your_app_id
   VONAGE_PRIVATE_KEY="your_private_key"
   ```

2. **Browser Windows Ready:**
   - Primary window: Code editor + terminal
   - Secondary window: Demo application
   - Mobile device or third window for multi-participant testing

3. **Backup Demos:**
   - Pre-recorded video of each demo step
   - Working code repository ready to clone
   - Screenshots of expected outcomes

### Demo Timing
- **60-Second Video Call:** Practice to stay under 60 seconds
- **Background Blur:** 30 seconds maximum
- **Screen Sharing:** 60 seconds including explanation
- **Chat Integration:** 2 minutes with testing
- **Multi-API:** 60 seconds showing flow

### Common Issues & Solutions
1. **Camera Permission Denied:** Use localhost or HTTPS
2. **API Keys Invalid:** Have backup test credentials
3. **Network Issues:** Test on mobile hotspot as backup
4. **Browser Compatibility:** Use Chrome for most reliable demo

---

*These code snippets are designed for live demonstration. For production use, refer to the complete workshop materials and add proper error handling, loading states, and user experience improvements.*