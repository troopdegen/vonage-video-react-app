import { Button } from '@mui/material';
import { MouseEvent, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

export type JoinButtonProps = {
  roomName: string;
  isDisabled: boolean;
};

/**
 * JoinButton Component
 *
 * This component returns a button that takes a user to the meeting.
 * @param {JoinButtonProps} props - the props for this component.
 *  @property {string} roomName - the name of the room to join.
 * @returns {ReactElement} - the join room button.
 */
const JoinButton = ({ roomName, isDisabled }: JoinButtonProps): ReactElement => {
  const navigate = useNavigate();

  const handleJoin = (event: MouseEvent) => {
    event.preventDefault();
    navigate(`/waiting-room/${roomName}`);
  };

  return (
    <Button
      disabled={roomName === '' || isDisabled}
      className="h-14"
      sx={{ textTransform: 'none', marginLeft: '8px' }}
      onClick={handleJoin}
      type="submit"
    >
      Join
    </Button>
  );
};

export default JoinButton;
