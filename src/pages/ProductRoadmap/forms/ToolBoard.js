import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import _ from 'lodash';
import {
  Autocomplete,
  Button,
  Chip,
  Grid,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import FormModal from '@components/Modal/FormModal';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getBoardQuery } from '@react-query/queries/product/getBoardQuery';
import { useCreateBoardMutation } from '@react-query/mutations/product/createBoardMutation.js';
import { useCreateStatusMutation } from '@react-query/mutations/release/createStatusMutation';
import { useDeleteStatusMutation } from '@react-query/mutations/release/deleteStatusMutation';
import { useUpdateStatusMutation } from '@react-query/mutations/release/updateStatusMutation';
import { getAllStatusQuery } from '@react-query/queries/release/getAllStatusQuery';
import { STATUSTYPES } from '../ProductRoadmapConstants';
import './RoadmapForms.css';

const ToolBoard = ({ history, location }) => {
  const user = getUser();
  const organization = user.organization.organization_uuid;
  const { displayAlert } = useAlert();

  const redirectTo = location.state && location.state.from;
  const product_uuid = location.state && location.state.product_uuid;
  const editStatus = location.state && location.state.editStatus;
  const productData = location.state && location.state.productData;

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [openFormModal, setFormModal] = useState(true);
  const [openConfirmModal, setConfirmModal] = useState(false);
  const [featOrgList, setFeatOrgList] = useState([]);
  const [issueOrgList, setIssueOrgList] = useState([]);
  const [featOrgID, setFeatOrgID] = useState('');
  const [issueOrgID, setIssueOrgID] = useState('');
  const [featBoardList, setFeatBoardList] = useState([]);
  const [featBoardID, setFeatBoardID] = useState('');
  const [featStatusList, setFeatStatusList] = useState([]);
  const [status, setStatus] = useState([]);
  const [orderedLanes, setOrderedLanes] = useState([]);
  const [defaultStatus, setDefaultStatus] = useState('');

  const [formError, setFormError] = useState({});

  const { data: boards, isLoading: isBoardLoading } = useQuery(
    ['board', product_uuid],
    () => getBoardQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );
  const { data: statuses, isLoading: isAllStatusLoading, isFetching: isAllStatusFetching } = useQuery(
    ['allStatuses', product_uuid],
    () => getAllStatusQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );

  const { mutate: createBoardMutation, isLoading: isCreatingBoardLoading } = useCreateBoardMutation(organization, product_uuid, history, redirectTo, displayAlert);

  useEffect(() => {
    if (!_.isEmpty(boards)) {
      setIssueOrgList(boards.issue_tool_detail);
      setFeatOrgList(boards.feature_tool_detail);

      if (editStatus) {
        const featOrg = _.find(boards.feature_tool_detail, { org_id: productData?.feature_tool_detail?.org_id });
        const issueOrg = _.find(boards.issue_tool_detail, { org_id: productData?.issue_tool_detail?.org_id });

        setFeatOrgID(featOrg);
        setIssueOrgID(issueOrg);
        setFeatBoardList(featOrg.board_list);
        setFeatBoardID(_.find(featOrg.board_list, { board_id: productData?.feature_tool_detail?.board_detail?.board_id }));
      }
    }
  }, [boards]);

  useEffect(() => {
    const filteredStatus = _.filter(statuses, { product_uuid });
    const statusDefault = _.find(filteredStatus, (s) => s.is_default_status);
    const initialStatuses = _.map(filteredStatus, 'name');
    setStatus(initialStatuses);

    // Initialize the ordered lanes/statuses
    const lanesCopy = JSON.parse(JSON.stringify(filteredStatus));
    setOrderedLanes(_.sortBy(lanesCopy, ['order_id']));
    setDefaultStatus((!!statusDefault && statusDefault.name) || '');
  }, [statuses]);

  useEffect(() => {
    // Initialize the ordered lanes/statuses
    setOrderedLanes(_.map(featStatusList, (fsl) => ({ name: fsl.column_name })));
  }, [featStatusList]);

  const discardFormData = () => {
    setConfirmModal(false);
    setFormModal(false);
    if (location && location.state) {
      history.push(redirectTo);
    }
  };

  const { mutate: createStatusMutation, isLoading: isCreatingStatusLoading } = useCreateStatusMutation(history, redirectTo, product_uuid, discardFormData, displayAlert);
  const { mutate: updateStatusMutation, isLoading: isUpdatingStatusLoading } = useUpdateStatusMutation(history, redirectTo, product_uuid, discardFormData, displayAlert);
  const { mutate: deleteStatusMutation, isLoading: isDeletingStatusLoading } = useDeleteStatusMutation(history, redirectTo, product_uuid, discardFormData, displayAlert);

  const closeFormModal = () => {
    let dataHasChanged = false;
    if (!editStatus) {
      dataHasChanged = featOrgID || featBoardID || issueOrgID || !_.isEmpty(status) || !_.isEmpty(featStatusList) || defaultStatus;
    } else {
      dataHasChanged = (
        !_.isEqual(featOrgID.org_id, productData?.feature_tool_detail?.org_id)
        || !_.isEqual(featBoardID.board_id, productData?.feature_tool_detail?.board_detail?.board_id)
        || !_.isEqual(issueOrgID.org_id, productData?.issue_tool_detail?.org_id)
        || !_.isEqual(_.find(_.filter(statuses, { product_uuid }, (s) => s.is_default_status))?.name, defaultStatus)
      );
    }

    if (dataHasChanged) {
      setConfirmModal(true);
    } else {
      setFormModal(false);
      if (location && location.state) {
        history.push(redirectTo);
      }
    }
  };

  // Handle statuses list
  const onStatusChange = (value) => {
    switch (true) {
      case (value.length > status.length):
        setOrderedLanes([...orderedLanes, { name: _.last(value) }]);
        setStatus([...status, _.last(value)]);
        break;

      case (value.length < status.length):
        setOrderedLanes(_.filter(orderedLanes, (lane) => value.includes(lane.name)));
        setStatus(value);
        break;

      default:
        break;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    delete featOrgID.board_list;
    delete issueOrgID.board_list;

    const formData = {
      product_uuid,
      feature_tool_detail: {
        ...featOrgID,
        board_detail: {
          ...featBoardID,
        },
      },
      issue_tool_detail: {
        ...issueOrgID,
        board_detail: {},
      },
    };

    if (!editStatus) {
      const statusData = _.map(status, (col) => {
        const index = _.findIndex(orderedLanes, (lane) => lane.name === col);
        return {
          product_uuid,
          name: col,
          description: col,
          status_tracking_id: null,
          is_default_status: _.isEqual(col, defaultStatus),
          order_id: index,
        };
      });

      createBoardMutation(formData);

      if (!_.isEmpty(statusData)) {
        createStatusMutation(statusData);
      }
    } else {
      let createStatusData = [];
      let editStatusData = [];
      let deleteStatusData = [];

      // Existing status
      const filteredStatus = _.filter(statuses, { product_uuid });
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
        const index = _.findIndex(orderedLanes, (lane) => lane.name === st);
        if (_.includes(nameList, st)) {
          const existingStatus = _.find(filteredStatus, { name: st });
          if (!_.isEmpty(existingStatus)) {
            if (
              !_.isEqual(existingStatus.order_id, index)
              || (existingStatus.is_default_status && !_.isEqual(st, defaultStatus))
              || (!existingStatus.is_default_status && _.isEqual(st, defaultStatus))
            ) {
              editStatusData = [...editStatusData, { ...existingStatus, is_default_status: _.isEqual(st, defaultStatus), order_id: index }];
            }
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
              order_id: index,
            },
          ];
        }
      });

      if (
        !_.isEqual(featOrgID.org_id, productData?.feature_tool_detail?.org_id)
        || !_.isEqual(featBoardID.board_id, productData?.feature_tool_detail?.board_detail?.board_id)
        || !_.isEqual(issueOrgID.org_id, productData?.issue_tool_detail?.org_id)
      ) {
        createBoardMutation(formData);
      }

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
    if ((!_.isEmpty(featOrgList) && !featOrgID)
      || (!_.isEmpty(featBoardList) && !featBoardID)
      || (!_.isEmpty(issueOrgList) && !issueOrgID)
      || ((!_.isEmpty(status) || !_.isEmpty(featStatusList)) && !defaultStatus)
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

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(orderedLanes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedLanes(items);
  };

  const getItemStyle = (draggableStyle, isDragging) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: 16,
    marginBottom: '0 8px 0 0',

    // styles we need to apply on draggables
    ...draggableStyle,
  });
  const getListStyle = (isDraggingOver) => ({
    display: 'flex',
    padding: 8,
    width: '100%',
  });

  return (
    <>
      {openFormModal && (
        <FormModal
          open={openFormModal}
          handleClose={closeFormModal}
          title="Configure Project Board"
          titleClass="tooloBoardFormTitle"
          maxWidth="md"
          wantConfirm
          openConfirmModal={openConfirmModal}
          setConfirmModal={setConfirmModal}
          handleConfirmModal={discardFormData}
        >
          {(isBoardLoading || isCreatingBoardLoading || isAllStatusLoading || isAllStatusFetching
            || isCreatingStatusLoading || isDeletingStatusLoading || isUpdatingStatusLoading) && (
            <Loader
              open={
                isBoardLoading
                || isCreatingBoardLoading
                || isAllStatusLoading
                || isAllStatusFetching
                || isCreatingStatusLoading
                || isDeletingStatusLoading
                || isUpdatingStatusLoading
              }
            />
          )}
          <form className="toolBoardForm" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={isDesktop ? 2 : 0}>
              {!(isBoardLoading || isCreatingBoardLoading) && !_.isEmpty(featOrgList) && (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    select
                    id="featOrgID"
                    label="Feature Organization"
                    name="featOrgID"
                    autoComplete="featOrgID"
                    value={featOrgID}
                    onChange={(e) => {
                      const org = e.target.value;
                      setFeatOrgID(org);
                      setFeatBoardList(org.board_list);
                    }}
                    disabled={editStatus && featOrgID}
                  >
                    <MenuItem value="">---------------------------</MenuItem>
                    {_.map(featOrgList, (org) => (
                      <MenuItem key={`org-${org.org_id}-${org.org_name}`} value={org}>
                        {org.org_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {!(isBoardLoading || isCreatingBoardLoading) && !_.isEmpty(featBoardList) && (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    select
                    id="boardID"
                    label="Feature Tool Board"
                    name="boardID"
                    value={featBoardID}
                    autoComplete="boardID"
                    onChange={(e) => {
                      const board = e.target.value;
                      setFeatBoardID(board);
                      setFeatStatusList(board.column_list);
                    }}
                    disabled={editStatus && featBoardID}
                  >
                    <MenuItem value="">---------------------------</MenuItem>
                    {_.map(featBoardList, (board) => (
                      <MenuItem key={`board-${board.board_id}-${board.board_name}`} value={board}>
                        {board.board_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {!(isBoardLoading || isCreatingBoardLoading) && _.isEmpty(featOrgList) && (
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
              )}

              {(!_.isEmpty(status) || !_.isEmpty(featStatusList)) && (
                <>
                  {/* Status order */}
                  <Grid item xs={12}>
                    <Typography variant="caption" gutterBottom sx={{ display: 'block', marginBottom: 0 }}>Drag to re-order columns</Typography>
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="orderLanes" direction="horizontal">
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)} {...provided.droppableProps} className="toolBoardOrderLanesContainer">
                            {_.map(orderedLanes, (lane, index) => (
                              <Draggable
                                key={lane.name}
                                draggableId={lane.name.toString()}
                                index={index}
                              >
                                {/* eslint-disable-next-line no-shadow */}
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    style={getItemStyle(
                                      provided.draggableProps.style,
                                      snapshot.isDragging,
                                    )}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="toolBoardLaneChip"
                                  >
                                    <Chip label={lane.name} variant="outlined" />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Grid>

                  {/* Default Status */}
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
                      {!_.isEmpty(status) && _.map(status, (sts, idx) => (
                        <MenuItem key={`sts-${idx}`} value={sts}>
                          {sts}
                        </MenuItem>
                      ))}
                      {!_.isEmpty(featStatusList) && _.map(featStatusList, (sts) => (
                        <MenuItem key={sts.column_id} value={sts.column_name}>
                          {sts.column_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}

              {!(isBoardLoading || isCreatingBoardLoading) && !_.isEmpty(issueOrgList) && (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    select
                    id="issueOrgID"
                    label="Issue Organization"
                    name="issueOrgID"
                    autoComplete="issueOrgID"
                    value={issueOrgID}
                    onChange={(e) => {
                      const org = e.target.value;
                      setIssueOrgID(org);
                    }}
                    disabled={editStatus && issueOrgID}
                  >
                    <MenuItem value="">---------------------------</MenuItem>
                    {_.map(issueOrgList, (org) => (
                      <MenuItem key={`org-${org.org_id}-${org.org_name}`} value={org}>
                        {org.org_name}
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
                  className="toolBoardSubmit"
                  disabled={submitDisabled()}
                >
                  {editStatus ? 'Update Board' : 'Configure Board'}
                </Button>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={discardFormData}
                  className="toolBoardSubmit"
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

export default ToolBoard;
