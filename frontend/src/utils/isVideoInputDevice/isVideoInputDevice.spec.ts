import { describe, it, expect } from 'vitest';
import { Device } from '@vonage/client-sdk-video';
import isVideoInputDevice from './isVideoInputDevice';

describe('isVideoInputDevice', () => {
  it('when given a videoInputDevice, returns true', () => {
    const videoInputDevice: Device = {
      kind: 'videoInput',
      deviceId: 'deviceId',
      label: 'deviceLabel',
    };

    const result = isVideoInputDevice(videoInputDevice);
    expect(result).toBe(true);
  });

  it('when given an audioInput device, returns false', () => {
    const audioInputDevice: Device = {
      kind: 'audioInput',
      deviceId: 'deviceId',
      label: 'deviceLabel',
    };

    const result = isVideoInputDevice(audioInputDevice);

    expect(result).toBe(false);
  });
});
