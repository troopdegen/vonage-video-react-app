import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import useHeight from '../useHeight';

describe('useHeight', () => {
  let originalVisualViewport = global.visualViewport;

  beforeAll(() => {
    // In the testing environment, the global object does not have a visualViewport object.
    // We'll set it here for testing and revert after finishing the test suite.
    originalVisualViewport = global.visualViewport;
  });

  beforeEach(() => {
    vi.spyOn(global, 'innerHeight', 'get').mockReturnValue(667);
    global.visualViewport = { scale: 1 } as VisualViewport;
    global.dispatchEvent(new Event('resize'));
  });

  afterAll(() => {
    global.visualViewport = originalVisualViewport;
  });

  it('should return the initial height', () => {
    const { result } = renderHook(() => useHeight());

    expect(result.current).toBe('667px');
  });

  it('should update height on window resize', () => {
    const { result } = renderHook(() => useHeight());
    act(() => {
      vi.spyOn(global, 'innerHeight', 'get').mockReturnValue(1024);
      global.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe('1024px');
  });

  it('should account for visualViewport scale', () => {
    const { result } = renderHook(() => useHeight());
    act(() => {
      global.visualViewport = { scale: 2 } as VisualViewport;
      global.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe('1334px');
  });
});
