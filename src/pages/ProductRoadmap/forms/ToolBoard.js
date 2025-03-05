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
import { getAllStatusQuery } from '@react-query/queries/release/getAllStatusQuery';
import { STATUSTYPES } from '../ProductRoadmapConstants';
import './RoadmapForms.css';

const ToolBoard = ({ history, location }) => {
  const user = getUser();
  const organization = user.organization.organization_uuid;
  const { displayAlert } = useAlert();

  const redirectTo = location.state && location.state.from;
  const product_uuid = location.state && location.state.product_uuid;

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
  const { data: statuses, isLoading: isAllStatusLoading } = useQuery(
    ['allStatuses', product_uuid],
    () => getAllStatusQuery(product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(product_uuid) && !_.isEqual(_.toNumber(product_uuid), 0) },
  );

  const { mutate: createBoardMutation, isLoading: isCreatingBoardLoading } = useCreateBoardMutation(organization, product_uuid, history, redirectTo, displayAlert);

  useEffect(() => {
    if (!_.isEmpty(boards)) {
      setIssueOrgList(boards.issue_tool_detail);
      setFeatOrgList(boards.feature_tool_detail);
    }
  }, [boards]);

  useEffect(() => {
    const filteredStatus = _.filter(statuses, { product_uuid });
    const statusDefault = _.find(filteredStatus, (s) => s.is_default_status);
    const initialStatuses = _.map(filteredStatus, 'name');
    setStatus(initialStatuses);

    // Initialize the ordered lanes/statuses
    const lanesCopy = JSON.parse(JSON.stringify(filteredStatus));
    setOrderedLanes(lanesCopy.sort((a, b) => (a.order_id > b.order_id ? 1 : -1)));
    setDefaultStatus((!!statusDefault && statusDefault.name) || '');
  }, [statuses]);

  const closeFormModal = () => {
    const dataHasChanged = featOrgID || featBoardID || issueOrgID
      || !_.isEmpty(status) || !_.isEmpty(featStatusList) || defaultStatus;

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

  // Handle statuses list
  const onStatusChange = (value) => {
    switch (true) {
      case (value.length > status.length):
        setOrderedLanes([...orderedLanes, { name: _.last(value) }]);
        setStatus([...status, _.last(value)]);
        break;

      case (value.length < status.length):
        setOrderedLanes(orderedLanes.filter((lane) => value.includes(lane.name)));
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
    const statusCols = !_.isEmpty(status)
      ? _.map(status, (sts) => ({ column_name: sts }))
      : featStatusList;
    const newStatusData = _.map(statusCols, (sts) => ({
      product_uuid,
      name: sts.column_name,
      description: sts.column_name,
      status_tracking_id: sts.column_id || null,
      is_default_status: !!(sts.column_name === defaultStatus),
    }));

    console.log(formData, newStatusData);
    // createBoardMutation({ formData, newStatusData });
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
          {(isBoardLoading || isCreatingBoardLoading) && <Loader open={isBoardLoading || isCreatingBoardLoading} />}
          <form className="tooloBoardForm" noValidate onSubmit={handleSubmit}>
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
                            {orderedLanes.map((lane, index) => (
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
                                    className="tooloBoardLaneChip"
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
                  className="tooloBoardSubmit"
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
                  className="tooloBoardSubmit"
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
