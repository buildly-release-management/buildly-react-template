import React from 'react';
import Copyright from '@components/Copyright/Copyright';

const Home = () => {
  return (
    <>
      <iframe
        title="Buildly Product Labs Onboarding"
        loading="lazy"
        style={{ position: 'absolute', width: '100%', height: '100%', border: 'none' }}
        src="https://labs-onboarding.buildly.io"
        allowFullScreen
      />
      <Copyright />
    </>
  );
};

export default Home;
