import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import makeStyles from '@mui/styles/makeStyles';
import {
  Group as GroupIcon,
  Logout, Person,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import logo from '@assets/buildly-product-labs-orange-white.png';
import { UserContext } from '@context/User.context';
import { routes } from '@routes/routesConstants';
import { hasGlobalAdminRights, hasAdminRights } from '@utils/permissions';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import StripeCard from '@components/StripeCard/StripeCard';
import Loader from '@components/Loader/Loader';
import { isMobile } from '@utils/mediaQuery';
import { useInput } from '@hooks/useInput';
import useAlert from '@hooks/useAlert';
import { validators } from '@utils/validators';
import { oauthService } from '@modules/oauth/oauth.service';
import { getOrganizationNameQuery } from '@react-query/queries/authUser/getOrganizationNameQuery';
import { getStripeProductQuery } from '@react-query/queries/authUser/getStripeProductQuery';
import { useUpdateUserMutation } from '@react-query/mutations/authUser/updateUserMutation';
import { useAddSubscriptionMutation } from '@react-query/mutations/authUser/addSubscriptionMutation';

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: theme.palette.secondary.dark, // Original brand blue #0C5595
    color: '#FFFFFF',
    boxShadow: '0px 2px 8px rgba(12, 85, 149, 0.2)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: theme.zIndex.drawer + 1,
    width: '100%',
  },
  logo: {
    maxWidth: 176,
    objectFit: 'contain',
  },
  navItems: {
    display: 'flex',
    justifyContent: 'center',
    flexGrow: 1,
  },
  navButton: {
    textTransform: 'uppercase',
    fontSize: 15,
    lineHeight: 1.25,
    alignItems: 'center',
    textAlign: 'center',
    color: theme.palette.contrast.text,
    '&:active': {
      backgroundColor: theme.palette.contrast.text,
      color: theme.palette.secondary.main,
      borderRadius: 32,
      paddingLeft: 16,
      paddingRight: 16,
    },
    '&:disabled': {
      color: theme.palette.secondary.dark,
      cursor: 'not-allowed',
    },
  },
  isActive: {
    backgroundColor: theme.palette.contrast.text,
    color: theme.palette.secondary.main,
    borderRadius: 32,
    paddingLeft: 16,
    paddingRight: 16,
    '&:hover': {
      backgroundColor: theme.palette.contrast.text,
      color: theme.palette.secondary.main,
      borderRadius: 32,
      paddingLeft: 16,
      paddingRight: 16,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  menuRight: {
    marginLeft: 'auto',
    display: 'flex',
    flexDirection: 'row',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    placeContent: 'flex-end center',
    alignItems: 'flex-end',
    color: '#FFFFFF', // Changed from theme.palette.contrast.text to white
    '& p': {
      fontSize: 12,
      color: '#FFFFFF', // Ensure all text is white
    },
    '& .MuiTypography-root': {
      color: '#FFFFFF', // Ensure Typography components are white
    },
  },
  accountMenuIItem: {
    margin: 8,
    color: '#000000', // Use dark text for proper contrast on white background
    '& .MuiTypography-root': {
      color: '#000000', // Ensure Typography in menu items is dark
    },
    '& .MuiListItemIcon-root': {
      color: '#000000', // Ensure icons are dark
    },
    '& .MuiSvgIcon-root': {
      color: '#000000', // Ensure SVG icons are dark
    },
  },
  accountMenuIcon: {
    backgroundColor: theme.palette.contrast.text,
  },
  userIcon: {
    fill: theme.palette.secondary.main,
  },
  menuIcon: {
    color: theme.palette.contrast.text,
  },
  globalFilter: {
    width: theme.spacing(24),
    marginTop: theme.spacing(1.5),
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(1, 3.5, 1, 2),
    },
    marginRight: 20,
  },
  navMenu: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(3),
  },
  dialogActionButtons: {
    padding: theme.spacing(0, 2.5, 2, 0),
  },
}));

const TopBar = ({ history, location }) => {
  const classes = useStyles();
  const user = useContext(UserContext);
  const isAdmin = hasAdminRights(user) || hasGlobalAdminRights(user);
  const isSuperAdmin = hasGlobalAdminRights(user);

  const [organization, setOrganization] = useState(null);

  const maxDate = new Date();
  maxDate.setHours(0, 0, 0, 0);
  maxDate.setDate(maxDate.getDate() + 1);

  const pages = [{
    label: 'Dashboard',
    value: routes.DASHBOARD,
    pathName: [routes.DASHBOARD],
  },
  {
    label: 'Product Portfolio',
    value: routes.PRODUCT_PORTFOLIO,
    pathName: [routes.PRODUCT_PORTFOLIO],
  },
  {
    label: 'Product Roadmap',
    value: routes.PRODUCT_ROADMAP,
    pathName: [routes.PRODUCT_ROADMAP, routes.PRODUCT_ROADMAP_TABULAR, routes.PRODUCT_ROADMAP_KANBAN, routes.PRODUCT_ROADMAP_REPORT],
  },
  {
    label: 'Releases',
    value: routes.RELEASE,
    pathName: [routes.RELEASE],
    disabled: !user?.subscription_active,
  },
  {
    label: 'Insights',
    value: routes.INSIGHTS,
    pathName: [routes.INSIGHTS],
  }];

  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(false);
  const [showProducts, setShowProducts] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [planDialogOpen, setOpen] = React.useState(false);

  const product = useInput('', { required: true });
  const [formError, setFormError] = useState({});

  const { displayAlert } = useAlert();

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

  const { mutate: updateUserMutation, isLoading: isUpdateUserLoading } = useUpdateUserMutation(history, displayAlert);

  const { mutate: addSubscriptionMutation, isLoading: isAddSubscriptionLoading } = useAddSubscriptionMutation(displayAlert);

  if (user) {
    if (!organization) {
      setOrganization(user.organization.name);
    }
  }

  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = (event, reason) => {
    if (reason && reason === ('backdropClick' || 'escapeKeyDown')) {
      return;
    }
    setOpen(false);
  };

  const handleLogoutClick = () => {
    oauthService.logout();
    history.push('/');
  };

  const handleOrganizationChange = (e) => {
    const organization_name = e.target.value;
    setOrganization(organization_name);
    const profileValues = {
      id: user.id,
      organization_name,
    };
    updateUserMutation(profileValues);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        handleDialogClose();
      }
    }
  };

  return (
    <>
      {(isOrgNamesLoading || isStripeProductsLoading || isUpdateUserLoading || isAddSubscriptionLoading) && <Loader open={isOrgNamesLoading || isStripeProductsLoading || isUpdateUserLoading || isAddSubscriptionLoading} />}
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Link to={routes.DASHBOARD}>
            <img src={logo} alt="Logo" className={classes.logo} />
          </Link>
          <Box className={classes.navItems}>
            {pages.map((page) => (
              <Button
                key={page.value}
                sx={{
                  m: 1,
                  display: 'block',
                }}
                className={`${classes.navButton} ${page.pathName.includes(location.pathname) ? classes.isActive : ''}`}
                disabled={page.disabled}
                onClick={() => {
                  setAnchorEl(null);
                  history.push(page.value);
                }}
              >
                {page.label}
              </Button>
            ))}
            {!(user && user.subscription_active) && (
              <Button
                variant="contained"
                size="small"
                onClick={handleDialogOpen}
              >
                Upgrade plan
              </Button>
            )}
          </Box>
          <div className={classes.menuRight}>
            {isSuperAdmin && (
              <TextField
                className={classes.globalFilter}
                variant="outlined"
                fullWidth
                id="org"
                label="Organization"
                select
                value={organization}
                onChange={handleOrganizationChange}
              >
                {_.map(orgNamesData, (org, index) => (
                  <MenuItem
                    key={index}
                    value={org}
                  >
                    {org}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <div className={classes.userInfo}>
              <Typography>{user.first_name}</Typography>
              <Typography>{`${user.organization.name}, ${user.user_type}`}</Typography>
            </div>
            <Tooltip title="Account settings">
              <IconButton
                size="small"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <Avatar
                  className={classes.accountMenuIcon}
                  sx={{
                    width: 32,
                    height: 32,
                  }}
                >
                  <Person className={classes.userIcon} />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  backgroundColor: '#FFFFFF', // Ensure white background
                  color: '#000000', // Ensure dark text
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '& .MuiMenuItem-root': {
                    color: '#000000', // Override any theme color for menu items
                    '& .MuiSvgIcon-root': {
                      color: '#000000', // Override icon colors
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#000000', // Override list item icon colors
                    },
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
            >
              <MenuItem
                className={classes.accountMenuIItem}
                onClick={() => {
                  history.push(routes.USER_PROFILE);
                }}
              >
                <Person />
                {' '}
                My profile
              </MenuItem>
              {isAdmin && (
                <MenuItem
                  className={classes.accountMenuIItem}
                  onClick={() => {
                    history.push(routes.USER_MANAGEMENT);
                  }}
                >
                  <GroupIcon />
                  {' '}
                  User management
                </MenuItem>
              )}
              <Divider />
              <MenuItem className={classes.accountMenuIItem} onClick={handleLogoutClick}>
                <ListItemIcon aria-label="logout">
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </div>
          <Dialog open={planDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle>Upgrade plan</DialogTitle>
            <DialogContent>
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
            </DialogContent>
            <DialogActions className={classes.dialogActionButtons}>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button
                variant="contained"
                disabled={submitDisabled()}
                onClick={handleSubmit}
              >
                Upgrade
              </Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TopBar;
