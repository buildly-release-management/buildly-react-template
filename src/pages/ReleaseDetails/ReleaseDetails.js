import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import _ from 'lodash';
import { useQuery } from 'react-query';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
} from '@mui/icons-material';
import Loader from '@components/Loader/Loader';
import Chatbot from '@components/Chatbot/Chatbot';
import BusinessTasksList from '@components/BusinessTasksList/BusinessTasksList';
import DoughnutChart from '@components/Charts/Doughnut/DoughnutChart';
import BarChart from '@components/Charts/BarChart/BarChart';
import useAlert from '@hooks/useAlert';
import { routes } from '@routes/routesConstants';
import { getReleaseSummaryQuery } from '@react-query/queries/release/getReleaseSummaryQuery.js';
import { getReleaseFeaturesIssuesQuery } from '@react-query/queries/release/getReleaseFeaturesIssuesQuery';
import { getProductPunchlistQuery } from '@react-query/queries/punchlist/getProductPunchlistQuery';
import { useCreatePunchlistItemMutation, useUpdatePunchlistStatusMutation, useDeletePunchlistItemMutation } from '@react-query/mutations/punchlist/punchlistMutations';
import ReleaseForm from './components/ReleaseForm';
import './ReleaseDetails.css';

const ReleaseDetails = ({ history }) => {
  const { releaseUuid } = useParams();
  const { displayAlert } = useAlert();

  const [releaseSummary, setReleaseSummary] = useState([]);
  const [progressSummaryLabels, setProgressSummaryLabels] = useState([]);
  const [progressSummaryValues, setProgressSummaryValues] = useState([]);
  const [assigneesLabels, setAssigneesLabels] = useState([]);
  const [assigneesValues, setAssigneesValues] = useState([]);
  const [barFeatureNames, setBarFeatureNames] = useState([]);
  const [barSummary, setBarSummary] = useState([]);
  const [value, setValue] = useState('2');
  
  // Punchlist form state for new API structure
  const [newPunchlistItem, setNewPunchlistItem] = useState({
    title: '',
    description: '',
    reporter_name: '',
    reporter_email: '',
    severity: 'medium',
    priority: 'medium',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: '',
    environment: '',
    browser_version: '',
    screenshots: [],
    assigned_to: '',
    tags: []
  });

  const { data: releaseDetails, isLoading: isReleaseDetailsLoading } = useQuery(
    ['releaseSummary', releaseUuid],
    () => getReleaseSummaryQuery(releaseUuid, null, displayAlert),
    { refetchOnWindowFocus: false },
  );
  
  const { data: releaseFeatures, isLoading: isReleaseFeaturesLoading } = useQuery(
    ['releaseFeatures', releaseUuid],
    () => getReleaseFeaturesIssuesQuery(releaseUuid, displayAlert),
    { refetchOnWindowFocus: false },
  );

  // Get product_uuid from release details
  const productUuid = releaseDetails?.product_uuid;

  // Punchlist API integration
  const { data: punchlistData = [], isLoading: isPunchlistLoading, refetch: refetchPunchlist } = useQuery(
    ['productPunchlist', productUuid],
    () => getProductPunchlistQuery(productUuid, displayAlert),
    { 
      enabled: !!productUuid,
      refetchOnWindowFocus: false 
    }
  );

  const createPunchlistMutation = useCreatePunchlistItemMutation(productUuid, displayAlert, refetchPunchlist);
  const updatePunchlistMutation = useUpdatePunchlistStatusMutation(productUuid, displayAlert, refetchPunchlist);
  const deletePunchlistMutation = useDeletePunchlistItemMutation(productUuid, displayAlert, refetchPunchlist);

  let featureNames = [];
  let barChartSummaryData = [];

  useEffect(() => {
    const releaseSummaryObj = releaseDetails;
    if (!_.isEmpty(releaseSummaryObj) && releaseSummaryObj.summary) {
      const featuresSummaryObj = generateBarChartData(releaseSummaryObj.summary.feature_issues);
      setReleaseSummary({
        progressSummary: {
          labels: Object.keys(releaseSummaryObj.summary.features_summary),
          values: Object.values(releaseSummaryObj.summary.features_summary),
        },
        features: featuresSummaryObj,
        assignees: {
          labels: releaseSummaryObj.summary.assignee_data
            ? Object.keys(releaseSummaryObj.summary.assignee_data)
            : [],
          values: Object.keys(releaseSummaryObj.summary.assignee_data)
            .length
            ? Object.values(releaseSummaryObj.summary.assignee_data)
            : [],
        },
      });
    }
  }, [releaseDetails]);

  useEffect(() => {
    if (!releaseSummary) return;

    const { progressSummary, features, assignees } = releaseSummary;

    if (progressSummary) {
      if (progressSummary.labels) {
        setProgressSummaryLabels(progressSummary.labels);
      }
      if (progressSummary.values) {
        setProgressSummaryValues(progressSummary.values);
      }
    }

    if (features) {
      if (features.featureNames) {
        setBarFeatureNames(features.featureNames);
      }
      if (features.barChartSummaryData) {
        setBarSummary(features.barChartSummaryData);
      }
    }

    if (assignees) {
      if (assignees.labels) {
        setAssigneesLabels(assignees.labels);
      }
      if (assignees.values) {
        setAssigneesValues(assignees.values);
      }
    }
  }, [releaseSummary]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Punchlist handlers using new API
  const handleAddPunchlistItem = async () => {
    // Required field validation
    if (!newPunchlistItem.title.trim() || !newPunchlistItem.description.trim() || !productUuid || !releaseUuid) {
      displayAlert('error', 'Missing required punchlist fields. Please fill in all required fields.');
      return;
    }
    try {
      const payload = {
        ...newPunchlistItem,
        product_uuid: productUuid,
        release_uuid: releaseUuid,
        date_created: new Date().toISOString(),
        status: 'open',
        // Add required fields for the API
        application_name: releaseDetails?.name || 'Web Application',
        version: releaseDetails?.version || '1.0.0'
      };
      // Log payload for debugging
      console.log('Submitting punchlist payload:', payload);
      await createPunchlistMutation.mutateAsync(payload);
      // Reset form
      setNewPunchlistItem({
        title: '',
        description: '',
        reporter_name: '',
        reporter_email: '',
        severity: 'medium',
        priority: 'medium',
        steps_to_reproduce: '',
        expected_behavior: '',
        actual_behavior: '',
        environment: '',
        browser_version: '',
        screenshots: [],
        assigned_to: '',
        tags: []
      });
      displayAlert('success', 'Punchlist item added successfully');
    } catch (error) {
      console.error('Error adding punchlist item:', error);
    }
  };

  const handleUpdatePunchlistStatus = async (itemUuid, newStatus) => {
    try {
      await updatePunchlistMutation.mutateAsync({
        uuid: itemUuid,
        status: newStatus
      });
      displayAlert('success', `Item marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating punchlist status:', error);
    }
  };

  const handleRemovePunchlistItem = async (itemUuid) => {
    try {
      await deletePunchlistMutation.mutateAsync(itemUuid);
      displayAlert('success', 'Punchlist item removed');
    } catch (error) {
      console.error('Error removing punchlist item:', error);
    }
  };

  const handlePunchlistFormChange = (field, value) => {
    setNewPunchlistItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateBarChartData = (data) => {
    featureNames = [];
    barChartSummaryData = [
      {
        label: 'Completed',
        key: 'completed',
        backgroundColor: '#0D5595',
        data: [],
      },
      {
        label: 'In progress',
        key: 'in_progress',
        backgroundColor: '#F8943C',
        data: [],
      },
      {
        label: 'Overdue',
        key: 'overdue',
        backgroundColor: '#C91B1A',
        data: [],
      },
    ];

    _.forEach(data, (entry) => {
      featureNames.push(entry.name);
      Object.keys(entry.issues_data).forEach((key) => {
        const index = barChartSummaryData.findIndex(
          (summaryEntry) => summaryEntry.key === key,
        );

        if (index > -1) {
          barChartSummaryData[index].data.push(entry.issues_data[key]);
        }
      });
    });

    return { featureNames, barChartSummaryData };
  };

  const Row = (props) => {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{row.name}</TableCell>
          <TableCell align="center">{row.complexity}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="issues">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="center">Complexity</TableCell>
                      <TableCell>Assignees</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row?.issuesList?.length ? (
                      row?.issuesList?.map((issue) => (
                        <TableRow key={issue.issue_uuid}>
                          <TableCell>{issue.name}</TableCell>
                          <TableCell align="center">
                            {issue.complexity}
                          </TableCell>
                          <TableCell>{issue.assignees}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                        <TableCell>No issues to display</TableCell>
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <>
      {(isReleaseDetailsLoading || isReleaseFeaturesLoading) && <Loader open={isReleaseDetailsLoading || isReleaseFeaturesLoading} />}
      <Box className="toolbar" display="flex" alignItems="center">
        <IconButton
          aria-label="back"
          onClick={(e) => history.push(routes.RELEASE)}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
        <Link
          className="toolbar-header"
          to={{
            pathname: routes.RELEASE,
          }}
        >
          {releaseDetails && releaseDetails.name}
        </Link>
      </Box>

      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="release tabs">
              <Tab label="Report" value="1" />
              <Tab label="Details" value="2" />
              <Tab label="Features & Issues" value="3" />
              <Tab label="Punchlist" value="4" />
              <Tab label="Business Tasks" value="5" />
            </TabList>
          </Box>
          <TabPanel value="1">
            {releaseDetails?.features?.length ? (
              <>
                <div className="container-fluid release-summary-container">
                  <div className="row flex-nowrap justify-content-between">
                    <div
                      className="chart-container"
                      style={{
                        width: '32%',
                        height: '100%',
                      }}
                    >
                      <DoughnutChart
                        id="progressSummary"
                        label="Progress summary"
                        labels={
                          progressSummaryLabels || []
                        }
                        data={
                          progressSummaryValues || []
                        }
                      />
                    </div>
                    <div
                      className="chart-container"
                      style={{
                        width: '32%',
                      }}
                    >
                      <BarChart
                        id="features"
                        label="Features summary"
                        labels={barFeatureNames || []}
                        data={barSummary || []}
                        backgroundColor="#02b844"
                        borderWidth={1}
                        borderColor="#000"
                      />
                    </div>
                    <div
                      className="chart-container"
                      style={{
                        width: '32%',
                      }}
                    >
                      {!_.isEmpty(assigneesLabels) ? (
                        <DoughnutChart
                          id="resourceAllocation"
                          label="Resource allocation"
                          labels={assigneesLabels || []}
                          data={assigneesValues || []}
                        />
                      ) : (
                        <>
                          <Typography>Resource allocation</Typography>
                          <Typography className="m-auto">
                            No data to display
                          </Typography>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Typography>No features added yet</Typography>
            )}
          </TabPanel>
          <TabPanel value="2">
            <ReleaseForm releasesDetails={releaseDetails} displayAlert={displayAlert} />
          </TabPanel>
          <TabPanel value="3">
            <TableContainer component={Paper}>
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell width="12" />
                    <TableCell width="33%">Name</TableCell>
                    <TableCell align="center">Complexity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!_.isEmpty(releaseFeatures) ? (
                    _.map(releaseFeatures, (row) => (
                      <Row key={row.feature_uuid} row={row} />
                    ))
                  ) : (
                    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                      <TableCell />
                      <TableCell>No features to display</TableCell>
                      <TableCell />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
          
          {/* Punchlist Tab */}
          <TabPanel value="4">
            <div style={{ padding: '20px' }}>
              <Typography variant="h6" style={{ marginBottom: '20px' }}>
                🔧 Release Punchlist ({punchlistData.length} items)
              </Typography>
              
              {isPunchlistLoading && <div>Loading punchlist...</div>}
              
              {/* Add new punchlist item form */}
              <Box sx={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <Typography variant="subtitle1" sx={{ marginBottom: '16px', fontWeight: 'bold' }}>
                  Add New Bug/Issue
                </Typography>
                
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                  <TextField
                    label="Title *"
                    value={newPunchlistItem.title}
                    onChange={(e) => handlePunchlistFormChange('title', e.target.value)}
                    fullWidth
                    size="small"
                  />
                  
                  <TextField
                    label="Reporter Name"
                    value={newPunchlistItem.reporter_name}
                    onChange={(e) => handlePunchlistFormChange('reporter_name', e.target.value)}
                    fullWidth
                    size="small"
                  />
                  
                  <TextField
                    label="Reporter Email"
                    type="email"
                    value={newPunchlistItem.reporter_email}
                    onChange={(e) => handlePunchlistFormChange('reporter_email', e.target.value)}
                    fullWidth
                    size="small"
                  />
                  
                  <FormControl fullWidth size="small">
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={newPunchlistItem.severity}
                      onChange={(e) => handlePunchlistFormChange('severity', e.target.value)}
                      label="Severity"
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={newPunchlistItem.priority}
                      onChange={(e) => handlePunchlistFormChange('priority', e.target.value)}
                      label="Priority"
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Environment"
                    value={newPunchlistItem.environment}
                    onChange={(e) => handlePunchlistFormChange('environment', e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="e.g., Production, Staging, Development"
                  />
                </div>
                
                <TextField
                  label="Description *"
                  value={newPunchlistItem.description}
                  onChange={(e) => handlePunchlistFormChange('description', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ marginTop: '16px' }}
                />
                
                <TextField
                  label="Steps to Reproduce"
                  value={newPunchlistItem.steps_to_reproduce}
                  onChange={(e) => handlePunchlistFormChange('steps_to_reproduce', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ marginTop: '16px' }}
                />
                
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr', marginTop: '16px' }}>
                  <TextField
                    label="Expected Behavior"
                    value={newPunchlistItem.expected_behavior}
                    onChange={(e) => handlePunchlistFormChange('expected_behavior', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  
                  <TextField
                    label="Actual Behavior"
                    value={newPunchlistItem.actual_behavior}
                    onChange={(e) => handlePunchlistFormChange('actual_behavior', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </div>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddPunchlistItem}
                  disabled={createPunchlistMutation.isLoading}
                  sx={{ marginTop: '16px' }}
                >
                  {createPunchlistMutation.isLoading ? 'Adding...' : 'Add Punchlist Item'}
                </Button>
              </Box>

              {/* Punchlist items */}
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {punchlistData.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Title</strong></TableCell>
                          <TableCell><strong>Reporter</strong></TableCell>
                          <TableCell align="center"><strong>Severity</strong></TableCell>
                          <TableCell align="center"><strong>Priority</strong></TableCell>
                          <TableCell align="center"><strong>Status</strong></TableCell>
                          <TableCell align="center"><strong>Created</strong></TableCell>
                          <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {punchlistData.map(item => (
                          <TableRow key={item.uuid}>
                            <TableCell>
                              <div>
                                <div style={{ 
                                  fontWeight: 'bold',
                                  textDecoration: item.status === 'resolved' ? 'line-through' : 'none',
                                  color: item.status === 'resolved' ? '#6c757d' : '#000'
                                }}>
                                  {item.title}
                                </div>
                                {item.description && (
                                  <div style={{ 
                                    fontSize: '12px', 
                                    color: '#666', 
                                    marginTop: '4px',
                                    maxWidth: '300px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div style={{ fontSize: '13px' }}>
                                {item.reporter_name || 'Anonymous'}
                                {item.reporter_email && (
                                  <div style={{ fontSize: '11px', color: '#666' }}>
                                    {item.reporter_email}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell align="center">
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                backgroundColor: 
                                  item.severity === 'critical' ? '#ff6b6b' :
                                  item.severity === 'high' ? '#ffa726' :
                                  item.severity === 'medium' ? '#ffcc02' : '#4caf50',
                                color: 'white'
                              }}>
                                {item.severity?.toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell align="center">
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                backgroundColor: 
                                  item.priority === 'urgent' ? '#e91e63' :
                                  item.priority === 'high' ? '#ff9800' :
                                  item.priority === 'medium' ? '#2196f3' : '#9e9e9e',
                                color: 'white'
                              }}>
                                {item.priority?.toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell align="center">
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                backgroundColor: 
                                  item.status === 'resolved' ? '#d4edda' :
                                  item.status === 'in_progress' ? '#cce5ff' :
                                  item.status === 'open' ? '#fff3cd' : '#f8d7da',
                                color: 
                                  item.status === 'resolved' ? '#155724' :
                                  item.status === 'in_progress' ? '#004085' :
                                  item.status === 'open' ? '#856404' : '#721c24',
                                border: `1px solid ${
                                  item.status === 'resolved' ? '#c3e6cb' :
                                  item.status === 'in_progress' ? '#b3d9ff' :
                                  item.status === 'open' ? '#ffeaa7' : '#f5c6cb'
                                }`
                              }}>
                                {item.status?.replace('_', ' ').toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell align="center" style={{ fontSize: '12px' }}>
                              {item.date_created ? new Date(item.date_created).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell align="center">
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleUpdatePunchlistStatus(
                                    item.uuid, 
                                    item.status === 'open' ? 'resolved' : 'open'
                                  )}
                                  disabled={updatePunchlistMutation.isLoading}
                                  style={{
                                    minWidth: 'auto',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    backgroundColor: item.status === 'open' ? '#28a745' : '#ffc107',
                                    color: 'white',
                                    border: 'none'
                                  }}
                                  title={item.status === 'open' ? 'Mark as Resolved' : 'Reopen'}
                                >
                                  {item.status === 'open' ? '✓' : '↻'}
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleRemovePunchlistItem(item.uuid)}
                                  disabled={deletePunchlistMutation.isLoading}
                                  style={{
                                    minWidth: 'auto',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none'
                                  }}
                                  title="Remove item"
                                >
                                  ✕
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <div style={{ 
                    textAlign: 'center',
                    color: '#6c757d',
                    fontStyle: 'italic',
                    padding: '40px',
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    No issues tracked yet. Add items above to start building your punchlist.
                  </div>
                )}
              </div>
            </div>
          </TabPanel>
          
          <TabPanel value="5">
            <BusinessTasksList
              productUuid={productUuid}
              releaseUuid={releaseUuid}
              title={`Business Tasks for ${releaseDetails?.name || 'Release'}`}
              showAddButton={true}
              onAddTask={() => {
                history.push({
                  pathname: '/app/roadmap/add_business_task',
                  state: {
                    from: `/app/release/${releaseUuid}`,
                    product_uuid: productUuid,
                    release_uuid: releaseUuid,
                  }
                });
              }}
              onEditTask={(task) => {
                history.push({
                  pathname: '/app/roadmap/add_business_task',
                  state: {
                    from: `/app/release/${releaseUuid}`,
                    type: 'edit',
                    data: task,
                    product_uuid: productUuid,
                    release_uuid: releaseUuid,
                  }
                });
              }}
            />
          </TabPanel>
        </TabContext>
      </Box>

      <Chatbot />
    </>
  );
};

export default ReleaseDetails;
