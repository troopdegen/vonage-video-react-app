import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useIsSmallViewport from '../useIsSmallViewport';

describe('useIsSmallViewport', () => {
  beforeEach(() => {
    vi.spyOn(global, 'innerWidth', 'get').mockReturnValue(1024);
    global.dispatchEvent(new Event('resize'));
  });

  it('should return false when window width is greater than 768px by default', () => {
    const { result } = renderHook(() => useIsSmallViewport());

    expect(result.current).toBe(false);
  });

  it('should return true when window width is less than or equal to 768px by default', () => {
    act(() => {
      vi.spyOn(global, 'innerWidth', 'get').mockReturnValue(768);
      global.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useIsSmallViewport());

    expect(result.current).toBe(true);
  });

  it('should return false when window width is greater than a provided value', () => {
    act(() => {
      vi.spyOn(global, 'innerWidth', 'get').mockReturnValue(481);
      global.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useIsSmallViewport(480));

    expect(result.current).toBe(false);
  });

  it('should return true when window width is less than or equal to a provided value', () => {
    act(() => {
      vi.spyOn(global, 'innerWidth', 'get').mockReturnValue(500);
      global.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useIsSmallViewport(500));

    expect(result.current).toBe(true);
  });

  it('should update to false when resized to a small width', () => {
    const { result } = renderHook(() => useIsSmallViewport());

    // Initially, this is a 1024px width
    expect(result.current).toBe(false);

    act(() => {
      vi.spyOn(global, 'innerWidth', 'get').mockReturnValue(512);
      global.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(true);
  });

  it('should update to false when resized to a larger width', () => {
    act(() => {
      vi.spyOn(global, 'innerWidth', 'get').mockReturnValue(512);
      global.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useIsSmallViewport());

    expect(result.current).toBe(true);

    act(() => {
      vi.spyOn(global, 'innerWidth', 'get').mockReturnValue(1024);
      global.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(false);
  });
});
