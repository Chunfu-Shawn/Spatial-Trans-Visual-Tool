import {
  Divider,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';
import List from '@mui/material/List';

function LandingPage() {
  return (
    <Paper elevation={0}>
      <Divider />
      <Typography variant="h6">Links</Typography>
      <List dense>
          <ListItemButton
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              href="/help/manual/datasets#data_visual_help"
          >
              <ListItemText primary={'Help - Manual'}></ListItemText>
          </ListItemButton>
        <ListItemButton
          component="a"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/Chunfu-Shawn/Spatial-Trans-Visual-Tool"
        >
          <ListItemText primary={'Source Code'}></ListItemText>
        </ListItemButton>
      </List>
      <Typography variant="h6">Primary Embedding Controls</Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="Pan: Mouse left click (2-d), right click (3-d)"></ListItemText>
        </ListItem>
        <ListItem>
          <ListItemText primary="Hover: Hover a data point to see the underlying value" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Rotate 3-d: Mouse left click" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Zoom: Mouse wheel" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Select: When using lasso or select tool, hold down the Ctrl or Command key to add to selection" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Resize: Click and drag the divider below the primary embedding" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Tooltip: Mouse move" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Select Category: Mouse double-click" />
        </ListItem>
      </List>
      <Typography variant="h6">Embedding Gallery</Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="Drag charts to reorder" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Click chart to set primary view" />
        </ListItem>
      </List>
      <Divider />
      {process.env.REACT_APP_VERSION != null && (
        <Typography variant="body2">
          Version: {process.env.REACT_APP_VERSION}
        </Typography>
      )}
    </Paper>
  );
}

export default LandingPage;
