import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import makeStyles from '@mui/styles/makeStyles';
import {
  Button,
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
import Loader from '@components/Loader/Loader';
import DatePickerComponent from '@components/DatePicker/DatePicker';
import AIFormHelper from '@components/AIFormHelper/AIFormHelper';
import { useInput } from '@hooks/useInput';
import { getOrganization } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { useQuery } from 'react-query';
import { useStore } from '@zustand/product/productStore';
import { getAllThirdPartyToolQuery } from '@react-query/queries/product/getAllThirdPartyToolQuery';
import { useValidateCredentialMutation } from '@react-query/mutations/product/validateCredentialMutation';

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

const StyledRadio = (props) => (
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
  handleNext,
  editData,
  viewPage,
  featCred,
  issueCred,
}) => {
  const classes = useStyles();

  const { displayAlert } = useAlert();
  const { productFormData, updateProductFormData } = useStore();

  const name = useInput((editData && editData.name)
    || (productFormData && productFormData.product_name)
    || '', { required: true });

  const description = useInput((editData && editData.description)
    || (productFormData && productFormData.product_description)
    || '');

  const featuresTool = useInput('start fresh', { required: true });
  const issuesTool = useInput('start fresh', { required: true });

  const [trelloAuth, setTrelloAuth] = useState({
    trello_key: '',
    access_token: '',
    tool_type: 'Feature',
    tool_name: 'Trello',
  });

  const [githubIssueAuth, setGithubIssueAuth] = useState({
    owner_name: '',
    access_token: '',
    tool_type: 'Issue',
    tool_name: 'GitHub',
  });

  const [startDate, setStartDate] = useState(moment(
    (editData && editData.start_date)
    || (productFormData && productFormData.start_date)
    || moment(),
  ).toISOString());

  const [endDate, setEndDate] = useState(moment(
    (editData && editData.end_date)
    || (productFormData && productFormData.end_date)
    || moment().add(2, 'M'),
  ).toISOString());

  const [formError, setFormError] = useState({});

  const { data: allThirdPartyToolData, isLoading: isAllThirdPartyToolLoading } = useQuery(
    ['allThirdPartyToolCredentials'],
    () => getAllThirdPartyToolQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { mutate: validateCredentialMutation, isLoading: isValidatingCredentialLoading, isSuccess: isValidateCredentailSuccess } = useValidateCredentialMutation(displayAlert);

  useEffect(() => {
    if (productFormData && !_.isEmpty(productFormData.featureCreds)) {
      switch (_.toLower(productFormData.featureCreds.auth_detail.tool_name)) {
        case 'trello':
          setTrelloAuth(productFormData.featureCreds.auth_detail);
          break;
        default:
          break;
      }
    }
    if (productFormData && !_.isEmpty(productFormData.issueCreds)) {
      switch (_.toLower(productFormData.issueCreds.auth_detail.tool_name)) {
        case 'github':
          setGithubIssueAuth(productFormData.issueCreds.auth_detail);
          break;
        default:
          break;
      }
    }
  }, [productFormData]);

  useEffect(() => {
    const editCreds = [];
    if (editData) {
      if (featCred) {
        editCreds.push(featCred);
      }
      if (issueCred) {
        editCreds.push(issueCred);
      }
    }
    if (editData && !_.isEmpty(editCreds)) {
      _.forEach(editCreds, (cred) => {
        if (cred && cred.auth_detail && _.toLower(cred.auth_detail.tool_type) === 'feature') {
          switch (_.toLower(cred.auth_detail.tool_name)) {
            case 'trello':
              setTrelloAuth(cred.auth_detail);
              break;
            default:
              break;
          }
        }
        if (cred && cred.auth_detail && _.toLower(cred.auth_detail.tool_type) === 'issue') {
          switch (_.toLower(cred.auth_detail.tool_name)) {
            case 'github':
              setGithubIssueAuth(cred.auth_detail);
              break;
            default:
              break;
          }
        }
      });
    }
  }, [editData]);

  useEffect(() => {
    if (productFormData
      && productFormData.third_party_tool
      && !_.isEmpty(productFormData.third_party_tool)
      && allThirdPartyToolData
      && !_.isEmpty(allThirdPartyToolData)
    ) {
      _.forEach(productFormData.third_party_tool, (id) => {
        const tool = _.find(allThirdPartyToolData, { thirdpartytool_uuid: id });
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
      && allThirdPartyToolData
      && !_.isEmpty(allThirdPartyToolData)
    ) {
      _.forEach(editData.third_party_tool, (id) => {
        const tool = _.find(allThirdPartyToolData, { thirdpartytool_uuid: id });
        if (tool) {
          if (_.toLower(tool.tool_type) === 'feature') {
            featuresTool.setNewValue(_.toLower(tool.name));
          } else {
            issuesTool.setNewValue(_.toLower(tool.name));
          }
        }
      });
    }
  }, [allThirdPartyToolData]);

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (!name.value
      || (featuresTool.value === 'trello' && (!trelloAuth.access_token || !trelloAuth.trello_key))
      || (issuesTool.value === 'github' && (!githubIssueAuth.access_token || !githubIssueAuth.owner_name))
      || (featuresTool.value !== 'start fresh' && !isValidateCredentailSuccess)
      || (issuesTool.value !== 'start fresh' && !isValidateCredentailSuccess)
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

  checkIfProductSetupEdited = () => {
    const tools = _.filter(allThirdPartyToolData, (tool) => (
      (editData && _.includes(editData.third_party_tool, tool.thirdpartytool_uuid))
      || (productFormData && _.includes(productFormData.third_party_tool, tool.thirdpartytool_uuid))
    ));
    const ft = _.toLower(_.find(tools, (tool) => _.toLower(tool.tool_type) === 'feature')?.name);
    const it = _.toLower(_.find(tools, (tool) => _.toLower(tool.tool_type) === 'issue')?.name);

    return (
      name.hasChanged()
      || description.hasChanged()
      || (ft && (featuresTool.value !== ft))
      || (it && (issuesTool.value !== it))
      || !!(((editData && editData.start_date) || (productFormData && productFormData.start_date))
        && (moment(startDate).format('L') !== moment(editData.start_date || productFormData.start_date).format('L')))
      || !!(((editData && editData.end_date) || (productFormData && productFormData.end_date))
        && (moment(endDate).format('L') !== moment(editData.end_date || productFormData.end_date).format('L')))
    );
  };

  const handleFeatureCredential = (event) => {
    event.preventDefault();
    let authDetail;
    switch (featuresTool.value) {
      case 'trello':
        authDetail = trelloAuth;
        break;
      default:
        break;
    }
    validateCredentialMutation({ ...authDetail });
  };

  const handleIssueCredential = (event) => {
    event.preventDefault();
    let authDetail;
    switch (issuesTool.value) {
      case 'github':
        authDetail = githubIssueAuth;
        break;
      default:
        break;
    }
    validateCredentialMutation({ ...authDetail });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const dateTime = new Date();
    let tools = [];
    let newFeatCred;
    let newIssueCred;
    switch (featuresTool.value) {
      case 'trello': {
        const ft = _.find(allThirdPartyToolData, (tool) => (
          _.toLower(tool.name) === 'trello'
          && _.toLower(tool.tool_type) === 'feature'
        ));
        tools = [...tools, ft?.thirdpartytool_uuid];
        newFeatCred = {
          third_party_tool: ft?.thirdpartytool_uuid,
          auth_detail: trelloAuth,
        };
        break;
      }
      default:
        break;
    }
    switch (issuesTool.value) {
      case 'github': {
        const it = _.find(allThirdPartyToolData, (tool) => (
          _.toLower(tool.name) === 'github'
          && _.toLower(tool.tool_type) === 'issue'
        ));
        tools = [...tools, it?.thirdpartytool_uuid];
        newIssueCred = {
          third_party_tool: it?.thirdpartytool_uuid,
          auth_detail: githubIssueAuth,
        };
        break;
      }
      default:
        break;
    }

    const updatedFeatureCreds = !_.isMatch(
      newFeatCred?.auth_detail.tool_name, featCred?.auth_detail.tool_name,
    );

    const updatedIssueCreds = !_.isMatch(
      newIssueCred?.auth_detail.tool_name, issueCred?.auth_detail.tool_name,
    );

    const formData = {
      ...productFormData,
      name: name.value,
      description: description.value,
      start_date: startDate,
      end_date: endDate,
      create_date: dateTime,
      edit_date: dateTime,
      organization_uuid: getOrganization(),
      third_party_tool: tools,
      product_info: {
        ...productFormData?.product_info,
      },
      featureCreds: updatedFeatureCreds
        ? {
          ...featCred,
          ...newFeatCred,
          auth_detail: { ...featCred?.auth_detail, ...newFeatCred?.auth_detail },
        } : newFeatCred,
      issueCreds: updatedIssueCreds
        ? {
          ...issueCred,
          ...newIssueCred,
          auth_detail: { ...issueCred?.auth_detail, ...newIssueCred?.auth_detail },
        } : newIssueCred,
    };
    updateProductFormData(formData);
    handleNext();
  };

  return (
    <>
      {(isAllThirdPartyToolLoading || isValidatingCredentialLoading) && <Loader open={isAllThirdPartyToolLoading || isValidatingCredentialLoading} />}
      <div>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <Box mb={2} mt={3}>
            <Grid container spacing={2}>
              <Grid className={classes.inputWithTooltip} item xs={12} sm={12}>
                <Box display="flex" alignItems="center">
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
                    {...name.bind}
                  />
                  <AIFormHelper
                    fieldType="product-name"
                    onSuggestion={(suggestion) => name.setValue(suggestion)}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid className={classes.inputWithTooltip} item xs={12}>
                    <Box display="flex" alignItems="flex-start">
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
                      <Box mt={2}>
                        <AIFormHelper
                          fieldType="product-description"
                          onSuggestion={(suggestion) => description.setValue(suggestion)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePickerComponent
                      label="Start Date"
                      selectedDate={startDate}
                      handleDateChange={setStartDate}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePickerComponent
                      label="End Date"
                      selectedDate={endDate}
                      handleDateChange={setEndDate}
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
                        control={<StyledRadio />}
                        disabled={viewPage}
                        label={(
                          <>
                            <FontAwesomeIcon icon={faTrello} className="fa-4x" />
                            <Typography align="center">Trello</Typography>
                          </>
                        )}
                      />
                      <FormControlLabel
                        value="start fresh"
                        className={classes.radioLeft}
                        disabled={viewPage}
                        control={<Radio color="info" />}
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
                    </>
                  )}
                  {featuresTool.value !== 'start fresh' && (
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
                        control={<StyledRadio />}
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
                        control={<Radio color="info" />}
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
                    </>
                  )}
                  {issuesTool.value !== 'start fresh' && (
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
    </>
  );
};

export default ProductSetup;
