import { IconButton, Link, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { ReactElement } from 'react';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

export type SupportedBrowserListItemProps = {
  url: string;
  browser: string;
};

/**
 * Displays a list item for a specified browser, including a button to open its download URL.
 * @param {SupportedBrowserListItemProps} props - The props for the component
 * @returns {ReactElement} - The rendered component.
 */
const SupportedBrowserListItem = ({
  url,
  browser,
}: SupportedBrowserListItemProps): ReactElement => {
  return (
    <ListItem key={browser}>
      <ListItemIcon>
        <Link href={url} target="_blank">
          <Tooltip title={`Download link for ${browser}`}>
            <IconButton>
              <OpenInNewOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Link>
      </ListItemIcon>

      <ListItemText primary={`${browser}`} />
    </ListItem>
  );
};

export default SupportedBrowserListItem;
