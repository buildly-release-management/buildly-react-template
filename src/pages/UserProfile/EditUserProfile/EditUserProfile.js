import React, { useState, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './EditUserProfile.css';
import { useInput } from '@hooks/useInput';
import useAlert from '@hooks/useAlert';
import {
  Avatar,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import { isMobile } from '@utils/mediaQuery';
import { validators } from '@utils/validators';
import { Person } from '@mui/icons-material';
import { UserContext } from '@context/User.context';
import { useUpdateUserMutation } from '@react-query/mutations/authUser/updateUserMutation';

const EditUserProfile = ({ history }) => {
  const user = useContext(UserContext);

  const { displayAlert } = useAlert();

  const [disableSubmitBtn, setBtnDisabled] = useState(true);
  const [formError, setFormError] = useState({});

  const first_name = useInput(user && user.first_name, { required: true });
  const last_name = useInput(user && user.last_name, { required: true });
  const userType = useInput(user && user.user_type, { required: true });
  
  // GitHub profile fields
  const [githubUsername, setGithubUsername] = useState(user && user.github_username || '');
  const [hasGithubProfile, setHasGithubProfile] = useState(user && user.has_github_profile || false);

  const { mutate: updateUserMutation, isLoading: isUpdateUserLoading } = useUpdateUserMutation(history, displayAlert);

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
    setBtnDisabled(toggleSubmitBtn());
  };

  const toggleSubmitBtn = () => {
    const errorKeys = Object.keys(formError);
    let errorExists = false;
    if (!first_name.value || !last_name.value || !userType.value) {
      return true;
    }
    if (first_name.hasChanged() || last_name.hasChanged() || userType.hasChanged() || 
        githubUsername !== (user && user.github_username || '') || 
        hasGithubProfile !== (user && user.has_github_profile || false)) {
      return false;
    }
    errorKeys.forEach((key) => {
      if (formError[key].error) {
        errorExists = true;
      }
    });
    return errorExists;
  };

  const saveUserProfile = (event) => {
    event.preventDefault();
    const profileValues = {
      id: user.id,
      first_name: first_name.value,
      last_name: last_name.value,
      user_type: userType.value,
      github_username: githubUsername,
      has_github_profile: hasGithubProfile,
    };
    updateUserMutation(profileValues);
    setBtnDisabled(true);
  };

  return (
    <>
      {isUpdateUserLoading && <Loader open={isUpdateUserLoading} />}
      <div className="row border rounded">
        <div className="col-4 m-auto">
          <div className="d-flex flex-column align-items-center">
            <Avatar sx={{ width: 96, height: 96 }}>
              <Person color="secondary" sx={{ fontSize: 72 }} />
            </Avatar>
            <Typography>{`${user.first_name} ${user.last_name}`}</Typography>
            <Typography>{`Organization: ${user.organization.name}`}</Typography>
            <Typography>{`Username: ${user.username}`}</Typography>
            <Typography>{`Email: ${user.email}`}</Typography>
          </div>
        </div>
        <div className="col-8 border-start">
          <form className="form" noValidate onSubmit={saveUserProfile}>
            <Grid container spacing={isMobile() ? 0 : 3}>
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="first_name"
                  label="First Name"
                  name="first_name"
                  autoComplete="first_name"
                  error={formError.first_name && formError.first_name.error}
                  helperText={
                    formError.first_name ? formError.first_name.message : ''
                  }
                  className="textField"
                  onKeyUp={(e) => handleBlur(e, 'required', first_name)}
                  {...first_name.bind}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="last_name"
                  label="Last Name"
                  name="last_name"
                  autoComplete="last_name"
                  error={formError.last_name && formError.last_name.error}
                  helperText={
                    formError.last_name ? formError.last_name.message : ''
                  }
                  className="textField"
                  onKeyUp={(e) => handleBlur(e, 'required', last_name)}
                  {...last_name.bind}
                />
              </Grid>
            </Grid>
            <Grid container spacing={isMobile() ? 0 : 3}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="userType"
                  name="userType"
                  label="User Type"
                  autoComplete="userType"
                  error={formError.userType && formError.userType.error}
                  helperText={
                    formError.userType ? formError.userType.message : ''
                  }
                  className="textField"
                  onBlur={(e) => handleBlur(e, 'required', userType)}
                  {...userType.bind}
                >
                  <MenuItem value="">----------</MenuItem>
                  <MenuItem value="Developer">Developer</MenuItem>
                  <MenuItem value="Product Team">Product Team</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* GitHub Profile Section */}
            <Grid container spacing={isMobile() ? 0 : 3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  🔗 GitHub Integration
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="githubUsername"
                  label="GitHub Username"
                  name="githubUsername"
                  placeholder="Enter your GitHub username"
                  value={githubUsername}
                  onChange={(e) => {
                    setGithubUsername(e.target.value);
                    setBtnDisabled(toggleSubmitBtn());
                  }}
                  helperText="Your GitHub username will be used for repository integrations and developer assignments"
                  className="textField"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  id="hasGithubProfile"
                  label="Has GitHub Profile"
                  value={hasGithubProfile}
                  onChange={(e) => {
                    setHasGithubProfile(e.target.value === 'true');
                    setBtnDisabled(toggleSubmitBtn());
                  }}
                  helperText="Indicates if you have an active GitHub profile"
                >
                  <MenuItem value={false}>No</MenuItem>
                  <MenuItem value={true}>Yes</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <div className="loadingWrapper">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="submit"
                disabled={isUpdateUserLoading || disableSubmitBtn}
              >
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditUserProfile;
