import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import {
  useTheme,
  useMediaQuery,
  Grid,
  TextField,
  Button,
  Autocomplete,
  Chip,
  MenuItem,
} from '@mui/material';
import FormModal from '@components/Modal/FormModal';
import Loader from '@components/Loader/Loader';
import { UserContext } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { useInput } from '@hooks/useInput';
import { validators } from '@utils/validators';
import { useCreatePunchlistMutation } from '@react-query/mutations/collabhub/createPunchlistMutation';
import { getAllCredentialQuery } from '@react-query/queries/product/getAllCredentialQuery';
import { getAllProductQuery } from '@react-query/queries/product/getAllProductQuery';
import { useStore } from '@zustand/product/productStore';
import './AddPunchlistBug.css';

const AddPunchlist = ({ location, history }) => {
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
  const title = useInput('', { required: true });
  const description = useInput('', { required: true });
  const complexity_estimate = useInput('', { required: true });

  const [tagList, setTagList] = useState([]);
  const [tags, setTags] = useState([]);

  const [repoList, setRepoList] = useState([]);
  const repo = useInput('', { required: true });

  // react query
  const { data: productData, isLoading: isAllProductLoading } = useQuery(
    ['allProducts', organization],
    () => getAllProductQuery(organization, displayAlert),
    { refetchOnWindowFocus: false },
  );
  const { data: credentialData, isLoading: isAllCredentialLoading } = useQuery(
    ['allCredentials', activeProduct],
    () => getAllCredentialQuery(activeProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(activeProduct) && !_.isEqual(_.toNumber(activeProduct), 0) },
  );

  const { mutate: createPunchlistMutation, isLoading: isCreatingPunchlistLoading } = useCreatePunchlistMutation(release_uuid, history, redirectTo, displayAlert);

  useEffect(() => {
    const prod = _.find(productData, { product_uuid: activeProduct });
    setRepoList(prod?.issue_tool_detail?.repository_list || []);
  }, [productData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const prod = _.find(productData, { product_uuid: activeProduct });
    const { org_name } = prod?.issue_tool_detail;
    const issueCred = _.find(credentialData, (cred) => (_.toLower(cred.auth_detail.tool_type) === 'issue'));

    const formData = {
      title: title.value,
      description: description.value,
      complexity_estimate: complexity_estimate.value,
      category: 'Punchlist',
      tags: _.toString(tags),
      repo_owner: '',
      repo: `${org_name}/${repo.value}`,
      repo_access_token: issueCred?.auth_detail?.access_token,
      labs_release_id: release_uuid,
    };

    createPunchlistMutation(formData);
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
      || !complexity_estimate.value
      || _.isEmpty(tags)
      || (!_.isEmpty(repoList) && !repo.value)
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
      || complexity_estimate.hasChanged()
      || !_.isEmpty(tags)
      || repo.hasChanged()
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
          {(isCreatingPunchlistLoading || isAllProductLoading || isAllCredentialLoading) && <Loader open={isCreatingPunchlistLoading || isAllProductLoading || isAllCredentialLoading} />}
          <form className="apbForm" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop ? 2 : 0}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="punchlist-title"
                  label="Title"
                  name="punchlist-title"
                  autoComplete="punchlist-title"
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
                  id="punchlist-description"
                  label="Description"
                  name="punchlist-description"
                  autoComplete="punchlist-description"
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

              {/* Complexity */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  select
                  id="punchlist-complexity-estimate"
                  label="Complexity Estimate"
                  name="punchlist-complexity-estimate"
                  autoComplete="punchlist-complexity-estimate"
                  error={
                    formError.complexity_estimate
                    && formError.complexity_estimate.error
                  }
                  helperText={
                    formError.complexity_estimate
                      ? formError.complexity_estimate.message
                      : ''
                  }
                  onBlur={(e) => handleBlur(e, 'duplicate', complexity_estimate)}
                  {...complexity_estimate.bind}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Extreme">Extreme</MenuItem>
                </TextField>
              </Grid>

              {/* Repository list */}
              {!_.isEmpty(repoList) && (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    select
                    id="punchlist-repo"
                    label="Repository"
                    name="punchlist-repo"
                    autoComplete="punchlistrepo"
                    value={repo.value}
                    onChange={(e) => {
                      const repository = e.target.value;
                      repo.setNewValue(repository);
                      const repoLabels = _.find(repoList, (item) => item.name === repository);
                      setTagList(repoLabels.labels || []);
                    }}
                  >
                    {_.map(repoList, (rep) => (
                      <MenuItem
                        key={`rep-${rep.id}-${rep.name}`}
                        value={rep.name}
                      >
                        {rep.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {/* Tags */}
              <Grid item xs={12}>
                <Autocomplete
                  fullWidth
                  multiple
                  filterSelectedOptions
                  id="punchlist-tags"
                  options={tagList}
                  value={tags}
                  onChange={(e, newValue) => setTags(newValue)}
                  renderTags={(value, getTagProps) => (
                    _.map(value, (option, index) => (
                      <Chip
                        variant="default"
                        label={option}
                        {...getTagProps({ index })}
                      />
                    ))
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Tags"
                      margin="normal"
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
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
                  disabled={isCreatingPunchlistLoading || isAllProductLoading || isAllCredentialLoading || submitDisabled()}
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

export default AddPunchlist;
