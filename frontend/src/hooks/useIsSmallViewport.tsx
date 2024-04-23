import { useEffect, useState } from 'react';

/**
 * Determines whether a viewport is small. If the window is resized, determines if the new size is small.
 * @param {number} [target] - (optional) The number of pixels determining if a window viewport is small.
 * @returns {boolean} Whether the browser has a small viewport.
 */
const useIsSmallViewport = (target?: number): boolean => {
  const smallViewport = target ?? 768;
  const [isSmallViewport, setIsSmallViewport] = useState(window.innerWidth <= smallViewport);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallViewport(window.innerWidth <= smallViewport);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [smallViewport]);

  return isSmallViewport;
};

export default useIsSmallViewport;
