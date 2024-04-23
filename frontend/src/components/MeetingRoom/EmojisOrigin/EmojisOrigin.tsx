import { ReactElement } from 'react';
import useEmoji from '../../../hooks/useEmoji';
import Emoji from '../Emoji/Emoji';

/**
 * EmojisOrigin Component
 *
 * Displays the emojis sent from any users in the meeting. All emojis will be initially rendered from this point.
 * @returns {ReactElement} - The EmojisOrigin Component.
 */
const EmojisOrigin = (): ReactElement => {
  const { emojiQueue } = useEmoji();

  return (
    <>
      {emojiQueue.map((emojiWrapper) => {
        return <Emoji key={emojiWrapper.time} emojiWrapper={emojiWrapper} />;
      })}
    </>
  );
};

export default EmojisOrigin;
