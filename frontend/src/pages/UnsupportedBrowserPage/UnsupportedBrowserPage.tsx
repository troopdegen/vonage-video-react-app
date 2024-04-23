import { ReactElement } from 'react';
import Banner from '../../components/Banner';
import SupportedBrowsers from '../../components/UnsupportedBrowser/SupportedBrowsers';
import UnsupportedBrowserMessage from '../../components/UnsupportedBrowser/UnsupportedBrowserMessage';

/**
 * UnsupportedBrowserPage
 *
 * This component renders the unsupported browser page of the application, including:
 * - A banner containing a company logo, a date-time widget, and a navigable button to a GitHub repo.
 * - A warning for users.
 * - A list of supported browsers with links to their download pages.
 * @returns {ReactElement} - The unsupported browser page.
 */
const UnsupportedBrowserPage = (): ReactElement => {
  return (
    <div className="bg-white flex h-full w-full justify-between flex-col">
      <Banner />

      <div className="bg-white flex w-full h-full items-center md:justify-center flex-col md:flex-row">
        <UnsupportedBrowserMessage />
        <SupportedBrowsers />
      </div>
    </div>
  );
};

export default UnsupportedBrowserPage;
