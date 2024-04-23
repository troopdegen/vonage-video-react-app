/* eslint-disable jsdoc/check-param-names */
/* eslint-disable jsdoc/require-param */
import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useRoomName from '../../hooks/useRoomName';

export type RedirectToWaitingRoomProps = {
  children: ReactElement;
};

/**
 * This component checks whether user should be redirected to the waiting room, or
 * be taken directly to the meeting room.
 * Users can bypass being redirected to the waiting room by adding ?bypass=true
 * to the URL.
 * @param {RedirectToWaitingRoomProps} props - the props for this component.
 * @property {ReactElement} children - the react elements to render if the user has access to the meeting room.
 * @returns {ReactElement} - the redirect to waiting room component.
 */
const RedirectToWaitingRoom = ({ children }: RedirectToWaitingRoomProps): ReactElement => {
  const location = useLocation();
  const roomName = useRoomName();
  const hasAccess = !!location.state?.hasAccess;

  const searchParams = new URLSearchParams(location.search);
  const bypass = searchParams.get('bypass');
  const canEnter = !hasAccess && bypass !== 'true';
  return canEnter ? (
    <Navigate
      to={{
        pathname: `/waiting-room/${roomName}`,
      }}
    />
  ) : (
    children
  );
};

export default RedirectToWaitingRoom;
