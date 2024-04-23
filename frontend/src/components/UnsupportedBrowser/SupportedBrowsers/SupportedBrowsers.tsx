import { ReactElement } from 'react';
import { List } from '@mui/material';
import { SUPPORTED_BROWSERS } from '../../../utils/constants';
import SupportedBrowserListItem from '../SupportedBrowserListItem';

/**
 * SupportedBrowsers Component
 *
 * This component delineates all of the supported browsers for the Vonage Video API Reference App.
 * @returns {ReactElement} The SupportedBrowsers component.
 */
const SupportedBrowsers = (): ReactElement => {
  return (
    <div className="ps-12 py-4 h-auto shrink w-[400px] text-left">
      <h3 className="text-4xl text-black pb-5 w-full">Supported browsers:</h3>

      <div className="md:max-h-[480px] md:overflow-y-auto ">
        <List sx={{ overflowX: 'auto' }}>
          {SUPPORTED_BROWSERS.map(({ browser, link }) => {
            return <SupportedBrowserListItem key={browser} url={link} browser={browser} />;
          })}
        </List>
      </div>
    </div>
  );
};

export default SupportedBrowsers;
