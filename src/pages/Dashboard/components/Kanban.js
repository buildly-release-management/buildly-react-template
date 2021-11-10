import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import {
	AddRounded as AddRoundedIcon,
	TrendingFlatRounded as TrendingFlatRoundedIcon,
	MoreVert as MoreVertIcon,
	MoreHoriz as MoreHorizIcon,
} from '@material-ui/icons';
import { makeStyles, Card, CardContent, IconButton, CardHeader, Chip } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
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
		margin: "0 0 8px 0",
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

const Kanban = ({ products, status, requirements, issues, redirectTo, history }) => {
	const classes = useStyles();
	const [columns, setColumns] = useState({});

	useEffect(() => {
		if (status && status.length) {
			let columnsFromBackend = {};
			let requirementList = [];
			let issueList = [];
			status.map((item) => {
				if (requirements && requirements.length) {
					requirementList = requirements.filter((req) => {
						return req.status === item.value;
					});
				}
				if (issues && issues.length) {
					issueList = issues.filter((issue) => {
						return issue.status === item.value;
					});
				}
				requirementList.push(...issueList);
				columnsFromBackend[item.value] = { name: item.name, items: requirementList };
			});
			setColumns(columnsFromBackend);
		}
	}, []);

	return (
		<div style={{ display: "flex", justifyContent: "center", height: "100%" }}>
      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
      >
        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <div
              className={classes.column}
              key={columnId}
            >
              <div className={classes.columnHead}>
									<p>{column.name}</p>
									<IconButton>
										<AddRoundedIcon
											className={classes.icon}
											fontSize='small'
											// onClick={(e) => addItem('req')}
										/>
									</IconButton>
									<IconButton
										aria-label='column-options'
										aria-controls='menu-column'
										aria-haspopup='false'
										color='default'>
										<MoreHorizIcon className={classes.icon} fontSize='small' />
									</IconButton>
				</div>
              <div style={{ margin: 8 }}>
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided, snapshot) => {
                    return (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={classes.tasksList}
						style={{
                          background: snapshot.isDraggingOver
                            ? "#D8D8D8"
                            : "#F6F8FA"
                        }}
                      >
                        {column.items.map((item, index) => {
                          return (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                return (
                                    <Card className={classes.card} ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      userSelect: "none",
                                      minHeight: "50px",
                                      backgroundColor: snapshot.isDragging
                                        ? "#F6F8FA"
                                        : "#FFFFFF",
                                      ...provided.draggableProps.style
                                    }}>
																			<div className={classes.priority}></div>
																			<CardHeader
																				action={
																					<div>
																						{!item.featureUUID && (
																							<IconButton
																								aria-label='convert-ticket'
																								aria-controls='menu-card'
																								aria-haspopup='false'
																								color='default'>
																								<TrendingFlatRoundedIcon
																									className={classes.icon}
																									fontSize='small'
																									// onClick={(e) => convertTicket(item,"convert")}
																								/>
																							</IconButton>
																						)}
																						<IconButton
																							aria-label='card-options'
																							aria-controls='menu-card'
																							aria-haspopup='false'
																							color='default'>
																							<MoreVertIcon
																								className={classes.icon}
																								fontSize='small'
																							/>
																						</IconButton>
																					</div>
																				}
																				title={item.name}
																			/>
																			<CardContent>
																				<div className={classes.flexContainer}>
																					<Chip label='testing' color='primary' size='small' />
																					<Chip
																						label='documentation'
																						variant='outlined'
																						color='secondary'
																						size='small'
																					/>
																				</div>
																				<div className={classes.datetime}>19 mins ago</div>
																			</CardContent>
																		</Card>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            </div>
          );
        })}
      </DragDropContext>
    </div>

	);
};

const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	...state.dashboardReducer,
});

export default connect(mapStateToProps)(Kanban);
