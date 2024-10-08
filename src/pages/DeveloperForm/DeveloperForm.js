import React, { useState, useContext } from 'react';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
  Button,
  CssBaseline,
  TextField,
  Card,
  CircularProgress,
  CardContent,
  Container,
  MenuItem,
  FormGroup,
  Checkbox,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import { routes } from '@routes/routesConstants';
import { UserContext } from '@context/User.context';
import { useInput } from '@hooks/useInput';
import useAlert from '@hooks/useAlert';
import { useAddDataMutation } from '@react-query/mutations/googlesheet/addDataMutation';
import { useUpdateUserMutation } from '@react-query/mutations/authUser/updateUserMutation';
import { validators } from '@utils/validators';

const useStyles = makeStyles((theme) => ({
  title: {
    margin: theme.spacing(2, 0),
  },
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(15),
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  choice: {
    marginBottom: '0.75rem',
  },
  textField: {
    minHeight: '5rem',
    margin: '0.25rem 0',
  },
  submit: {
    maxWidth: theme.spacing(12.5),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  loadingWrapper: {
    margin: theme.spacing(1),
    position: 'relative',
    textAlign: 'center',
  },
}));

const DeveloperForm = ({ loading, history }) => {
  const classes = useStyles();
  const user = useContext(UserContext);

  const { displayAlert } = useAlert();

  const [question1, setQuestion1] = useState(null);
  const question2 = useInput('', { required: true });
  const [question3, setQuestion3] = useState(null);
  const [question4, setQuestion4] = useState(null);
  const [question5, setQuestion5] = useState(null);
  const question6 = useInput('', { required: true });
  const [question7, setQuestion7] = useState(null);
  const [question8, setQuestion8] = useState(null);
  const [question9, setQuestion9] = useState({
    enterprise: false,
    small: false,
    startup: false,
  });
  const [question10, setQuestion10] = useState({
    microservice: false,
    monolith: false,
    separate: false,
    all: false,
  });
  const [question11, setQuestion11] = useState(null);
  const [question12, setQuestion12] = useState(null);
  const [question13, setQuestion13] = useState({
    autoGenerated: false,
    pushEmail: false,
    versionDependency: false,
  });
  const [formError, setFormError] = useState({});

  const { mutate: addDataMutation, isLoading: isAddingDataLoading } = useAddDataMutation(history, routes.PRODUCT_PORTFOLIO, displayAlert);
  const { mutate: updateUserMutation, isLoading: isUpdateUserLoading } = useUpdateUserMutation(history, displayAlert);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = {
      Name: `${user.first_name} ${user.last_name}`,
      'Trello/Github': question1,
      'Other than Trello/Github': question2.value,
      'Tool/System in place for updating customer on progress': question3,
      'Customers asked for more communication about status': question4,
      'Do you ask your customers to track or send seperate updates': question5,
      'Seperate updates, manual or automatic': question6.value,
      'Acceptance testing with your customers or clients': question7,
      'Share release notes and version updates with customer': question8,
      'Enterprise Level Companies': question9.enterprise,
      'Small Business': question9.small,
      Startups: question9.startup,
      'Microservice Architectures': question10.all
        ? true
        : question10.microservice,
      'Monolith Deployments': question10.all ? true : question10.monolith,
      'Seperate FrontEnd and BackEnd(s)': question10.all
        ? true
        : question10.separate,
      'Interested in Release Management Tool': question11,
      'Interested in 3 month free trial': question12,
      'Auto Generated Release Notes': question13.autoGenerated,
      'Status updates via push/email notification to team members':
        question13.pushEmail,
      'Version Dependency Management': question13.versionDependency,
    };
    const profileValues = {
      id: user.id,
      survey_status: true,
    };
    addDataMutation(formData);
    updateUserMutation(profileValues);
  };

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
    const errorKeys = Object.keys(formError);
    let errorExists = false;
    if (
      !question1
      || (question1 === 'no' && !question2.value)
      || !question3
      || !question4
      || !question5
      || (question5 === 'separate updates' && !question6.value)
      || !question7
      || !question8
      || !question11
      || !question12
    ) return true;
    errorKeys.forEach((key) => {
      if (formError[key].error) errorExists = true;
    });
    return errorExists;
  };

  const handleMultipleChoice = (event, question) => {
    switch (question) {
      case 'question9':
        setQuestion9({ ...question9, [event.target.id]: event.target.checked });
        break;

      case 'question10':
        setQuestion10({
          ...question10,
          [event.target.id]: event.target.checked,
        });
        break;

      case 'question13':
        setQuestion13({
          ...question13,
          [event.target.id]: event.target.checked,
        });
        break;

      default:
        break;
    }
  };

  return (
    <>
      {(isAddingDataLoading || isUpdateUserLoading) && <Loader open={isAddingDataLoading || isUpdateUserLoading} />}
      <Typography className={classes.title} variant="body1">
        Thanks for checking out Buildly and our new Project Management offering
        Buildly Planner intended to help facilitate the communication between
        product owners and development teams. To help us guide the direction of
        the application moving forward and help find a fit inside the Buildly
        ecosystem of tools, it would be of great help to us if you could fill
        out this small survey.
      </Typography>
      <Container component="main" maxWidth="md" className={classes.container}>
        <CssBaseline />
        <Card variant="outlined">
          <CardContent>
            <div className={classes.paper}>
              <Typography component="h1" variant="h5">
                Survey
              </Typography>
              <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <FormControl
                  className={classes.choice}
                  fullWidth
                  component="fieldset"
                >
                  <FormLabel component="legend">
                    Do you use Trello or GitHub for either Issue tracking or
                    Project Road-mapping?
                  </FormLabel>
                  <RadioGroup
                    aria-label="issue-tracking-product-road-map"
                    name="question1"
                    value={question1}
                    onChange={(e) => setQuestion1(e.target.value)}
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
                {question1 === 'no' && (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="question2"
                    label="If not what do you use?"
                    name="question2"
                    autoComplete="question2"
                    error={formError.question2 && formError.question2.error}
                    helperText={
                      formError && formError.question2
                        ? formError.question2.message
                        : ''
                    }
                    className={classes.textField}
                    onBlur={(e) => handleBlur(e, 'required', question2)}
                    {...question2.bind}
                  />
                )}
                <FormControl
                  className={classes.choice}
                  fullWidth
                  component="fieldset"
                >
                  <FormLabel component="legend">
                    If you are a developer or development agency, do you have a
                    tool or system in place for updating your customers on
                    progress?
                  </FormLabel>
                  <RadioGroup
                    aria-label="progress-update-to-customer"
                    name="question3"
                    value={question3}
                    onChange={(e) => setQuestion3(e.target.value)}
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
                <FormControl
                  className={classes.choice}
                  fullWidth
                  component="fieldset"
                >
                  <FormLabel component="legend">
                    Have your customers asked for more communication about
                    status, and when they can see a particular feature or fix?
                  </FormLabel>
                  <RadioGroup
                    aria-label="more-comm-status-feature-fix"
                    name="question4"
                    value={question4}
                    onChange={(e) => setQuestion4(e.target.value)}
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
                <FormControl
                  className={classes.choice}
                  fullWidth
                  component="fieldset"
                >
                  <FormLabel component="legend">
                    Do you ask your customers to track bugs, tickets or issues
                    in a developer tracking tool or do you send them separate
                    updates?
                  </FormLabel>
                  <RadioGroup
                    aria-label="customer-dev-tracking-tool"
                    name="question5"
                    value={question5}
                    onChange={(e) => setQuestion5(e.target.value)}
                  >
                    <FormControlLabel
                      value="developer tracking tool"
                      label="Developer Tracking Tool"
                      control={<Radio color="primary" />}
                    />
                    <FormControlLabel
                      value="separate updates"
                      label="Separate Updates"
                      control={<Radio color="primary" />}
                    />
                  </RadioGroup>
                </FormControl>
                {question5 === 'separate updates' && (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    select
                    required
                    fullWidth
                    id="question6"
                    label="If you do send them a separate update is this a manual or automatic process?"
                    error={formError.question6 && formError.question6.error}
                    helperText={
                      formError && formError.question6
                        ? formError.question6.message
                        : ''
                    }
                    className={classes.textField}
                    onBlur={(e) => handleBlur(e, 'required', question6, 'question6')}
                    {...question6.bind}
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="manual">Manual</MenuItem>
                    <MenuItem value="automatic">Automatic</MenuItem>
                  </TextField>
                )}
                <FormControl
                  className={classes.choice}
                  fullWidth
                  component="fieldset"
                >
                  <FormLabel component="legend">
                    Do you do acceptance testing with your customers or clients?
                  </FormLabel>
                  <RadioGroup
                    aria-label="customer-client-acceptance-testing"
                    name="question7"
                    value={question7}
                    onChange={(e) => setQuestion7(e.target.value)}
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
                <FormControl
                  className={classes.choice}
                  fullWidth
                  component="fieldset"
                >
                  <FormLabel component="legend">
                    Do you share release notes and version updates to major
                    components of your software with customers?
                  </FormLabel>
                  <RadioGroup
                    aria-label="customer-share-release-notes-versions"
                    name="question8"
                    value={question8}
                    onChange={(e) => setQuestion8(e.target.value)}
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
                <FormControl
                  className={classes.choice}
                  fullWidth
                  component="fieldset"
                >
                  <FormLabel component="legend">
                    Are the majority of your customers enterprise level
                    companies, startups or small business?
                  </FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          id="enterprise"
                          name="enterprise"
                          color="primary"
                          onChange={(e) => handleMultipleChoice(e, 'question9')}
                        />
                      )}
                      label="Enterprise Level Companies"
                    />
                    <FormControlLabel
                      control={(
                        <Checkbox
                          id="small"
                          name="small"
                          color="primary"
                          onChange={(e) => handleMultipleChoice(e, 'question9')}
                        />
                      )}
                      label="Small Business"
                    />
                    <FormControlLabel
                      control={(
                        <Checkbox
                          id="startup"
                          name="startup"
                          color="primary"
                          onChange={(e) => handleMultipleChoice(e, 'question9')}
                        />
                      )}
                      label="Startups"
                    />
                  </FormGroup>
                </FormControl>
                <FormControl
                  className={classes.choice}
                  fullWidth
                  component="fieldset"
                >
                  <FormLabel component="legend">
                    Do you use microservice architectures, Monolith deployments,
                    separate Front End and Back Ends or All of the Above?
                  </FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          id="microservice"
                          name="microservice"
                          color="primary"
                          onChange={(e) => handleMultipleChoice(e, 'question10')}
                        />
                      )}
                      label="Microservice Architecture"
                    />
                    <FormControlLabel
                      control={(
                        <Checkbox
                          id="monolith"
                          name="monolith"
                          color="primary"
                          onChange={(e) => handleMultipleChoice(e, 'question10')}
                        />
                      )}
                      label="Monolith Deployments"
                    />
                    <FormControlLabel
                      control={(
                        <Checkbox
                          id="separate"
                          name="separate"
                          color="primary"
                          onChange={(e) => handleMultipleChoice(e, 'question10')}
                        />
                      )}
                      label="Separate FrontEnd and BackEnd(s)"
                    />
                    <FormControlLabel
                      control={(
                        <Checkbox
                          id="all"
                          name="all"
                          color="primary"
                          onChange={(e) => handleMultipleChoice(e, 'question10')}
                        />
                      )}
                      label="All of the above"
                    />
                  </FormGroup>
                </FormControl>
                <FormControl
                  className={classes.choice}
                  fullWidth
                  component="fieldset"
                >
                  <FormLabel component="legend">
                    Would you be interested in a release management tool that
                    could facilitate communication with your customers or your
                    development team without adding a new tool?
                  </FormLabel>
                  <RadioGroup
                    aria-label="interested"
                    name="question11"
                    value={question11}
                    onChange={(e) => setQuestion11(e.target.value)}
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
                <FormControl
                  className={classes.choice}
                  fullWidth
                  component="fieldset"
                >
                  <FormLabel component="legend">
                    Would you be interested in a 3 month free trial of a tool
                    that can generate Release Notes, Send updates to development
                    and product teams at each stage of your development workflow
                    and let you keep using the tools you are using?
                  </FormLabel>
                  <RadioGroup
                    aria-label="3-month-free-trial"
                    name="question12"
                    value={question12}
                    onChange={(e) => setQuestion12(e.target.value)}
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
                <FormControl
                  className={classes.choice}
                  fullWidth
                  component="fieldset"
                >
                  <FormLabel component="legend">
                    If not what feature would you be most interested in Auto
                    Generated Release Notes, Status updates via push/email
                    notification to team members or Version Dependency
                    Management?
                  </FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          id="autoGenerated"
                          name="autoGenerated"
                          color="primary"
                          onChange={(e) => handleMultipleChoice(e, 'question13')}
                        />
                      )}
                      label="Auto Generated Release Notes"
                    />
                    <FormControlLabel
                      control={(
                        <Checkbox
                          id="pushEmail"
                          name="pushEmail"
                          color="primary"
                          onChange={(e) => handleMultipleChoice(e, 'question13')}
                        />
                      )}
                      label="Status updates via push/email notification to team members"
                    />
                    <FormControlLabel
                      control={(
                        <Checkbox
                          id="versionDependency"
                          name="versionDependency"
                          color="primary"
                          onChange={(e) => handleMultipleChoice(e, 'question13')}
                        />
                      )}
                      label="Version Dependency Management"
                    />
                  </FormGroup>
                </FormControl>
                <div className={classes.loadingWrapper}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    disabled={loading || submitDisabled()}
                  >
                    Submit
                  </Button>
                  {loading && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default DeveloperForm;
