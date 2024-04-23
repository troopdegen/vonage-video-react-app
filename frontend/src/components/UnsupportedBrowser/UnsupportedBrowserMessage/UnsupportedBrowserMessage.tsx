import { ReactElement } from 'react';

/**
 * UnsupportedBrowserMessage Component
 *
 * This component warns users they are using a browser unsupported by the Vonage Video API Reference App.
 * @returns {ReactElement} The UnsupportedBrowserMessage component.
 */
const UnsupportedBrowserMessage = (): ReactElement => {
  const header = 'Your browser is unsupported';
  const message = 'Please use one of our supported browsers.';

  return (
    <div className="ps-12 py-4 h-auto shrink w-[400px] text-left">
      <h2 className="text-5xl text-black pb-5 w-9/12">{header}</h2>
      <h3 className="text-large text-slate-500">{message}</h3>
    </div>
  );
};

export default UnsupportedBrowserMessage;
