import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Copyright from '@components/Copyright/Copyright';

const useStyles = makeStyles((theme) => ({
  iframe: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: 'none',
  },
}));

const Home = () => {
  const classes = useStyles();

  return (
    <>
      <iframe
        title="Buildly Product Labs Home Page"
        loading="lazy"
        className={classes.iframe}
        src={`https://storage.googleapis.com/insights-landing/index.html?origin=https://${window.env.HOSTNAME}/`}
        allowFullScreen
      />
      <Copyright />
    </>
  );
};

export default Home;
