import React, { useState, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import makeStyles from '@mui/styles/makeStyles';
import {
  Grid,
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  Checkbox,
  ListItemText,
  Autocomplete,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import { UserContext } from '@context/User.context';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import useAlert from '@hooks/useAlert';
import { routes } from '../../../routes/routesConstants';
import {
  EXPECTED_TRAFFIC, INTEGRATION_TYPES, PRODUCT_SETUP, PRODUCT_TYPE,
} from '../ProductFormConstants';
import { useStore } from '../../../zustand/product/productStore';
import { useUpdateUserMutation } from '../../../react-query/mutation/authUser/updateUserMutation';
import { useCreateProductMutation } from '../../../react-query/mutation/product/createProductMutation';
import { useUpdateProductMutation } from '../../../react-query/mutation/product/updateProductMutation';

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      width: '70%',
      margin: 'auto',
    },
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    borderRadius: '18px',
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

// eslint-disable-next-line import/no-mutable-exports
export let checkIfSetupEdited;

const Setup = ({
  history,
  editData,
  handleBack,
  editPage,
  product_uuid,
  redirectTo,
}) => {
  const classes = useStyles();
  const buttonText = editPage ? 'Save' : 'Create Product';
  const user = useContext(UserContext);
  const organization = user.organization.organization_uuid;

  const { productFormData, clearProductFormData } = useStore();
  const { displayAlert } = useAlert();

  const productSetup = useInput((editData && editData.product_info
    && editData.product_info.product_setup)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.product_setup)
    || '', { required: true });

  const integrationNeeded = useInput((editData && editData.product_info
    && editData.product_info.integration_needed)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.integration_needed)
    || false, { required: true });

  const integrationTypes = useInput((editData && editData.product_info
    && editData.product_info.integration_types)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.integration_types)
    || [], { required: true });

  const productType = useInput((editData && editData.product_info
    && editData.product_info.product_type)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.product_type)
    || '', { required: true });

  const expectedTraffic = useInput((editData && editData.product_info
    && editData.product_info.expected_traffic)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.expected_traffic)
    || '', { required: true });

  const teamNeeded = useInput((editData && editData.product_info
    && editData.product_info.team_needed)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.team_needed)
    || false, { required: true });

  const productTimezone = useInput((editData && editData.product_info
    && editData.product_info.product_timezone)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.product_timezone)
    || '', { required: true });

  const [timezone, setTimezone] = useState(productTimezone.value);

  const teamTimezoneAway = useInput((editData && editData.product_info
    && editData.product_info.team_timezone_away)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.team_timezone_away)
    || true, { required: true });

  const [formError, setFormError] = useState({});

  const { mutate: updateUserMutation, isLoading: isUpdateUserLoading } = useUpdateUserMutation(history, displayAlert);
  const { mutate: createProductMutation, isLoading: isCreatingProductLoading } = useCreateProductMutation(organization, history, routes.PRODUCT_ROADMAP, clearProductFormData, displayAlert);
  const { mutate: updateProductMutation, isLoading: isUpdatingProductLoading } = useUpdateProductMutation(organization, history, redirectTo, clearProductFormData, displayAlert);

  const handleBlur = (e, validation, input, parentId) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e?.target?.id || parentId]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e?.target?.id || parentId]: {
          error: false,
          message: '',
        },
      });
    }
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!productSetup.value
      || (integrationNeeded.value && _.isEmpty(integrationTypes.value))
      || !productType.value
      || !expectedTraffic.value
      || (teamNeeded.value && !timezone && typeof timezone === 'object')
    ) {
      return true;
    }
    let errorExists = false;
    _.forEach(errorKeys, (key) => {
      if (formError[key].error) {
        errorExists = true;
      }
    });
    return errorExists;
  };

  checkIfSetupEdited = () => (
    productSetup.hasChanged()
    || integrationNeeded.hasChanged()
    || integrationTypes.hasChanged()
    || productType.hasChanged()
    || expectedTraffic.hasChanged()
    || teamNeeded.hasChanged()
    || productTimezone.hasChanged()
    || teamTimezoneAway.hasChanged()
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = {
      ...productFormData,
      product_info: {
        ...productFormData.product_info,
        product_setup: productSetup.value,
        integration_needed: integrationNeeded.value,
        integration_types: integrationNeeded.value ? integrationTypes.value : [],
        product_type: productType.value,
        expected_traffic: expectedTraffic.value,
        team_needed: teamNeeded.value,
        product_timezone: teamNeeded.value ? timezone : '',
        team_timezone_away: teamNeeded.value ? teamTimezoneAway.value : false,
      },
      edit_date: new Date(),
    };
    if (user && !user.survey_status) {
      const profileValues = {
        id: user.id,
        survey_status: true,
      };
      updateUserMutation(profileValues);
    }
    if (editPage) {
      formData.product_uuid = product_uuid;
      updateProductMutation(formData);
    } else {
      createProductMutation(formData);
    }
  };

  return (
    <>
      {(isUpdateUserLoading || isCreatingProductLoading || isUpdatingProductLoading) && <Loader open={isUpdateUserLoading || isCreatingProductLoading || isUpdatingProductLoading} />}
      <div>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <Box mb={2} mt={3}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="productSetup"
                  label="What type of product or project is this"
                  name="productSetup"
                  autoComplete="productSetup"
                  onBlur={(e) => handleBlur(e, 'required', productSetup)}
                  {...productSetup.bind}
                >
                  {_.map(PRODUCT_SETUP, (setup, idx) => (
                    <MenuItem key={idx} value={setup.value}>{setup.text}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" component="h6">
                  Will you be integrating with other software?
                </Typography>
                <FormControl component="fieldset" required>
                  <RadioGroup
                    row
                    aria-label="integration"
                    name="integration-radio-buttons-group"
                  >
                    <FormControlLabel
                      checked={integrationNeeded.value}
                      control={<Radio color="info" onClick={(e) => integrationNeeded.setNewValue(true)} />}
                      label="Yes"
                    />
                    <FormControlLabel
                      checked={!integrationNeeded.value}
                      control={<Radio color="info" onClick={(e) => integrationNeeded.setNewValue(false)} />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {integrationNeeded.value && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom component="div">
                    If Yes what types? (Multiple Select)
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      labelId="integration-type-label"
                      id="integration-type"
                      value={integrationTypes.value}
                      label="Integration Type"
                      multiple
                      onChange={(event) => {
                        const {
                          target: { value },
                        } = event;
                        integrationTypes.setNewValue(
                          // On autofill we get a stringified value.
                          typeof value === 'string' ? value.split(',') : value,
                        );
                      }}
                      renderValue={(selected) => {
                        const values = _.map(selected, (sel) => {
                          const type = _.find(INTEGRATION_TYPES, { value: sel });
                          return type.text;
                        });
                        return values.join(', ');
                      }}
                    >
                      <MenuItem value="">-----------------------</MenuItem>
                      {_.map(INTEGRATION_TYPES, (intType, idx) => (
                        <MenuItem key={`integration-type-${idx}`} value={intType.value}>
                          <Checkbox
                            checked={_.indexOf(integrationTypes.value, intType.value) > -1}
                          />
                          <ListItemText primary={intType.text} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={3}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="productType"
                  label="What type of product/app it is?"
                  name="productType"
                  autoComplete="productType"
                  onBlur={(e) => handleBlur(e, 'required', productType)}
                  {...productType.bind}
                >
                  {_.map(PRODUCT_TYPE, (type, idx) => (
                    <MenuItem key={idx} value={type.value}>{type.text}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="expectedTraffic"
                  label="How many users do you expect to accommodate per month?"
                  name="expectedTraffic"
                  autoComplete="expectedTraffic"
                  onBlur={(e) => handleBlur(e, 'required', expectedTraffic)}
                  {...expectedTraffic.bind}
                >
                  <MenuItem value="">------------------------------</MenuItem>
                  {productType.value && _.map(EXPECTED_TRAFFIC[productType.value], (traffic, idx) => (
                    <MenuItem key={idx} value={traffic}>{traffic}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" component="h6">
                  Do you want to hire a team or use your own team (internal developers)?
                </Typography>
                <FormControl component="fieldset" required>
                  <RadioGroup
                    row
                    aria-label="team-needed"
                    name="team-needed-radio-buttons-group"
                  >
                    <FormControlLabel
                      checked={teamNeeded.value}
                      control={<Radio color="info" onClick={(e) => teamNeeded.setNewValue(true)} />}
                      label="Hire team"
                    />
                    <FormControlLabel
                      checked={!teamNeeded.value}
                      control={<Radio color="info" onClick={(e) => teamNeeded.setNewValue(false)} />}
                      label="Use my Own team"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {teamNeeded.value && (
                <Grid item xs={12}>
                  <Autocomplete
                    disablePortal
                    id="productTimezone"
                    name="productTimezone"
                    options={moment.tz.names()}
                    value={timezone}
                    onChange={(event, value) => {
                      handleBlur(event, 'required', productTimezone);
                      setTimezone(value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        fullWidth
                        label="What timezone are you in?"
                        {...productTimezone.bind}
                      />
                    )}
                  />
                </Grid>
              )}
              {teamNeeded.value && (
                <Grid item xs={12}>
                  <Typography variant="h6" component="h6">
                    Is it ok for that team to be more then 3 timezones away?
                  </Typography>
                  <FormControl component="fieldset" required>
                    <RadioGroup
                      row
                      aria-label="team-timezone-away"
                      name="team-timezone-away-radio-buttons-group"
                    >
                      <FormControlLabel
                        checked={teamTimezoneAway.value}
                        control={<Radio color="info" onClick={(e) => teamTimezoneAway.setNewValue(true)} />}
                        label="Yes"
                      />
                      <FormControlLabel
                        checked={!teamTimezoneAway.value}
                        control={<Radio color="info" onClick={(e) => teamTimezoneAway.setNewValue(false)} />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              )}
            </Grid>
            <Grid container spacing={3} className={classes.buttonContainer}>
              <Grid item xs={12} sm={4}>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={handleBack}
                  className={classes.submit}
                >
                  Back
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={submitDisabled()}
                  className={classes.submit}
                >
                  {buttonText}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </div>
    </>
  );
};

export default Setup;
