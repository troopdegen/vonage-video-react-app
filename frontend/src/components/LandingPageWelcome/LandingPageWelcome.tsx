import { ReactElement } from 'react';

/**
 * LandingPageWelcome Component
 * This component includes a welcome message to the users visiting the landing page.
 * @returns {ReactElement} - the landing page component
 */
const LandingPageWelcome = (): ReactElement => {
  return (
    <div className="ps-12 py-4 h-auto  shrink max-w-xl text-left">
      <h2 className="text-5xl font-bold text-black pb-5 w-9/12">
        Welcome to the Vonage Video React App
      </h2>
      <h3 className="text-large text-slate-500">Create a new room or join an existing one.</h3>
    </div>
  );
};

export default LandingPageWelcome;
