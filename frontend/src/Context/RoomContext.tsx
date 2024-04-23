import { Outlet } from 'react-router-dom';
import { ReactElement } from 'react';
import RedirectToUnsupportedBrowserPage from '../components/RedirectToUnsupportedBrowserPage';
import { AudioOutputProvider } from './AudioOutputProvider';
import UserProvider from './user';

/**
 * Wrapper for all of the contexts used by the waiting room and the meeting room.
 * @returns {ReactElement} The context.
 */
const RoomContext = (): ReactElement => (
  <UserProvider>
    <RedirectToUnsupportedBrowserPage>
      <AudioOutputProvider>
        <Outlet />
      </AudioOutputProvider>
    </RedirectToUnsupportedBrowserPage>
  </UserProvider>
);

export default RoomContext;
