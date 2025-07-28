# Integration Patterns: Building Comprehensive Communication Solutions

## Introduction

The true power of the Vonage platform emerges when you combine multiple APIs to create comprehensive communication solutions. This section demonstrates how to integrate the Video API with other Vonage services to build applications that handle the complete communication lifecycle: from initial contact through verification, messaging, video consultation, and follow-up.

## Architecture Overview: Multi-API Integration

### The Unified Communication Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                         │
├─────────────────────────────────────────────────────────────┤
│  Video API     │  Messages API  │  Verify API  │  Voice API │
│  Real-time     │  Omnichannel   │  2FA & Auth  │  Phone     │
│  Video/Audio   │  Messaging     │  Security    │  Calls     │
├─────────────────────────────────────────────────────────────┤
│                Vonage Global Infrastructure                 │
└─────────────────────────────────────────────────────────────┘
```

### Common Integration Patterns

1. **Pre-Video Authentication**: Verify API → Video API
2. **Video + Messaging**: Real-time chat alongside video
3. **Multi-Channel Notifications**: Messages API for session invites
4. **Voice Fallback**: Voice API when video fails
5. **Post-Session Follow-up**: Messages API for summaries and recordings

## Pattern 1: Secure Video Meetings with 2FA

Combine Verify API with Video API to create secure, authenticated video sessions perfect for telehealth, financial consultations, or confidential meetings.

### Backend Integration Setup

```typescript
// backend/services/secureSessionService.ts
import { Vonage } from '@vonage/server-sdk';
import { videoService } from '../videoService/videoServiceFactory';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY!,
  apiSecret: process.env.VONAGE_API_SECRET!
});

interface SecureSessionRequest {
  phoneNumber: string;
  userEmail: string;
  meetingId: string;
}

export class SecureSessionService {
  // Step 1: Initialize secure session with verification
  async initiateSecureSession(request: SecureSessionRequest) {
    try {
      // Start phone verification
      const verifyResponse = await vonage.verify.start({
        number: request.phoneNumber,
        brand: 'Your App Name',
        codeLength: 6
      });

      // Store session request temporarily
      await this.storeSessionRequest(verifyResponse.requestId, {
        ...request,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      return {
        requestId: verifyResponse.requestId,
        status: 'verification_sent'
      };
    } catch (error) {
      throw new Error(`Verification failed: ${error.message}`);
    }
  }

  // Step 2: Verify code and create video session
  async completeSecureSession(requestId: string, code: string) {
    try {
      // Verify the code
      const verifyResult = await vonage.verify.check(requestId, code);
      
      if (verifyResult.status !== '0') {
        throw new Error('Invalid verification code');
      }

      // Retrieve stored session request
      const sessionRequest = await this.getSessionRequest(requestId);
      if (!sessionRequest) {
        throw new Error('Session request expired or not found');
      }

      // Create video session
      const videoSession = await videoService.createSession();
      
      // Generate token with enhanced security
      const token = videoService.generateToken(videoSession.sessionId, {
        role: 'publisher',
        data: JSON.stringify({
          verified: true,
          phone: sessionRequest.phoneNumber,
          meetingId: sessionRequest.meetingId,
          timestamp: Date.now()
        }),
        expireTime: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
      });

      // Clean up verification request
      await this.clearSessionRequest(requestId);

      return {
        status: 'verified',
        credentials: {
          apiKey: process.env.VONAGE_API_KEY,
          sessionId: videoSession.sessionId,
          token: token
        },
        meetingInfo: {
          id: sessionRequest.meetingId,
          verifiedParticipant: true
        }
      };
    } catch (error) {
      throw new Error(`Session creation failed: ${error.message}`);
    }
  }

  private async storeSessionRequest(requestId: string, data: any) {
    // Implement your storage mechanism (Redis, Database, etc.)
    // Example with in-memory storage:
    this.sessionRequests.set(requestId, data);
  }

  private async getSessionRequest(requestId: string) {
    return this.sessionRequests.get(requestId);
  }

  private async clearSessionRequest(requestId: string) {
    this.sessionRequests.delete(requestId);
  }

  private sessionRequests = new Map();
}
```

### API Endpoints

```typescript
// backend/routes/secureSession.ts
import express from 'express';
import { SecureSessionService } from '../services/secureSessionService';

const router = express.Router();
const secureSessionService = new SecureSessionService();

// Initiate secure session
router.post('/initiate', async (req, res) => {
  try {
    const { phoneNumber, userEmail, meetingId } = req.body;
    
    // Validate inputs
    if (!phoneNumber || !userEmail || !meetingId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await secureSessionService.initiateSecureSession({
      phoneNumber,
      userEmail,
      meetingId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete secure session
router.post('/verify', async (req, res) => {
  try {
    const { requestId, code } = req.body;
    
    if (!requestId || !code) {
      return res.status(400).json({ error: 'Request ID and code required' });
    }

    const result = await secureSessionService.completeSecureSession(requestId, code);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
```

### Frontend: Secure Session Component

```typescript
// SecureVideoMeeting.tsx
import React, { useState, useCallback } from 'react';
import { Box, Button, Input, Typography, Alert } from '@mui/joy';

interface SecureVideoMeetingProps {
  meetingId: string;
  onSessionReady: (credentials: any) => void;
}

export default function SecureVideoMeeting({ meetingId, onSessionReady }: SecureVideoMeetingProps) {
  const [step, setStep] = useState<'phone' | 'verification' | 'connecting'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [requestId, setRequestId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Request verification
  const initiateVerification = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/secure-session/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          userEmail,
          meetingId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setRequestId(data.requestId);
      setStep('verification');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, userEmail, meetingId]);

  // Step 2: Verify code and get session
  const verifyAndConnect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/secure-session/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStep('connecting');
      onSessionReady(data.credentials);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [requestId, verificationCode, onSessionReady]);

  const renderPhoneStep = () => (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography level="h3" sx={{ mb: 3 }}>
        🔒 Secure Meeting Access
      </Typography>
      
      <Typography sx={{ mb: 3 }}>
        To join this secure meeting, we need to verify your identity via SMS.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <Input
          placeholder="Phone number (e.g., +1234567890)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          type="tel"
        />
        
        <Input
          placeholder="Email address"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          type="email"
        />
      </Box>

      <Button
        onClick={initiateVerification}
        disabled={!phoneNumber || !userEmail || loading}
        loading={loading}
        fullWidth
      >
        Send Verification Code
      </Button>
    </Box>
  );

  const renderVerificationStep = () => (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography level="h3" sx={{ mb: 3 }}>
        📱 Enter Verification Code
      </Typography>
      
      <Typography sx={{ mb: 3 }}>
        We've sent a 6-digit code to {phoneNumber}. Enter it below to access the meeting.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <Input
          placeholder="6-digit code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          type="text"
          sx={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => setStep('phone')}
          disabled={loading}
        >
          Back
        </Button>
        
        <Button
          onClick={verifyAndConnect}
          disabled={verificationCode.length !== 6 || loading}
          loading={loading}
          sx={{ flex: 1 }}
        >
          Verify & Join Meeting
        </Button>
      </Box>
    </Box>
  );

  const renderConnectingStep = () => (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3, textAlign: 'center' }}>
      <Typography level="h3" sx={{ mb: 3 }}>
        ✅ Verified Successfully
      </Typography>
      
      <Typography sx={{ mb: 3 }}>
        Connecting to secure meeting...
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'background.body' }}>
      <Box sx={{ width: '100%' }}>
        {error && (
          <Alert color="danger" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            {error}
          </Alert>
        )}

        {step === 'phone' && renderPhoneStep()}
        {step === 'verification' && renderVerificationStep()}
        {step === 'connecting' && renderConnectingStep()}
      </Box>
    </Box>
  );
}
```

## Pattern 2: Multi-Channel Communication Hub

Create a comprehensive communication solution that seamlessly transitions between messaging, video, and voice based on context and user preferences.

### Unified Communication Service

```typescript
// backend/services/communicationHub.ts
import { Vonage } from '@vonage/server-sdk';
import { videoService } from '../videoService/videoServiceFactory';

export class CommunicationHub {
  private vonage: Vonage;

  constructor() {
    this.vonage = new Vonage({
      apiKey: process.env.VONAGE_API_KEY!,
      apiSecret: process.env.VONAGE_API_SECRET!,
      applicationId: process.env.VONAGE_APP_ID!,
      privateKey: process.env.VONAGE_PRIVATE_KEY!
    });
  }

  // Send meeting invitation via SMS with video link
  async sendMeetingInvitation(invitation: {
    to: string;
    meetingId: string;
    hostName: string;
    scheduledTime: Date;
    meetingUrl: string;
  }) {
    const message = `
🎥 Meeting Invitation

Host: ${invitation.hostName}
Time: ${invitation.scheduledTime.toLocaleString()}
Meeting ID: ${invitation.meetingId}

Join here: ${invitation.meetingUrl}

Reply CONFIRM to accept or DECLINE to reject.
    `.trim();

    try {
      const response = await this.vonage.sms.send({
        to: invitation.to,
        from: 'YourApp',
        text: message
      });

      return { success: true, messageId: response.messages[0]['message-id'] };
    } catch (error) {
      throw new Error(`Failed to send invitation: ${error.message}`);
    }
  }

  // Send WhatsApp meeting invitation with rich formatting
  async sendWhatsAppInvitation(invitation: {
    to: string;
    meetingId: string;
    hostName: string;
    scheduledTime: Date;
    meetingUrl: string;
  }) {
    try {
      const response = await this.vonage.messages.send({
        message_type: 'text',
        to: invitation.to,
        from: 'your_whatsapp_number',
        channel: 'whatsapp',
        text: `
🎥 *Meeting Invitation*

*Host:* ${invitation.hostName}
*Time:* ${invitation.scheduledTime.toLocaleString()}
*Meeting ID:* ${invitation.meetingId}

Click to join: ${invitation.meetingUrl}

Reply with "YES" to confirm attendance.
        `.trim()
      });

      return { success: true, messageId: response.message_uuid };
    } catch (error) {
      throw new Error(`Failed to send WhatsApp invitation: ${error.message}`);
    }
  }

  // Handle meeting reminders
  async sendMeetingReminder(reminder: {
    to: string;
    meetingId: string;
    hostName: string;
    startsIn: number; // minutes
    meetingUrl: string;
    channel: 'sms' | 'whatsapp';
  }) {
    const message = `
⏰ Meeting Reminder

Your meeting with ${reminder.hostName} starts in ${reminder.startsIn} minutes.

Meeting ID: ${reminder.meetingId}
Join: ${reminder.meetingUrl}
    `.trim();

    if (reminder.channel === 'whatsapp') {
      return this.vonage.messages.send({
        message_type: 'text',
        to: reminder.to,
        from: 'your_whatsapp_number',
        channel: 'whatsapp',
        text: message
      });
    } else {
      return this.vonage.sms.send({
        to: reminder.to,
        from: 'YourApp',
        text: message
      });
    }
  }

  // Create meeting with automatic invitations
  async createMeetingWithInvitations(meeting: {
    hostName: string;
    participants: Array<{ phone: string; email: string; name: string; preferredChannel: 'sms' | 'whatsapp' }>;
    scheduledTime: Date;
    meetingId: string;
    baseUrl: string;
  }) {
    try {
      // Create video session
      const videoSession = await videoService.createSession();
      const meetingUrl = `${meeting.baseUrl}/meeting/${meeting.meetingId}`;

      // Send invitations to all participants
      const invitationPromises = meeting.participants.map(async (participant) => {
        const invitation = {
          to: participant.phone,
          meetingId: meeting.meetingId,
          hostName: meeting.hostName,
          scheduledTime: meeting.scheduledTime,
          meetingUrl
        };

        if (participant.preferredChannel === 'whatsapp') {
          return this.sendWhatsAppInvitation(invitation);
        } else {
          return this.sendMeetingInvitation(invitation);
        }
      });

      const invitationResults = await Promise.allSettled(invitationPromises);

      return {
        sessionId: videoSession.sessionId,
        meetingUrl,
        invitationResults: invitationResults.map((result, index) => ({
          participant: meeting.participants[index],
          success: result.status === 'fulfilled',
          error: result.status === 'rejected' ? result.reason.message : null
        }))
      };
    } catch (error) {
      throw new Error(`Failed to create meeting: ${error.message}`);
    }
  }

  // Handle voice fallback when video fails
  async initiateVoiceFallback(callData: {
    from: string;
    to: string;
    meetingId: string;
  }) {
    try {
      const response = await this.vonage.voice.createOutboundCall({
        to: [{
          type: 'phone',
          number: callData.to
        }],
        from: {
          type: 'phone',
          number: callData.from
        },
        ncco: [
          {
            action: 'talk',
            text: `Hello, this is a voice fallback for meeting ${callData.meetingId}. You will be connected to the conference bridge.`
          },
          {
            action: 'conversation',
            name: `meeting-${callData.meetingId}`
          }
        ]
      });

      return { success: true, callId: response.uuid };
    } catch (error) {
      throw new Error(`Voice fallback failed: ${error.message}`);
    }
  }

  // Send meeting summary and recording links
  async sendMeetingSummary(summary: {
    participants: Array<{ phone: string; email: string; name: string }>;
    meetingId: string;
    duration: string;
    recordingUrl?: string;
    nextSteps?: string[];
    hostName: string;
  }) {
    let message = `
📝 Meeting Summary

Meeting ID: ${summary.meetingId}
Host: ${summary.hostName}
Duration: ${summary.duration}
    `;

    if (summary.recordingUrl) {
      message += `\n\n🎥 Recording: ${summary.recordingUrl}`;
    }

    if (summary.nextSteps && summary.nextSteps.length > 0) {
      message += `\n\n📋 Next Steps:\n${summary.nextSteps.map(step => `• ${step}`).join('\n')}`;
    }

    // Send to all participants
    const summaryPromises = summary.participants.map(participant =>
      this.vonage.sms.send({
        to: participant.phone,
        from: 'YourApp',
        text: message.trim()
      })
    );

    return Promise.allSettled(summaryPromises);
  }
}
```

## Pattern 3: Real-Time Chat Integration with Video

Enhance video calls with sophisticated messaging capabilities that persist beyond the session.

### Enhanced Chat Service

```typescript
// backend/services/enhancedChatService.ts
import { Vonage } from '@vonage/server-sdk';

export class EnhancedChatService {
  private vonage: Vonage;

  constructor() {
    this.vonage = new Vonage({
      apiKey: process.env.VONAGE_API_KEY!,
      apiSecret: process.env.VONAGE_API_SECRET!
    });
  }

  // Send chat history via SMS when session ends
  async sendChatSummary(summary: {
    to: string;
    meetingId: string;
    messages: Array<{ sender: string; text: string; timestamp: Date }>;
  }) {
    // Create formatted chat summary
    const chatSummary = summary.messages
      .slice(-10) // Last 10 messages
      .map(msg => `${msg.sender}: ${msg.text}`)
      .join('\n');

    const message = `
💬 Chat Summary - Meeting ${summary.meetingId}

${chatSummary}

Full chat history available in your account.
    `.trim();

    return this.vonage.sms.send({
      to: summary.to,
      from: 'YourApp',
      text: message
    });
  }

  // Send important chat messages via WhatsApp during video call
  async sendHighPriorityMessage(message: {
    to: string;
    from: string;
    text: string;
    meetingId: string;
  }) {
    try {
      return await this.vonage.messages.send({
        message_type: 'text',
        to: message.to,
        from: 'your_whatsapp_number',
        channel: 'whatsapp',
        text: `
🚨 Priority Message from ${message.from}

Meeting: ${message.meetingId}
Message: ${message.text}

This message was flagged as important during your video call.
        `.trim()
      });
    } catch (error) {
      throw new Error(`Failed to send priority message: ${error.message}`);
    }
  }
}
```

### Frontend: Integrated Chat with External Messaging

```typescript
// IntegratedVideoChat.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Box, Button, Input, Typography, Switch, Alert } from '@mui/joy';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  priority: 'normal' | 'high';
  external: boolean; // Sent via external channel
}

export function IntegratedVideoChat({ session, participantPhone }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [highPriority, setHighPriority] = useState(false);
  const [sendExternal, setSendExternal] = useState(false);

  // Send message with optional external delivery
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage.trim(),
      sender: 'You',
      timestamp: new Date(),
      priority: highPriority ? 'high' : 'normal',
      external: sendExternal
    };

    try {
      // Send via video session signaling
      session.signal({
        type: 'chat',
        data: JSON.stringify(messageData)
      });

      // If high priority or external delivery requested, also send via SMS/WhatsApp
      if (highPriority || sendExternal) {
        await fetch('/api/chat/send-external', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: participantPhone,
            message: messageData,
            channel: sendExternal ? 'whatsapp' : 'sms'
          })
        });
      }

      // Add to local messages
      const localMessage: Message = {
        id: Date.now().toString(),
        ...messageData,
        external: highPriority || sendExternal
      };
      
      setMessages(prev => [...prev, localMessage]);
      setNewMessage('');
      setHighPriority(false);
      setSendExternal(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [newMessage, highPriority, sendExternal, session, participantPhone]);

  // Enhanced message display
  const renderMessage = (message: Message) => (
    <Box
      key={message.id}
      sx={{
        mb: 1,
        p: 1,
        borderLeft: message.priority === 'high' ? '3px solid red' : '3px solid transparent',
        bgcolor: message.external ? 'warning.50' : 'neutral.50',
        borderRadius: 'sm'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography level="body-xs" color="neutral">
          {message.sender}
        </Typography>
        {message.priority === 'high' && <span>🚨</span>}
        {message.external && <span>📱</span>}
        <Typography level="body-xs" color="neutral">
          {message.timestamp.toLocaleTimeString()}
        </Typography>
      </Box>
      <Typography level="body-sm">{message.text}</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 300 }}>
      <Typography level="title-md" sx={{ mb: 2 }}>
        Enhanced Chat
      </Typography>

      {/* Messages display */}
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
        {messages.map(renderMessage)}
      </Box>

      {/* Message options */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
        <Switch
          checked={highPriority}
          onChange={(e) => setHighPriority(e.target.checked)}
          size="sm"
        />
        <Typography level="body-xs">High Priority (SMS)</Typography>

        <Switch
          checked={sendExternal}
          onChange={(e) => setSendExternal(e.target.checked)}
          size="sm"
        />
        <Typography level="body-xs">Send WhatsApp</Typography>
      </Box>

      {/* Message input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          sx={{ flex: 1 }}
        />
        <Button onClick={sendMessage} disabled={!newMessage.trim()}>
          Send
        </Button>
      </Box>

      {(highPriority || sendExternal) && (
        <Alert color="warning" size="sm" sx={{ mt: 1 }}>
          This message will also be sent via {sendExternal ? 'WhatsApp' : 'SMS'}
        </Alert>
      )}
    </Box>
  );
}
```

## Pattern 4: Healthcare Video Platform

Build a complete telehealth solution combining secure authentication, video consultations, and follow-up communications.

### Healthcare Communication Workflow

```typescript
// backend/services/healthcareWorkflow.ts
import { CommunicationHub } from './communicationHub';
import { SecureSessionService } from './secureSessionService';
import { EnhancedChatService } from './enhancedChatService';

export class HealthcareWorkflow {
  private communicationHub: CommunicationHub;
  private secureSession: SecureSessionService;
  private chatService: EnhancedChatService;

  constructor() {
    this.communicationHub = new CommunicationHub();
    this.secureSession = new SecureSessionService();
    this.chatService = new EnhancedChatService();
  }

  // Complete patient journey workflow
  async scheduleConsultation(appointment: {
    doctorName: string;
    patientPhone: string;
    patientEmail: string;
    appointmentTime: Date;
    appointmentId: string;
    specialtyNotes?: string;
  }) {
    try {
      // 1. Send appointment confirmation
      await this.communicationHub.sendMeetingInvitation({
        to: appointment.patientPhone,
        meetingId: appointment.appointmentId,
        hostName: `Dr. ${appointment.doctorName}`,
        scheduledTime: appointment.appointmentTime,
        meetingUrl: `${process.env.BASE_URL}/consultation/${appointment.appointmentId}`
      });

      // 2. Schedule reminder 24 hours before
      const reminderTime = new Date(appointment.appointmentTime.getTime() - 24 * 60 * 60 * 1000);
      await this.scheduleReminder(appointment, reminderTime);

      // 3. Schedule pre-consultation verification 15 minutes before
      const verificationTime = new Date(appointment.appointmentTime.getTime() - 15 * 60 * 1000);
      await this.scheduleVerification(appointment, verificationTime);

      return { success: true, appointmentId: appointment.appointmentId };
    } catch (error) {
      throw new Error(`Failed to schedule consultation: ${error.message}`);
    }
  }

  // Pre-consultation verification and instructions
  async sendPreConsultationInstructions(appointment: {
    patientPhone: string;
    doctorName: string;
    appointmentId: string;
    instructions: string[];
  }) {
    const message = `
🏥 Upcoming Consultation Reminder

Dr. ${appointment.doctorName} consultation in 15 minutes.

📋 Pre-consultation checklist:
${appointment.instructions.map(instruction => `• ${instruction}`).join('\n')}

🔐 You'll receive a verification code before joining.

Appointment ID: ${appointment.appointmentId}
    `.trim();

    return this.communicationHub.vonage.sms.send({
      to: appointment.patientPhone,
      from: 'HealthApp',
      text: message
    });
  }

  // Post-consultation follow-up
  async sendPostConsultationSummary(consultation: {
    patientPhone: string;
    doctorName: string;
    appointmentId: string;
    duration: string;
    prescription?: string;
    followUpInstructions: string[];
    nextAppointment?: Date;
    recordingUrl?: string;
  }) {
    let message = `
🏥 Consultation Summary

Dr. ${consultation.doctorName}
Duration: ${consultation.duration}
ID: ${consultation.appointmentId}

📋 Instructions:
${consultation.followUpInstructions.map(instruction => `• ${instruction}`).join('\n')}
    `;

    if (consultation.prescription) {
      message += `\n\n💊 Prescription: ${consultation.prescription}`;
    }

    if (consultation.nextAppointment) {
      message += `\n\n📅 Next appointment: ${consultation.nextAppointment.toLocaleString()}`;
    }

    if (consultation.recordingUrl) {
      message += `\n\n🎥 Consultation recording: ${consultation.recordingUrl}`;
    }

    message += '\n\nFor urgent concerns, contact our 24/7 helpline.';

    return this.communicationHub.vonage.sms.send({
      to: consultation.patientPhone,
      from: 'HealthApp',
      text: message.trim()
    });
  }

  private async scheduleReminder(appointment: any, reminderTime: Date) {
    // Implement your scheduling mechanism (cron job, queue, etc.)
    console.log(`Reminder scheduled for ${reminderTime}`);
  }

  private async scheduleVerification(appointment: any, verificationTime: Date) {
    // Implement pre-consultation verification scheduling
    console.log(`Verification scheduled for ${verificationTime}`);
  }
}
```

## Pattern 5: Customer Support Video Integration

Create a seamless customer support experience that escalates from chat to video when needed.

### Support Escalation Service

```typescript
// backend/services/supportEscalationService.ts
export class SupportEscalationService {
  async initiateVideoEscalation(escalation: {
    ticketId: string;
    customerPhone: string;
    agentName: string;
    issueDescription: string;
    estimatedDuration: number;
  }) {
    try {
      // Create immediate video session
      const videoSession = await videoService.createSession();
      
      // Send video invitation with context
      const message = `
🎧 Customer Support Video Call

Agent: ${escalation.agentName}
Ticket: ${escalation.ticketId}
Issue: ${escalation.issueDescription}

Join video call: ${process.env.BASE_URL}/support/${escalation.ticketId}

Estimated duration: ${escalation.estimatedDuration} minutes

This call may be recorded for quality assurance.
      `.trim();

      await this.communicationHub.vonage.sms.send({
        to: escalation.customerPhone,
        from: 'Support',
        text: message
      });

      return {
        sessionId: videoSession.sessionId,
        callUrl: `${process.env.BASE_URL}/support/${escalation.ticketId}`
      };
    } catch (error) {
      throw new Error(`Video escalation failed: ${error.message}`);
    }
  }

  // Send screen sharing instructions
  async sendScreenShareInstructions(customer: {
    phone: string;
    agentName: string;
  }) {
    const message = `
🖥️ Screen Sharing Instructions

${customer.agentName} has requested to view your screen to better assist you.

When prompted:
1. Click "Share Screen"
2. Select the window/tab with the issue
3. Click "Share"

Your privacy is protected - you control what is shared.
    `.trim();

    return this.communicationHub.vonage.sms.send({
      to: customer.phone,
      from: 'Support',
      text: message
    });
  }

  // Follow-up satisfaction survey
  async sendSatisfactionSurvey(support: {
    customerPhone: string;
    agentName: string;
    ticketId: string;
    resolutionSummary: string;
  }) {
    const surveyUrl = `${process.env.BASE_URL}/survey/${support.ticketId}`;
    
    const message = `
✅ Support Call Complete

Agent: ${support.agentName}
Ticket: ${support.ticketId}

Resolution: ${support.resolutionSummary}

How was your experience? Rate us here: ${surveyUrl}

Reply HELP if you need further assistance.
    `.trim();

    return this.communicationHub.vonage.sms.send({
      to: support.customerPhone,
      from: 'Support',
      text: message
    });
  }
}
```

## Integration Best Practices

### 1. Error Handling and Fallbacks

```typescript
// Robust integration with fallback strategies
export class RobustCommunicationService {
  async sendWithFallback(recipient: {
    phone: string;
    email: string;
    preferredChannel: 'sms' | 'whatsapp' | 'email';
  }, message: string) {
    const attempts = [
      { channel: recipient.preferredChannel, priority: 1 },
      { channel: 'sms', priority: 2 },
      { channel: 'email', priority: 3 }
    ];

    for (const attempt of attempts) {
      try {
        switch (attempt.channel) {
          case 'whatsapp':
            return await this.sendWhatsApp(recipient.phone, message);
          case 'sms':
            return await this.sendSMS(recipient.phone, message);
          case 'email':
            return await this.sendEmail(recipient.email, message);
        }
      } catch (error) {
        console.warn(`${attempt.channel} failed, trying next option:`, error.message);
        continue;
      }
    }

    throw new Error('All communication channels failed');
  }
}
```

### 2. Rate Limiting and Cost Management

```typescript
// Smart rate limiting to manage API costs
export class CostOptimizedMessaging {
  private rateLimiter = new Map<string, number>();

  async sendOptimized(to: string, message: string, channel: 'sms' | 'whatsapp') {
    // Check rate limits
    const key = `${to}-${channel}`;
    const lastSent = this.rateLimiter.get(key) || 0;
    const now = Date.now();

    if (now - lastSent < 60000) { // 1 minute cooldown
      throw new Error('Rate limit exceeded');
    }

    // Choose cost-effective channel based on message length
    const optimizedChannel = this.chooseOptimalChannel(message, channel);
    
    const result = await this.send(to, message, optimizedChannel);
    this.rateLimiter.set(key, now);
    
    return result;
  }

  private chooseOptimalChannel(message: string, preferred: string): string {
    // SMS is cheaper for short messages, WhatsApp for longer ones
    if (message.length > 160 && preferred === 'sms') {
      return 'whatsapp';
    }
    return preferred;
  }
}
```

### 3. Message Templates and Personalization

```typescript
// Template-based messaging with personalization
export class TemplateService {
  private templates = new Map([
    ['meeting_invite', {
      sms: 'Hi {{name}}, {{host}} invited you to a meeting at {{time}}. Join: {{url}}',
      whatsapp: '*Meeting Invitation* 📅\n\nHi {{name}}!\n{{host}} has invited you to a video meeting.\n\n🕐 *Time:* {{time}}\n🔗 *Join:* {{url}}\n\nSee you there!'
    }],
    ['reminder', {
      sms: 'Reminder: Your meeting with {{host}} starts in {{minutes}} minutes. Join: {{url}}',
      whatsapp: '⏰ *Meeting Reminder*\n\nYour meeting with {{host}} starts in {{minutes}} minutes.\n\n🔗 Join now: {{url}}'
    }]
  ]);

  async sendFromTemplate(
    templateId: string,
    channel: 'sms' | 'whatsapp',
    to: string,
    variables: Record<string, string>
  ) {
    const template = this.templates.get(templateId)?.[channel];
    if (!template) {
      throw new Error(`Template ${templateId} not found for ${channel}`);
    }

    const message = this.interpolate(template, variables);
    return this.send(to, message, channel);
  }

  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
  }
}
```

## Testing Integration Patterns

### Integration Test Suite

```typescript
// Integration testing for multi-API workflows
describe('Communication Integration', () => {
  test('secure video meeting flow', async () => {
    // 1. Initiate verification
    const verifyResponse = await request(app)
      .post('/api/secure-session/initiate')
      .send({
        phoneNumber: '+1234567890',
        userEmail: 'test@example.com',
        meetingId: 'test-meeting'
      });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.status).toBe('verification_sent');

    // 2. Mock verification completion
    const sessionResponse = await request(app)
      .post('/api/secure-session/verify')
      .send({
        requestId: verifyResponse.body.requestId,
        code: '123456' // Mock code
      });

    expect(sessionResponse.status).toBe(200);
    expect(sessionResponse.body.credentials).toBeDefined();
  });

  test('meeting invitation delivery', async () => {
    const invitation = {
      to: '+1234567890',
      meetingId: 'test-meeting',
      hostName: 'Test Host',
      scheduledTime: new Date(),
      meetingUrl: 'https://example.com/meeting/test'
    };

    const result = await communicationHub.sendMeetingInvitation(invitation);
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });
});
```

## Deployment Considerations

### Environment Configuration

```bash
# Multi-API environment variables
VONAGE_API_KEY=your_api_key
VONAGE_API_SECRET=your_api_secret
VONAGE_APP_ID=your_application_id
VONAGE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."

# Service-specific configuration
WHATSAPP_NUMBER=your_whatsapp_business_number
SMS_SENDER_ID=YourBrand
EMAIL_SENDER=noreply@yourdomain.com

# Integration settings
BASE_URL=https://yourdomain.com
WEBHOOK_SECRET=your_webhook_secret
RATE_LIMIT_ENABLED=true
COST_OPTIMIZATION=true
```

## Conclusion

Multi-API integration patterns unlock the full potential of the Vonage communication platform:

- **Seamless User Journeys**: From initial contact through video consultation to follow-up
- **Enhanced Security**: Multi-factor authentication and verified sessions
- **Omnichannel Communication**: SMS, WhatsApp, voice, and video coordination
- **Industry-Specific Solutions**: Healthcare, support, education, and enterprise workflows
- **Cost Optimization**: Smart channel selection and rate limiting

These integration patterns provide the foundation for building comprehensive communication solutions that rival enterprise platforms while maintaining the flexibility and cost-effectiveness of API-based development.

**Ready to deploy?** Continue to [Reference Materials](./reference/) for production deployment guides, API references, and troubleshooting resources.