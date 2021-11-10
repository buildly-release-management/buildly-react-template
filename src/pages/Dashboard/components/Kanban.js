/* eslint-disable no-shadow */
/* eslint-disable import/no-unresolved */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import {
  AddRounded as AddRoundedIcon,
  EditRounded as EditRoundedIcon,
  DeleteRounded as DeleteRoundedIcon,
  TrendingFlatRounded as TrendingFlatRoundedIcon,
  MoreVert as MoreVertIcon,
  MoreHoriz as MoreHorizIcon,
} from '@material-ui/icons';
import {
  makeStyles,
  Card,
  CardContent,
  IconButton,
  CardHeader,
  Chip,
  Typography,
  TextField,
  MenuItem,
} from '@material-ui/core';
import { routes } from '@routes/routesConstants';
import { deleteRequirement, deleteIssue } from '@redux/dashboard/actions/dashboard.actions';
import _ from 'lodash';
import AddRequirements from '../forms/AddRequirements';
import AddIssues from '../forms/AddIssues';
import RequirementToIssue from '../forms/RequirementToIssue';
import ConfirmModal from '../forms/ConfirmModal';

const useStyles = makeStyles((theme) => ({
  section1: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: theme.palette.secondary.contrastText,
  },
  title: {
    margin: theme.spacing(2, 0),
  },
  product: {
    width: '30%',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.secondary.contrastText,
    },
    '& .MuiOutlinedInput-root:hover > .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgb(255, 255, 255, 0.23)',
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.secondary.contrastText,
    },
    '& .MuiSelect-icon': {
      color: theme.palette.secondary.contrastText,
    },
    '& .MuiInputBase-input': {
      color: theme.palette.secondary.contrastText,
    },
  },
  board: {
    display: 'flex',
    margin: '0 auto',
  },
  column: {
    margin: theme.spacing(0, 1),
    backgroundColor: theme.palette.neutral.main,
    borderRadius: theme.spacing(1),
  },
  columnHead: {
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-evenly',
    fontSize: '1.2rem',
    alignItems: 'center',
    backgroundColor: theme.palette.neutral.main,
    borderBottom: '1px solid #d8d8d8',
    '& > p': {
      flex: '1 1 auto',
      margin: 'auto',
    },
  },
  tasksList: {
    padding: theme.spacing(0, 0.5),
    height: '80vh',
    overflow: 'auto',
    minWidth: '300px',
  },
  icon: {
    margin: 'auto',
    cursor: 'pointer',
  },
  item: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    fontSize: '0.8em',
    cursor: 'pointer',
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'flex-wrap',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  priority: {
    width: '60%',
    padding: theme.spacing(0.5),
    backgroundColor: '#0000ff',
    borderRadius: theme.spacing(1),
    margin: theme.spacing(1, 0.2),
  },
  datetime: {
    float: 'right',
    fontSize: '0.7rem',
    padding: theme.spacing(1, 0),
  },
  card: {
    border: '1px solid #d8d8d8',
    margin: '0 0 8px 0',
    padding: theme.spacing(1),
    '& .MuiCardHeader-title': {
      fontSize: '1rem',
    },
    '& .MuiCardHeader-root': {
      padding: theme.spacing(0.5),
    },
    '& .MuiCardContent-root': {
      padding: theme.spacing(2, 1),
    },
    '& .MuiIconButton-root': {
      padding: theme.spacing(0.5),
    },
    '& .MuiChip-root': {
      marginRight: theme.spacing(0.2),
    },
  },
}));

const Kanban = (props) => {
  const {
    products, status, requirements, issues, redirectTo, history,
  } = props;
  const classes = useStyles();
  const [columns, setColumns] = useState({});
  const [proj, setProj] = useState(0);
  const [projReqs, setProjReqs] = useState([]);
  const [projIssues, setProjIssues] = useState([]);
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [toDeleteItem, setDeleteItem] = useState({ id: 0, type: 'req' });

  const addReqPath = redirectTo
    ? `${redirectTo}/dashboard`
    : `${routes.DASHBOARD}/add-requirement`;

  const editReqPath = redirectTo
    ? `${redirectTo}/dashboard`
    : `${routes.DASHBOARD}/edit-requirement`;

  const addIssuePath = redirectTo ? `${redirectTo}/dashboard` : `${routes.DASHBOARD}/add-issue`;

  const editIssuePath = redirectTo ? `${redirectTo}/dashboard` : `${routes.DASHBOARD}/edit-issue`;

  const requirementToIssuePath = redirectTo
    ? `${redirectTo}/dashboard`
    : `${routes.DASHBOARD}/convert-issue`;

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    }
  };

  useEffect(() => {
    if (status && status.length) {
      const columnsFromBackend = {};
      status.forEach((item) => {
        columnsFromBackend[item.value] = { name: item.name, items: [] };
      });
      setColumns(columnsFromBackend);
    }
  }, []);

  //   const updateReqs = (reqs) => {
  // 	let cols = columns;
  // 	setProjReqs(_.orderBy(reqs, ['id']));
  // 	status.forEach((item) => {
  // 		cols[item.value] = { name: item.name, items: [...projReqs, ...projIssues] };
  // 	  });
  // 	setColumns(cols);
  //   }

  useEffect(() => {
    const cols = columns;
    const reqs = _.filter(requirements, { productUUID: proj });
    const iss = _.filter(issues, { productUUID: proj });
    setProjReqs(_.orderBy(reqs, ['id']));
    setProjIssues(_.orderBy(iss, ['id']));
    status.forEach((item) => {
      const statusReqs = _.filter(reqs, { status: item.value });
      const statusIss = _.filter(iss, { status: item.value });
      cols[item.value] = { name: item.name, items: [...statusReqs, ...statusIss] };
    });
    setColumns(cols);
  }, [requirements, issues, proj]);

  const editItem = (item, type) => {
    let path;
    if (type === 'req') {
      path = `${editReqPath}/:${item.id}`;
    } else if (type === 'issue') {
      path = `${editIssuePath}/:${item.id}`;
    } else if (type === 'convert') {
      path = `${requirementToIssuePath}/:${item.id}`;
    }

    history.push(path, {
      type: 'edit',
      from: redirectTo || routes.DASHBOARD,
      data: item,
      productUUID: proj,
    });
  };

  const addItem = (type) => {
    let path;
    let nextId;
    if (type === 'req') {
      path = addReqPath;
      nextId = (_.max(_.map(projReqs, 'id')) || 0) + 1;
    } else if (type === 'issue') {
      path = addIssuePath;
      nextId = (_.max(_.map(projIssues, 'id')) || 0) + 1;
    } else if (type === 'convert') {
      path = requirementToIssuePath;
      nextId = (_.max(_.map(projIssues, 'id')) || 0) + 1;
    }

    history.push(path, {
      from: redirectTo || routes.DASHBOARD,
      productUUID: proj,
      nextId,
    });
  };

  const convertIssue = (item, type) => {
    let path;
    let nextId;
    if (type === 'convert') {
      path = requirementToIssuePath;
      nextId = (_.max(_.map(projIssues, 'id')) || 0) + 1;
    }

    history.push(path, {
      type: 'edit',
      from: redirectTo || routes.DASHBOARD,
      productUUID: proj,
      nextId,
      data: item,
    });
  };

  const deleteItem = (item, type) => {
    setDeleteItem({ id: item.id, type });
    setDeleteModal(true);
  };

  const handleDeleteModal = () => {
    const { type } = toDeleteItem;
    const { id } = toDeleteItem;
    setDeleteModal(false);
    if (type === 'req') {
      dispatch(deleteRequirement(id));
    } else if (type === 'issue') {
      dispatch(deleteIssue(id));
    }
  };

  return (
    <main>
      <div className={classes.section1}>
        <Typography className={classes.title} variant="h3">
          Dashboard
        </Typography>
        <TextField
          variant="outlined"
          margin="normal"
          select
          id="product"
          color="primary"
          label="Select Product"
          className={classes.product}
          value={proj}
          onChange={(e) => {
					  setProj(e.target.value);
					  setProjReqs(_.filter(requirements, { productUUID: e.target.value }));
					  setProjIssues(_.filter(issues, { productUUID: e.target.value }));
          }}
        >
          <MenuItem value={0}>Select</MenuItem>
          {products
						&& products.length > 0
						&& _.map(products, (proj) => (
  <MenuItem key={`product-${proj.id}`} value={proj.id}>
    {proj.name}
  </MenuItem>
						))}
        </TextField>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
        <DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns)}>
          {Object.entries(columns).map(([columnId, column], index) => (
            <div className={classes.column} key={columnId}>
              <div className={classes.columnHead}>
                <p>{column.name}</p>
                <IconButton>
                  <AddRoundedIcon
                    className={classes.icon}
                    fontSize="small"
                    onClick={(e) => addItem(index === 1 ? 'req' : 'issue')}
                  />
                </IconButton>
                <IconButton
                  aria-label="column-options"
                  aria-controls="menu-column"
                  aria-haspopup="false"
                  color="default"
                >
                  <MoreHorizIcon className={classes.icon} fontSize="small" />
                </IconButton>
              </div>
              <div style={{ margin: 8 }}>
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={classes.tasksList}
                      style={{
													  background: snapshot.isDraggingOver ? '#D8D8D8' : '#F6F8FA',
                      }}
                    >
                      {column.items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              className={classes.card}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
																			  userSelect: 'none',
																			  minHeight: '50px',
																			  backgroundColor: snapshot.isDragging
																			    ? '#F6F8FA'
																			    : '#FFFFFF',
																			  ...provided.draggableProps.style,
                              }}
                            >
                              <div className={classes.priority} />
                              <CardHeader
                                action={(
                                  <div>
                                    {!item.featureUUID && (
                                    <IconButton
                                      aria-label="convert-ticket"
                                      aria-controls="menu-card"
                                      aria-haspopup="false"
                                      color="default"
                                    >
                                      <TrendingFlatRoundedIcon
                                        className={classes.icon}
                                        fontSize="small"
                                      />
                                    </IconButton>
                                    )}
                                    <IconButton
                                      aria-label="card-options"
                                      aria-controls="menu-card"
                                      aria-haspopup="false"
                                      color="default"
                                    >
                                      <MoreVertIcon
                                        className={classes.icon}
                                        fontSize="small"
                                      />
                                    </IconButton>
                                  </div>
                   )}
                                title={item.name}
                              />
                              <CardContent>
                                <div className={classes.flexContainer}>
                                  <Chip label="testing" color="primary" size="small" />
                                  <Chip
                                    label="documentation"
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                  />
                                </div>
                                <div className={classes.datetime}>19 mins ago</div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </DragDropContext>
      </div>
    </main>
  );
};

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.dashboardReducer,
});

export default connect(mapStateToProps)(Kanban);
