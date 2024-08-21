/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import makeStyles from '@mui/styles/makeStyles';
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
import useAlert from '@hooks/useAlert';
import { getAllStatusQuery } from '@react-query/queries/release/getAllStatusQuery';
import { useCreateStatusMutation } from '@react-query/mutations/release/createStatusMutation';
import { useUpdateStatusMutation } from '@react-query/mutations/release/updateStatusMutation';
import { useDeleteStatusMutation } from '@react-query/mutations/release/deleteStatusMutation';
import { STATUSTYPES } from '../ProductRoadmapConstants';

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
}));

const StatusBoard = ({ history, location }) => {
  const classes = useStyles();
  const editStatus = location.state && location.state.editStatus;
  const product_uuid = location.state && location.state.product_uuid;
  const redirectTo = location.state && location.state.from;

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const { displayAlert } = useAlert();

  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [status, setStatus] = useState([]);
  const [defaultStatus, setDefaultStatus] = useState('');
  const [formError, setFormError] = useState({});

  const { data: statuses, isLoading: isAllStatusLoading } = useQuery(
    ['allStatuses', product_uuid],
    () => getAllStatusQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );

  useEffect(() => {
    const filteredStatus = _.filter(statuses, { product_uuid });
    const statusDefault = _.find(filteredStatus, (s) => s.is_default_status);
    setStatus(_.map(filteredStatus, 'name'));
    setDefaultStatus((!!statusDefault && statusDefault.name) || '');
  }, [statuses]);

  const closeFormModal = () => {
    const filteredStatus = _.filter(statuses, { product_uuid });
    const statusDefault = _.find(filteredStatus, (s) => s.is_default_status);

    const dataHasChanged = (
      (editStatus && !_.isEqual(status, _.map(statuses, 'name')))
      || (editStatus && (
        (!statusDefault && !!defaultStatus)
        || (!!statusDefault && !_.isEqual(defaultStatus, statusDefault.name))
      ))
      || (!editStatus && !_.isEmpty(status))
    );

    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      if (location && location.state) {
        history.push(redirectTo);
      }
    }
  };

  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(redirectTo);
    }
  };

  const onStatusChange = (value) => {
    switch (true) {
      case (value.length > status.length):
        setStatus([...status, _.last(value)]);
        break;

      case (value.length < status.length):
        setStatus(value);
        break;

      default:
        break;
    }
  };

  const { mutate: createStatusMutation, isLoading: isCreatingStatusLoading } = useCreateStatusMutation(history, redirectTo, product_uuid, discardFormData, displayAlert);
  const { mutate: updateStatusMutation, isLoading: isUpdatingStatusLoading } = useUpdateStatusMutation(history, redirectTo, product_uuid, discardFormData, displayAlert);
  const { mutate: deleteStatusMutation, isLoading: isDeletingStatusLoading } = useDeleteStatusMutation(history, redirectTo, product_uuid, discardFormData, displayAlert);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!editStatus) {
      const statusData = _.map(status, (col) => ({
        product_uuid,
        name: col,
        description: col,
        status_tracking_id: null,
        is_default_status: _.isEqual(col, defaultStatus),
      }));

      createStatusMutation(statusData);
    } else {
      let createStatusData = [];
      let editStatusData = [];
      let deleteStatusData = [];

      // Existing status
      const filteredStatus = _.filter(statuses, { product_uuid });
      const statusDefault = _.find(filteredStatus, (s) => s.is_default_status);
      const nameList = _.map(filteredStatus, 'name');

      _.forEach(nameList, (name) => {
        if (!_.includes(status, name)) {
          const st = _.find(filteredStatus, { name });
          if (!_.isEmpty(st)) {
            deleteStatusData = [...deleteStatusData, st];
          }
        }
      });

      _.forEach(status, (st) => {
        if (_.includes(nameList, st)) {
          const existingStatus = _.find(filteredStatus, { name: st });
          if (!_.isEmpty(existingStatus)) {
            editStatusData = [...editStatusData, { ...existingStatus, is_default_status: _.isEqual(st, defaultStatus) }];
          }
        } else {
          createStatusData = [
            ...createStatusData,
            {
              product_uuid,
              name: st,
              description: st,
              status_tracking_id: null,
              is_default_status: _.isEqual(st, defaultStatus),
            },
          ];
        }
      });

      if (!_.isEmpty(deleteStatusData)) {
        deleteStatusMutation(deleteStatusData);
      }
      if (!_.isEmpty(editStatusData)) {
        updateStatusMutation(editStatusData);
      }
      if (!_.isEmpty(createStatusData)) {
        createStatusMutation(createStatusData);
      }
    }
  };

  const submitDisabled = () => {
    const errorKeys = Object.keys(formError);
    if (_.isEmpty(status) || !defaultStatus) {
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
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title="Configure Project Board"
          titleClass={classes.formTitle}
          maxWidth="md"
          wantConfirm
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {(isCreatingStatusLoading || isUpdatingStatusLoading || isDeletingStatusLoading || isAllStatusLoading)
          && <Loader open={isCreatingStatusLoading || isUpdatingStatusLoading || isDeletingStatusLoading || isAllStatusLoading} />}
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop ? 2 : 0}>
              <Grid item xs={12}>
                <Autocomplete
                  fullWidth
                  multiple
                  filterSelectedOptions
                  id="status"
                  options={STATUSTYPES}
                  freeSolo
                  value={status}
                  onChange={(e, newValue) => onStatusChange(newValue)}
                  renderTags={(value, getStatusProps) => (
                    _.map(value, (option, index) => (
                      <Chip
                        variant="default"
                        label={option}
                        {...getStatusProps({ index })}
                      />
                    ))
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Select the list of Columns"
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              {!_.isEmpty(status) && (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    select
                    id="defaultStatus"
                    label="Default Status to be used while creating cards/tasks"
                    name="defaultStatus"
                    value={defaultStatus}
                    autoComplete="defaultStatus"
                    onChange={(e) => setDefaultStatus(e.target.value)}
                  >
                    <MenuItem value="">--------------------</MenuItem>
                    {_.map(status, (sts, idx) => (
                      <MenuItem key={`sts-${idx}`} value={sts}>
                        {sts}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>
            <Grid container spacing={isDesktop ? 3 : 0} justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={submitDisabled()}
                >
                  Configure Board
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={discardFormData}
                  className={classes.submit}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormModal>
      )}
    </>
  );
};

export default StatusBoard;
