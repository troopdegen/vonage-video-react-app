import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';
import useElementDimensions from '../useElementDimensions';

describe('useElementDimensions', () => {
  let elementRef: RefObject<HTMLDivElement>;
  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);

    elementRef = { current: document.createElement('div') };
    Object.defineProperty(elementRef.current, 'offsetWidth', {
      configurable: true,
      writable: true,
      value: 1,
    });

    Object.defineProperty(elementRef.current, 'offsetHeight', {
      configurable: true,
      writable: true,
      value: 2,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('initially returns dimensions as { width: 0, height: 0 }', () => {
    const { result } = renderHook(() => useElementDimensions({ elementRef }));
    expect(result.current).toEqual({ width: 0, height: 0 });
  });
});
