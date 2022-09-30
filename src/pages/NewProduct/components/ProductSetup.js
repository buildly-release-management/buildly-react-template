import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import {
  Button,
  useTheme,
  useMediaQuery,
  Grid,
  TextField,
  Typography,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faTrello } from '@fortawesome/free-brands-svg-icons';
import DatePickerComponent from '@components/DatePicker/DatePicker';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import { getOrganization } from '@context/User.context';
import {
  saveProductFormData, getAllThirdPartyTools, getAllCredentials, validateCredential,
} from '@redux/product/actions/product.actions';

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
  radioButton: {
    margin: theme.spacing(2, 2),
  },
  radioLeft: {
    marginLeft: theme.spacing(2),
  },
}));

// eslint-disable-next-line import/no-mutable-exports
export let checkIfProductSetupEdited;

const StyledRadio = (props) => <Radio color="info" {...props} />;

const StyledStart = (props) => (
  <Radio
    sx={{
      opacity: 0,
      '&.Mui-checked': {
        '&, & + .MuiFormControlLabel-label': {
          color: '#137cbd',
        },
      },
    }}
    {...props}
  />
);

const ProductSetup = ({
  productFormData,
  handleNext,
  dispatch,
  thirdPartyTools,
  editData,
  viewPage,
  featCred,
  issueCred,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const name = useInput((editData && editData.name)
  || (productFormData && productFormData.product_name) || '',
  { required: true });
  const description = useInput((editData && editData.description)
  || (productFormData && productFormData.product_description) || '',
  { required: true });
  const featuresTool = useInput('start fresh', { required: true });
  const issuesTool = useInput('start fresh', { required: true });
  const [trelloAuth, setTrelloAuth] = useState({
    trello_key: '',
    access_token: '',
    tool_type: 'Feature',
    tool_name: 'Trello',
  });
  const [githubFeatureAuth, setGithubFeatureAuth] = useState({
    owner_name: '',
    access_token: '',
    tool_type: 'Feature',
    tool_name: 'GitHub',
  });
  const [githubIssueAuth, setGithubIssueAuth] = useState({
    owner_name: '',
    access_token: '',
    tool_type: 'Issue',
    tool_name: 'GitHub',
  });
  const [startDate, handleStartDateChange] = useState((editData && editData.start_date)
  || (productFormData && productFormData.start_date) || new Date());
  const [endDate, handleEndDateChange] = useState((editData && editData.end_date)
  || (productFormData && productFormData.end_date) || new Date());
  const [formError, setFormError] = useState({});

  const editCreds = [];
  if (editData) {
    if (featCred) {
      editCreds.push(featCred);
    }
    if (issueCred) {
      editCreds.push(issueCred);
    }
  }

  useEffect(() => {
    if (productFormData && !_.isEmpty(productFormData.creds)) {
      _.forEach(productFormData.creds, (cred) => {
        switch (true) {
          case cred && cred.auth_detail
            && cred.auth_detail.tool_type === 'Feature':
            if (cred.auth_detail.tool_name === 'Trello') {
              setTrelloAuth(cred.auth_detail);
            }
            if (cred.auth_detail.tool_name === 'GitHub') {
              setGithubFeatureAuth(cred.auth_detail);
            }
            break;

          case cred && cred.auth_detail
            && cred.auth_detail.tool_type === 'Issue':
            if (cred.auth_detail.tool_name === 'GitHub') {
              setGithubIssueAuth(cred.auth_detail);
            }
            break;

          default:
            break;
        }
      });
    }
  }, [productFormData]);

  useEffect(() => {
    if (editData && !_.isEmpty(editCreds)) {
      _.forEach(editCreds, (cred) => {
        switch (true) {
          case cred && cred.auth_detail
            && cred.auth_detail.tool_type === 'Feature':
            if (cred.auth_detail.tool_name === 'Trello') {
              setTrelloAuth(cred.auth_detail);
            }
            if (cred.auth_detail.tool_name === 'GitHub') {
              setGithubFeatureAuth(cred.auth_detail);
            }
            break;

          case cred && cred.auth_detail
            && cred.auth_detail.tool_type === 'Issue':
            if (cred.auth_detail.tool_name === 'GitHub') {
              setGithubIssueAuth(cred.auth_detail);
            }
            break;

          default:
            break;
        }
      });
    }
  }, [editData]);

  useEffect(() => {
    if (!thirdPartyTools || _.isEmpty(thirdPartyTools)) {
      dispatch(getAllThirdPartyTools());
    }

    if (productFormData
      && productFormData.third_party_tool
      && !_.isEmpty(productFormData.third_party_tool)
      && thirdPartyTools
      && !_.isEmpty(thirdPartyTools)
    ) {
      _.forEach(productFormData.third_party_tool, (id) => {
        const tool = _.find(thirdPartyTools, { thirdpartytool_uuid: id });
        if (tool) {
          if (_.toLower(tool.tool_type) === 'feature') {
            featuresTool.setNewValue(_.toLower(tool.name));
          } else {
            issuesTool.setNewValue(_.toLower(tool.name));
          }
        }
      });
    } else if (editData
        && editData.third_party_tool
        && !_.isEmpty(editData.third_party_tool)
        && thirdPartyTools
        && !_.isEmpty(thirdPartyTools)
    ) {
      _.forEach(editData.third_party_tool, (id) => {
        const tool = _.find(thirdPartyTools, { thirdpartytool_uuid: id });
        if (tool) {
          if (_.toLower(tool.tool_type) === 'feature') {
            featuresTool.setNewValue(_.toLower(tool.name));
          } else {
            issuesTool.setNewValue(_.toLower(tool.name));
          }
        }
      });
    }
  }, [thirdPartyTools]);

  /**
   * Handle input field blur event
   * @param {Event} e Event
   * @param {String} validation validation type if any
   * @param {Object} input input field
   */
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
    if (!name.value || !description.value
      || (featuresTool.value === 'trello'
        && (!trelloAuth.access_token || !trelloAuth.trello_key))
      || (featuresTool.value === 'github'
        && (!githubFeatureAuth.access_token
          || !githubFeatureAuth.owner_name))
      || (issuesTool.value === 'github'
        && (!githubIssueAuth.access_token
          || !githubIssueAuth.owner_name))
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

  checkIfProductSetupEdited = () => (
    name.hasChanged()
    || description.hasChanged()
    || featuresTool.hasChanged()
    || issuesTool.hasChanged()
    || (productFormData
      && productFormData.start_date
      && (startDate !== productFormData.start_date))
    || (productFormData
      && productFormData.end_date
      && (endDate !== productFormData.end_date))
  );

  const handleFeatureCredential = (event) => {
    event.preventDefault();

    let tools = [];
    let creds = [];

    switch (featuresTool.value) {
      case 'trello': {
        const ft = _.find(thirdPartyTools, (tool) => (
          _.toLower(tool.name) === 'trello'
          && _.toLower(tool.tool_type) === 'feature'
        ));
        tools = [...tools, ft?.thirdpartytool_uuid];
        creds = [...creds, {
          third_party_tool: ft?.thirdpartytool_uuid,
          auth_detail: trelloAuth,
        }];
        break;
      }

      case 'github': {
        const ft = _.find(thirdPartyTools, (tool) => (
          _.toLower(tool.name) === 'github'
          && _.toLower(tool.tool_type) === 'feature'
        ));
        tools = [...tools, ft?.thirdpartytool_uuid];
        creds = [...creds, {
          third_party_tool: ft?.thirdpartytool_uuid,
          auth_detail: githubFeatureAuth,
        }];
        break;
      }

      default:
        break;
    }
    const formData = {
      ...creds[0].auth_detail,
    };

    dispatch(validateCredential(formData));
  };

  const handleIssueCredential = (event) => {
    event.preventDefault();

    let tools = [];
    let creds = [];

    switch (issuesTool.value) {
      case 'github': {
        const it = _.find(thirdPartyTools, (tool) => (
          _.toLower(tool.name) === 'github'
          && _.toLower(tool.tool_type) === 'issue'
        ));
        tools = [...tools, it?.thirdpartytool_uuid];
        creds = [...creds, {
          third_party_tool: it?.thirdpartytool_uuid,
          auth_detail: githubIssueAuth,
        }];
        break;
      }

      default:
        break;
    }

    const formData = {
      ...creds[0].auth_detail,
    };

    dispatch(validateCredential(formData));
  };

  /**
   * Submit The form and add/edit
   * @param {Event} event the default submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    const dateTime = new Date();
    let tools = [];
    let creds = [];
    let changedData = [];
    let featCreds = [];
    let issCreds = [];

    switch (featuresTool.value) {
      case 'trello': {
        const ft = _.find(thirdPartyTools, (tool) => (
          _.toLower(tool.name) === 'trello'
          && _.toLower(tool.tool_type) === 'feature'
        ));
        tools = [...tools, ft?.thirdpartytool_uuid];
        creds = [...creds, {
          third_party_tool: ft?.thirdpartytool_uuid,
          auth_detail: trelloAuth,
          credential_uuid: featCred?.credential_uuid,
        }];
        featCreds = [...featCreds, {
          third_party_tool: ft?.thirdpartytool_uuid,
          auth_detail: trelloAuth,
          credential_uuid: featCred?.credential_uuid,
        }];
        break;
      }

      case 'github': {
        const ft = _.find(thirdPartyTools, (tool) => (
          _.toLower(tool.name) === 'github'
          && _.toLower(tool.tool_type) === 'feature'
        ));
        tools = [...tools, ft?.thirdpartytool_uuid];
        creds = [...creds, {
          third_party_tool: ft?.thirdpartytool_uuid,
          auth_detail: githubFeatureAuth,
          credential_uuid: featCred?.credential_uuid,
        }];
        featCreds = [...featCreds, {
          third_party_tool: ft?.thirdpartytool_uuid,
          auth_detail: githubFeatureAuth,
          credential_uuid: featCred?.credential_uuid,
        }];
        break;
      }

      default:
        break;
    }

    switch (issuesTool.value) {
      case 'github': {
        const it = _.find(thirdPartyTools, (tool) => (
          _.toLower(tool.name) === 'github'
          && _.toLower(tool.tool_type) === 'issue'
        ));
        tools = [...tools, it?.thirdpartytool_uuid];
        creds = [...creds, {
          third_party_tool: it?.thirdpartytool_uuid,
          auth_detail: githubIssueAuth,
          credential_uuid: issueCred?.credential_uuid,
        }];
        issCreds = [...issCreds, {
          third_party_tool: it?.thirdpartytool_uuid,
          auth_detail: githubIssueAuth,
          credential_uuid: issueCred?.credential_uuid,
        }];
        break;
      }

      default:
        break;
    }

    //  check tooltype of features and previous tool credentials
    const resultFeat = !_.isMatch(
      featCreds[0]?.auth_detail.tool_name, featCred?.auth_detail.tool_name,
    );

    // check tooltype of issues and previous tool credentials
    const resultIssue = !_.isMatch(
      issCreds[0]?.auth_detail.tool_name, issueCred?.auth_detail.tool_name,
    );

    changedData = [{
      changeTool: resultFeat,
      ...featCreds[0],
    },
    {
      changeTool: resultIssue,
      ...issCreds[0],
    }];

    const formData = {
      ...productFormData,
      product_name: name.value,
      product_description: description.value,
      start_date: startDate,
      end_date: endDate,
      create_date: dateTime,
      edit_date: dateTime,
      organization_uuid: getOrganization(),
      third_party_tool: tools,
      product_info: {
        ...productFormData?.product_info,
      },
      creds,
      changedData,
    };

    dispatch(saveProductFormData(formData));
    handleNext();
  };

  return (
    <div>
      <form className={classes.form} noValidate onSubmit={handleSubmit}>
        <Box mb={2} mt={3}>
          <Grid container spacing={2}>
            <Grid className={classes.inputWithTooltip} item xs={12} sm={12}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                required
                id="name"
                label="Product name"
                name="name"
                autoComplete="name"
                error={formError.name && formError.name.error}
                onBlur={(e) => handleBlur(e, 'required', name)}
                {...name.bind}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={isDesktop ? 2 : 0}>
                <Grid className={classes.inputWithTooltip} item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    multiline
                    rows={6}
                    id="description"
                    label="Product description"
                    name="description"
                    autoComplete="description"
                    {...description.bind}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePickerComponent
                    label="Start Date"
                    selectedDate={startDate}
                    hasTime
                    handleDateChange={handleStartDateChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePickerComponent
                    label="End Date"
                    selectedDate={endDate}
                    hasTime
                    handleDateChange={handleEndDateChange}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Features</Typography>
              <Box sx={{ border: '1px solid', borderRadius: '4px', padding: '0 12px' }}>
                <Typography variant="subtitle1" align="center" mt={2}>Connect to supported tool</Typography>
                <FormControl component="fieldset" required>
                  <RadioGroup
                    row
                    aria-label="features"
                    name="features-radio-buttons-group"
                    {...featuresTool.bind}
                    className={classes.radioButton}
                  >
                    <FormControlLabel
                      value="trello"
                      control={<StyledStart />}
                      disabled={viewPage}
                      label={(
                        <>
                          <FontAwesomeIcon icon={faTrello} className="fa-4x" />
                          <Typography align="center">Trello</Typography>
                        </>
                      )}
                    />
                    <FormControlLabel
                      value="github"
                      control={<StyledStart />}
                      disabled={viewPage}
                      label={(
                        <>
                          <FontAwesomeIcon icon={faGithub} className="fa-4x" />
                          <Typography align="center">Github</Typography>
                        </>
                      )}
                    />
                    <FormControlLabel
                      value="start fresh"
                      className={classes.radioLeft}
                      disabled={viewPage}
                      control={<StyledRadio />}
                      label="Start Fresh"
                    />
                  </RadioGroup>
                </FormControl>
                {featuresTool.value === 'trello' && (
                  <>
                    <Grid item>
                      <a href="https://docs.google.com/document/d/1QYosDQAyaTGJJ0TbiojPHQptbDEKI5NEvvwWvZI5Rhk/edit" target="_blank" rel="noopener noreferrer">
                        How to get the access token?
                      </a>
                    </Grid>
                    <Grid item>
                      <TextField
                        required
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        id="trello-access-token"
                        label="Trello Access Token"
                        name="trello-access-token"
                        autoComplete="trello-access-token"
                        value={trelloAuth.access_token}
                        onChange={(e) => setTrelloAuth({
                          ...trelloAuth,
                          access_token: e.target.value,
                        })}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        required
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        id="trello-key"
                        label="Trello Key"
                        name="trello-key"
                        autoComplete="trello-key"
                        value={trelloAuth.trello_key}
                        onChange={(e) => setTrelloAuth({
                          ...trelloAuth,
                          trello_key: e.target.value,
                        })}
                      />
                    </Grid>
                    <Grid item>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        className={classes.submit}
                        onClick={handleFeatureCredential}
                      >
                        Validate
                      </Button>
                    </Grid>
                  </>
                )}
                {featuresTool.value === 'github' && (
                  <>
                    <Grid item>
                      <a href="https://docs.google.com/document/d/1T04LhZjsNsS7ufRZmp-ZGBD60iEOAcMR0aAtAAkdxgs/edit" target="_blank" rel="noopener noreferrer">
                        How to get the access token?
                      </a>
                    </Grid>
                    <Grid item>
                      <TextField
                        required
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        id="github-feature-access-token"
                        label="Github Access Token"
                        name="github-feature-access-token"
                        autoComplete="github-feature-access-token"
                        value={githubFeatureAuth.access_token}
                        onChange={(e) => setGithubFeatureAuth({
                          ...githubFeatureAuth,
                          access_token: e.target.value,
                        })}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        required
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        id="github-feature-owner-name"
                        label="Github Owner Name"
                        name="github-feature-owner-name"
                        autoComplete="github-feature-owner-name"
                        value={githubFeatureAuth.owner_name}
                        onChange={(e) => setGithubFeatureAuth({
                          ...githubFeatureAuth,
                          owner_name: e.target.value,
                        })}
                      />
                    </Grid>
                    <Grid item>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleFeatureCredential}
                        className={classes.submit}
                      >
                        Validate
                      </Button>
                    </Grid>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Issues</Typography>
              <Box sx={{ border: '1px solid', borderRadius: '4px', padding: '0 12px' }}>
                <Typography variant="subtitle1" align="center" mt={2}>Connect to supported tool</Typography>
                <FormControl component="fieldset" required>
                  <RadioGroup
                    row
                    aria-label="issues"
                    name="issues-radio-buttons-group"
                    {...issuesTool.bind}
                    className={classes.radioButton}
                  >
                    <FormControlLabel
                      value="github"
                      control={<StyledStart />}
                      disabled={viewPage}
                      label={(
                        <>
                          <FontAwesomeIcon icon={faGithub} className="fa-4x" />
                          <Typography align="center">Github</Typography>
                        </>
                      )}
                    />
                    <FormControlLabel
                      value="start fresh"
                      className={classes.radioLeft}
                      disabled={viewPage}
                      control={<StyledRadio />}
                      label="Start Fresh"
                    />
                  </RadioGroup>
                </FormControl>
                {issuesTool.value === 'github' && (
                  <>
                    <Grid item>
                      <a href="https://docs.google.com/document/d/1T04LhZjsNsS7ufRZmp-ZGBD60iEOAcMR0aAtAAkdxgs/edit" target="_blank" rel="noopener noreferrer">
                        How to get the access token?
                      </a>
                    </Grid>
                    <Grid item>
                      <TextField
                        required
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        id="github-issues-access-token"
                        label="Github Access Token"
                        name="github-issue-access-token"
                        autoComplete="github-issue-access-token"
                        value={githubIssueAuth.access_token}
                        onChange={(e) => setGithubIssueAuth({
                          ...githubIssueAuth,
                          access_token: e.target.value,
                        })}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        required
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        id="github-issue-owner-name"
                        label="Github Owner Name"
                        name="github-issue-owner-name"
                        autoComplete="github-issue-owner-name"
                        value={githubIssueAuth.owner_name}
                        onChange={(e) => setGithubIssueAuth({
                          ...githubIssueAuth,
                          owner_name: e.target.value,
                        })}
                      />
                    </Grid>
                    <Grid item>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleIssueCredential}
                        className={classes.submit}
                      >
                        Validate
                      </Button>
                    </Grid>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Grid container spacing={3} className={classes.buttonContainer}>
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
      </form>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  productFormData: state.productReducer.productFormData,
  thirdPartyTools: state.productReducer.thirdPartyTools,
  credentials: state.productReducer.credentials,
});

export default connect(mapStateToProps)(ProductSetup);
