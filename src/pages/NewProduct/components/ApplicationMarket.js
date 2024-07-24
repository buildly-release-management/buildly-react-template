import React, { useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import {
  Grid,
  Typography,
  Box,
  MenuItem,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Select,
  Button,
  Checkbox,
  ListItemText,
  TextField,
} from '@mui/material';
import { useInput } from '@hooks/useInput';
import { saveProductFormData } from '@redux/product/actions/product.actions';
import { AVAILABLE_USER_TYPES, BUSSINESS_SEGMENTS } from '../ProductFormConstants';

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
  addButton: {
    margin: 'auto',
  },
  userProfile: {
    paddingTop: '0 !important',
    paddingBottom: theme.spacing(2),
  },
}));

// eslint-disable-next-line import/no-mutable-exports
export let checkIfApplicationMarketEdited;

const ApplicationMarket = ({
  productFormData,
  handleNext,
  handleBack,
  dispatch,
  editData,
}) => {
  const classes = useStyles();

  const applicationType = useInput((editData && editData.product_info
    && editData.product_info.application_type)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.application_type)
    || 'Desktop', { required: true });

  const userLabels = useInput((editData && editData.product_info
    && editData.product_info.user_labels)
    || (productFormData && productFormData.product_info && productFormData.product_info.user_labels)
    || [{ label: '', type: '' }], { required: true });

  const [bussinessSegment, setBussinessSegment] = useState((editData && editData.product_info
    && editData.product_info.bussiness_segment)
    || (productFormData && productFormData.product_info
      && productFormData.product_info.bussiness_segment)
    || []);

  const submitDisabled = () => {
    if (!applicationType.value
      || bussinessSegment.length <= 0
    ) {
      return true;
    }
    return false;
  };

  checkIfApplicationMarketEdited = () => (
    applicationType.hasChanged()
    || userLabels.hasChanged()
    || !!(editData && editData.product_info
      && editData.product_info.bussiness_segment
      && !_.isEqual(bussinessSegment, editData.product_info.bussiness_segment))
    || !!(productFormData && productFormData.product_info
      && productFormData.product_info.bussiness_segment
      && !_.isEqual(bussinessSegment, productFormData.product_info.bussiness_segment))
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = {
      ...productFormData,
      product_info: {
        ...productFormData.product_info,
        application_type: applicationType.value,
        user_labels: userLabels.value,
        bussiness_segment: bussinessSegment,
      },
      edit_date: new Date(),
    };
    dispatch(saveProductFormData(formData));
    handleNext();
  };

  return (
    <div>
      <form className={classes.form} noValidate onSubmit={handleSubmit}>
        <Box mb={2} mt={3}>
          <Grid container>
            <Grid item>
              <Typography variant="h6" gutterBottom component="div">
                Type of Application
              </Typography>
              <RadioGroup
                row
                aria-label="Application"
                name="Application-radio-buttons-group"
                {...applicationType.bind}
              >
                <FormControlLabel
                  value="Mobile Native"
                  control={<Radio color="info" />}
                  label="Mobile Native"
                />
                <FormControlLabel
                  value="Mobile Hybrid"
                  control={<Radio color="info" />}
                  label="Mobile Hybrid"
                />
                <FormControlLabel
                  value="Desktop"
                  control={<Radio color="info" />}
                  label="Desktop"
                />
                <FormControlLabel
                  value="Both"
                  control={<Radio color="info" />}
                  label="Desktop and Mobile"
                />
              </RadioGroup>
            </Grid>
            <Grid item xs={12} mt={3}>
              <Typography variant="h6" gutterBottom component="div">
                What our your primary business segments?
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="bussiness-segment-label">
                  Business Segment
                </InputLabel>
                <Select
                  labelId="bussiness-segment-label"
                  id="bussiness-segment"
                  value={bussinessSegment}
                  label="Type of User"
                  multiple
                  onChange={(event) => {
                    const {
                      target: { value },
                    } = event;
                    setBussinessSegment(
                      // On autofill we get a stringified value.
                      typeof value === 'string' ? value.split(',') : value,
                    );
                  }}
                  renderValue={(selected) => selected.join(', ')}
                >
                  <MenuItem value="">-----------------------</MenuItem>
                  {_.map(BUSSINESS_SEGMENTS, (segment, idx) => (
                    <MenuItem key={`segment-${idx}`} value={segment}>
                      <Checkbox
                        checked={_.indexOf(bussinessSegment, segment) > -1}
                      />
                      <ListItemText primary={segment} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} mt={3}>
              <Typography variant="h6" gutterBottom component="div">
                Who are your users?
              </Typography>
              {_.map(userLabels.value, (userLabel, idx) => (
                <Grid container spacing={2} key={`user-label-${idx}`} mt={-3.5}>
                  <Grid item xs={5}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      id={`user-label-${idx}`}
                      label="User Label"
                      name={`user-label-${idx}`}
                      autoComplete="user-label"
                      value={userLabel.label}
                      onChange={(e) => userLabels.setNewValue(
                        _.map(userLabels.value, (ul, index) => (
                          idx === index
                            ? { label: e.target.value, type: ul.type }
                            : ul
                        )),
                      )}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      select
                      fullWidth
                      id={`user-type-${idx}`}
                      label="User Type"
                      name={`user-type-${idx}`}
                      autoComplete="user-type"
                      value={userLabel.type}
                      onChange={(e) => userLabels.setNewValue(
                        _.map(userLabels.value, (ul, index) => (
                          idx === index
                            ? { label: ul.label, type: e.target.value }
                            : ul
                        )),
                      )}
                    >
                      <MenuItem value="">-----------------------</MenuItem>
                      {_.map(AVAILABLE_USER_TYPES, (ut, inx) => (
                        <MenuItem key={`available-user-type-${inx}`} value={ut}>
                          {ut}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  {idx === 0 && (
                    <Grid item xs={2} className={classes.addButton}>
                      <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={(e) => userLabels.setNewValue([
                          ...userLabels.value,
                          { label: '', type: '' },
                        ])}
                      >
                        Add
                      </Button>
                    </Grid>
                  )}
                  <Grid item xs={12} className={classes.userProfile}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      id={`user-profile-${idx}`}
                      label="User Profile"
                      name={`user-profile-${idx}`}
                      autoComplete="user-profile"
                      value={userLabel.profile}
                      onChange={(e) => userLabels.setNewValue(
                        _.map(userLabels.value, (ul, index) => (
                          idx === index
                            ? { label: ul.label, type: ul.type, profile: e.target.value, }
                            : ul
                        )),
                      )}
                    />
                  </Grid>
                </Grid>
              ))}
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
                disabled={submitDisabled()}
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

export default connect(mapStateToProps)(ApplicationMarket);
