import React, { useContext, useState } from 'react';
import { useQuery } from 'react-query';
import _ from 'lodash';
import {
  useTheme,
  useMediaQuery,
  Grid,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import FormModal from '@components/Modal/FormModal';
import Loader from '@components/Loader/Loader';
import { UserContext } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import { useCreateBugMutation } from '@react-query/mutations/collabhub/createBugMutation';
import { getAllPunchListQuery } from '@react-query/queries/collabhub/getAllPunchListQuery';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery';
import { getAllReleaseQuery } from '@react-query/queries/release/getAllReleaseQuery';
import { routes } from '@routes/routesConstants';
import { useStore } from '@zustand/product/productStore';
import './AddPunchlistBug.css';

const AddBug = ({ location, history }) => {
  const redirectTo = location.state && location.state.from;
  const { release_uuid } = location && location.state;

  const user = useContext(UserContext);
  const organization = user.organization.organization_uuid;
  const { displayAlert } = useAlert();
  const { activeProduct } = useStore();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);

  const [formError, setFormError] = useState({});

  // form fields definition
  const severity = useInput('', { required: true });
  const title = useInput('', { required: true });
  const description = useInput('', { required: true });
  const punchlist = useInput('', { required: true });

  // react query
  const { data: productData, isLoading: isAllProductLoading } = useQuery(
    ['allProducts', organization],
    () => getAllProductQuery(organization, displayAlert),
    { refetchOnWindowFocus: false },
  );
  const { data: releases, isLoading: isAllReleaseLoading } = useQuery(
    ['allReleases', activeProduct],
    () => getAllReleaseQuery(activeProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(activeProduct) && !_.isEqual(_.toNumber(activeProduct), 0) },
  );
  const { data: allPunchlists, isLoading: isAllPunchlistLoading } = useQuery(
    ['allPunchlists'],
    () => getAllPunchListQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { mutate: createBugMutation, isLoading: isCreatingBugLoading } = useCreateBugMutation(release_uuid, history, redirectTo, displayAlert);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = {
      url: `${window.env.HOSTNAME}/${routes.RELEASE}/${release_uuid}`,
      severity: severity.value,
      title: title.value,
      app_name: _.find(productData, { product_uuid: activeProduct })?.name || '',
      version: _.find(releases, { release_uuid })?.name || '',
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      description: description.value,
      is_user_submitted: true,
      punchlist: punchlist.value,
    };

    createBugMutation(formData);
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
      !title.value
      || !description.value
      || !severity.value
      || !punchlist.value
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
      title.hasChanged()
      || description.hasChanged()
      || severity.hasChanged()
      || punchlist.hasChanged()
    );

    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      history.push(redirectTo, { tab: '5' });
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
          handleConfirmModal={(e) => history.push(redirectTo, { tab: '5' })}
        >
          {(isCreatingBugLoading || isAllProductLoading || isAllReleaseLoading) && <Loader open={isCreatingBugLoading || isAllProductLoading || isAllReleaseLoading} />}
          <form className="apbForm" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop ? 2 : 0}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="bug-title"
                  label="Title"
                  name="bug-title"
                  autoComplete="bug-title"
                  error={
                    formError.title
                    && formError.title.error
                  }
                  helperText={
                    formError.title
                      ? formError.title.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, 'duplicate', title)}
                  {...title.bind}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  multiline
                  required
                  fullWidth
                  id="bug-description"
                  label="Description"
                  name="bug-description"
                  autoComplete="bug-description"
                  error={
                    formError.description
                    && formError.description.error
                  }
                  helperText={
                    formError.description
                      ? formError.description.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, 'duplicate', description)}
                  {...description.bind}
                />
              </Grid>

              {/* Severity */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="bug-severity"
                  label="Severity"
                  name="bug-severity"
                  autoComplete="bug-severity"
                  error={
                    formError.severity
                    && formError.severity.error
                  }
                  helperText={
                    formError.severity
                      ? formError.severity.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, 'duplicate', severity)}
                  {...severity.bind}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </TextField>
              </Grid>

              {/* Punchlist */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="bug-punchlist"
                  label="Punchlist"
                  name="bug-punchlist"
                  autoComplete="bug-punchlist"
                  error={
                    formError.punchlist
                    && formError.punchlist.error
                  }
                  helperText={
                    formError.punchlist
                      ? formError.punchlist.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, 'duplicate', punchlist)}
                  {...punchlist.bind}
                >
                  <MenuItem value="">Select</MenuItem>
                  {_.map(allPunchlists, (pl) => (
                    <MenuItem key={`${pl.id}-${pl.title}`} value={pl.id}>
                      {pl.title}
                    </MenuItem>
                  ))}
                </TextField>
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
                  disabled={isCreatingBugLoading || isAllProductLoading || isAllReleaseLoading || submitDisabled()}
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
