import { Button, Grid } from '@mui/material';
import { ReactElement } from 'react';
import useEmoji from '../../../hooks/useEmoji';

export type SendEmojiButtonProps = {
  emoji: string;
};

/**
 * SendEmojiButton Component
 *
 * Displays a clickable button to send emojis to all users in the meeting.
 * @param {SendEmojiButtonProps} props - The props for the component.
 * @returns {ReactElement} The SendEmojiButton component.
 */
const SendEmojiButton = ({ emoji }: SendEmojiButtonProps): ReactElement => {
  const { sendEmoji } = useEmoji();

  return (
    <Grid item xs={3} className="flex justify-center">
      <Button
        size="large"
        onClick={() => sendEmoji(emoji)}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
          },
          padding: '0.25rem',
          fontSize: '1.5rem',
        }}
      >
        {emoji}
      </Button>
    </Grid>
  );
};

export default SendEmojiButton;
