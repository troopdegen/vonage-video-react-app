import { useEffect, useState } from 'react';

/**
 * Mobile browsers can have an address bar opened or closed. This calculates the proper height of the screen.
 * @returns {string} - The height
 */
export default (): string => {
  // We ignore the following lint warning because we do not want a scale of 0.
  const [height, setHeight] = useState(window.innerHeight * (window.visualViewport?.scale || 1)); // NOSONAR

  useEffect(() => {
    const onResize = () => {
      setHeight(window.innerHeight * (window.visualViewport?.scale ?? 1));
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  });

  return `${height}px`;
};
