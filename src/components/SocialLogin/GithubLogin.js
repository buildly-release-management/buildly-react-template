import React, { useRef } from 'react';
import { Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { providers, toQuery } from '@utils/socialLogin';
import PopupWindow from './PopupWindow';

const GithubLogin = ({ socialLoginMutation, history, disabled }) => {
  const popup = useRef(null);

  const onBtnClick = () => {
    const search = toQuery({ client_id: window.env.GITHUB_CLIENT_ID });
    popup.current = PopupWindow.open(
      'github-oauth-authorize',
      `https://github.com/login/oauth/authorize?${search}`,
      { height: 800, width: 600 },
    );
    popup.current.then(
      (data) => onSuccess(data),
      (error) => onFailure(error),
    );
  };

  // eslint-disable-next-line consistent-return
  const onSuccess = (data) => {
    if (!data.code) {
      return onFailure(new Error("'code' not found"));
    }
    const socialData = {
      code: data.code,
      providers: providers.github,
    };
    socialLoginMutation(socialData);
  };

  const onFailure = (error) => {
    // Handle GitHub login failure silently
  };

  return (
    <Button
      fullWidth
      variant="contained"
      startIcon={<GitHubIcon />}
      onClick={onBtnClick}
      disabled={Boolean(disabled)}
    >
      Sign in with Github
    </Button>
  );
};

export default GithubLogin;
