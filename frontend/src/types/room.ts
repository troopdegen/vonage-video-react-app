import { AudioOutputDevice, Device } from '@vonage/client-sdk-video';

export type AllMediaDevices = {
  audioInputDevices: Device[];
  videoInputDevices: Device[];
  audioOutputDevices: AudioOutputDevice[];
};
