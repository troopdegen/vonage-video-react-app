import isReportIssueEnabled from './isReportIssueEnabled/isReportIssueEnabled';

/**
 * @constant {string} API_URL - The base URL determined by the current environment.
 */
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.origin.includes('localhost') ? 'http://localhost:3345' : window.location.origin);

// Debug logging - remove after testing
console.log('API_URL Debug:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  windowOrigin: window.location.origin,
  finalAPIURL: API_URL,
});

/**
 * @constant {object} DEVICE_ACCESS_STATUS - An object representing various states for device access.
 * @property {string} PENDING - Status when the access to the device is pending.
 * @property {string} ACCEPTED - Status when the access to the device has been granted.
 * @property {string} REJECTED - Status when the access to the device was denied.
 * @property {string} ACCESS_CHANGED - Status when the access to the device has changed.
 */
export const DEVICE_ACCESS_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ACCESS_CHANGED: 'accessChanged',
};

/**
 * @constant {string} MUTED_ALERT_MESSAGE - A message to alert the user that their microphone is muted.
 */
export const MUTED_ALERT_MESSAGE =
  'Are you talking? Your mic is off. Click on the mic to turn it on.';

/**
 * @constant {string} FORCE_MUTED_ALERT_MESSAGE - A message to alert the user that their microphone was muted by another participant.
 */
export const FORCE_MUTED_ALERT_MESSAGE =
  'You have been muted by another participant. Click on the mic to unmute yourself.';

/**
 * @constant {string} PUBLISHING_BLOCKED_CAPTION - A user-friendly message alerting the user of publishing issues.
 */
export const PUBLISHING_BLOCKED_CAPTION =
  "We're having trouble connecting you with others in the meeting room. Please check your network and try again.";

/**
 * @constant {string} TEXT_SHADOW - The text shadow style used for display purposes.
 */
export const TEXT_SHADOW = '[text-shadow:_0_1px_2px_rgb(0_0_0_/_60%)]';

/**
 * @constant {number} EMOJI_DISPLAY_DURATION - The duration in milliseconds for which emojis are displayed.
 */
export const EMOJI_DISPLAY_DURATION = 5_000;

/**
 * @constant {number} REPORT_TITLE_LIMIT - The maximum number of characters allowed in the Report Issue form for the title input.
 */
export const REPORT_TITLE_LIMIT = 100;

/**
 * @constant {number} REPORT_NAME_LIMIT - The maximum number of characters allowed in the Report Issue form for the name input.
 */
export const REPORT_NAME_LIMIT = 100;

/**
 * @constant {number} REPORT_DESCRIPTION_LIMIT - The maximum number of characters allowed in the Report Issue form for the description input.
 */
export const REPORT_DESCRIPTION_LIMIT = 1000;

/**
 * @constant {object} SupportedBrowser - An object representing the browser name and link to download it
 * @property {string} browser - The browser name.
 * @property {string} link - The link to download the said browser.
 */
export type SupportedBrowser = {
  browser: string;
  link: string;
};

/**
 * @constant {SupportedBrowser[]} SUPPORTED_BROWSERS - The browsers supported by Vonage Video API Reference App, and their download links.
 */
export const SUPPORTED_BROWSERS = [
  { browser: 'Chrome', link: 'https://www.google.com/chrome/' },
  { browser: 'Firefox', link: 'https://www.mozilla.org/en-US/firefox/download/' },
  { browser: 'Edge', link: 'https://www.microsoft.com/en-us/edge/download' },
  { browser: 'Opera', link: 'https://www.opera.com/download' },
  { browser: 'Safari', link: 'https://www.apple.com/safari/' },
];

/**
 * @constant {number} MAX_PIN_COUNT_MOBILE - the maximum number of pinned participants on mobile
 */
export const MAX_PIN_COUNT_MOBILE = 1;
/**
 * @constant {number} MAX_PIN_COUNT_DESKTOP - the maximum number of pinned participants on desktop
 */
export const MAX_PIN_COUNT_DESKTOP = 3;
/**
 * @constant {number} MAX_TILES_GRID_VIEW_DESKTOP - the maximum number of subscriber video tiles in grid view on desktop
 */
export const MAX_TILES_GRID_VIEW_DESKTOP = 11;
/**
 * @constant {number} MAX_TILES_SPEAKER_VIEW_DESKTOP - the maximum number of subscriber video tiles in active-speaker view on desktop
 */
export const MAX_TILES_SPEAKER_VIEW_DESKTOP = 5;
/**
 * @constant {number} MAX_TILES_GRID_VIEW_MOBILE - the maximum number of subscriber video tiles in grid view on mobile
 */
export const MAX_TILES_GRID_VIEW_MOBILE = 3;
/**
 * @constant {number} MAX_TILES_SPEAKER_VIEW_MOBILE - the maximum number of subscriber video tiles in active-speaker view on mobile
 */
export const MAX_TILES_SPEAKER_VIEW_MOBILE = 2;

/**
 * @constant {number} RIGHT_PANEL_BUTTON_COUNT - The number of buttons used to control the Right Panel. This value determines the number
 * of buttons shown on the right side of the Toolbar.
 */
export const RIGHT_PANEL_BUTTON_COUNT = 3 - (isReportIssueEnabled() ? 0 : 1);

/**
 * @constant {number} CAPTION_DISPLAY_DURATION_MS - The duration in milliseconds for which captions are displayed.
 */
export const CAPTION_DISPLAY_DURATION_MS = 4000;

/**
 * @constant {number} CAPTION_ERROR_DISPLAY_DURATION_MS - The duration in milliseconds for which the caption error popup is displayed.
 */
export const CAPTION_ERROR_DISPLAY_DURATION_MS = 4000;

/*
 * @constant {number} SMALL_VIEWPORT - The pixel width threshold used to determine if the viewport is considered small.
 * Typically used as the max-width breakpoint for responsive layouts.
 */
export const SMALL_VIEWPORT = 768;
