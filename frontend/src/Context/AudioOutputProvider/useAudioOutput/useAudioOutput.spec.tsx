import { beforeEach, describe, it, expect, vi, afterAll, MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AudioOutputDevice } from '@vonage/client-sdk-video';
import * as OT from '@vonage/client-sdk-video';
import useAudioOutput from './useAudioOutput';

vi.mock('@vonage/client-sdk-video');

describe('useAudioOutput', () => {
  let mockGetActiveAudioOutputDevice: MockInstance<[], Promise<AudioOutputDevice>>;
  let mockSetAudioOutputDevice: MockInstance<[deviceId: string], Promise<void>>;

  beforeEach(() => {
    vi.resetAllMocks();

    mockGetActiveAudioOutputDevice = vi.spyOn(OT, 'getActiveAudioOutputDevice').mockImplementation(
      () =>
        new Promise<AudioOutputDevice>((res) => {
          res({
            deviceId: 'some-device-id',
            label: 'some-device-label',
          });
        })
    );
    mockSetAudioOutputDevice = vi.spyOn(OT, 'setAudioOutputDevice').mockImplementation(
      () =>
        new Promise<void>((res) => {
          res();
        })
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useAudioOutput());

    expect(result.current.audioOutput).toBeUndefined();
    expect(result.current.setAudioOutput).toBeDefined();
  });

  it('should call getActiveAudioOutputDevice when initialized', async () => {
    const { result } = renderHook(() => useAudioOutput());

    await waitFor(() => expect(result.current.audioOutput).toBe('some-device-id'));

    expect(mockGetActiveAudioOutputDevice).toHaveBeenCalledOnce();
  });

  it('should update audioOutput when setAudioOutput is called', async () => {
    const newAudioOutput = 'new-audio-output-device';
    const { result, rerender } = renderHook(() => useAudioOutput());

    await act(async () => {
      await result.current.setAudioOutput(newAudioOutput);
    });

    rerender();

    expect(result.current.audioOutput).toBe(newAudioOutput);
  });

  it('should call setAudioOutputDevice when audioOutput is called', async () => {
    const newAudioOutput = 'new-audio-output-device';
    const { result } = renderHook(() => useAudioOutput());

    await act(async () => {
      await result.current.setAudioOutput(newAudioOutput);
    });

    expect(mockSetAudioOutputDevice).toHaveBeenCalledOnce();
  });
});
