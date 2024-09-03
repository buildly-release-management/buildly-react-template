import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import MUIDataTable from 'mui-datatables';
import {
  Button, Grid, Tooltip,
} from '@mui/material';
import Modal from 'react-bootstrap/Modal';
import { UserContext } from '@context/User.context';
import Badge from 'react-bootstrap/Badge';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { isMobile } from '@utils/mediaQuery';
import { validators } from '@utils/validators';
import { useInput } from '@hooks/useInput';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import StripeCard from '@components/StripeCard/StripeCard';
import makeStyles from '@mui/styles/makeStyles';
import { httpService } from '@modules/http/http.service';
import { hasAdminRights, hasGlobalAdminRights } from '@utils/permissions';
import { getOrganizationNameQuery } from '@react-query/queries/authUser/getOrganizationNameQuery';
import { getStripeProductQuery } from '@react-query/queries/authUser/getStripeProductQuery';
import { useAddSubscriptionMutation } from '@react-query/mutations/authUser/addSubscriptionMutation';
import useAlert from '@hooks/useAlert';

const useStyles = makeStyles((theme) => ({
  dialogActionButtons: {
    padding: theme.spacing(0, 2.5, 2, 0),
  },
}));

const Subscriptions = () => {
  const classes = useStyles();
  const user = useContext(UserContext);
  const { displayAlert } = useAlert();
  const isAdmin = hasAdminRights(user) || hasGlobalAdminRights(user);

  const [organization, setOrganization] = useState(null);
  if (!organization) {
    setOrganization(user.organization.name);
  }

  const maxDate = new Date();
  maxDate.setHours(0, 0, 0, 0);
  maxDate.setDate(maxDate.getDate() + 1);

  const [showProducts, setShowProducts] = useState(false);
  const product = useInput('', { required: true });
  const [formError, setFormError] = useState({});

  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(false);

  const columns = [
    { name: 'subscription_uuid', options: { display: false, filter: false, sort: false } },
    { name: 'stripe_card_id', options: { display: false, filter: false, sort: false } },
    { name: 'stripe_product_info.name', label: 'Product', options: { filter: true, sort: true } },
    { name: 'stripe_product', label: 'Product', options: { display: false, filter: true, sort: true } },
    { name: 'trial_start_date', label: 'Trial start date', options: { filter: true, sort: true } },
    { name: 'trial_end_date', label: 'Trial end date', options: { filter: true, sort: true } },
    { name: 'subscription_start_date', label: 'Subscription start date', options: { filter: true, sort: true } },
    { name: 'subscription_end_date', label: 'Subscription end date', options: { filter: true, sort: true } },
    {
      name: '',
      label: '',
      options: {
        filter: false,
        sort: false,
        empty: true,
        customBodyRenderLite: (dataIndex) => (
          <>
            {(isAdmin && (maxDate < new Date(user.subscriptions[dataIndex].subscription_end_date))) && (
              (user.subscriptions[dataIndex].cancelled) ? (
                <Tooltip
                  title={`Cancelled on: ${new Date(user.subscriptions[dataIndex].cancelled_date)}`}
                  placement="right-start"
                >
                  <Badge bg="secondary">Cancelled</Badge>
                </Tooltip>
              ) : (
                <Button
                  type="submit"
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => openWarningModal(user.subscriptions[dataIndex])}
                >
                  Cancel
                </Button>
              )
            )}
          </>
        ),
      },
    },
  ];

  const options = {
    responsive: 'standard',
    selectableRows: 'none',
    download: false,
    search: false,
    print: false,
    filter: false,
    viewColumns: false,
    enableNestedDataAccess: '.',
  };

  const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);

  const { data: orgNamesData, isLoading: isOrgNamesLoading } = useQuery(
    ['orgNames'],
    () => getOrganizationNameQuery(),
    { refetchOnWindowFocus: false },
  );
  const { data: stripeProductData, isLoading: isStripeProductsLoading } = useQuery(
    ['stripeProducts'],
    () => getStripeProductQuery(),
    { refetchOnWindowFocus: false },
  );
  const { mutate: addSubscriptionMutation, isLoading: isAddSubscriptionLoading } = useAddSubscriptionMutation(displayAlert);

  const cancelSubscription = () => {
    try {
      httpService.makeRequest('delete',
        `${window.env.API_URL}subscription/${subscriptionToCancel.subscription_uuid}`)
        .then((response) => {
          closeWarningModal();
          displayAlert('success', 'Subscription successfully saved');
        });
    } catch (httpError) {
      displayAlert('error', 'Couldn\'t cancel subscription!');
      closeWarningModal();
    }
  };

  // Cancel subscription warning modal
  const [show, setCancelWarningShow] = useState(false);
  const closeWarningModal = () => setCancelWarningShow(false);
  const openWarningModal = (item) => {
    setSubscriptionToCancel(item);
    setCancelWarningShow(true);
  };

  // Subscription modal
  const [planDialogOpen, setOpen] = React.useState(false);
  const handleDialogOpen = () => {
    setOpen(true);
  };
  const handleDialogClose = (event, reason) => {
    if (reason && reason === ('backdropClick' || 'escapeKeyDown')) {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    if (organization) {
      setShowProducts(true);
    } else {
      setShowProducts(false);
    }
  }, []);

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

  const submitDisabled = () => {
    try {
      if (
        (showProducts && !product.value)
          || (showProducts && cardError)
          || (showProducts && !elements)
          // eslint-disable-next-line no-underscore-dangle
          || (showProducts && elements && elements.getElement('card')._empty)
      ) {
        return true;
      }
    } catch (e) {
      return false;
    }
    return !!Object.keys(formError)
      .find((key) => formError[key].error);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let validationError = '';

    if (showProducts) {
      const {
        error,
        paymentMethod,
      } = await stripe.createPaymentMethod({
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
        handleDialogClose();
      }
    }
  };

  return (
    <>
      <div className="p-2 ms-auto">
        {isAdmin
        && (
        <Button
          variant="contained"
          size="small"
          onClick={handleDialogOpen}
        >
          New subscription
        </Button>
        )}
      </div>

      <Grid item xs={12}>
        <MUIDataTable
          data={user.subscriptions}
          columns={columns}
          options={options}
        />
      </Grid>

      {/* Cancel subscription warning modal */}
      <Modal show={show} onHide={closeWarningModal} animation={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body>Please confirm that you want to cancel your subscription</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeWarningModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={cancelSubscription}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Subscribe modal */}
      <Modal show={planDialogOpen} onHide={handleDialogClose} dialogClassName="modal-70w" centered>
        <Modal.Header closeButton>
          <Modal.Title>Subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Grid
            className={showProducts ? '' : classes.hidden}
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
                label="Subscription to Product"
                autoComplete="product"
                error={formError.product && formError.product.error}
                helperText={
                    formError.product ? formError.product.message : ''
                  }
                onBlur={(e) => handleBlur(e, 'required', product)}
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
            className={showProducts ? '' : classes.hidden}
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
        </Modal.Body>
        <Modal.Footer className={classes.dialogActionButtons}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            disabled={submitDisabled()}
            onClick={handleSubmit}
          >
            Subscribe
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Subscriptions;
