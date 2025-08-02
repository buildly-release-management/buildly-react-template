/* eslint-disable no-shadow */
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import moment from 'moment-timezone';
import {
  DragDropContext,
  Draggable,
  Droppable,
} from 'react-beautiful-dnd';
import { makeStyles } from '@mui/styles';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  FormHelperText,
  ListItemIcon,
  Badge,
  Divider,
} from '@mui/material';
import {
  AddRounded as AddRoundedIcon,
  AddTask as AddTaskIcon,
  CallMerge as CallMergeIcon,
  Close as CloseIcon,
  Comment as CommentIcon,
  CallSplit as CallSplitIcon,
  DateRange as DateRangeIcon,
  MoreHoriz as MoreHorizIcon,
  Update as UpdateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Task as TaskIcon,
} from '@mui/icons-material';
import Loader from '@components/Loader/Loader';
import useAlert from '@hooks/useAlert';
import { getAllCredentialQuery } from '@react-query/queries/product/getAllCredentialQuery';
import { getAllStatusQuery } from '@react-query/queries/release/getAllStatusQuery';
import { getAllFeatureQuery } from '@react-query/queries/release/getAllFeatureQuery';
import { getAllIssueQuery } from '@react-query/queries/release/getAllIssueQuery';
import { getAllCommentQuery } from '@react-query/queries/release/getAllCommentQuery';
import { useUpdateFeatureIssueMutation } from '@react-query/mutations/release/updateFeatureIssueMutation';

const useStyles = makeStyles((theme) => ({
  noProduct: {
    marginTop: theme.spacing(12),
    textAlign: 'center',
  },
  container: {
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    paddingBottom: theme.spacing(4),
    columnGap: '16px',
    alignItems: 'stretch',
    height: '100%',
  },
  swimlane: {
    borderRadius: '6px',
    backgroundColor: theme.palette.contrast.text,
    display: 'flex',
    flexDirection: 'column',
    minWidth: '23.5%',
    boxShadow: '0 0 10px 5px #efefef',
    // height: '100%',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.contrast.text,
    borderBottom: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: '6px 6px 0px 0px',
  },
  title: {
    color: theme.palette.secondary.main,
    fontWeight: 500,
    padding: '16px',
  },
  addIcon: {
    color: theme.palette.secondary.main,
  },
  card: {
    margin: theme.spacing(1),
  },
  cardHeader: {
    padding: '8px',
  },
  chip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
  tag: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.neutral.text,
  },
  moment: {
    marginTop: theme.spacing(1),
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 0,
    marginLeft: theme.spacing(1),
  },
  bottomIcon: {
    marginLeft: theme.spacing(1),
    cursor: 'pointer',
  },
  columnBody: {
    // [theme.breakpoints.up('lg')]: {
    //   height: '63vh',
    // },
    // overflowY: 'auto',
    // minHeight: '24px',
  },
  addItems: {
    color: '#A8A8A8',
    padding: '16px',
    fontStyle: 'italic',
  },
}));

const Kanban = ({
  selectedProduct,
  addItem,
  editItem,
  deleteItem,
  commentItem,
  issueSuggestions,
  upgrade,
  suggestedFeatures,
  createSuggestedFeature,
  removeSuggestedFeature,
  showRelatedIssues,
  editBoard,
  generateAIFeatureSuggestion,
}) => {
  const classes = useStyles();
  const { displayAlert } = useAlert();

  const [columns, setColumns] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [addAnchorEl, setAddAnchorEl] = useState(null);
  const [currentColId, setCurrentColId] = useState(null);

  const { data: credentials, isLoading: isAllCredentialLoading } = useQuery(
    ['allCredentials', selectedProduct],
    () => getAllCredentialQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );
  const { data: statuses, isLoading: isAllStatusLoading } = useQuery(
    ['allStatuses', selectedProduct],
    () => getAllStatusQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );
  const { data: features, isLoading: isAllFeatureLoading } = useQuery(
    ['allFeatures', selectedProduct],
    () => getAllFeatureQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );
  const { data: issues, isLoading: isAllIssueLoading } = useQuery(
    ['allIssues', selectedProduct],
    () => getAllIssueQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );

  const { data: comments, isLoading: isAllCommentLoading } = useQuery(
    ['allComments', selectedProduct],
    () => getAllCommentQuery(selectedProduct, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(selectedProduct) && _.toNumber(selectedProduct) !== 0 },
  );

  const { mutate: updateFeatureIssueMutation, isLoading: isUpdatingFeatureIssue } = useUpdateFeatureIssueMutation(selectedProduct, displayAlert);

  const handleClick = (event, number) => {
    setAnchorEl(event.currentTarget);
    setCurrentNumber(number);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentNumber(null);
  };

  const handleAddClick = (event, id) => {
    setAddAnchorEl(event.currentTarget);
    setCurrentColId(id);
  };

  const handleAddClose = () => {
    setAddAnchorEl(null);
    setCurrentColId(null);
  };

  useEffect(() => {
    let cols = {};
    if (statuses && !_.isEmpty(statuses)) {
      statuses.sort((a, b) => (a.order_id > b.order_id ? 1 : -1));
      statuses.forEach((sts) => {
        const statusFeatures = features.filter((feature) => feature.status === sts.status_uuid).sort((a, b) => a.feature_detail.kanban_column_order - b.feature_detail.kanban_column_order);
        const featureUuids = statusFeatures.map((item) => item.feature_uuid);
        const statusIssues = _.filter(issues, { status: sts.status_uuid });

        const statusItems = [];
        statusFeatures.forEach((item, index) => {
          const feature = item;

          if (issues && issues.length) {
            const featureIssues = issues.filter((issue) => issue.feature === feature.feature_uuid).sort((a, b) => a.issue_detail.kanban_column_order - b.issue_detail.kanban_column_order);
            feature.issues = featureIssues;
            // if (featureIssues.length) {
            //   statusItems.push(...featureIssues);
            // }
          }

          statusItems.push(feature);
        });

        // const issuesNotInFeatures = statusIssues.filter((issue) => !featureUuids.includes(issue.feature));
        // statusItems.push(...issuesNotInFeatures);

        cols = {
          ...cols,
          [sts.status_uuid]: {
            name: sts.name,
            items: statusItems,
          },
        };

        if (sts.name === 'No Status' && !statusFeatures.length) {
          delete cols[sts.status_uuid];
        }
      });
      setColumns(cols);
    }
  }, [statuses, features, issues]);

  const onDragEnd = (result, columns) => {
    console.log('Kanban: onDragEnd called with result:', result);
    
    const featCred = _.find(credentials, { auth_detail: { tool_type: 'Feature' } });
    let finalUpdatedData = [];

    if (!result.destination) {
      console.log('Kanban: No destination, canceling drag');
      return;
    }
    
    const { source, destination } = result;
    console.log('Kanban: Moving from', source, 'to', destination);

    if (source.droppableId !== destination.droppableId) {
      console.log('Kanban: Cross-column drag detected');
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      console.log('Kanban: Removed item structure:', removed);
      console.log('Kanban: Item keys:', Object.keys(removed || {}));
      console.log('Kanban: Moved item:', removed?.feature_name || removed?.issue_name || removed?.name || 'Unknown item', 'from column', source.droppableId, 'to', destination.droppableId);

      // Update kanban_column_order for features in the source column
      let updatedSourceItems = [];
      if (sourceItems?.length) {
        updatedSourceItems = sourceItems.map((item, index) => {
          if (item?.feature_detail?.kanban_column_order !== index) {
            const updateFeatureData = {
              ...item,
              ...featCred?.auth_detail,
              feature_detail: {
                ...item.feature_detail,
                kanban_column_order: index,
              },
            };
            return updateFeatureData;
          }
          return item;
        });
      }

      // Update status of the card on drag and drop to other column
      removed.status = destination.droppableId;
      const currentStatData = _.find(statuses, { status_uuid: destination.droppableId });
      removed.column_id = currentStatData.status_tracking_id;

      // Update kanban_column_order for features in the destination column
      const updatedDestinationItems = _.map(destItems, (item, index) => {
        if (item?.feature_uuid === removed?.feature_uuid) {
          const draggedFeature = {
            ...removed,
            feature_detail: {
              ...removed.feature_detail,
              kanban_column_order: index,
            },
          };

          const featureIssues = [];
          if (removed?.issues?.length) {
            _.forEach(removed.issues, (issue) => {
              featureIssues.push({ ...issue, status: destination.droppableId });
            });
          }

          draggedFeature.issues = featureIssues;
          return draggedFeature;
        }

        if (item?.feature_detail?.kanban_column_order !== index) {
          const updatedFeatureData = {
            ...item,
            ...featCred?.auth_detail,
            feature_detail: {
              ...item.feature_detail,
              kanban_column_order: index,
            },
          };
          return updatedFeatureData;
        }
        return item;
      });

      // Add to list of features to be updated
      finalUpdatedData = [...finalUpdatedData, ...updatedSourceItems, ...updatedDestinationItems];

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: [...updatedSourceItems],
        },
        [destination.droppableId]: {
          ...destColumn,
          items: [...updatedDestinationItems],
        },
      });
    } else {
      console.log('Kanban: Same-column reorder detected');
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      console.log('Kanban: Removed item structure (same column):', removed);
      console.log('Kanban: Item keys (same column):', Object.keys(removed || {}));
      console.log('Kanban: Reordered item:', removed?.feature_name || removed?.issue_name || removed?.name || 'Unknown item', 'in column', source.droppableId);

      // Update kanban_column_order for features in the source column
      let updatedColumnItems = [];
      if (copiedItems?.length) {
        updatedColumnItems = copiedItems.map((item, index) => {
          if (item?.feature_detail?.kanban_column_order !== index) {
            const updateFeatureData = {
              ...item,
              ...featCred?.auth_detail,
              feature_detail: {
                ...item.feature_detail,
                kanban_column_order: index,
              },
            };
            return updateFeatureData;
          }
          return item;
        });
      }

      // Add to the list of features to be updated
      finalUpdatedData = [...finalUpdatedData, ...updatedColumnItems];

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: [...updatedColumnItems],
        },
      });
    }

    // Query to update the features with new kanban_column_order
    if (finalUpdatedData.length) {
      updateFeatureIssueMutation(finalUpdatedData);
    }
  };

  return (
    <>
      {(isAllCredentialLoading || isAllStatusLoading || isAllFeatureLoading || isAllIssueLoading || isAllCommentLoading || isUpdatingFeatureIssue) && (
        <Loader open={isAllCredentialLoading || isAllStatusLoading || isAllFeatureLoading || isAllIssueLoading || isAllCommentLoading || isUpdatingFeatureIssue} />
      )}
      {(_.isEmpty(selectedProduct) || _.toNumber(selectedProduct) === 0) && (
        <Typography className={classes.noProduct} component="div" variant="body1">
          No product selected yet. Please select a product to view related features and/or issues.
        </Typography>
      )}
      {!!selectedProduct && upgrade && (
        <FormHelperText error style={{ marginBottom: '16px' }}>
          Upgrade to be able to create more features
        </FormHelperText>
      )}

      {!!selectedProduct && _.toNumber(selectedProduct) !== 0 && (
        <DragDropContext
          onDragEnd={(result) => {
            onDragEnd(result, columns);
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            className="mb-2"
            onClick={editBoard}
          >
            <EditIcon />
            {' '}
            Edit board
          </Button>
          <Grid container rowGap={2} columnGap={4} className={classes.container}>
            {!!selectedProduct && (
              <Grid item xs={2.6} sm={2.75} lg={2.85} className={classes.swimlane}>
                <div>
                  <Typography className={classes.title} component="div" variant="body1">
                    Feature Suggestions
                  </Typography>
                </div>

                <div className={classes.columnBody}>
                  {suggestedFeatures && !_.isEmpty(suggestedFeatures) ? (
                    <>
                      {_.map(suggestedFeatures, (sug, idx) => (
                        <Card key={`suggestion-${sug.suggestion_uuid}`} className={classes.card} variant="outlined">
                          <CardHeader
                            subheader={sug.suggested_feature}
                            action={(
                              <div>
                                <IconButton
                                  aria-label="product-suggestion-add"
                                  aria-haspopup="false"
                                  color="secondary"
                                  onClick={(e) => createSuggestedFeature(sug)}
                                  size="large"
                                  className={classes.iconButton}
                                >
                                  <AddTaskIcon fontSize="small" />
                                </IconButton>

                                <IconButton
                                  aria-label="product-suggestion-remove"
                                  aria-haspopup="false"
                                  color="secondary"
                                  onClick={(e) => removeSuggestedFeature(sug)}
                                  size="large"
                                  className={classes.iconButton}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </div>
                            )}
                          />
                        </Card>
                      ))}
                      {/* Add button for generating more suggestions */}
                      <Card className={classes.card} variant="outlined" style={{ marginTop: '8px' }}>
                        <CardContent style={{ textAlign: 'center', padding: '12px' }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={generateAIFeatureSuggestion}
                            startIcon={<TaskIcon />}
                          >
                            Generate Another
                          </Button>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card className={classes.card} variant="outlined">
                      <CardContent style={{ textAlign: 'center', padding: '16px' }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          No feature suggestions available
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={generateAIFeatureSuggestion}
                          startIcon={<TaskIcon />}
                          style={{ marginTop: '8px' }}
                        >
                          Generate AI Suggestion
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </Grid>
            )}

            {_.map(Object.entries(columns), ([columnId, column], index) => (
              <Grid key={columnId} item xs={2.6} sm={2.75} lg={2.85} className={classes.swimlane}>
                <div>
                  <div className={classes.titleContainer}>
                    <Typography className={classes.title} component="div" variant="body1">
                      {column.name}
                    </Typography>
                    <IconButton onClick={(e) => handleAddClick(e, columnId)} size="medium" variant="outlined">
                      <AddRoundedIcon fontSize="small" className={classes.addIcon} />
                    </IconButton>
                  </div>
                  <Menu
                    id="add-menu"
                    MenuListProps={{
                      'aria-labelledby': 'add-button',
                    }}
                    anchorEl={addAnchorEl}
                    open={currentColId === columnId}
                    PaperProps={{
                      style: {
                        maxHeight: 48 * 4.5,
                        marginLeft: 16,
                      },
                    }}
                    onClick={handleAddClose}
                  >
                    <MenuItem onClick={() => addItem('feat')}>
                      Add Feature
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => addItem('issue')}>
                      Add Issue
                    </MenuItem>
                  </Menu>
                </div>

                <div className={classes.columnBody}>
                  <Droppable droppableId={columnId} key={columnId}>
                    {(provided, snapshot) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {column.items.length > 0 ? (
                          <>
                            {' '}
                            {_.map(column.items, (item, itemIndex) => (
                              <Draggable
                                key={item?.feature_uuid}
                                draggableId={item?.feature_uuid}
                                index={itemIndex}
                              >
                                {(provided, snapshot) => (
                                  <>
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{ ...provided.draggableProps.style, cursor: 'grab' }}
                                    >
                                      <Card
                                        className={classes.card}
                                        variant="outlined"
                                        elevation={2}
                                        style={{
                                          // ...provided.draggableProps.style,
                                          userSelect: 'none',
                                          backgroundColor: item?.feature_detail?.is_imported ? '#e0e0e0' : '#efefef',
                                        }}
                                      >
                                        <CardHeader
                                          className={classes.cardHeader}
                                          subheader={item.name}
                                          subheaderTypographyProps={{
                                            fontSize: 14, fontWeight: 500,
                                          }}
                                          action={(
                                            <div>
                                              <IconButton
                                                id="menu-button"
                                                aria-label="column-options"
                                                aria-controls="menu-column"
                                                aria-haspopup="true"
                                                color="secondary"
                                                aria-expanded
                                                onClick={(e) => handleClick(e, item)}
                                              >
                                                <MoreHorizIcon />
                                              </IconButton>

                                              <Menu
                                                id="long-menu"
                                                MenuListProps={{
                                                  'aria-labelledby': 'long-button',
                                                }}
                                                anchorEl={anchorEl}
                                                open={currentNumber === item}
                                                PaperProps={{
                                                  style: {
                                                    maxHeight: 48 * 4.5,
                                                  // width: '20ch',
                                                  },
                                                }}
                                                onClick={handleClose}
                                              >
                                                <MenuItem
                                                  onClick={(e) => {
                                                    const type = item.issue_uuid ? 'issue' : 'feat';
                                                    editItem(item, type);
                                                  }}
                                                >
                                                  <ListItemIcon>
                                                    <EditIcon fontSize="small" />
                                                  </ListItemIcon>
                                                  Edit
                                                </MenuItem>

                                                {!item.issue_uuid && _.filter(issues, (issue) => (
                                                  issue.feature_uuid === item.feature_uuid
                                                )).length === 0
                                              && (
                                                <MenuItem onClick={(e) => issueSuggestions(item, 'show')}>
                                                  <ListItemIcon>
                                                    <TaskIcon fontSize="small" />
                                                  </ListItemIcon>
                                                  Convert to issue/ticket for dev team
                                                </MenuItem>
                                              )}

                                                <MenuItem
                                                  onClick={(e) => {
                                                    const type = item.issue_uuid ? 'issue' : 'feat';
                                                    deleteItem(item, type);
                                                  }}
                                                >
                                                  <ListItemIcon>
                                                    <DeleteIcon fontSize="small" />
                                                  </ListItemIcon>
                                                  Delete
                                                </MenuItem>
                                              </Menu>
                                            </div>
                                      )}
                                        />

                                        <CardContent style={{ paddingBottom: '8px' }} className={classes.cardHeader}>
                                          {_.map(item.tags, (tag) => (
                                            <Chip
                                              key={item.issue_uuid
                                                ? `tag-${item.issue_uuid}-${tag}`
                                                : `tag-${item.feature_uuid}-${tag}`}
                                              label={tag}
                                              variant="outlined"
                                              color="primary"
                                              className={classes.tag}
                                            />
                                          ))}

                                          {item.estimate && (
                                          <Chip
                                            variant="outlined"
                                            color="primary"
                                            className={classes.chip}
                                            icon={<UpdateIcon fontSize="small" />}
                                            label={`${item.estimate}:00 Hrs`}
                                          />
                                          )}

                                          {item.end_date && (
                                          <Chip
                                            variant="outlined"
                                            color="primary"
                                            className={classes.chip}
                                            icon={<DateRangeIcon fontSize="small" />}
                                            label={(item.end_date).slice(0, 10)}
                                          />
                                          )}

                                          {item.issue_uuid && _.map(
                                            _.filter(features, (feat) => (
                                              feat.feature_uuid === item.feature_uuid
                                            )),
                                            (feat, ind) => (
                                              <Chip
                                                key={ind}
                                                variant="outlined"
                                                color="primary"
                                                className={classes.chip}
                                                icon={<CallMergeIcon fontSize="small" />}
                                                label={feat.name}
                                                onClick={() => editItem(feat, 'feat', true)}
                                              />
                                            ),
                                          )}

                                          <Typography className={classes.moment} component="div" variant="body2">
                                            {moment(item.create_date).fromNow()}

                                            <div style={{ display: 'flex' }}>
                                              {!item.issue_uuid && (
                                              <CallSplitIcon
                                                className={classes.bottomIcon}
                                                fontSize="medium"
                                                onClick={(e) => showRelatedIssues(item.feature_uuid)}
                                              />
                                              )}

                                              <Badge
                                                badgeContent={_.size(_.filter(comments, (c) => (
                                                  item.issue_uuid
                                                    ? c.issue === item.issue_uuid
                                                    : c.feature === item.feature_uuid
                                                )))}
                                                anchorOrigin={{
                                                  vertical: 'top',
                                                  horizontal: 'right',
                                                }}
                                                color="info"
                                                overlap="circular"
                                                showZero
                                              >
                                                <CommentIcon
                                                  className={classes.bottomIcon}
                                                  onClick={(e) => commentItem(item)}
                                                  fontSize="medium"
                                                />
                                              </Badge>
                                            </div>
                                          </Typography>
                                        </CardContent>
                                      </Card>

                                      {item.issues && item.issues.map((issue, issueIndex) => (
                                        <Card
                                          key={issue.issue_uuid}
                                          className={classes.card}
                                          variant="outlined"
                                          style={{
                                            marginLeft: '24px',
                                            backgroundColor: issue.issue_detail?.is_imported ? '#e0e0e0' : '#efefef',
                                          }}
                                        >
                                          <CardHeader
                                            className={classes.cardHeader}
                                            subheader={issue.name}
                                            subheaderTypographyProps={{
                                              fontSize: 14, fontWeight: 500,
                                            }}
                                            action={(
                                              <div>
                                                <IconButton
                                                  id="menu-button"
                                                  aria-label="column-options"
                                                  aria-controls="menu-column"
                                                  aria-haspopup="true"
                                                  color="secondary"
                                                  aria-expanded
                                                  onClick={(e) => handleClick(e, issue)}
                                                >
                                                  <MoreHorizIcon />
                                                </IconButton>

                                                <Menu
                                                  id="long-menu"
                                                  MenuListProps={{
                                                    'aria-labelledby': 'long-button',
                                                  }}
                                                  anchorEl={anchorEl}
                                                  open={currentNumber === issue}
                                                  PaperProps={{
                                                    style: {
                                                      maxHeight: 48 * 4.5,
                                                    },
                                                  }}
                                                  onClick={handleClose}
                                                >
                                                  <MenuItem
                                                    onClick={(e) => {
                                                      editItem(issue, 'issue');
                                                    }}
                                                  >
                                                    <ListItemIcon>
                                                      <EditIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    Edit
                                                  </MenuItem>

                                                  <MenuItem
                                                    onClick={(e) => {
                                                      deleteItem(issue, 'issue');
                                                    }}
                                                  >
                                                    <ListItemIcon>
                                                      <DeleteIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    Delete
                                                  </MenuItem>
                                                </Menu>
                                              </div>
                                        )}
                                          />
                                          <CardContent style={{ paddingBottom: '8px' }} className={classes.cardHeader}>
                                            {issue.tags && issue.tags.map((tag) => (
                                              <Chip
                                                key={`tag-${issue.issue_uuid}-${tag}`}
                                                label={tag}
                                                variant="outlined"
                                                color="primary"
                                                className={classes.tag}
                                              />
                                            ))}

                                            {issue.estimate && (
                                            <Chip
                                              variant="outlined"
                                              color="primary"
                                              className={classes.chip}
                                              icon={<UpdateIcon fontSize="small" />}
                                              label={`${issue.estimate}:00 Hrs`}
                                            />
                                            )}

                                            {issue.end_date && (
                                            <Chip
                                              variant="outlined"
                                              color="primary"
                                              className={classes.chip}
                                              icon={<DateRangeIcon fontSize="small" />}
                                              label={(issue.end_date).slice(0, 10)}
                                            />
                                            )}

                                            <Typography className={classes.moment} component="div" variant="body2">
                                              {moment(issue.create_date).fromNow()}

                                              <div style={{ display: 'flex' }}>
                                                <Badge
                                                  badgeContent={_.size(_.filter(comments, (c) => c.issue === issue.issue_uuid))}
                                                  anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                  }}
                                                  color="info"
                                                  overlap="circular"
                                                  showZero
                                                >
                                                  <CommentIcon
                                                    className={classes.bottomIcon}
                                                    onClick={(e) => commentItem(issue)}
                                                    fontSize="medium"
                                                  />
                                                </Badge>
                                              </div>
                                            </Typography>
                                          </CardContent>
                                        </Card>
                                      ))}

                                    </div>

                                  </>

                                )}
                              </Draggable>
                            ))}
                          </>
                        )
                          : (
                            <>
                              <Typography component="div" align="center" className={classes.addItems}>
                                Add issues
                              </Typography>
                            </>
                          )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </Grid>
            ))}
          </Grid>
        </DragDropContext>
      )}
    </>

  );
};

export default Kanban;
