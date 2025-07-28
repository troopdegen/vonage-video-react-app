# Advanced Features: Building Premium Video Experiences

## Introduction

Now that you've mastered the core video functionality, let's explore advanced features that transform basic video calls into premium, professional experiences. This section covers the sophisticated capabilities that set modern video applications apart: AI-powered background processing, real-time reactions, multi-party optimization, and performance tuning.

## Feature 1: Background Blur and Virtual Backgrounds

Background blur uses machine learning to separate you from your background, providing privacy and reducing distractions in professional settings.

### Understanding Background Processing

The Vonage Video API includes AI-powered video filters that run locally on the participant's device:

- **Background Blur**: Blurs everything except the person
- **Background Replacement**: Replaces background with custom images
- **Noise Suppression**: AI-powered audio cleanup
- **Low-light Enhancement**: Automatic brightness and contrast adjustment

### Implementation: Background Blur

```typescript
// Add to your component state
const [backgroundBlurEnabled, setBackgroundBlurEnabled] = useState(false);

// Background blur toggle function
const toggleBackgroundBlur = useCallback(async () => {
  if (!publisher) return;

  try {
    if (backgroundBlurEnabled) {
      // Remove background blur
      await publisher.setVideoFilter({
        type: 'none'
      });
      setBackgroundBlurEnabled(false);
    } else {
      // Apply background blur
      await publisher.setVideoFilter({
        type: 'backgroundBlur',
        blurStrength: 'high' // 'low', 'medium', 'high'
      });
      setBackgroundBlurEnabled(true);
    }
  } catch (error) {
    setError(`Background blur failed: ${error.message}`);
  }
}, [publisher, backgroundBlurEnabled]);

// UI Control
<Button
  onClick={toggleBackgroundBlur}
  variant={backgroundBlurEnabled ? 'solid' : 'outlined'}
  color="primary"
  disabled={!publisher}
>
  {backgroundBlurEnabled ? '✨ Blur ON' : '✨ Add Blur'}
</Button>
```

### Advanced Background Processing

```typescript
// Custom background replacement
const setVirtualBackground = useCallback(async (imageUrl: string) => {
  if (!publisher) return;

  try {
    await publisher.setVideoFilter({
      type: 'backgroundReplacement',
      backgroundImageUrl: imageUrl
    });
  } catch (error) {
    setError(`Virtual background failed: ${error.message}`);
  }
}, [publisher]);

// Predefined background options
const VIRTUAL_BACKGROUNDS = [
  { name: 'Office', url: '/backgrounds/office.jpg' },
  { name: 'Beach', url: '/backgrounds/beach.jpg' },
  { name: 'Mountains', url: '/backgrounds/mountains.jpg' },
  { name: 'City', url: '/backgrounds/city.jpg' }
];

// Background selector UI
<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
  <Button
    onClick={toggleBackgroundBlur}
    variant={backgroundBlurEnabled ? 'solid' : 'outlined'}
    size="sm"
  >
    Blur
  </Button>
  
  {VIRTUAL_BACKGROUNDS.map(bg => (
    <Button
      key={bg.name}
      onClick={() => setVirtualBackground(bg.url)}
      variant="outlined"
      size="sm"
    >
      {bg.name}
    </Button>
  ))}
  
  <Button
    onClick={() => publisher?.setVideoFilter({ type: 'none' })}
    variant="outlined"
    size="sm"
  >
    None
  </Button>
</Box>
```

## Feature 2: Real-Time Reactions and Engagement

Interactive reactions create engaging, dynamic video experiences that encourage participation and feedback.

### Emoji Reactions System

```typescript
// Reaction state management
const [activeReactions, setActiveReactions] = useState<Array<{
  id: string;
  emoji: string;
  sender: string;
  timestamp: number;
  x: number;
  y: number;
}>>([]);

// Available reaction emojis
const REACTIONS = ['👍', '👎', '❤️', '😂', '😮', '😢', '👏', '🔥'];

// Send reaction function
const sendReaction = useCallback((emoji: string) => {
  if (!session) return;

  const reactionData = {
    emoji,
    sender: 'You', // Replace with actual user name
    timestamp: Date.now(),
    x: Math.random() * 80 + 10, // Random position (10-90%)
    y: Math.random() * 80 + 10
  };

  // Send to all participants
  session.signal({
    type: 'reaction',
    data: JSON.stringify(reactionData)
  });

  // Add to local state
  addReactionToDisplay(reactionData);
}, [session]);

// Handle incoming reactions
const handleReactionSignal = useCallback((event: any) => {
  const reactionData = JSON.parse(event.data);
  addReactionToDisplay(reactionData);
}, []);

// Add reaction to display with auto-removal
const addReactionToDisplay = useCallback((reactionData: any) => {
  const reaction = {
    ...reactionData,
    id: `${reactionData.timestamp}-${Math.random()}`
  };

  setActiveReactions(prev => [...prev, reaction]);

  // Remove reaction after 3 seconds
  setTimeout(() => {
    setActiveReactions(prev => 
      prev.filter(r => r.id !== reaction.id)
    );
  }, 3000);
}, []);

// Reaction overlay component
const ReactionOverlay = () => (
  <Box sx={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 10
  }}>
    {activeReactions.map(reaction => (
      <Box
        key={reaction.id}
        sx={{
          position: 'absolute',
          left: `${reaction.x}%`,
          top: `${reaction.y}%`,
          fontSize: '2rem',
          animation: 'reactionFloat 3s ease-out forwards',
          '@keyframes reactionFloat': {
            '0%': {
              opacity: 1,
              transform: 'translateY(0) scale(1)'
            },
            '100%': {
              opacity: 0,
              transform: 'translateY(-100px) scale(1.5)'
            }
          }
        }}
      >
        {reaction.emoji}
      </Box>
    ))}
  </Box>
);

// Reaction controls UI
<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
  {REACTIONS.map(emoji => (
    <Button
      key={emoji}
      onClick={() => sendReaction(emoji)}
      variant="outlined"
      size="sm"
      sx={{ minWidth: 'auto', p: 0.5 }}
    >
      {emoji}
    </Button>
  ))}
</Box>
```

### Advanced Engagement Features

```typescript
// Hand raising system
const [handRaised, setHandRaised] = useState(false);
const [raisedHands, setRaisedHands] = useState<string[]>([]);

const toggleHandRaise = useCallback(() => {
  if (!session) return;

  const newState = !handRaised;
  setHandRaised(newState);

  session.signal({
    type: 'handRaise',
    data: JSON.stringify({
      raised: newState,
      participant: 'You' // Replace with actual participant ID
    })
  });
}, [session, handRaised]);

// Applause meter - track clapping reactions
const [applauseLevel, setApplauseLevel] = useState(0);

const handleApplause = useCallback(() => {
  setApplauseLevel(prev => Math.min(prev + 1, 10));
  
  // Decay applause over time
  setTimeout(() => {
    setApplauseLevel(prev => Math.max(prev - 1, 0));
  }, 1000);
}, []);

// Applause meter UI
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Typography level="body-sm">Applause:</Typography>
  <Box sx={{
    width: 100,
    height: 8,
    bgcolor: 'neutral.200',
    borderRadius: 4,
    overflow: 'hidden'
  }}>
    <Box sx={{
      width: `${applauseLevel * 10}%`,
      height: '100%',
      bgcolor: 'success.500',
      transition: 'width 0.3s ease'
    }} />
  </Box>
</Box>
```

## Feature 3: Multi-Party Optimization

Optimize video experiences for large groups with intelligent participant management and layout strategies.

### Active Speaker Detection

```typescript
// Active speaker tracking
const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
const [speakerHistory, setSpeakerHistory] = useState<string[]>([]);

// Enhanced subscriber setup with audio level monitoring
const setupSubscriberWithAudioTracking = useCallback((subscriber: Subscriber) => {
  // Monitor audio levels to detect speaking
  subscriber.on('audioLevelUpdated', (event: any) => {
    const { audioLevel } = event;
    
    // Consider speaking if audio level > threshold
    if (audioLevel > 0.3) {
      const streamId = subscriber.stream.streamId;
      
      // Update active speaker
      setActiveSpeaker(streamId);
      
      // Track speaker history
      setSpeakerHistory(prev => {
        const updated = [streamId, ...prev.filter(id => id !== streamId)];
        return updated.slice(0, 5); // Keep last 5 speakers
      });
      
      // Clear active speaker after silence
      setTimeout(() => {
        setActiveSpeaker(prev => prev === streamId ? null : prev);
      }, 2000);
    }
  });
}, []);

// Prioritized participant display
const getPrioritizedParticipants = useCallback(() => {
  const prioritized = [...subscriberWrappers];
  
  // Sort by priority: active speaker > recent speakers > others
  prioritized.sort((a, b) => {
    const aStreamId = a.subscriber?.stream.streamId;
    const bStreamId = b.subscriber?.stream.streamId;
    
    // Active speaker always first
    if (aStreamId === activeSpeaker) return -1;
    if (bStreamId === activeSpeaker) return 1;
    
    // Then by recent speaker order
    const aIndex = speakerHistory.indexOf(aStreamId || '');
    const bIndex = speakerHistory.indexOf(bStreamId || '');
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    return 0;
  });
  
  return prioritized;
}, [subscriberWrappers, activeSpeaker, speakerHistory]);
```

### Intelligent Layout Management

```typescript
// Layout modes for different participant counts
type LayoutMode = 'grid' | 'speaker' | 'presentation' | 'sidebar';

const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');

// Auto-select optimal layout based on participant count
const getOptimalLayout = useCallback((participantCount: number): LayoutMode => {
  if (participantCount <= 4) return 'grid';
  if (participantCount <= 8) return 'speaker';
  return 'presentation';
}, []);

// Dynamic layout component
const DynamicVideoLayout = ({ participants }: { participants: SubscriberWrapper[] }) => {
  const participantCount = participants.length + (publisher ? 1 : 0);
  const currentLayout = layoutMode === 'auto' ? getOptimalLayout(participantCount) : layoutMode;
  
  const renderLayout = () => {
    switch (currentLayout) {
      case 'grid':
        return renderGridLayout(participants);
      case 'speaker':
        return renderSpeakerLayout(participants);
      case 'presentation':
        return renderPresentationLayout(participants);
      case 'sidebar':
        return renderSidebarLayout(participants);
      default:
        return renderGridLayout(participants);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {renderLayout()}
      <ReactionOverlay />
    </Box>
  );
};

// Grid layout for small groups
const renderGridLayout = (participants: SubscriberWrapper[]) => {
  const gridCols = Math.ceil(Math.sqrt(participants.length + 1));
  
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
      gap: 1,
      height: '100%'
    }}>
      {/* Publisher (self) */}
      {publisher && (
        <VideoTile
          type="publisher"
          publisher={publisher}
          isActiveSpeaker={false}
        />
      )}
      
      {/* Subscribers */}
      {participants.map(wrapper => (
        <VideoTile
          key={wrapper.subscriber?.stream.streamId}
          type="subscriber"
          subscriber={wrapper.subscriber}
          isActiveSpeaker={wrapper.subscriber?.stream.streamId === activeSpeaker}
        />
      ))}
    </Box>
  );
};

// Speaker layout for medium groups
const renderSpeakerLayout = (participants: SubscriberWrapper[]) => {
  const prioritized = getPrioritizedParticipants();
  const mainSpeaker = prioritized[0];
  const otherParticipants = prioritized.slice(1, 5); // Show max 5 others
  
  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 1 }}>
      {/* Main speaker */}
      <Box sx={{ flex: '2 1 60%' }}>
        {mainSpeaker ? (
          <VideoTile
            type="subscriber"
            subscriber={mainSpeaker.subscriber}
            isActiveSpeaker={true}
            size="large"
          />
        ) : (
          <VideoTile
            type="publisher"
            publisher={publisher}
            isActiveSpeaker={false}
            size="large"
          />
        )}
      </Box>
      
      {/* Sidebar participants */}
      <Box sx={{
        flex: '1 1 40%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {/* Publisher in sidebar if not main speaker */}
        {mainSpeaker && (
          <VideoTile
            type="publisher"
            publisher={publisher}
            isActiveSpeaker={false}
            size="small"
          />
        )}
        
        {otherParticipants.map(wrapper => (
          <VideoTile
            key={wrapper.subscriber?.stream.streamId}
            type="subscriber"
            subscriber={wrapper.subscriber}
            isActiveSpeaker={false}
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};
```

## Feature 4: Performance Optimization

Optimize your video application for smooth performance across devices and network conditions.

### Bandwidth Management

```typescript
// Quality management system
interface QualitySettings {
  resolution: string;
  frameRate: number;
  maxBitrate: number;
}

const QUALITY_PROFILES: Record<string, QualitySettings> = {
  high: { resolution: '1280x720', frameRate: 30, maxBitrate: 2000000 },
  medium: { resolution: '640x480', frameRate: 24, maxBitrate: 1000000 },
  low: { resolution: '320x240', frameRate: 15, maxBitrate: 500000 }
};

// Network quality monitoring
const [networkQuality, setNetworkQuality] = useState<'excellent' | 'good' | 'poor' | 'bad'>('good');
const [currentQuality, setCurrentQuality] = useState<string>('medium');

// Automatic quality adjustment based on network conditions
const adjustQualityBasedOnNetwork = useCallback(() => {
  let targetQuality = 'medium';
  
  switch (networkQuality) {
    case 'excellent':
      targetQuality = 'high';
      break;
    case 'good':
      targetQuality = 'medium';
      break;
    case 'poor':
    case 'bad':
      targetQuality = 'low';
      break;
  }
  
  if (targetQuality !== currentQuality) {
    applyQualitySettings(targetQuality);
  }
}, [networkQuality, currentQuality]);

// Apply quality settings to publisher
const applyQualitySettings = useCallback(async (qualityLevel: string) => {
  if (!publisher) return;
  
  const settings = QUALITY_PROFILES[qualityLevel];
  
  try {
    // Update publisher settings
    await publisher.setVideoSource(publisher.getVideoSource(), {
      resolution: settings.resolution,
      frameRate: settings.frameRate
    });
    
    setCurrentQuality(qualityLevel);
  } catch (error) {
    console.error('Failed to adjust quality:', error);
  }
}, [publisher]);

// Monitor participant count and adjust accordingly
const optimizeForParticipantCount = useCallback(() => {
  const totalParticipants = subscriberWrappers.length + (publisher ? 1 : 0);
  
  if (totalParticipants > 10) {
    // Large meeting - prioritize stability
    applyQualitySettings('low');
    
    // Subscribe to only visible participants
    const visibleCount = 6;
    const prioritizedParticipants = getPrioritizedParticipants().slice(0, visibleCount);
    
    // Unsubscribe from non-visible participants
    subscriberWrappers.forEach(wrapper => {
      const isVisible = prioritizedParticipants.includes(wrapper);
      if (!isVisible && wrapper.subscriber) {
        wrapper.subscriber.subscribeToVideo(false);
      }
    });
  } else if (totalParticipants > 5) {
    // Medium meeting - balanced quality
    applyQualitySettings('medium');
  } else {
    // Small meeting - high quality
    applyQualitySettings('high');
  }
}, [subscriberWrappers.length, publisher]);
```

### Device Performance Monitoring

```typescript
// Performance monitoring
const [cpuUsage, setCpuUsage] = useState<number>(0);
const [memoryUsage, setMemoryUsage] = useState<number>(0);

// Monitor device performance
useEffect(() => {
  const monitorPerformance = () => {
    // Check if Performance Observer is available
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            // Process performance measurements
            console.log('Performance metric:', entry.name, entry.duration);
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure'] });
    }
    
    // Memory usage monitoring (Chrome only)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryUsage(memory.usedJSHeapSize / memory.jsHeapSizeLimit);
    }
  };

  const interval = setInterval(monitorPerformance, 5000);
  return () => clearInterval(interval);
}, []);

// Performance-based optimizations
const applyPerformanceOptimizations = useCallback(() => {
  // If memory usage is high, reduce quality
  if (memoryUsage > 0.8) {
    applyQualitySettings('low');
    
    // Disable background blur if active
    if (backgroundBlurEnabled) {
      toggleBackgroundBlur();
    }
  }
  
  // If CPU is struggling, reduce frame rate
  if (cpuUsage > 0.9) {
    // Reduce publisher frame rate
    publisher?.setVideoSource(publisher.getVideoSource(), {
      frameRate: 15
    });
  }
}, [memoryUsage, cpuUsage, backgroundBlurEnabled]);
```

## Feature 5: Advanced Audio Processing

Enhance audio quality with AI-powered processing and spatial audio features.

### Noise Suppression

```typescript
// Audio processing state
const [noiseSuppression, setNoiseSuppression] = useState(false);
const [echoCancellation, setEchoCancellation] = useState(true);

// Apply audio processing
const toggleNoiseSuppression = useCallback(async () => {
  if (!publisher) return;

  try {
    await publisher.setAudioSource(publisher.getAudioSource(), {
      noiseSuppression: !noiseSuppression,
      echoCancellation: echoCancellation,
      autoGainControl: true
    });
    
    setNoiseSuppression(!noiseSuppression);
  } catch (error) {
    setError(`Audio processing failed: ${error.message}`);
  }
}, [publisher, noiseSuppression, echoCancellation]);

// Audio controls UI
<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
  <Button
    onClick={toggleNoiseSuppression}
    variant={noiseSuppression ? 'solid' : 'outlined'}
    size="sm"
    color="success"
  >
    🎤 {noiseSuppression ? 'Noise Filter ON' : 'Enable Noise Filter'}
  </Button>
  
  <Button
    onClick={() => setEchoCancellation(!echoCancellation)}
    variant={echoCancellation ? 'solid' : 'outlined'}
    size="sm"
  >
    🔊 Echo Cancel
  </Button>
</Box>
```

## Putting It All Together: Premium Video Component

Here's how to combine all these advanced features into a cohesive, premium video experience:

```typescript
// PremiumVideoCall.tsx - Complete advanced video component
export default function PremiumVideoCall() {
  // All state management from previous examples...
  
  // Master control panel
  const renderAdvancedControls = () => (
    <Box sx={{ 
      position: 'absolute', 
      bottom: 16, 
      left: '50%', 
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 1,
      flexWrap: 'wrap',
      bgcolor: 'rgba(0,0,0,0.8)',
      p: 2,
      borderRadius: 2,
      zIndex: 20
    }}>
      {/* Basic Controls */}
      <Button onClick={toggleMute} color={isMuted ? 'danger' : 'primary'}>
        {isMuted ? '🔇' : '🎤'}
      </Button>
      
      <Button onClick={toggleVideo} color={isVideoOff ? 'danger' : 'primary'}>
        {isVideoOff ? '📹' : '📷'}
      </Button>
      
      {/* Advanced Features */}
      <Button onClick={toggleBackgroundBlur} variant={backgroundBlurEnabled ? 'solid' : 'outlined'}>
        ✨ Blur
      </Button>
      
      <Button onClick={toggleScreenShare} color={isScreenSharing ? 'danger' : 'primary'}>
        {isScreenSharing ? 'Stop Share' : '🖥️ Share'}
      </Button>
      
      <Button onClick={toggleRecording} color={isRecording ? 'danger' : 'success'}>
        {isRecording ? '⏹️' : '🔴'} Record
      </Button>
      
      <Button onClick={toggleNoiseSuppression} variant={noiseSuppression ? 'solid' : 'outlined'}>
        🎤 Filter
      </Button>
      
      {/* Reactions */}
      {REACTIONS.map(emoji => (
        <Button key={emoji} onClick={() => sendReaction(emoji)} size="sm">
          {emoji}
        </Button>
      ))}
      
      {/* Layout Controls */}
      <Select value={layoutMode} onChange={(_, value) => setLayoutMode(value)}>
        <Option value="grid">Grid</Option>
        <Option value="speaker">Speaker</Option>
        <Option value="presentation">Presentation</Option>
        <Option value="auto">Auto</Option>
      </Select>
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Main video layout */}
      <DynamicVideoLayout participants={getPrioritizedParticipants()} />
      
      {/* Reaction overlay */}
      <ReactionOverlay />
      
      {/* Performance indicators */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Typography level="body-xs">
          Quality: {currentQuality} | Network: {networkQuality}
        </Typography>
      </Box>
      
      {/* Advanced controls */}
      {renderAdvancedControls()}
      
      {/* Chat panel (if open) */}
      {showChat && <ChatPanel />}
    </Box>
  );
}
```

## Performance Best Practices

### Optimization Checklist

1. **Video Quality Management**
   - Automatically adjust quality based on network conditions
   - Reduce resolution/frame rate for large meetings
   - Unsubscribe from non-visible participants

2. **Memory Management**
   - Monitor JavaScript heap usage
   - Clean up event listeners on component unmount
   - Dispose of unused video elements

3. **CPU Optimization**
   - Limit simultaneous video processing effects
   - Use requestAnimationFrame for smooth animations
   - Debounce rapid state changes

4. **Network Efficiency**
   - Implement adaptive bitrate streaming
   - Use selective subscription for large meetings
   - Optimize signaling message frequency

## Next Steps

You've now implemented premium video features that rival commercial video conferencing platforms. Consider exploring:

- **[Integration Patterns](./05-integration-patterns.md)**: Combine with other Vonage APIs
- **[Production Deployment](../reference/deployment-guide.md)**: Scale for real-world usage
- **Custom Analytics**: Track engagement and usage metrics
- **White-label Solutions**: Brand customization and embedding

## Conclusion

These advanced features transform basic video calls into engaging, professional experiences:

- **Background Processing**: Privacy and professionalism
- **Real-time Reactions**: Engagement and interactivity  
- **Smart Layouts**: Optimal viewing for any group size
- **Performance Optimization**: Smooth experience across devices
- **Audio Enhancement**: Crystal-clear communication

The patterns and techniques you've learned provide the foundation for building world-class video applications that can compete with any commercial solution.

**Ready to integrate with other services?** Continue to [Integration Patterns](./05-integration-patterns.md) to learn how to combine video with messaging, authentication, and other Vonage APIs.