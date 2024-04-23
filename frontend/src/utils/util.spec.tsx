import { describe, it, expect, vi, afterAll } from 'vitest';
import { Device } from '@vonage/client-sdk-video';
import * as util from './util';

const chromeUserAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

const safariUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15';

const firefoxUserAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';

describe('isGetActiveAudioOutputDeviceSupported', () => {
  const originalUserAgent = navigator.userAgent;

  afterAll(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
    });
  });

  it('is not supported on Firefox', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: firefoxUserAgent,
      writable: true,
    });

    expect(util.isGetActiveAudioOutputDeviceSupported()).toBe(false);
  });

  it('is not supported on Safari', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: safariUserAgent,
      writable: true,
    });

    expect(util.isGetActiveAudioOutputDeviceSupported()).toBe(false);
  });

  it('is supported on Chrome', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: chromeUserAgent,
      writable: true,
    });

    expect(util.isGetActiveAudioOutputDeviceSupported()).toBe(true);
  });
});

describe('isWebKit', () => {
  const originalUserAgent = navigator.userAgent;

  afterAll(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
    });
  });

  it('returns true if it is Safari', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: safariUserAgent,
      writable: true,
    });

    expect(util.isWebKit()).toBe(true);
  });

  it('returns false if it is Chrome', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: chromeUserAgent,
      writable: true,
    });

    expect(util.isWebKit()).toBe(false);
  });
});

describe('getBackgroundGradient', () => {
  it('should return a linear gradient with the specified fill percentage', () => {
    const level = 50;
    const result = util.getBackgroundGradient(level);
    expect(result).toBe('linear-gradient(to top, rgba(26,115,232,.9) 50%, transparent 50%)');
  });
});

describe('getAudioSourceDeviceId', () => {
  it('returns the correct deviceId when a matching device is found', () => {
    const devices: Device[] = [
      { kind: 'audioInput', deviceId: 'device1', label: 'Microphone 1' },
      { kind: 'audioInput', deviceId: 'device2', label: 'Microphone 2' },
    ];
    const currentAudioSource = { label: 'Microphone 2' } as MediaStreamTrack;

    const result = util.getAudioSourceDeviceId(devices, currentAudioSource);
    expect(result).toBe('device2');
  });

  it('returns an empty string when no matching device is found', () => {
    const devices: Device[] = [
      { kind: 'audioInput', deviceId: 'device1', label: 'Microphone 1' },
      { kind: 'audioInput', deviceId: 'device2', label: 'Microphone 2' },
    ];
    const currentAudioSource = { label: 'Not Matching Microphone' } as MediaStreamTrack;

    const result = util.getAudioSourceDeviceId(devices, currentAudioSource);
    expect(result).toBe('');
  });
});
