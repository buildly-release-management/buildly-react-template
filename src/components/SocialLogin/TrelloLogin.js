import React, { useRef } from 'react';
import { Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { providers, toQuery } from '@utils/socialLogin';
import PopupWindow from './PopupWindow';
import useAlert from '@hooks/useAlert';
import { useSocialLoginMutation } from '../../react-query/mutations/authUser/socialLoginMutation';
import { routes } from '../../routes/routesConstants';

const TrelloLogin = ({ history, disabled }) => {
  const popup = useRef(null);

  const { displayAlert } = useAlert();

  const { mutate: socialLoginMutation } = useSocialLoginMutation(history, routes.MISSING_DATA, routes.PRODUCT_PORTFOLIO, displayAlert);

  const onBtnClick = () => {
    const search = toQuery({ key: window.env.TRELLO_API_KEY });
    popup.current = PopupWindow.open(
      'trello-oauth-authorize',
      `https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&name=Release-Management&${search}`,
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
      providers: providers.trello,
    };
    socialLoginMutation(socialData);
  };

  const onFailure = (error) => {
    console.log(error);
  };

  return (
    <Button
      fullWidth
      variant="contained"
      color="secondary"
      startIcon={<GitHubIcon />}
      onClick={onBtnClick}
      disabled={Boolean(disabled)}
    >
      Sign in with Trello
    </Button>
  );
};

export default TrelloLogin;
