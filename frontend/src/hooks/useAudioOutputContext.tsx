import { useContext } from 'react';
import { AudioOutputContext, AudioOutputContextType } from '../Context/AudioOutputProvider';

/**
 * React hook to access the audio output context containing audio output options.
 * @returns {AudioOutputContextType} - The current context value for the audio output context.
 */
const useAudioOutputContext = (): AudioOutputContextType => {
  const context = useContext<AudioOutputContextType>(AudioOutputContext);
  return context;
};

export default useAudioOutputContext;
