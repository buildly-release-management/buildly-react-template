import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import {
  useTheme,
  useMediaQuery,
  Grid,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useInput } from '@hooks/useInput';
import {
  getAllStatuses,
  createFeature,
  updateFeature,
  saveFeatureFormData,
} from '@redux/decision/actions/decision.actions';
import { getAllCredentials } from '@redux/product/actions/product.actions';
import { validators } from '@utils/validators';

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    color: '#fff',
    [theme.breakpoints.up('sm')]: {
      width: '70%',
      margin: 'auto',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.secondary.contrastText,
    },
    '& .MuiOutlinedInput-root:hover > .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgb(255, 255, 255, 0.23)',
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.secondary.contrastText,
    },
    '& .MuiSelect-icon': {
      color: theme.palette.secondary.contrastText,
    },
    '& .MuiInputBase-input': {
      color: theme.palette.secondary.contrastText,
    },
  },
  choice: {
    marginTop: '0.75rem',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    borderRadius: '18px',
  },
  formTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
    color: theme.palette.primary.contrastText,
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
  icon: {
    borderRadius: '50%',
    width: 16,
    height: 16,
    boxShadow:
      'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: '#f5f8fa',
    backgroundImage:
      'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
    'input:hover ~ &': {
      backgroundColor: '#ebf1f5',
    },
    'input:disabled ~ &': {
      boxShadow: 'none',
      background: 'rgba(206,217,224,.5)',
    },
  },
  checkedIcon: {
    backgroundColor: '#137cbd',
    backgroundImage:
      'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&:before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
      content: '""',
    },
    'input:hover ~ &': {
      backgroundColor: '#106ba3',
    },
  },
  radioButton: {
    margin: theme.spacing(2, 2),
  },
  radioLeft: {
    marginLeft: theme.spacing(2),
  },
}));

// eslint-disable-next-line import/no-mutable-exports
export let checkIfDescribeProcessEdited;

const DescribeProcess = ({
  history,
  location,
  statuses,
  dispatch,
  products,
  credentials,
  productFeatures,
  handleNext,
  handleBack,
  featureFormData,
}) => {
  const classes = useStyles();
  const [product, setProduct] = useState('');

  const redirectTo = location.state && location.state.from;
  const editPage = location.state && (location.state.type === 'edit' || location.state.type === 'view');
  const product_uuid = location.state && location.state.product_uuid;
  const [formError, setFormError] = useState({});
  const editData = (
    location.state
    && (location.state.type === 'edit' || location.state.type === 'view')
    && location.state.data
  ) || {};
  const viewPage = (location.state && location.state.viewOnly) || false;

  const [quest1, setQuest1] = useState((editData && editData.feature_detail.collecting_data) || []);
  const quest2 = useInput((editData && editData.feature_detail.field_desc) || '', {
    required: true,
  });
  const [quest3, setQuest3] = useState((editData && editData.feature_detail.displaying_data) || []);
  const quest4 = useInput((editData && editData.feature_detail.display_desc) || '', {
    required: true,
  });
  const [quest5, setQuest5] = useState((editData && editData.feature_detail.business_logic) || []);
  const [quest6, setQuest6] = useState((editData && editData.feature_detail.enabled) || []);
  const quest7 = useInput((editData && editData.feature_detail.enabled_desc) || '', {
    required: true,
  });
  const [quest8, setQuest8] = useState((editData && editData.feature_detail.search_or_nav) || []);
  const [quest9, setQuest9] = useState((editData && editData.feature_detail.links) || []);

  const buttonText = editPage ? 'Save' : 'Add Feature';
  const formTitle = editPage ? 'Edit Feature' : 'Add Feature';

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  useEffect(() => {
    if (!statuses || _.isEmpty(statuses)) {
      dispatch(getAllStatuses());
    }
    if (!credentials || _.isEmpty(credentials)) {
      dispatch(getAllCredentials());
    }
  }, []);

  checkIfDescribeProcessEdited = () => (
    quest2.hasChanged()
    || quest4.hasChanged()
    || quest7.hasChanged()
    || (!_.isEmpty(editData) && !_.isEqual(quest1, editData.feature_detail.quest1))
      || (_.isEmpty(editData) && !_.isEmpty(quest1))
    || (!_.isEmpty(editData) && !_.isEqual(quest3, editData.feature_detail.quest3))
      || (_.isEmpty(editData) && !_.isEmpty(quest3))
    || (!_.isEmpty(editData) && !_.isEqual(quest6, editData.feature_detail.quest6))
      || (_.isEmpty(editData) && !_.isEmpty(quest6))
    || (!_.isEmpty(editData) && !_.isEqual(quest8, editData.feature_detail.quest8))
      || (_.isEmpty(editData) && !_.isEmpty(quest8))
    || (!_.isEmpty(editData) && !_.isEqual(quest9, editData.feature_detail.quest9))
      || (_.isEmpty(editData) && !_.isEmpty(quest9))
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const featureDetails = {
      ...featureFormData,
      feature_detail: {
        collecting_data: quest1,
        field_desc: quest2.value,
        displaying_data: quest3,
        display_desc: quest4.value,
        business_logic: quest5,
        enabled: quest6,
        enabled_desc: quest7.value,
        search_or_nav: quest8,
        links: quest9,
      },
    };
    if (editPage) {
      dispatch(updateFeature(featureDetails));
    } else {
      dispatch(createFeature(featureDetails));
    }
    history.push(redirectTo);
  };

  const handleBlur = (e, validation, input, parentId) => {
    const validateObj = validators(validation, input);
    const prevState = { ...formError };
    if (validateObj && validateObj.error) {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: validateObj,
      });
    } else {
      setFormError({
        ...prevState,
        [e.target.id || parentId]: {
          error: false,
          message: '',
        },
      });
    }
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!quest1
    || (quest1 === 'yes' && !quest2.value)
    || !quest3
    || (quest3 === 'yes' && !quest4.value)
    || (quest3 === 'yes' && !quest5)
    || !quest6
    || (quest6 === 'yes' && !quest7.value)
    || (quest5 === 'no' && !quest8)
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

  return (
    <>
      <form
        className={classes.form}
        noValidate
        onSubmit={handleSubmit}
      >
        <Grid container spacing={isDesktop ? 2 : 0}>
          <FormControl
            className={classes.choice}
            fullWidth
            component="fieldset"
            disabled={viewPage}
          >
            <FormLabel component="legend">
              Collecting Data?
            </FormLabel>
            <RadioGroup
              aria-label="collecting-data"
              name="quest1"
              value={quest1}
              onChange={(e) => setQuest1(e.target.value)}
            >
              <FormControlLabel
                value="yes"
                control={<Radio color="primary" />}
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={<Radio color="primary" />}
                label="No"
              />
            </RadioGroup>
          </FormControl>
          {quest1 === 'yes' && (
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="quest2"
            label="Describe the fields"
            name="quest2"
            autoComplete="quest2"
            error={formError.quest2 && formError.quest2.error}
            helperText={
              formError && formError.quest2
                ? formError.quest2.message
                : ''
                    }
            className={classes.textField}
            onBlur={(e) => handleBlur(e, 'required', quest2)}
            {...quest2.bind}
            disabled={viewPage}
          />
          )}
          <FormControl
            className={classes.choice}
            fullWidth
            component="fieldset"
            disabled={viewPage}
          >
            <FormLabel component="legend">
              Displaying Data?
            </FormLabel>
            <RadioGroup
              aria-label="displaying-data"
              name="quest3"
              value={quest3}
              onChange={(e) => setQuest3(e.target.value)}
            >
              <FormControlLabel
                value="yes"
                label="Yes"
                control={<Radio color="primary" />}
              />
              <FormControlLabel
                value="no"
                label="No"
                control={<Radio color="primary" />}
              />
            </RadioGroup>
          </FormControl>
          {quest3 === 'yes' && (
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="quest4"
            label="Describe how data will be displayed"
            name="quest4"
            autoComplete="quest4"
            error={formError.quest4 && formError.quest4.error}
            helperText={
              formError && formError.quest4
                ? formError.quest4.message
                : ''
                    }
            className={classes.textField}
            onBlur={(e) => handleBlur(e, 'required', quest4)}
            {...quest4.bind}
            disabled={viewPage}
          />
          )}
          {quest3 === 'yes' && (
          <FormControl
            className={classes.choice}
            fullWidth
            component="fieldset"
            disabled={viewPage}
          >
            <FormLabel component="legend">
              Business Logic?
            </FormLabel>
            <RadioGroup
              aria-label="business-logic"
              name="quest5"
              value={quest5}
              onChange={(e) => setQuest5(e.target.value)}
            >
              <FormControlLabel
                value="yes"
                label="Yes"
                control={<Radio color="primary" />}
              />
              <FormControlLabel
                value="no"
                label="No"
                control={<Radio color="primary" />}
              />
            </RadioGroup>
          </FormControl>
          )}
          <FormControl
            className={classes.choice}
            fullWidth
            component="fieldset"
            disabled={viewPage}
          >
            <FormLabel component="legend">
              Making a decision?
            </FormLabel>
            <RadioGroup
              aria-label="making-decision"
              name="quest6"
              value={quest6}
              onChange={(e) => setQuest6(e.target.value)}
            >
              <FormControlLabel
                value="yes"
                label="Yes"
                control={<Radio color="primary" />}
              />
              <FormControlLabel
                value="no"
                label="No"
                control={<Radio color="primary" />}
              />
            </RadioGroup>
          </FormControl>
          {quest6 === 'yes' && (
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="quest7"
            label="Describe how decision will be displayed"
            name="quest7"
            autoComplete="quest7"
            error={formError.quest7 && formError.quest7.error}
            helperText={
              formError && formError.quest7
                ? formError.quest7.message
                : ''
                    }
            className={classes.textField}
            onBlur={(e) => handleBlur(e, 'required', quest7)}
            {...quest7.bind}
            disabled={viewPage}
          />
          )}
          {quest5 === 'no' && (
          <FormControl
            className={classes.choice}
            fullWidth
            component="fieldset"
            disabled={viewPage}
          >
            <FormLabel component="legend">
              How does a user find this data?
            </FormLabel>
            <RadioGroup
              aria-label="user-find-data"
              name="quest8"
              value={quest8}
              onChange={(e) => setQuest8(e.target.value)}
            >
              <FormControlLabel
                value="search"
                label="Search"
                control={<Radio color="primary" />}
              />
              <FormControlLabel
                value="nav"
                label="Nav"
                control={<Radio color="primary" />}
              />
            </RadioGroup>
          </FormControl>
          )}
          {(quest8 === 'nav' || quest6 === 'no') && (
          <FormControl
            className={classes.choice}
            fullWidth
            component="fieldset"
            disabled={viewPage}
          >
            <FormLabel component="legend">
              Links?
            </FormLabel>
            <RadioGroup
              aria-label="links"
              name="quest9"
              value={quest9}
              onChange={(e) => setQuest9(e.target.value)}
            >
              <FormControlLabel
                value="top"
                label="Top"
                control={<Radio color="primary" />}
              />
              <FormControlLabel
                value="secondary"
                label="Secondary"
                control={<Radio color="primary" />}
              />
              <FormControlLabel
                value="tertiary"
                label="Tertiary"
                control={<Radio color="primary" />}
              />
            </RadioGroup>
          </FormControl>
          )}
        </Grid>
        <Grid container spacing={3} className={classes.buttonContainer}>
          <Grid item xs={12} sm={4}>
            <Button
              type="button"
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleBack}
              className={classes.submit}
            >
              Back
            </Button>
          </Grid>
          { !viewPage && (
          <Grid item xs={12} sm={4}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className={classes.submit}
              disabled={submitDisabled()}
            >
              {buttonText}
            </Button>
          </Grid>
          )}
        </Grid>
      </form>
    </>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  statuses: state.decisionReducer.statuses,
  products: state.productReducer.products,
  credentials: state.productReducer.credentials,
  featureFormData: state.decisionReducer.featureFormData,
});

export default connect(mapStateToProps)(DescribeProcess);
