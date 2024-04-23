import { describe, it, expect } from 'vitest';
import { Device } from '@vonage/client-sdk-video';
import isAudioInputDevice from './isAudioInputDevice';

describe('isAudioInputDevice', () => {
  it('when given an audioInput device, returns true', () => {
    const audioInputDevice: Device = {
      kind: 'audioInput',
      deviceId: 'deviceId',
      label: 'deviceLabel',
    };

    const result = isAudioInputDevice(audioInputDevice);

    expect(result).toBe(true);
  });

  it('when given a videoInputDevice, returns false', () => {
    const videoInputDevice: Device = {
      kind: 'videoInput',
      deviceId: 'deviceId',
      label: 'deviceLabel',
    };

    const result = isAudioInputDevice(videoInputDevice);
    expect(result).toBe(false);
  });
});
