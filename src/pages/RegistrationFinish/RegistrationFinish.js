import React, { useContext, useState } from 'react';
import {
  Button,
  Card, CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  MenuItem, Paper,
  TextField, Typography,
} from '@mui/material';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { isMobile } from '@utils/mediaQuery';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import StripeCard from '@components/StripeCard/StripeCard';
import { getStripeProductQuery } from '@react-query/queries/authUser/getStripeProductQuery';
import { useAddSubscriptionMutation } from '../../react-query/mutations/authUser/addSubscriptionMutation';
import './RegistrationFinish.css';
import { UserContext } from '../../context/User.context';
import { useInput } from '../../hooks/useInput';
import useAlert from '../../hooks/useAlert';
import { hasAdminRights, hasGlobalAdminRights } from '../../utils/permissions';
import { validators } from '../../utils/validators';
import { routes } from '../../routes/routesConstants';

const RegistrationFinish = ({ history }) => {
  const user = useContext(UserContext);
  const { displayAlert } = useAlert();
  const isAdmin = hasAdminRights(user) || hasGlobalAdminRights(user);
  const [organization, setOrganization] = useState(null);
  const stripe = useStripe();
  const elements = useElements();
  const cardError = () => { };
  const setCardError = () => { };

  const { data: stripeProductData, isLoading: isStripeProductsLoading } = useQuery(
    ['stripeProducts'],
    () => getStripeProductQuery(),
    { refetchOnWindowFocus: false },
  );

  const { mutate: addSubscriptionMutation } = useAddSubscriptionMutation(displayAlert, history, routes.PRODUCT_PORTFOLIO);

  if (user) {
    if (!organization) {
      setOrganization(user.organization.name);
    }
  }

  const product = useInput('', { required: true });
  const [formError, setFormError] = useState({});

  const handleBlur = (e, validation, input) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id]: {
          error: false,
          message: '',
        },
      });
    }
  };

  // submit card details to activate 30 day free trial
  const handleSubmit = async (cardDetails) => {
    let validationError = '';
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement('card'),
      billing_details: {
        email: user.email,
        name: organization,
      },
    });
    validationError = error;

    const formValue = {
      product: product.value,
      card_id: paymentMethod?.id,
    };
    if (!validationError) {
      addSubscriptionMutation(formValue);
    }
  };

  return (
    <>
      <Container maxWidth="sm" className="main-container">
        {isAdmin ? (
          <>
            <Card variant="outlined">
              <CardHeader
                title={<b>Activate 30 Day Free Trial</b>}
                subheader="Submit card details to activate 30 day free trial. Please note that you will not be charged until the trial period ends."
              />
              <CardContent>
                <Grid
                  container
                  spacing={isMobile() ? 0 : 3}
                >
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      id="product"
                      name="product"
                      required
                      label="Select a Product"
                      autoComplete="product"
                      onBlur={(e) => {
                        handleBlur(e, 'required', product);
                      }}
                      {...product.bind}
                    >
                      <MenuItem value="">----------</MenuItem>
                      {stripeProductData && !_.isEmpty(stripeProductData)
                    && _.map(stripeProductData, (prd) => (
                      <MenuItem key={`sub-product-${prd.id}`} value={prd.id}>
                        {`${prd.name}`}
                      </MenuItem>
                    ))}
                    </TextField>
                  </Grid>
                </Grid>
                <Grid
                  container
                  spacing={isMobile() ? 0 : 3}
                >
                  <Grid item xs={12}>
                    <StripeCard
                      cardError={cardError}
                      setCardError={setCardError}
                    />
                  </Grid>
                </Grid>
                <div className="actions">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className="btn-space"
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outlined"
                    className="btn-space"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Paper elevation={1} square={false}>
              <CardContent>
                <Typography variant="h5" component="div">
                  No active subscriptions
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', my: 1.5 }}>
                  Your organisation's subscription is no longer active. Please contact your admin to activate the subscription.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => {
                    history.push(routes.LOGIN);
                  }}
                >
                  Back to login page
                </Button>
              </CardActions>
            </Paper>
            {' '}

          </>
        )}
      </Container>
      {isAdmin && (
      <Typography variant="body2" sx={{ color: 'text.secondary', m: 1.5 }} className="footer">
        At Buildly Labs, we offer a 30-day free trial for each new organization to help you explore and evaluate our platform without any initial cost. To start your trial, we request a credit card to ensure a seamless transition from trial to paid subscription if you choose to continue. Rest assured, before any charges are made, we will notify you via email, giving you ample time to review and decide if Buildly Labs is the right fit for your needs. This approach ensures you have a full opportunity to assess our platform's capabilities and benefits for your entire team, there is only one monthly plan fee that covers your entire team, so please explore the full platform and feel free to send us feedback or questions help@buildly.io
      </Typography>
      )}
    </>
  );
};

export default RegistrationFinish;
