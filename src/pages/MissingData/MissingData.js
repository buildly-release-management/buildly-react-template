import React, { useState } from 'react';
import _ from 'lodash';
import makeStyles from '@mui/styles/makeStyles';
import {
  Backdrop,
  Grid,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
} from '@mui/material';
import { getUser } from '@context/User.context';
import Autocomplete from '@mui/material/Autocomplete';
import FormModal from '@components/Modal/FormModal';
import { useInput } from '@hooks/useInput';
import useAlert from '@hooks/useAlert';
import { routes } from '@routes/routesConstants';
import { validators } from '@utils/validators';
import Loader from '@components/Loader/Loader';
import { useQuery } from 'react-query';
import { getOrganizationNameQuery } from '@react-query/queries/authUser/getOrganizationNameQuery';
import { useAddOrgSocialUserMutation } from '@react-query/mutations/authUser/addOrgSocialUserMutation';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
  radio: {
    marginBottom: '0.75rem',
  },
  textField: {
    minHeight: '5rem',
    margin: '0.25rem 0',
  },
  submit: {
    marginBottom: theme.spacing(2),
  },
  hidden: {
    display: 'none',
  },
}));

const MissingData = ({ history }) => {
  const classes = useStyles();
  const user = getUser();

  const userType = useInput('', { required: true });
  const email = useInput('', { required: true });
  const [radioValue, setRadioValue] = useState(null);
  const [orgName, setOrgName] = useState('');
  const [formError, setFormError] = useState({});

  const { displayAlert } = useAlert();

  const { data: orgNamesData, isLoading: isOrgNamesLoading } = useQuery(
    ['orgNames'],
    () => getOrganizationNameQuery(),
    { refetchOnWindowFocus: false },
  );

  const { mutate: addOrgSocialUserMutation, isLoading: isAddOrgSocialUserLoading } = useAddOrgSocialUserMutation(history, _.includes(orgNamesData, orgName), routes.LOGIN, routes.PRODUCT_PORTFOLIO, displayAlert);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updateForm = {
      id: !!user && user.id,
      organization_name: orgName,
      user_type: userType.value,
    };
    if (email.value) {
      updateForm.email = email.value;
    }
    addOrgSocialUserMutation(updateForm);
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
      (!!user && !user.email && !email.value)
      || !userType.value
      || !radioValue
      || (radioValue === 'no' && !orgName)
    ) return true;
    errorKeys.forEach((key) => {
      if (formError[key].error) errorExists = true;
    });
    return errorExists;
  };

  const handleRadio = (event) => {
    if (event.target.value !== 'no') {
      setOrgName('default organization');
    } else {
      setOrgName('');
    }
    setRadioValue(event.target.value);
  };

  return (
    <div>
      {isOrgNamesLoading && <Loader open={isOrgNamesLoading} />}
      <Backdrop className={classes.backdrop} open>
        <FormModal
          open
          title="Missing Info"
          titleClass={classes.modalTitle}
          maxWidth="sm"
          wantConfirm={false}
        >
          <form
            noValidate
            onSubmit={handleSubmit}
          >
            <Grid container>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="userType"
                  label="User Type"
                  name="userType"
                  autoComplete="userType"
                  error={formError.userType && formError.userType.error}
                  helperText={formError.userType ? formError.userType.message : ''}
                  className={classes.textField}
                  onBlur={(e) => handleBlur(e, 'required', userType)}
                  {...userType.bind}
                >
                  <MenuItem value="">----------</MenuItem>
                  <MenuItem value="Developer">Developer</MenuItem>
                  <MenuItem value="Product Team">Product Team</MenuItem>
                </TextField>
              </Grid>
              {user && !user.email && (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    error={formError.email && formError.email.error}
                    helperText={formError.email ? formError.email.message : ''}
                    className={classes.textField}
                    onBlur={(e) => handleBlur(e, 'email', email)}
                    {...email.bind}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControl component="fieldset" className={classes.radio}>
                  <FormLabel component="legend">
                    Should you be added to the Default Organization?
                  </FormLabel>
                  <RadioGroup
                    aria-label="use-default-org"
                    name="use-default-org"
                    value={radioValue}
                    onChange={handleRadio}
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {radioValue === 'no' && (
                <Grid item xs={12}>
                  <Autocomplete
                    freeSolo
                    disableClearable
                    id="organization_name"
                    name="organization_name"
                    options={orgNamesData || []}
                    getOptionLabel={(label) => _.capitalize(label)}
                    value={orgName}
                    onChange={(e, newValue) => setOrgName(newValue || '')}
                    inputValue={orgName}
                    onInputChange={(event, newInputValue) => setOrgName(newInputValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Organization Name"
                        className={classes.textField}
                      />
                    )}
                  />
                </Grid>
              )}
            </Grid>
            <Grid container justifyContent="center">
              <Grid item>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={isOrgNamesLoading || submitDisabled()}
                >
                  Update
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      </Backdrop>
    </div>
  );
};

export default MissingData;
