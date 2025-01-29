import React, { useState } from 'react';
import _ from 'lodash';
import {
  useTheme,
  useMediaQuery,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import FormModal from '@components/Modal/FormModal';
import Loader from '@components/Loader/Loader';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import { useCreateBugMutation } from '@react-query/mutations/collabhub/createBugMutation';
import './AddPunchlistBug.css';

const AddBug = ({ location, history }) => {
  const redirectTo = location.state && location.state.from;
  const { release_uuid } = location && location.state;

  const { displayAlert } = useAlert();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);

  const [formError, setFormError] = useState({});

  // form fields definition
  const name = useInput('', { required: true });

  // react query
  const { mutate: createBugMutation, isLoading: isCreatingBugLoading } = useCreateBugMutation(release_uuid, history, redirectTo, displayAlert);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Submit event');
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

    if (
      !name.value
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

  const handleClose = () => {
    const dataHasChanged = (
      name.hasChanged()
    );

    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      history.push(redirectTo);
    }
  };

  return (
    <>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={handleClose}
          title="Add Punchlist"
          titleClass="apbFormTitle"
          maxWidth="md"
          wantConfirm
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={(e) => history.push(redirectTo)}
        >
          {(isCreatingBugLoading) && <Loader open={isCreatingBugLoading} />}
          <form className="apbForm" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop ? 2 : 0}>
              {/* Name */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Title"
                  name="name"
                  autoComplete="name"
                  error={
                    formError.name
                    && formError.name.error
                  }
                  helperText={
                    formError.name
                      ? formError.name.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, 'duplicate', name)}
                  {...name.bind}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} className="apbButtonContainer">
              <Grid item xs={12} sm={4}>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={handleClose}
                  className="apbSubmit"
                >
                  Cancel
                </Button>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  className="apbSubmit"
                  disabled={isCreatingBugLoading || submitDisabled()}
                >
                  Add Punchlist
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      )}
    </>
  );
};

export default AddBug;
