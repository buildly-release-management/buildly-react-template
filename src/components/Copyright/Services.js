import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import {
  Button,
  Link,
  Menu,
  MenuItem,
} from '@mui/material';

const useStyles = makeStyles((theme) => ({
  link: {
    color: theme.palette.secondary.main,
    textDecoration: 'none',
  },
}));

const Services = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        aria-controls="buildly-services-menu"
        aria-haspopup="true"
        color="primary"
        variant="contained"
        onClick={handleClick}
      >
        Buildly Services
      </Button>
      <Menu
        id="buildly-services-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleClose}>
          <Link
            className={classes.link}
            href="https://buildly.io/"
            target="_blank"
            rel="noopener"
          >
            Open Source
          </Link>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Link
            className={classes.link}
            href="https://buildly.io/"
            target="_blank"
            rel="noopener"
          >
            Sales and Consulting
          </Link>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Services;
