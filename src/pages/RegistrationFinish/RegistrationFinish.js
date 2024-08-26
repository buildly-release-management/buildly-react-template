import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  MenuItem,
  TextField
} from '@mui/material';
import { isMobile } from '@utils/mediaQuery';
import _ from 'lodash';
import StripeCard from '@components/StripeCard/StripeCard';
import { useQuery } from 'react-query';
import { getStripeProductQuery } from '@react-query/queries/authUser/getStripeProductQuery';
import './RegistrationFinish.css';

const RegistrationFinish = () => {
  const {
    data: stripeProductData,
    isLoading: isStripeProductsLoading
  } = useQuery(
    ['stripeProducts'],
    () => getStripeProductQuery(),
    { refetchOnWindowFocus: false },
  );
  const cardError = () => {
  };
  const setCardError = () => {
  };
  return (
    <>
      <Container maxWidth="sm" className="main-container">
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
      </Container>
    </>
  );
};

export default RegistrationFinish;
