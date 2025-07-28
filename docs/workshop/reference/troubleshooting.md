# Troubleshooting Guide

This comprehensive troubleshooting guide covers common issues, their causes, and step-by-step solutions for Vonage Video API applications. Use this guide to quickly diagnose and resolve problems during development and production.

## Quick Diagnostic Checklist

Before diving into specific issues, run through this quick checklist:

1. ✅ **Credentials**: API Key, Session ID, and Token are correct and not expired
2. ✅ **Network**: Internet connection is stable and WebRTC ports are open
3. ✅ **Permissions**: Browser has camera and microphone access
4. ✅ **HTTPS**: Application is served over HTTPS (required for production)
5. ✅ **Browser Support**: Using a supported browser version
6. ✅ **Console**: Check browser console for error messages

## Connection Issues

### Problem: "Failed to connect to session"

**Symptoms:**
- Session connection fails immediately
- Error code 1004 or 1006
- "Authentication failed" or "Connection failed" messages

**Causes & Solutions:**

#### Invalid Credentials
```typescript
// Check your credentials
console.log('API Key:', process.env.VONAGE_API_KEY);
console.log('Session ID:', sessionId);
console.log('Token expires:', new Date(tokenExpiry * 1000));

// Common issues:
// 1. Wrong API key (copy-paste error)
// 2. Mismatched session ID (using wrong session)
// 3. Expired token (generated more than 30 days ago)
// 4. Wrong token for session (token generated for different session)
```

**Solution:**
```typescript
// Regenerate credentials on your backend
const session = await videoService.createSession();
const token = videoService.generateToken(session.sessionId, {
  role: 'publisher',
  expireTime: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
});
```

#### Network/Firewall Issues
```typescript
// Test network connectivity
const testConnection = async () => {
  try {
    // Test basic API connectivity
    const response = await fetch('https://api.opentok.com/v2/project/healthcheck');
    console.log('API connectivity:', response.ok);
    
    // Test WebRTC connectivity (simplified)
    const rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:relay.example.com', username: 'user', credential: 'pass' }
      ]
    };
    
    const pc = new RTCPeerConnection(rtcConfig);
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };
    
  } catch (error) {
    console.error('Network test failed:', error);
  }
};
```

**Required Ports:**
- TCP 443 (HTTPS)
- UDP 3478-3481 (STUN)
- TCP 443 (TURN over TLS)
- UDP/TCP 1024-65535 (Media)

#### HTTPS Requirement
```typescript
// Check if running on HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.error('Video API requires HTTPS in production');
  // Redirect to HTTPS or show error message
}
```

### Problem: "Connection lost during session"

**Symptoms:**
- Session disconnects unexpectedly
- "sessionReconnecting" events frequent
- Poor video/audio quality before disconnection

**Diagnostic Steps:**
```typescript
// Monitor connection quality
session.on('sessionReconnecting', () => {
  console.log('Session reconnecting...');
  showReconnectingUI();
});

session.on('sessionReconnected', () => {
  console.log('Session reconnected');
  hideReconnectingUI();
});

// Monitor network statistics
publisher.getStats((error, stats) => {
  if (stats) {
    console.log('Publisher stats:', {
      videoBytesReceived: stats.video.bytesReceived,
      audioBytesReceived: stats.audio.bytesReceived,
      videoPacketsLost: stats.video.packetsLost,
      audioPacketsLost: stats.audio.packetsLost
    });
  }
});
```

**Solutions:**

1. **Implement Auto-Reconnection:**
```typescript
let reconnectAttempts = 0;
const maxReconnectAttempts = 3;

session.on('sessionDisconnected', (event) => {
  if (event.reason === 'networkDisconnected' && reconnectAttempts < maxReconnectAttempts) {
    setTimeout(() => {
      reconnectAttempts++;
      session.connect(token); // Retry connection
    }, 2000 * reconnectAttempts); // Exponential backoff
  }
});
```

2. **Network Quality Adaptation:**
```typescript
// Reduce quality on poor network
const adaptToNetwork = () => {
  publisher.setVideoSource(null); // Audio only mode
  
  // Or reduce video quality
  publisher.setVideoSource(publisher.getVideoSource(), {
    resolution: '320x240',
    frameRate: 15
  });
};
```

## Audio/Video Issues

### Problem: "No video/audio appearing"

**Symptoms:**
- Video element is black or empty
- No audio heard from participants
- Publisher/subscriber elements not populated

**Diagnostic Steps:**
```typescript
// Check device access
const checkDeviceAccess = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    console.log('Devices accessible:', {
      video: stream.getVideoTracks().length > 0,
      audio: stream.getAudioTracks().length > 0
    });
    
    stream.getTracks().forEach(track => track.stop());
  } catch (error) {
    console.error('Device access failed:', error);
  }
};

// Check publisher creation
publisher.on('accessAllowed', () => {
  console.log('Camera/microphone access granted');
});

publisher.on('accessDenied', () => {
  console.error('Camera/microphone access denied');
  showPermissionError();
});

// Check stream events
publisher.on('streamCreated', (event) => {
  console.log('Publisher stream created:', event.stream);
});

session.on('streamCreated', (event) => {
  console.log('Remote stream created:', event.stream);
});
```

**Solutions:**

1. **Permission Issues:**
```typescript
// Handle permission denial gracefully
const handlePermissionDenied = () => {
  // Show user-friendly instructions
  showModal({
    title: 'Camera Permission Required',
    content: `
      To join this video call, please:
      1. Click the camera icon in your address bar
      2. Select "Allow" for camera and microphone
      3. Refresh this page
    `
  });
};

// Retry permission request
const retryPermissions = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    location.reload(); // Refresh to retry with new permissions
  } catch (error) {
    handlePermissionDenied();
  }
};
```

2. **Element Attachment Issues:**
```typescript
// Ensure proper element attachment
const ensureVideoElements = () => {
  // Publisher
  if (publisher && publisherRef.current) {
    if (!publisherRef.current.hasChildNodes()) {
      publisher.addVideoElement(publisherRef.current);
    }
  }
  
  // Subscribers
  subscribers.forEach(subscriber => {
    const element = subscriberElements[subscriber.stream.streamId];
    if (element && !element.hasChildNodes()) {
      subscriber.addVideoElement(element);
    }
  });
};

// Call after DOM updates
useEffect(() => {
  ensureVideoElements();
}, [publisher, subscribers]);
```

### Problem: "Poor audio/video quality"

**Symptoms:**
- Pixelated or blurry video
- Choppy or distorted audio
- Frequent buffering or freezing

**Diagnostic Tools:**
```typescript
// Monitor connection statistics
const monitorQuality = () => {
  setInterval(() => {
    // Check publisher stats
    publisher.getStats((error, stats) => {
      if (stats) {
        const videoStats = stats.video;
        const audioStats = stats.audio;
        
        console.log('Quality metrics:', {
          videoBitrate: videoStats.bytesSent / 1024, // KB/s
          audioBitrate: audioStats.bytesSent / 1024,
          videoPacketLoss: videoStats.packetsLost / videoStats.packetsSent,
          audioPacketLoss: audioStats.packetsLost / audioStats.packetsSent,
          roundTripTime: stats.timestamp // MS
        });
        
        // Auto-adjust quality based on metrics
        if (videoStats.packetsLost / videoStats.packetsSent > 0.05) {
          reduceVideoQuality();
        }
      }
    });
  }, 5000);
};

// Quality adjustment functions
const reduceVideoQuality = () => {
  publisher.setVideoSource(publisher.getVideoSource(), {
    resolution: '640x480',
    frameRate: 15
  });
};

const improveVideoQuality = () => {
  publisher.setVideoSource(publisher.getVideoSource(), {
    resolution: '1280x720',
    frameRate: 30
  });
};
```

**Solutions:**

1. **Adaptive Quality:**
```typescript
// Implement adaptive bitrate
const adaptiveQuality = {
  excellent: { resolution: '1280x720', frameRate: 30, bitrate: 2000000 },
  good: { resolution: '640x480', frameRate: 24, bitrate: 1000000 },
  poor: { resolution: '320x240', frameRate: 15, bitrate: 500000 }
};

const adjustQualityBasedOnNetwork = (networkQuality) => {
  const settings = adaptiveQuality[networkQuality];
  
  publisher.setVideoSource(publisher.getVideoSource(), {
    resolution: settings.resolution,
    frameRate: settings.frameRate
  });
};
```

2. **Bandwidth Optimization:**
```typescript
// Optimize for large meetings
const optimizeForParticipantCount = (count) => {
  if (count > 10) {
    // Reduce quality for large meetings
    publisher.setVideoSource(publisher.getVideoSource(), {
      resolution: '320x240',
      frameRate: 15
    });
    
    // Subscribe to fewer participants
    const visibleSubscribers = subscribers.slice(0, 6);
    subscribers.forEach(sub => {
      if (!visibleSubscribers.includes(sub)) {
        sub.subscribeToVideo(false);
      }
    });
  }
};
```

## Browser Compatibility Issues

### Problem: "Browser not supported" or missing features

**Symptoms:**
- Video API not loading
- Missing WebRTC features
- Error: "OT is not defined"

**Browser Support Check:**
```typescript
// Comprehensive browser support detection
const checkBrowserSupport = () => {
  const support = {
    webrtc: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection),
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    websockets: !!window.WebSocket,
    promises: typeof Promise !== 'undefined'
  };
  
  const isSupported = Object.values(support).every(Boolean);
  
  if (!isSupported) {
    showUnsupportedBrowserMessage(support);
    return false;
  }
  
  return true;
};

// Specific browser version checks
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const browsers = {
    chrome: /Chrome\/(\d+)/.exec(userAgent),
    firefox: /Firefox\/(\d+)/.exec(userAgent),
    safari: /Safari\/(\d+)/.exec(userAgent),
    edge: /Edg\/(\d+)/.exec(userAgent)
  };
  
  const minVersions = {
    chrome: 74,
    firefox: 60,
    safari: 11,
    edge: 79
  };
  
  for (const [browser, match] of Object.entries(browsers)) {
    if (match) {
      const version = parseInt(match[1]);
      const supported = version >= minVersions[browser];
      
      return { browser, version, supported, minVersion: minVersions[browser] };
    }
  }
  
  return { browser: 'unknown', supported: false };
};
```

**Solutions:**

1. **Graceful Degradation:**
```typescript
// Fallback for unsupported browsers
const handleUnsupportedBrowser = () => {
  const browserInfo = getBrowserInfo();
  
  const upgradeMessage = `
    Your browser (${browserInfo.browser} ${browserInfo.version}) is not fully supported.
    
    Please upgrade to:
    • Chrome ${minVersions.chrome}+
    • Firefox ${minVersions.firefox}+
    • Safari ${minVersions.safari}+
    • Edge ${minVersions.edge}+
    
    Or try our mobile app for the best experience.
  `;
  
  showUpgradePrompt(upgradeMessage);
};
```

2. **Feature Detection:**
```typescript
// Progressive enhancement based on available features
const initializeWithFeatureDetection = () => {
  const features = {
    backgroundBlur: checkBackgroundBlurSupport(),
    screenShare: checkScreenShareSupport(),
    deviceSelection: checkDeviceSelectionSupport()
  };
  
  // Initialize with available features only
  initializeVideoCall(features);
};

const checkBackgroundBlurSupport = () => {
  // Background blur requires WebGL and sufficient CPU
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return !!gl && navigator.hardwareConcurrency >= 4;
};
```

## Authentication & Token Issues

### Problem: "Token expired" or "Invalid token"

**Symptoms:**
- Connection succeeds initially but fails later
- Error code 1004 with token-related message
- Participants disconnected unexpectedly

**Diagnostic Steps:**
```typescript
// Token validation and refresh system
const validateToken = (token) => {
  try {
    // Decode JWT token (simplified - use proper JWT library)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiry - now;
    
    console.log('Token info:', {
      expiresAt: new Date(expiry),
      timeUntilExpiry: Math.floor(timeUntilExpiry / 1000 / 60), // minutes
      isValid: timeUntilExpiry > 0
    });
    
    // Warn if token expires soon
    if (timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes
      console.warn('Token expires soon, consider refreshing');
    }
    
    return timeUntilExpiry > 0;
  } catch (error) {
    console.error('Invalid token format:', error);
    return false;
  }
};

// Automatic token refresh
const setupTokenRefresh = () => {
  const refreshInterval = setInterval(async () => {
    try {
      const response = await fetch('/api/session/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ sessionId: session.sessionId })
      });
      
      const { token: newToken } = await response.json();
      
      // Update token for future operations
      currentToken = newToken;
      
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }, 15 * 60 * 1000); // Refresh every 15 minutes
  
  return refreshInterval;
};
```

**Solutions:**

1. **Backend Token Management:**
```typescript
// backend/routes/session.ts
router.post('/refresh-token', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Generate new token with extended expiry
    const newToken = videoService.generateToken(sessionId, {
      role: 'publisher',
      expireTime: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 hours
    });
    
    res.json({ token: newToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

2. **Graceful Token Expiry Handling:**
```typescript
// Handle token expiry gracefully
session.on('exception', (event) => {
  if (event.code === 1004 && event.message.includes('token')) {
    handleTokenExpiry();
  }
});

const handleTokenExpiry = async () => {
  try {
    // Show loading state
    setSessionStatus('refreshing');
    
    // Get new token
    const newToken = await refreshToken();
    
    // Reconnect with new token
    session.connect(newToken, (error) => {
      if (error) {
        handleReconnectionFailure(error);
      } else {
        setSessionStatus('connected');
      }
    });
  } catch (error) {
    handleReconnectionFailure(error);
  }
};
```

## Performance Issues

### Problem: "High CPU usage" or "Browser freezing"

**Symptoms:**
- Browser becomes unresponsive
- High CPU usage in task manager
- Frame rate drops significantly

**Diagnostic & Solutions:**

```typescript
// Performance monitoring
const monitorPerformance = () => {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.duration > 100) { // Log slow operations
        console.warn('Slow operation detected:', entry.name, entry.duration);
      }
    });
  });
  
  observer.observe({ entryTypes: ['measure', 'navigation'] });
  
  // Memory monitoring (Chrome only)
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (usage > 0.8) {
        console.warn('High memory usage detected:', usage);
        optimizeMemoryUsage();
      }
    }, 10000);
  }
};

// Memory optimization
const optimizeMemoryUsage = () => {
  // Remove unused video elements
  const unusedElements = document.querySelectorAll('[data-ot-widget][data-ot-widget=""]');
  unusedElements.forEach(el => el.remove());
  
  // Limit simultaneous video streams
  if (subscribers.length > 6) {
    subscribers.slice(6).forEach(sub => {
      sub.subscribeToVideo(false);
    });
  }
  
  // Reduce video quality
  publisher.setVideoSource(publisher.getVideoSource(), {
    resolution: '640x480',
    frameRate: 15
  });
};
```

## Common Error Codes Reference

### Session Errors

| Code | Error | Cause | Solution |
|------|-------|--------|---------|
| 1004 | Authentication failed | Invalid API key, session ID, or token | Verify credentials, regenerate token |
| 1005 | Invalid session ID | Malformed session ID | Create new session |
| 1006 | Connect failed | Network issues, firewall | Check network connectivity |
| 1007 | Connect timeout | Slow network, server issues | Retry connection |
| 1008 | Security error | HTTPS required in production | Serve over HTTPS |

### Publishing Errors

| Code | Error | Cause | Solution |
|------|-------|--------|---------|
| 1500 | Unable to publish | No camera/microphone access | Request permissions |
| 1501 | Publishing timeout | Device busy, hardware issues | Check device availability |
| 1502 | Session not connected | Trying to publish before connection | Wait for connection |
| 1510 | Unable to force disconnect | Insufficient privileges | Use moderator token |

### General Errors

| Code | Error | Cause | Solution |
|------|-------|--------|---------|
| 2000 | Internal error | Server-side issues | Retry operation, contact support |
| 2001 | Conflict | Multiple operations | Serialize operations |
| 4000 | WebSocket error | Network connectivity | Check network, retry |

## Debugging Tools and Techniques

### Browser DevTools

```typescript
// Enable Video API debugging
window.OT.setLogLevel(window.OT.DEBUG);

// Custom logging for debugging
const debugLog = (category, message, data) => {
  console.group(`[${category}] ${message}`);
  if (data) console.log(data);
  console.trace();
  console.groupEnd();
};

// Use throughout your application
debugLog('Session', 'Connection attempt', { sessionId, token });
```

### Network Analysis

```typescript
// Network quality estimation
const estimateNetworkQuality = async () => {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.opentok.com/v2/project/healthcheck');
    const latency = Date.now() - startTime;
    
    let quality = 'excellent';
    if (latency > 100) quality = 'good';
    if (latency > 300) quality = 'poor';
    if (latency > 1000) quality = 'bad';
    
    return { latency, quality };
  } catch (error) {
    return { latency: Infinity, quality: 'bad' };
  }
};
```

### Session Inspector

```typescript
// Comprehensive session state inspector
const inspectSession = () => {
  if (!session) return null;
  
  return {
    sessionId: session.sessionId,
    connected: session.isConnected(),
    connectionCount: session.connection ? 1 : 0,
    streams: Object.keys(session.streams || {}).length,
    capabilities: session.capabilities,
    connection: session.connection ? {
      connectionId: session.connection.connectionId,
      creationTime: session.connection.creationTime,
      data: session.connection.data
    } : null,
    publishers: publishers.map(p => ({
      id: p.id,
      streamId: p.stream?.streamId,
      hasAudio: p.stream?.hasAudio,
      hasVideo: p.stream?.hasVideo
    })),
    subscribers: subscribers.map(s => ({
      id: s.id,
      streamId: s.stream?.streamId,
      hasAudio: s.stream?.hasAudio,
      hasVideo: s.stream?.hasVideo,
      subscribeToAudio: s.subscribeToAudio,
      subscribeToVideo: s.subscribeToVideo
    }))
  };
};

// Call from browser console for debugging
window.inspectSession = inspectSession;
```

## Getting Additional Help

### When to Contact Support

Contact Vonage support if you encounter:

1. **Persistent API errors** not covered in this guide
2. **Account-related issues** (billing, limits, permissions)
3. **Performance degradation** affecting multiple users
4. **Security concerns** or compliance questions

### Information to Provide

When contacting support, include:

1. **Error details**: Exact error messages and codes
2. **Session information**: Session ID, timestamp of issue
3. **Browser details**: Browser version, operating system
4. **Network information**: ISP, general location
5. **Code samples**: Minimal reproducible example
6. **Console logs**: Browser console output during error

### Self-Service Resources

Before contacting support:

1. Check [Vonage Status Page](https://status.vonage.com) for service issues
2. Review [official documentation](https://developer.vonage.com/en/video/overview)
3. Search [community forums](https://developer.vonage.com/community)
4. Test with [Video API Inspector](https://tokbox.com/developer/tools/inspector/)

---

This troubleshooting guide covers the most common issues encountered when developing with the Vonage Video API. For issues not covered here, consult the [API Reference](./api-reference.md) or contact Vonage support with detailed information about your specific problem.