import { Device } from '@vonage/client-sdk-video';

/**
 * Helper function to determine if a given device is an audio input device.
 * @param {Device} device - The device to check.
 * @returns {boolean} - true if device is an audioInput device, else false
 */
export default (device: Device): boolean => device.kind.toLowerCase() === 'audioinput';
