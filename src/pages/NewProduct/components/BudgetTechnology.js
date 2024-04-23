import React, { useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment-timezone';
import makeStyles from '@mui/styles/makeStyles';
import {
  Grid,
  Typography,
  Box,
  Slider,
  FormControl,
  Select,
  MenuItem,
  Button,
  FormLabel,
} from '@mui/material';
import DatePickerComponent from '@components/DatePicker/DatePicker';
import { useInput } from '@hooks/useInput';
import { saveProductFormData } from '@redux/product/actions/product.actions';
import {
  BUDGET_CATEGORY, DATABASES, DEPLOYMENTS, HOSTING, LANGUAGES, STORAGES,
} from '../ProductFormConstants';

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
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  inputWithTooltip: {
    display: 'flex',
    alignItems: 'center',
  },
}));

// eslint-disable-next-line import/no-mutable-exports
export let checkIfBudgetTechnologyEdited;

const BudgetTechnology = ({
  productFormData,
  handleNext,
  handleBack,
  dispatch,
  editData,
}) => {
  const classes = useStyles();

  const [firstUserDate, handlefirstUserDateChange] = useState(moment(
    (editData && editData.product_info && editData.product_info.first_user_date)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.first_user_date)
    || moment().add(3, 'M'),
  ).toISOString());

  const [approxBudget, setApproxBudget] = useState(
    (editData && editData.product_info && editData.product_info.approx_budget)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.approx_budget)
    || {
      value: 0,
      category: '10-15k',
    },
  );

  const hosting = useInput((editData && editData.product_info && editData.product_info.hosting)
    || (productFormData && productFormData.product_info && productFormData.product_info.hosting)
    || 'No Preference', { required: true });

  const language = useInput((editData && editData.product_info && editData.product_info.language)
    || (productFormData && productFormData.product_info && productFormData.product_info.language)
    || 'No Preference', { required: true });

  const database = useInput((editData && editData.product_info && editData.product_info.database)
    || (productFormData && productFormData.product_info && productFormData.product_info.database)
    || 'No Preference', { required: true });

  const storage = useInput((editData && editData.product_info && editData.product_info.storage)
    || (productFormData && productFormData.product_info && productFormData.product_info.storage)
    || 'No Preference', { required: true });

  const deployment = useInput((editData && editData.product_info
    && editData.product_info.deployment)
    || (productFormData && productFormData.product_info && productFormData.product_info.deployment)
    || 'No Preference', { required: true });

  checkIfBudgetTechnologyEdited = () => (
    !!(productFormData && productFormData.product_info
      && productFormData.product_info.first_user_date
      && (moment(firstUserDate).format('L') !== moment(productFormData.product_info.first_user_date).format('L')))
    || !!(editData && editData.product_info && editData.product_info.first_user_date
      && (moment(firstUserDate).format('L') !== moment(editData.product_info.first_user_date).format('L')))
    || !!(productFormData && productFormData.product_info
      && productFormData.product_info.approx_budget
      && !_.isEqual(approxBudget, productFormData.product_info.approx_budget))
    || !!(editData && editData.product_info
      && editData.product_info.approx_budget
      && !_.isEqual(approxBudget, editData.product_info.approx_budget))
    || hosting.hasChanged()
    || language.hasChanged()
    || database.hasChanged()
    || storage.hasChanged()
    || deployment.hasChanged()
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = {
      ...productFormData,
      product_info: {
        ...productFormData.product_info,
        first_user_date: firstUserDate,
        approx_budget: approxBudget,
        hosting: hosting.value,
        language: language.value,
        database: database.value,
        storage: storage.value,
        deployment: deployment.value,
      },
      edit_date: new Date(),
    };
    dispatch(saveProductFormData(formData));
    handleNext();
  };

  const getBudgetCategory = (newValue) => {
    switch (newValue) {
      case 1:
        return '10-15k';
      case 2:
        return '15-25k';
      case 3:
        return '25-35k';
      case 4:
        return '35-50k';
      case 5:
        return '50-100k';
      case 6:
        return '100-150k';
      case 7:
        return '150-200k';
      case 8:
        return '200-300k';
      case 9:
        return '300-500k';
      case 10:
        return '500k+';
      default:
        return 'error';
    }
  };

  return (
    <div>
      <form className={classes.form} noValidate onSubmit={handleSubmit}>
        <Box mb={2} mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom component="div">
                Do you have an approximate date you would like to have your
                first users onboarded?
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePickerComponent
                label="Date"
                selectedDate={firstUserDate}
                handleDateChange={handlefirstUserDateChange}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant="h6" gutterBottom component="div">
                Do you have an approximate budget yet?
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Slider
                value={approxBudget.value}
                onChange={(event, newValue) => {
                  setApproxBudget({
                    value: newValue,
                    category: getBudgetCategory(newValue),
                  });
                }}
                step={1}
                min={1}
                max={10}
                marks={BUDGET_CATEGORY}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant="h6" gutterBottom component="div">
                Do you have a preference for hosting, language, database,
                storage or deployment?
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                variant="outlined"
                fullWidth
                component="fieldset"
                className={classes.formControl}
              >
                <FormLabel component="legend">
                  Select Hosting
                </FormLabel>
                <Select {...hosting.bind}>
                  {_.map(HOSTING, (host, idx) => (
                    <MenuItem key={`hosting-${idx}`} value={host}>
                      {host}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                variant="outlined"
                fullWidth
                component="fieldset"
                className={classes.formControl}
              >
                <FormLabel component="legend">
                  Select Language
                </FormLabel>
                <Select {...language.bind}>
                  {_.map(LANGUAGES, (lng, idx) => (
                    <MenuItem key={`language-${idx}`} value={lng}>
                      {lng}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                variant="outlined"
                fullWidth
                component="fieldset"
                className={classes.formControl}
              >
                <FormLabel component="legend">
                  Select Database
                </FormLabel>
                <Select {...database.bind}>
                  {_.map(DATABASES, (db, idx) => (
                    <MenuItem key={`database-${idx}`} value={db}>
                      {db}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                variant="outlined"
                fullWidth
                component="fieldset"
                className={classes.formControl}
              >
                <FormLabel component="legend">
                  Select Storage
                </FormLabel>
                <Select {...storage.bind}>
                  {_.map(STORAGES, (strg, idx) => (
                    <MenuItem key={`storage-${idx}`} value={strg}>
                      {strg}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                variant="outlined"
                fullWidth
                component="fieldset"
                className={classes.formControl}
              >
                <FormLabel component="legend">
                  Select Deployment
                </FormLabel>
                <Select {...deployment.bind}>
                  {_.map(DEPLOYMENTS, (deploy, idx) => (
                    <MenuItem key={`deployment-${idx}`} value={deploy}>
                      {deploy}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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
                className={classes.submit}
              >
                Next
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  productFormData: state.productReducer.productFormData,
});

export default connect(mapStateToProps)(BudgetTechnology);
