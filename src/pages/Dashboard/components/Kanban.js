import React, { useState, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import {
	AddRounded as AddRoundedIcon,
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
} from '@material-ui/core';

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
		// width: '250px',
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

const Kanban = ({
	products,
	status,
	requirements,
	issues,
	redirectTo,
	history,
}) => {
	const classes = useStyles();
	const [tasks, setTaskStatus] = useState(requirements.push(...issues));

	const changeTaskStatus = useCallback(
		(id, status) => {
			let task = tasks.find((task) => task.id === id);
			const taskIndex = tasks.indexOf(task);
			task = { ...task, status };
			let newTasks = update(tasks, {
				[taskIndex]: { $set: task },
			});
			setTaskStatus(newTasks);
		},
		[tasks]
	);

	return (
		<main>
			<DndProvider backend={HTML5Backend}>
				<section className={classes.board}>
					{status.map((statusItem) => (
						<KanbanColumn key={statusItem.name} status={statusItem} changeTaskStatus={changeTaskStatus}>
							<div className={classes.column}>
								<div className={classes.columnHead}>
									<p>{statusItem.name}</p>
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
								<div className={classes.tasksList}>
									{tasks && tasks.length > 0 && tasks
										.filter((item) => item.status === statusItem.value)
										.map((item) => (
											<KanbanItem key={`card-${item.id}-${item.name}`} id={`${item.id}-${item.name}`}>
												<Card className={classes.card}>
													<div className={classes.priority}></div>
													<CardHeader
														action={
															<div>
																{item.featureUUID &&
																<IconButton
																	aria-label='convert-issue'
																	aria-controls='menu-card'
																	aria-haspopup='false'
																	color='default'>
																	<TrendingFlatRoundedIcon
																		className={classes.icon}
																		fontSize='small'
																		// onClick={(e) => convertIssue(item,"convert")}
																	/>
																</IconButton>}
																<IconButton
																	aria-label='card-options'
																	aria-controls='menu-card'
																	aria-haspopup='false'
																	color='default'>
																	<MoreVertIcon className={classes.icon} fontSize='small' />
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
											</KanbanItem>
										))}
								</div>
							</div>
						</KanbanColumn>
					))}
				</section>
			</DndProvider>
		</main>
	);
};

// export default Kanban;

const KanbanColumn = ({ status, changeTaskStatus, children }) => {
	const ref = useRef(null);
	const [, drop] = useDrop({
		accept: 'card',
		drop(item) {
			changeTaskStatus(item.id, status);
		},
	});
	drop(ref);
	return <div ref={ref}> {children}</div>;
};

const KanbanItem = ({ id, children }) => {
	const ref = useRef(null);
	const [{ isDragging }, drag] = useDrag({
		item: { type: 'card', id },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});
	const opacity = isDragging ? 0 : 1;
	drag(ref);
	return (
		<div ref={ref} style={{ opacity, margin: 10 + 'px' }}>
			{children}
		</div>
	);
};

const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	...state.dashboardReducer,
  });

export default connect(mapStateToProps)(Kanban);
