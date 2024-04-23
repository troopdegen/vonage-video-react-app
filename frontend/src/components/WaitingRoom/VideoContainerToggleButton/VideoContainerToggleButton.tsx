import { IconButton, SxProps } from '@mui/material';
import { ForwardedRef, forwardRef, ReactElement } from 'react';

export type VideoContainerButtonProps = {
  onClick: () => void;
  icon: ReactElement;
  sx?: SxProps;
  isEnabled: boolean;
};

/**
 * VideoContainerToggleButton Component
 *
 * An overlay button for the preview publisher.
 * @param {VideoContainerButtonProps} props - The props for the component.
 *  @property {Function} onClick - The on-click handler for the button.
 *  @property {ReactElement} icon - The Icon element for the button.
 *  @property {SxProps} sx - The style properties for the component.
 *  @property {boolean} isEnabled - Whether the button is toggled or not.
 * @returns {ReactElement} The VideoContainerToggleButton component.
 */
const VideoContainerToggleButton = forwardRef(function VideoContainerToggleButton(
  props: VideoContainerButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
): ReactElement {
  const { icon: Icon, sx = {}, isEnabled, ...rest } = props;
  return (
    <IconButton
      {...rest}
      ref={ref}
      sx={{
        height: '100%',
        width: '100%',
        ...sx,
      }}
    >
      {Icon}
    </IconButton>
  );
});

export default VideoContainerToggleButton;
